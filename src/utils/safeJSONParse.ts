export function safeJSONParse(data: string): unknown | null {
  try {
    return JSON.parse(data);
  } catch (error) {
    return null;
  }
}
