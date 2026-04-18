use std::collections::HashMap;
use std::time::Instant;

use base64::engine::general_purpose::STANDARD as BASE64_STANDARD;
use base64::Engine;

use reqwest::header::{HeaderMap, HeaderName, HeaderValue, USER_AGENT};
use tauri::AppHandle;

use super::models::{RequestPayload, ResponsePayload};
use crate::storage::{get_storage_root, load_collection_config_from_path, load_env_vars};

fn resolve_variables(input: &str, vars: &HashMap<String, String>) -> String {
    let mut result = input.to_string();
    for (key, value) in vars {
        let placeholder = format!("{{{{{}}}}}", key);
        result = result.replace(&placeholder, value);
    }
    result
}

fn normalize_url(raw: &str) -> Result<String, String> {
    let trimmed = raw.trim();

    if trimmed.is_empty() {
        return Err("Enter a URL first.".to_string());
    }

    let candidate = if trimmed.starts_with("http://") || trimmed.starts_with("https://") {
        trimmed.to_string()
    } else {
        format!("https://{trimmed}")
    };

    reqwest::Url::parse(&candidate)
        .map(|url| url.to_string())
        .map_err(|_| format!("Invalid URL: {trimmed}"))
}

fn build_headers(headers: &HashMap<String, String>) -> Result<HeaderMap, String> {
    let mut header_map = HeaderMap::new();

    for (key, value) in headers {
        let name = HeaderName::from_bytes(key.as_bytes())
            .map_err(|_| format!("Invalid header name: {key}"))?;
        let header_value =
            HeaderValue::from_str(value).map_err(|_| format!("Invalid header value for: {key}"))?;

        header_map.insert(name, header_value);
    }

    if !header_map.contains_key(USER_AGENT) {
        header_map.insert(USER_AGENT, HeaderValue::from_static("kivo/0.2"));
    }

    Ok(header_map)
}

#[tauri::command]
pub async fn send_http_request(
    app: AppHandle,
    payload: RequestPayload,
) -> Result<ResponsePayload, String> {

    let storage_root = get_storage_root(&app).unwrap_or_default();
    let workspace_path = storage_root.join(&payload.workspace_name);
    let collection_path = if payload.collection_name.is_empty() {
        None
    } else {
        Some(
            workspace_path
                .join("collections")
                .join(&payload.collection_name),
        )
    };

    let env_vars = load_env_vars(&workspace_path, collection_path.as_deref());

    let col_config = collection_path
        .as_deref()
        .map(load_collection_config_from_path)
        .unwrap_or_default();

    let mut merged_headers: HashMap<String, String> = HashMap::new();

    if payload.inherit_headers.unwrap_or(true) {
        merged_headers = col_config
            .default_headers
            .iter()
            .filter(|row| row.enabled && !row.key.trim().is_empty())
            .map(|row| {
                (
                    resolve_variables(row.key.trim(), &env_vars),
                    resolve_variables(&row.value, &env_vars),
                )
            })
            .collect();
    }

    for (k, v) in &payload.headers {
        merged_headers.insert(
            resolve_variables(k, &env_vars),
            resolve_variables(v, &env_vars),
        );
    }

    let has_auth_header = merged_headers
        .keys()
        .any(|k| k.to_lowercase() == "authorization");

    if payload.auth_type == "inherit" && !has_auth_header {
        let auth = &col_config.default_auth;
        match auth.auth_type.as_str() {
            "bearer" if !auth.token.is_empty() => {
                let resolved = resolve_variables(&auth.token, &env_vars);
                merged_headers.insert(
                    "Authorization".to_string(),
                    format!("Bearer {}", resolved),
                );
            }
            "basic" if !auth.username.is_empty() || !auth.password.is_empty() => {
                let u = resolve_variables(&auth.username, &env_vars);
                let p = resolve_variables(&auth.password, &env_vars);
                let encoded = BASE64_STANDARD.encode(format!("{}:{}", u, p));
                merged_headers.insert(
                    "Authorization".to_string(),
                    format!("Basic {}", encoded),
                );
            }
            "apikey" if !auth.api_key_name.is_empty() => {
                let name = resolve_variables(&auth.api_key_name, &env_vars);
                let value = resolve_variables(&auth.api_key_value, &env_vars);
                if auth.api_key_in == "query" {
                } else {
                    merged_headers.insert(name, value);
                }
            }
            _ => {}
        }
    }

    let resolved_url = resolve_variables(&payload.url, &env_vars);
    let resolved_body = payload
        .body
        .as_deref()
        .map(|b| resolve_variables(b, &env_vars));

    let mut url = normalize_url(&resolved_url)?;

    let should_inject_apikey_query = if payload.auth_type == "inherit" {
        col_config.default_auth.auth_type == "apikey"
            && col_config.default_auth.api_key_in == "query"
            && !col_config.default_auth.api_key_name.is_empty()
    } else {
        false
    };

    if should_inject_apikey_query {
        let name = resolve_variables(&col_config.default_auth.api_key_name, &env_vars);
        let value = resolve_variables(&col_config.default_auth.api_key_value, &env_vars);
        if let Ok(mut parsed) = reqwest::Url::parse(&url) {
            parsed.query_pairs_mut().append_pair(&name, &value);
            url = parsed.to_string();
        }
    }

    if payload.auth_type == "apikey" {
        if let Some(ref ap) = payload.auth_payload {
            if ap.api_key_in == "query" && !ap.api_key_name.is_empty() {
                let name = resolve_variables(&ap.api_key_name, &env_vars);
                let value = resolve_variables(&ap.api_key_value, &env_vars);
                if let Ok(mut parsed) = reqwest::Url::parse(&url) {
                    let already_has = parsed.query_pairs().any(|(k, _)| k == name);
                    if !already_has {
                        parsed.query_pairs_mut().append_pair(&name, &value);
                        url = parsed.to_string();
                    }
                }
            }
        }
    }

    let client = reqwest::Client::builder()
        .redirect(reqwest::redirect::Policy::limited(10))
        .build()
        .map_err(|err| err.to_string())?;

    let method_str = payload.method.to_uppercase();
    let method = reqwest::Method::from_bytes(method_str.as_bytes())
        .map_err(|_| format!("Unsupported HTTP method: {}", payload.method))?;

    let mut request = client
        .request(method.clone(), &url)
        .headers(build_headers(&merged_headers)?);

    if let Some(body) = resolved_body {
        if !body.trim().is_empty() {
            request = request.body(body);
        }
    }

    let started_at = Instant::now();
    let response = request.send().await.map_err(|err| err.to_string())?;
    let duration_ms = started_at.elapsed().as_millis();

    let status = response.status();
    let status_text = status.canonical_reason().unwrap_or("Unknown").to_string();
    let headers = response
        .headers()
        .iter()
        .map(|(name, value)| {
            (
                name.to_string(),
                value.to_str().unwrap_or("<binary>").to_string(),
            )
        })
        .collect::<HashMap<_, _>>();
    let body = response.text().await.map_err(|err| err.to_string())?;

    Ok(ResponsePayload {
        status: status.as_u16(),
        status_text,
        headers,
        body,
        duration_ms,
    })
}

