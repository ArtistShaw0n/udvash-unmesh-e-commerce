/**
 * Standardised JSON response helpers for Next.js Route Handlers.
 * Centralised so the api-client on the frontend can rely on a consistent shape.
 */

import "server-only";
import { NextResponse } from "next/server";

export interface ApiSuccess<T> {
  ok: true;
  data: T;
}
export interface ApiFailure {
  ok: false;
  error: string;
  code?: string;
}

export function ok<T>(data: T, init?: ResponseInit): NextResponse<ApiSuccess<T>> {
  return NextResponse.json({ ok: true, data }, init);
}

export function err(
  message: string,
  status = 400,
  code?: string,
): NextResponse<ApiFailure> {
  return NextResponse.json({ ok: false, error: message, code }, { status });
}

export const unauthorized = (msg = "Login required") => err(msg, 401, "UNAUTHORIZED");
export const forbidden = (msg = "Forbidden") => err(msg, 403, "FORBIDDEN");
export const notFound = (msg = "Not found") => err(msg, 404, "NOT_FOUND");
export const conflict = (msg = "Conflict") => err(msg, 409, "CONFLICT");
export const badRequest = (msg = "Bad request") => err(msg, 400, "BAD_REQUEST");
