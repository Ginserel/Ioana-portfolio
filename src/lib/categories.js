// One place to define categories - used by every page.
// The keys (left side) are what's stored in the database,
// the values (right side) are what visitors see.
export const CATEGORY_LABELS = {
  fashion_licensing: 'Fashion licensing',
  graphic_design: 'Graphic design',
  illustration: 'Illustration',
  fine_art: 'Fine art',
}

// Helper: takes the raw value, returns the label.
export function categoryLabel(value) {
  return CATEGORY_LABELS[value] || value
}