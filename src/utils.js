export function getAlias(fieldName, fields) {
  const field = fields.find((field) => field.name === fieldName);

  return field?.alias ?? fieldName;
}
