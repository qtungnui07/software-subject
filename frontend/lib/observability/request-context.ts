import { randomUUID } from "node:crypto";

const REQUEST_ID_PATTERN = /^[a-zA-Z0-9._:-]{8,128}$/;

export const createRequestId = () => `req_${randomUUID()}`;

export const getRequestId = (request?: Request | null) => {
  const provided = request?.headers.get("x-request-id")?.trim();
  return provided && REQUEST_ID_PATTERN.test(provided)
    ? provided
    : createRequestId();
};

export const requestIdHeaders = (requestId: string) => ({
  "cache-control": "no-store",
  "x-request-id": requestId,
});
