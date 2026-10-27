/**
 * Utility functions for making safe API fetch requests that never throw on HTML/404 responses.
 */

export async function safeFetchJson<T = any>(input: RequestInfo | URL, init?: RequestInit): Promise<T | null> {
  try {
    const res = await fetch(input, init);
    const contentType = res.headers.get('content-type') || '';
    if (!contentType.includes('application/json')) {
      console.warn(`[safeFetchJson] Received non-JSON response (${res.status} ${res.statusText}, type: ${contentType}) for`, input);
      return null;
    }
    const data = await res.json();
    return data as T;
  } catch (err) {
    console.warn(`[safeFetchJson] Network or parse error for`, input, err);
    return null;
  }
}

export async function safeParseResponse<T = any>(res: Response): Promise<T | null> {
  try {
    const contentType = res.headers.get('content-type') || '';
    if (!contentType.includes('application/json')) {
      return null;
    }
    return (await res.json()) as T;
  } catch {
    return null;
  }
}
