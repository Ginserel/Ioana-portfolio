// One place to define how category values map to pretty labels.
// Used by every page - change it here, changes everywhere.
export const CATEGORY_LABELS = {
  fine_art: 'Fine art',
  graphic_design: 'Graphic design',
  ux_ui: 'UX / UI',
}

// Helper: takes the raw value, returns the label.
// The || fallback returns the raw value if it's not in our map.
export function categoryLabel(value) {
  return CATEGORY_LABELS[value] || value
}