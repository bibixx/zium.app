export function setRef<T>(ref: React.ForwardedRef<T>, value: T) {
  if (typeof ref === "function") {
    ref(value);
    return;
  }

  if (ref !== null) {
    ref.current = value;
  }
}
