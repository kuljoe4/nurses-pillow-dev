## $(date +%Y-%m-%d) - Adding ARIA labels to Icon-only Buttons

**Learning:** When using Google Material Symbols, icon-only buttons (`<button><span className="material-symbols-outlined">icon_name</span></button>`) are inaccessible to screen readers because they lack visible text context. The text inside the span ("icon_name") does not map to a semantic label.

**Action:** Always ensure that icon-only buttons include a descriptive `aria-label` attribute on the `<button>` element to convey the action to assistive technologies.
