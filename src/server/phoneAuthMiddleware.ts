// Nurses Pillow - Phone Verification Connect/Express Middleware for Vite dev & preview server
// Implements /api/auth/phone/send-otp and /api/auth/phone/verify-otp

import type { IncomingMessage, ServerResponse } from 'http';
import { phoneAuthStore } from '../services/phoneAuthApi.ts';

export function createPhoneAuthMiddleware() {
  return async (req: IncomingMessage, res: ServerResponse, next: () => void) => {
    const url = req.url || '';

    // Only process /api/auth/phone/*
    if (!url.startsWith('/api/auth/phone')) {
      return next();
    }

    // CORS & Content-Type Headers
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-simulate-error, Authorization');

    if (req.method === 'OPTIONS') {
      res.statusCode = 204;
      res.end();
      return;
    }

    if (req.method !== 'POST') {
      res.statusCode = 405;
      res.end(
        JSON.stringify({
          success: false,
          statusCode: 405,
          error: 'METHOD_NOT_ALLOWED',
          message: 'Only POST requests are supported.',
        })
      );
      return;
    }

    // Read request body safely
    const chunks: Buffer[] = [];
    try {
      for await (const chunk of req) {
        chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
      }
      const rawBody = Buffer.concat(chunks).toString('utf8');
      let body: any = {};
      if (rawBody.trim()) {
        try {
          body = JSON.parse(rawBody);
        } catch {
          res.statusCode = 400;
          res.end(
            JSON.stringify({
              success: false,
              statusCode: 400,
              error: 'INVALID_JSON',
              message: 'Malformed request payload. Please verify your data format.',
            })
          );
          return;
        }
      }

      // Route 1: /api/auth/phone/send-otp
      if (url.includes('/send-otp')) {
        const phoneNumber = body.phoneNumber;
        if (!phoneNumber || typeof phoneNumber !== 'string' || phoneNumber.trim().length < 7) {
          res.statusCode = 400;
          res.end(
            JSON.stringify({
              success: false,
              statusCode: 400,
              error: 'INVALID_PHONE',
              message: 'Please provide a valid mobile phone number.',
            })
          );
          return;
        }

        const session = phoneAuthStore.createSession(phoneNumber);
        res.statusCode = 200;
        res.end(
          JSON.stringify({
            success: true,
            statusCode: 200,
            sid: session.sid,
            to: session.phoneNumber,
            status: 'pending',
            codeSent: session.codeSent,
            createdAt: new Date(session.createdAt).toISOString(),
            expiresInSeconds: 600,
            deliveryTimeMs: Math.floor(140 + Math.random() * 100),
            message: 'Verification code dispatched successfully.',
          })
        );
        return;
      }

      // Route 2: /api/auth/phone/verify-otp (Robust Error-Handling Layer)
      if (url.includes('/verify-otp')) {
        const headers = req.headers as Record<string, string | string[] | undefined>;
        const simulateHeader = headers?.['x-simulate-error'];
        const simulateError = body.simulateError || (typeof simulateHeader === 'string' ? simulateHeader : undefined);

        // 1. Network Failure Check -> HTTP 503
        if (simulateError === 'network' || body.code === '999999') {
          res.statusCode = 503;
          res.end(
            JSON.stringify({
              success: false,
              status: 'error',
              statusCode: 503,
              error: 'NETWORK_FAILURE',
              message: 'Unable to reach the verification network. Please check your connection and retry.',
              canResend: true,
              diagnosticAdvice: 'Network communication timed out. Check your cellular signal or Wi-Fi connection.',
            })
          );
          return;
        }

        // 2. Parameter Presence & Validation -> HTTP 400
        if (!body.phoneNumber || typeof body.phoneNumber !== 'string' || body.phoneNumber.trim().length < 7) {
          res.statusCode = 400;
          res.end(
            JSON.stringify({
              success: false,
              status: 'error',
              statusCode: 400,
              error: 'INVALID_PHONE',
              message: 'Please provide a valid mobile number with country code.',
              diagnosticAdvice: 'Enter your 10-digit mobile number to verify.',
            })
          );
          return;
        }

        const cleanCode = (body.code || '').toString().replace(/\D/g, '');
        if (!cleanCode || cleanCode.length !== 6) {
          res.statusCode = 400;
          res.end(
            JSON.stringify({
              success: false,
              status: 'error',
              statusCode: 400,
              error: 'INVALID_CODE',
              message: 'Verification code must be exactly 6 digits.',
              diagnosticAdvice: 'Check the SMS sent to your phone and enter all 6 digits.',
            })
          );
          return;
        }

        // 3. Expired Token Check -> HTTP 410
        if (simulateError === 'expired' || cleanCode === '000000') {
          res.statusCode = 410;
          res.end(
            JSON.stringify({
              success: false,
              status: 'expired',
              statusCode: 410,
              error: 'TOKEN_EXPIRED',
              message: 'This verification code has expired after 10 minutes. Please request a new code.',
              expiredAt: new Date(Date.now() - 30000).toISOString(),
              canResend: true,
              diagnosticAdvice: 'Security codes expire after 10 minutes to protect your account.',
            })
          );
          return;
        }

        // 4. Rate Limiting Check -> HTTP 429
        if (simulateError === 'rate_limit' || cleanCode === '888888') {
          res.statusCode = 429;
          res.end(
            JSON.stringify({
              success: false,
              status: 'rate_limited',
              statusCode: 429,
              error: 'RATE_LIMITED',
              message: 'Too many incorrect attempts. For your account security, verification is locked for 60 seconds.',
              retryAfterSeconds: 60,
              diagnosticAdvice: 'Account lockout active after repeated attempts. Please wait 60 seconds.',
            })
          );
          return;
        }

        // 5. Verify against session store
        const verificationResult = phoneAuthStore.verifyOtp(body, headers);
        res.statusCode = verificationResult.statusCode || (verificationResult.success ? 200 : 400);
        res.end(JSON.stringify(verificationResult));
        return;
      }

      // 404 for unknown endpoints
      res.statusCode = 404;
      res.end(
        JSON.stringify({
          success: false,
          statusCode: 404,
          error: 'NOT_FOUND',
          message: 'Requested verification endpoint not found.',
        })
      );
    } catch (err: any) {
      res.statusCode = 500;
      res.end(
        JSON.stringify({
          success: false,
          statusCode: 500,
          error: 'SERVER_ERROR',
          message: 'An unexpected verification error occurred. Please try again.',
        })
      );
    }
  };
}
