import { defaultHeaders } from "./apiDefaultHeaders";

interface ApiErrorResponseData {
  status: number;
  statusText: string;
  url: string;
  headers: Record<string, string>;
  body: string | null;
}

class ApiError extends Error {
  static async fromResponse(
    message: string,
    url: string,
    init: RequestInit | undefined,
    res: Response | null,
  ): Promise<ApiError> {
    if (!res) {
      return new ApiError(message, url, init);
    }

    const body = await res.text().catch(() => null);

    const responseData: ApiErrorResponseData = {
      status: res.status,
      statusText: res.statusText,
      url: res.url,
      headers: Object.fromEntries(res.headers.entries()),
      body,
    };

    return new ApiError(res.statusText, res.url, init, responseData);
  }

  public init?: string;
  public responseData?: string;
  constructor(
    message: string,
    public url: string,
    init: RequestInit | undefined,
    responseData?: ApiErrorResponseData,
  ) {
    super(message);
    this.init = init ? JSON.stringify(init) : undefined;
    this.responseData = responseData ? JSON.stringify(responseData) : undefined;
  }
}

export const fetchJSON = async (url: string, init: RequestInit | undefined, signal: AbortSignal): Promise<unknown> => {
  let res: Response | null = null;
  try {
    res = await fetch(`https://f1tv.formula1.com${url}`, {
      ...init,
      headers: {
        ...defaultHeaders,
        ...init?.headers,
      },
      signal,
    });

    return await res.json();
  } catch (error) {
    if (error instanceof Error) {
      throw await ApiError.fromResponse(error.message, url, init, res);
    }

    throw error;
  }
};
