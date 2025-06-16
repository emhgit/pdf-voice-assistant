//Utility function that is used to determine whether a user can naviagate based on the params of this function
export function canNavigate<T>(
  value: T | null | undefined,
  validator: (input: T) => boolean
): boolean {
  if (value == null) return false;
  return validator(value);
}
