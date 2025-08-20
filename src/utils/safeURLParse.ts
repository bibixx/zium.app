export function safeURLParse(url: string, baseUrl?: string): URL | null {
  try {
    return new URL(url, baseUrl);
  } catch (error) {
    if (error instanceof TypeError) {
      return null;
    }

    throw error;
  }
}
