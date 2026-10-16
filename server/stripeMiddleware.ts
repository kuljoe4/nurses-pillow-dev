import { Request, Response, NextFunction } from 'express';
import Stripe from 'stripe';

/**
 * Stripe API Error Handling & Logging Middleware specifically tuned for booking capture,
 * payment intents, and transfer flows. Captures, logs, and formats Stripe API error responses
 * to debug 'requires_payment_method', card declines, and other Stripe errors in the logs.
 */
export function handleStripeError(err: any, req: Request, res: Response, next: NextFunction) {
  if (
    err instanceof Stripe.errors.StripeError ||
    (err && (err.type || err.code || err.rawType || err.statusCode))
  ) {
    const statusCode = err.statusCode || 400;
    const stripeErrorDetails = {
      timestamp: new Date().toISOString(),
      path: req.originalUrl || req.path,
      method: req.method,
      errorType: err.type || err.rawType || 'StripeError',
      errorCode: err.code || 'unknown_stripe_error',
      message: err.message,
      declineCode: err.decline_code,
      param: err.param,
      requestId: err.requestId,
      statusCode: statusCode,
      charge: err.charge,
    };

    console.error('==================================================');
    console.error('🔴 STRIPE API ERROR [Booking Capture / Transfer Flow]:');
    console.error(JSON.stringify(stripeErrorDetails, null, 2));
    console.error('==================================================');

    return res.status(statusCode).json({
      error: err.message || 'An error occurred with Stripe processing.',
      code: err.code || 'stripe_error',
      type: err.type || 'StripeError',
      param: err.param || null,
      requestId: err.requestId || null,
      decline_code: err.decline_code || null,
    });
  }

  // If not a Stripe error, pass to next error handler
  return next(err);
}

/**
 * Async wrapper middleware for Stripe routes to catch and forward errors to stripe error handler
 */
export function stripeRouteWrapper(fn: Function) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await fn(req, res, next);
    } catch (error: any) {
      handleStripeError(error, req, res, next);
    }
  };
}
