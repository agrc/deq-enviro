export function validate(value, min, max) {
  if (!value || value.trim() === '') return null;

  value = Number(value);
  if (value < min || value > max) {
    return `Value must be between ${min.toLocaleString()} and ${max.toLocaleString()}.`;
  }

  return null;
}
