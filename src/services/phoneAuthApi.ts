// Nurses Pillow - Twilio Verify SMS Endpoint & Error-Handling Engine
// Endpoint: /api/auth/phone/verify-otp & /api/auth/phone/send-otp

export type OtpErrorCode =
  | 'INVALID_CODE'
  | 'TOKEN_EXPIRED'
  | 'RATE_LIMITED'
  | 'NETWORK_FAILURE'
  | 'SESSION_NOT_FOUND'
  | 'INVALID_PHONE'
  | 'INVALID_REQUEST';

export interface VerifyOtpRequestBody {
  phoneNumber: string;
  code: string;
}

export interface VerifyOtpResponse {
  success: boolean;
  status: 'approved' | 'failed' | 'expired' | 'rate_limited' | 'error';
  message: string;
  error?: OtpErrorCode;
  statusCode: number;
  attemptsRemaining?: number;
  attemptsUsed?: number;
  retryAfterSeconds?: number;
  expiredAt?: string;
  canResend?: boolean;
  verifiedAt?: string;
  diagnosticAdvice?: string;
}

export interface SendOtpResponse {
  success: boolean;
  sid: string;
  to: string;
  status: 'pending';
  codeSent: string;
  createdAt: string;
  expiresInSeconds: number;
  deliveryTimeMs: number;
  message: string;
}

export interface StoredOtpSession {
  sid: string;
  phoneNumber: string;
  codeSent: string;
  createdAt: number; // timestamp ms
  expiresAt: number; // timestamp ms (10 minutes)
  attempts: number;
  maxAttempts: number;
  isLocked: boolean;
  lockUntil?: number;
  status: 'pending' | 'approved' | 'expired' | 'canceled';
}

// In-memory store for OTP sessions
class PhoneAuthStore {
  private sessions: Map<string, StoredOtpSession> = new Map();

  constructor() {
    // No mock sessions
  }

  formatE164(phone: string): string {
    const digits = phone.replace(/\D/g, '');
    if (digits.startsWith('1') && digits.length === 11) {
      return `+${digits}`;
    }
    if (digits.length === 10) {
      return `+1${digits}`;
    }
    return phone.startsWith('+') ? phone : `+${digits}`;
  }

  createSession(phoneNumber: string): StoredOtpSession {
    const formatted = this.formatE164(phoneNumber);
    const now = Date.now();
    const generatedCode = Math.floor(100000 + Math.random() * 900000).toString();

    const session: StoredOtpSession = {
      sid: `VE_${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
      phoneNumber: formatted,
      codeSent: generatedCode,
      createdAt: now,
      expiresAt: now + 10 * 60 * 1000, // 10 minutes
      attempts: 0,
      maxAttempts: 5,
      isLocked: false,
      status: 'pending',
    };

    this.sessions.set(formatted, session);
    return session;
  }

  getSession(phoneNumber: string): StoredOtpSession | undefined {
    const formatted = this.formatE164(phoneNumber);
    return this.sessions.get(formatted);
  }

  // Handle verify-otp request with thorough validation
  verifyOtp(body: VerifyOtpRequestBody, headers?: Record<string, string | string[] | undefined>): VerifyOtpResponse {

    // 1. Validate input parameters
    if (!body.phoneNumber || body.phoneNumber.trim().length < 7) {
      return {
        success: false,
        status: 'error',
        statusCode: 400,
        error: 'INVALID_PHONE',
        message: 'Please provide a valid mobile number with country code.',
        diagnosticAdvice: 'Ensure phone includes country code or 10-digit number (e.g. +1 919-555-0198).',
      };
    }

    const cleanCode = (body.code || '').replace(/\D/g, '');
    if (!cleanCode || cleanCode.length !== 6) {
      return {
        success: false,
        status: 'error',
        statusCode: 400,
        error: 'INVALID_CODE',
        message: 'Verification code must be exactly 6 digits.',
        diagnosticAdvice: 'Check the SMS message sent to your phone and enter all 6 digits.',
      };
    }

    const formattedPhone = this.formatE164(body.phoneNumber);
    const session = this.sessions.get(formattedPhone);

    // 2. Check if session exists in memory
    if (!session) {
      return {
        success: false,
        status: 'failed',
        statusCode: 404,
        error: 'SESSION_NOT_FOUND',
        message: 'No active verification session found for this number. Please request a new code.',
        canResend: true,
        diagnosticAdvice: 'The verification session may have expired or was dispatched to a different number.',
      };
    }

    // 3. Check if session is currently locked due to rate limiting
    const now = Date.now();
    if (session.isLocked && session.lockUntil && now < session.lockUntil) {
      const remainingSeconds = Math.ceil((session.lockUntil - now) / 1000);
      return {
        success: false,
        status: 'rate_limited',
        statusCode: 429,
        error: 'RATE_LIMITED',
        message: `Too many incorrect attempts. Please wait ${remainingSeconds} seconds before trying again.`,
        retryAfterSeconds: remainingSeconds,
        diagnosticAdvice: 'Account temporarily locked to protect your mobile identity against brute force.',
      };
    } else if (session.isLocked && session.lockUntil && now >= session.lockUntil) {
      // Unlock after cooldown
      session.isLocked = false;
      session.attempts = 0;
      session.lockUntil = undefined;
    }

    // 4. Check if actual session has expired (exceeded 10 minutes)
    if (now > session.expiresAt || session.status === 'expired') {
      session.status = 'expired';
      return {
        success: false,
        status: 'expired',
        statusCode: 410,
        error: 'TOKEN_EXPIRED',
        message: 'This verification code has expired after 10 minutes. Please request a new SMS code.',
        expiredAt: new Date(session.expiresAt).toISOString(),
        canResend: true,
        diagnosticAdvice: 'Security tokens are invalidated 10 minutes post-dispatch.',
      };
    }

    // 5. Validate the code
    const isCodeValid = cleanCode === session.codeSent;

    if (isCodeValid) {
      session.status = 'approved';
      session.attempts = 0;
      session.isLocked = false;
      return {
        success: true,
        status: 'approved',
        statusCode: 200,
        message: 'Mobile number verified successfully.',
        verifiedAt: new Date().toISOString(),
      };
    }

    // 6. Invalid code: Increment attempts and evaluate lock out
    session.attempts += 1;
    const attemptsRemaining = Math.max(0, session.maxAttempts - session.attempts);

    if (attemptsRemaining === 0) {
      session.isLocked = true;
      session.lockUntil = now + 60 * 1000; // 60-second cooldown
      return {
        success: false,
        status: 'rate_limited',
        statusCode: 429,
        error: 'RATE_LIMITED',
        message: 'Maximum verification attempts exceeded (5/5). Account locked for 60 seconds.',
        attemptsUsed: session.attempts,
        attemptsRemaining: 0,
        retryAfterSeconds: 60,
        canResend: true,
        diagnosticAdvice: 'For safety, multiple failed verification attempts trigger a 1-minute protective cooldown.',
      };
    }

    return {
      success: false,
      status: 'failed',
      statusCode: 400,
      error: 'INVALID_CODE',
      message: `Incorrect verification code. Please check your SMS and try again (${attemptsRemaining} attempt${attemptsRemaining === 1 ? '' : 's'} remaining).`,
      attemptsUsed: session.attempts,
      attemptsRemaining,
      diagnosticAdvice: 'Double-check the 6-digit code received via SMS.',
    };
  }

  // Get active session count / debugging info
  getAllSessions(): StoredOtpSession[] {
    return Array.from(this.sessions.values());
  }
}

export const phoneAuthStore = new PhoneAuthStore();
