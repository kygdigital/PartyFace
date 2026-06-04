export type ApiSuccess<T> = {
  ok: true;
  data: T;
};

export type ApiFailure = {
  ok: false;
  error: {
    code: string;
    message: string;
    recoverable: boolean;
  };
};

export type ApiResponse<T> = ApiSuccess<T> | ApiFailure;

export function apiSuccess<T>(data: T): ApiSuccess<T> {
  return {
    ok: true,
    data,
  };
}

export function apiFailure(
  code: string,
  message: string,
  recoverable = true,
): ApiFailure {
  return {
    ok: false,
    error: {
      code,
      message,
      recoverable,
    },
  };
}
