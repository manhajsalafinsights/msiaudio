/** Envelope respons API publik (architecture.md §15.3). */
export type ApiSuccess<T> = {
  success: true;
  data: T;
  meta?: ApiMeta;
};

export type ApiError = {
  success: false;
  error: { code: string; message: string };
};

export type ApiEnvelope<T> = ApiSuccess<T> | ApiError;

export type ApiMeta = {
  page: number;
  perPage: number;
  total: number;
  totalPages: number;
};
