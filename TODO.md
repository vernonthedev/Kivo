# UI Migration Plan: daisyUI & Hugeicons

Migrate the application's UI from custom Shadcn-like components and Lucide icons to **daisyUI** and **Hugeicons** for a cleaner, more consistent setup.

## Phase 1: Preparation & Dependencies
- [ ] Install dependencies:
  - `pnpm add daisyui@latest`
  - `pnpm add hugeicons-react`
- [ ] Update `tailwind.config.js`:
  - Add `require("daisyui")` to plugins.
  - Configure daisyUI themes to match current HSL variables (light/dark).
  - Disable default daisyUI themes if they conflict with the custom aesthetic.

## Phase 2: Icon Migration (Lucide -> Hugeicons)
Systematically replace all `lucide-react` imports with `hugeicons-react` equivalents.
- [ ] `src/app/App.jsx`
- [ ] `src/components/Updater.jsx`
- [ ] `src/components/ui/JsonTree.jsx`
- [ ] `src/components/workspace/AppHeader.jsx`
- [ ] `src/components/workspace/CollectionSettingsPage.jsx`
- [ ] `src/components/workspace/EnvEditor.jsx`
- [ ] `src/components/workspace/RequestPane.jsx`
- [ ] `src/components/workspace/RequestTabs.jsx`
- [ ] `src/components/workspace/ResponsePane.jsx`
- [ ] `src/components/workspace/SetupWizard.jsx`
- [ ] `src/components/workspace/Sidebar.jsx`
- [ ] `src/components/workspace/ThemeToggle.jsx`
- [ ] `src/components/workspace/WorkspaceModal.jsx`

## Phase 3: Core UI Component Migration
Refactor base UI components to use daisyUI classes.
- [ ] **Button** (`src/components/ui/button.jsx`): Map `variant` and `size` props to daisyUI classes (e.g., `btn`, `btn-primary`, `btn-sm`).
- [ ] **Input & Textarea** (`src/components/ui/input.jsx`, `textarea.jsx`): Use `input`, `input-bordered`, `textarea`, `textarea-bordered`.
- [ ] **Card** (`src/components/ui/card.jsx`): Use `card`, `card-body`.
- [ ] **Dropdowns/Selects**: Check for custom implementations and replace with daisyUI `dropdown`.

## Phase 4: Layout & Feedback Components
- [ ] **Tabs** (`RequestTabs.jsx`): Refactor to use daisyUI `tabs` and `tab-lifted` or `tab-bordered`.
- [ ] **Modals** (`WorkspaceModal.jsx`): Refactor to use daisyUI `modal`.
- [ ] **Sidebar**: Audit sidebar item states and transitions using daisyUI utility classes.
- [ ] **Tooltips**: Implement daisyUI `tooltip` where needed.

## Phase 5: Theme & Style Refinement
- [ ] Audit `src/index.css` to ensure daisyUI doesn't override critical custom styles (like the radial gradients).
- [ ] Ensure `theme-light` and `theme-dark` classes correctly trigger daisyUI's `data-theme` if used, or maintain HSL variable mapping.

## Phase 6: Validation
- [ ] Verify all icons are correctly rendered and sized.
- [ ] Test all interactive components (buttons, tabs, modals).
- [ ] Ensure responsive behavior and theme switching work seamlessly.
