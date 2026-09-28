import { describe, it, expect, vi } from 'vitest';
import { createPhoneAuthMiddleware } from './phoneAuthMiddleware';
import { IncomingMessage, ServerResponse } from 'http';

describe('phoneAuthMiddleware', () => {
  it('should return 400 for malformed JSON payload', async () => {
    const middleware = createPhoneAuthMiddleware();

    // Create a mock request
    const req = {
      url: '/api/auth/phone/send-otp',
      method: 'POST',
      headers: {},
      [Symbol.asyncIterator]: async function* () {
        yield Buffer.from('{ malformed_json: true'); // Invalid JSON
      }
    } as IncomingMessage;

    // Create a mock response
    let statusCode = 200;
    let endResult = '';
    const res = {
      setHeader: vi.fn(),
      get statusCode() {
        return statusCode;
      },
      set statusCode(code: number) {
        statusCode = code;
      },
      end: vi.fn().mockImplementation((data) => {
        endResult = data;
      })
    } as unknown as ServerResponse;

    const next = vi.fn();

    await middleware(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.statusCode).toBe(400);
    expect(res.end).toHaveBeenCalled();

    const responseBody = JSON.parse(endResult);
    expect(responseBody).toEqual({
      success: false,
      statusCode: 400,
      error: 'INVALID_JSON',
      message: 'Malformed request payload. Please verify your data format.',
    });
  });

  it('should process valid JSON payload', async () => {
    const middleware = createPhoneAuthMiddleware();

    // Create a mock request
    const req = {
      url: '/api/auth/phone/send-otp',
      method: 'POST',
      headers: {},
      [Symbol.asyncIterator]: async function* () {
        yield Buffer.from('{"phoneNumber": "1234567890"}'); // Valid JSON
      }
    } as IncomingMessage;

    // Create a mock response
    let statusCode = 200;
    let endResult = '';
    const res = {
      setHeader: vi.fn(),
      get statusCode() {
        return statusCode;
      },
      set statusCode(code: number) {
        statusCode = code;
      },
      end: vi.fn().mockImplementation((data) => {
        endResult = data;
      })
    } as unknown as ServerResponse;

    const next = vi.fn();

    await middleware(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.statusCode).toBe(200);
    expect(res.end).toHaveBeenCalled();

    const responseBody = JSON.parse(endResult);
    expect(responseBody.success).toBe(true);
  });
});
