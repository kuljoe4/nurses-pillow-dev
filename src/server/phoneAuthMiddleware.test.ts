import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createPhoneAuthMiddleware } from './phoneAuthMiddleware';
import type { IncomingMessage, ServerResponse } from 'http';
import { phoneAuthStore } from '../services/phoneAuthApi';

describe('phoneAuthMiddleware', () => {
  let req: Partial<IncomingMessage>;
  let res: Partial<ServerResponse>;
  let next: ReturnType<typeof vi.fn>;
  let middleware: ReturnType<typeof createPhoneAuthMiddleware>;

  beforeEach(() => {
    vi.restoreAllMocks();

    req = {
      url: '/api/auth/phone/send-otp',
      method: 'POST',
      headers: {},
      [Symbol.asyncIterator]: async function* () {
        yield Buffer.from(JSON.stringify({ phoneNumber: '+1234567890' }));
      }
    };

    res = {
      setHeader: vi.fn(),
      statusCode: 200,
      end: vi.fn(),
    };

    next = vi.fn();
    middleware = createPhoneAuthMiddleware();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('CORS and Route filtering', () => {
    it('should ignore non-/api/auth/phone requests', async () => {
      req.url = '/api/other';
      await middleware(req as IncomingMessage, res as ServerResponse, next);
      expect(next).toHaveBeenCalled();
    });

    it('should handle OPTIONS request', async () => {
      req.method = 'OPTIONS';
      await middleware(req as IncomingMessage, res as ServerResponse, next);
      expect(res.statusCode).toBe(204);
      expect(res.end).toHaveBeenCalled();
      expect(res.setHeader).toHaveBeenCalledWith('Content-Type', 'application/json');
    });

    it('should reject non-POST requests', async () => {
      req.method = 'GET';
      await middleware(req as IncomingMessage, res as ServerResponse, next);
      expect(res.statusCode).toBe(405);
      expect(res.end).toHaveBeenCalledWith(
        expect.stringContaining('Only POST requests are supported.')
      );
    });
  });

  describe('Request Body Parsing', () => {
    it('should handle malformed JSON body', async () => {
      req[Symbol.asyncIterator] = async function* () {
        yield Buffer.from('{ invalid_json }');
      };
      await middleware(req as IncomingMessage, res as ServerResponse, next);
      expect(res.statusCode).toBe(400);
      expect(res.end).toHaveBeenCalledWith(
        expect.stringContaining('INVALID_JSON')
      );
    });
  });

  describe('Error Handling', () => {
    it('should catch generic errors during request processing', async () => {
      // Force an error to be thrown during reading the body
      req[Symbol.asyncIterator] = async function* () {
        throw new Error('Forced Error');
      };

      await middleware(req as IncomingMessage, res as ServerResponse, next);

      expect(res.statusCode).toBe(500);
      expect(res.end).toHaveBeenCalledWith(
        expect.stringContaining('SERVER_ERROR')
      );
    });

    it('should return 404 for unknown /api/auth/phone/* endpoints', async () => {
      req.url = '/api/auth/phone/unknown';
      await middleware(req as IncomingMessage, res as ServerResponse, next);
      expect(res.statusCode).toBe(404);
      expect(res.end).toHaveBeenCalledWith(
        expect.stringContaining('NOT_FOUND')
      );
    });
  });

  describe('/send-otp', () => {
    it('should reject invalid phone number', async () => {
      req[Symbol.asyncIterator] = async function* () {
        yield Buffer.from(JSON.stringify({ phoneNumber: '123' }));
      };
      await middleware(req as IncomingMessage, res as ServerResponse, next);
      expect(res.statusCode).toBe(400);
      expect(res.end).toHaveBeenCalledWith(
        expect.stringContaining('INVALID_PHONE')
      );
    });

    it('should send OTP successfully', async () => {
      const mockSession = { sid: 'test-sid', phoneNumber: '+1234567890', codeSent: true, createdAt: Date.now() };
      vi.spyOn(phoneAuthStore, 'createSession').mockReturnValue(mockSession as any);

      await middleware(req as IncomingMessage, res as ServerResponse, next);

      expect(phoneAuthStore.createSession).toHaveBeenCalledWith('+1234567890');
      expect(res.statusCode).toBe(200);
      expect(res.end).toHaveBeenCalled();

      const responseBody = JSON.parse(vi.mocked(res.end).mock.calls[0][0] as string);
      expect(responseBody.success).toBe(true);
      expect(responseBody.sid).toBe('test-sid');
    });
  });

  describe('/verify-otp', () => {
    beforeEach(() => {
      req.url = '/api/auth/phone/verify-otp';
    });

    it('should handle network failure simulation', async () => {
      req[Symbol.asyncIterator] = async function* () {
        yield Buffer.from(JSON.stringify({ phoneNumber: '+1234567890', code: '999999' }));
      };
      await middleware(req as IncomingMessage, res as ServerResponse, next);
      expect(res.statusCode).toBe(503);
      expect(res.end).toHaveBeenCalledWith(expect.stringContaining('NETWORK_FAILURE'));
    });

    it('should reject invalid phone number', async () => {
      req[Symbol.asyncIterator] = async function* () {
        yield Buffer.from(JSON.stringify({ phoneNumber: '123', code: '123456' }));
      };
      await middleware(req as IncomingMessage, res as ServerResponse, next);
      expect(res.statusCode).toBe(400);
      expect(res.end).toHaveBeenCalledWith(expect.stringContaining('INVALID_PHONE'));
    });

    it('should reject invalid code', async () => {
      req[Symbol.asyncIterator] = async function* () {
        yield Buffer.from(JSON.stringify({ phoneNumber: '+1234567890', code: '123' }));
      };
      await middleware(req as IncomingMessage, res as ServerResponse, next);
      expect(res.statusCode).toBe(400);
      expect(res.end).toHaveBeenCalledWith(expect.stringContaining('INVALID_CODE'));
    });

    it('should handle expired token simulation', async () => {
      req[Symbol.asyncIterator] = async function* () {
        yield Buffer.from(JSON.stringify({ phoneNumber: '+1234567890', code: '000000' }));
      };
      await middleware(req as IncomingMessage, res as ServerResponse, next);
      expect(res.statusCode).toBe(410);
      expect(res.end).toHaveBeenCalledWith(expect.stringContaining('TOKEN_EXPIRED'));
    });

    it('should handle rate limit simulation', async () => {
      req[Symbol.asyncIterator] = async function* () {
        yield Buffer.from(JSON.stringify({ phoneNumber: '+1234567890', code: '888888' }));
      };
      await middleware(req as IncomingMessage, res as ServerResponse, next);
      expect(res.statusCode).toBe(429);
      expect(res.end).toHaveBeenCalledWith(expect.stringContaining('RATE_LIMITED'));
    });

    it('should verify OTP successfully', async () => {
      req[Symbol.asyncIterator] = async function* () {
        yield Buffer.from(JSON.stringify({ phoneNumber: '+1234567890', code: '123456' }));
      };

      const mockResult = { success: true, statusCode: 200, message: 'Verified' };
      vi.spyOn(phoneAuthStore, 'verifyOtp').mockReturnValue(mockResult as any);

      await middleware(req as IncomingMessage, res as ServerResponse, next);

      expect(phoneAuthStore.verifyOtp).toHaveBeenCalled();
      expect(res.statusCode).toBe(200);
      expect(res.end).toHaveBeenCalledWith(JSON.stringify(mockResult));
    });

    it('should use default 400 status if success is false and no statusCode in result', async () => {
       req[Symbol.asyncIterator] = async function* () {
        yield Buffer.from(JSON.stringify({ phoneNumber: '+1234567890', code: '123456' }));
      };

      const mockResult = { success: false, message: 'Failed' };
      vi.spyOn(phoneAuthStore, 'verifyOtp').mockReturnValue(mockResult as any);

      await middleware(req as IncomingMessage, res as ServerResponse, next);

      expect(res.statusCode).toBe(400);
      expect(res.end).toHaveBeenCalledWith(JSON.stringify(mockResult));
    });
  });
});
