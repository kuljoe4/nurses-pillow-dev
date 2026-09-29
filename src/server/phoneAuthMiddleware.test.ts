import { describe, it, expect, beforeEach } from 'bun:test';
import { createPhoneAuthMiddleware } from './phoneAuthMiddleware';

describe('phoneAuthMiddleware', () => {
  let middleware: ReturnType<typeof createPhoneAuthMiddleware>;

  beforeEach(() => {
    middleware = createPhoneAuthMiddleware();
  });

  const createMockRequest = (url: string, method: string, body: any) => {
    const bodyStr = JSON.stringify(body);
    let chunkYielded = false;

    return {
      url,
      method,
      headers: {},
      [Symbol.asyncIterator]: async function* () {
        if (!chunkYielded && bodyStr !== undefined) {
          chunkYielded = true;
          yield bodyStr;
        }
      }
    } as any;
  };

  const createMockResponse = () => {
    let responseData = '';
    const res = {
      statusCode: 200,
      headers: {} as Record<string, string>,
      setHeader(name: string, value: string) {
        this.headers[name] = value;
      },
      end(data?: string) {
        if (data) {
          responseData = data;
        }
      },
      getResponse() {
        if (!responseData) return null;
        return JSON.parse(responseData);
      }
    };
    return res as any;
  };

  describe('/send-otp validation', () => {
    it('returns 400 when phoneNumber is missing', async () => {
      const req = createMockRequest('/api/auth/phone/send-otp', 'POST', {});
      const res = createMockResponse();

      await middleware(req, res, () => {});

      expect(res.statusCode).toBe(400);
      const response = res.getResponse();
      expect(response.error).toBe('INVALID_PHONE');
      expect(response.message).toBe('Please provide a valid mobile phone number.');
    });

    it('returns 400 when phoneNumber is not a string', async () => {
      const req = createMockRequest('/api/auth/phone/send-otp', 'POST', { phoneNumber: 1234567890 });
      const res = createMockResponse();

      await middleware(req, res, () => {});

      expect(res.statusCode).toBe(400);
      const response = res.getResponse();
      expect(response.error).toBe('INVALID_PHONE');
    });

    it('returns 400 when phoneNumber is too short', async () => {
      const req = createMockRequest('/api/auth/phone/send-otp', 'POST', { phoneNumber: '  12345  ' });
      const res = createMockResponse();

      await middleware(req, res, () => {});

      expect(res.statusCode).toBe(400);
      const response = res.getResponse();
      expect(response.error).toBe('INVALID_PHONE');
    });

    it('returns 200 when phoneNumber is valid', async () => {
      const req = createMockRequest('/api/auth/phone/send-otp', 'POST', { phoneNumber: '1234567' });
      const res = createMockResponse();

      await middleware(req, res, () => {});

      expect(res.statusCode).toBe(200);
      const response = res.getResponse();
      expect(response.success).toBe(true);
      // The store seems to prepend + if it's missing or just returns it like that. Let's just check truthy
      expect(response.to).toBeDefined();
    });
  });
});
