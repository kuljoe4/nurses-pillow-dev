import { describe, it, expect, beforeAll, afterAll } from "bun:test";
import { createServer } from "http";
import { createPhoneAuthMiddleware } from "../phoneAuthMiddleware.ts";

describe("Phone Auth Middleware", () => {
    let server: ReturnType<typeof createServer>;
    let port: number;

    beforeAll(() => {
        const middleware = createPhoneAuthMiddleware();
        server = createServer(async (req, res) => {
            await middleware(req, res, () => {
                res.statusCode = 404;
                res.end("Not Found");
            });
        });

        server.listen(0);
        port = (server.address() as any).port;
    });

    afterAll(() => {
        server.close();
    });

    it("should return 503 for simulated network error via header", async () => {
        const response = await fetch(`http://localhost:${port}/api/auth/phone/verify-otp`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "x-simulate-error": "network"
            },
            body: JSON.stringify({
                phoneNumber: "1234567890",
                code: "123456"
            })
        });

        expect(response.status).toBe(503);
        const data = await response.json();
        expect(data.error).toBe("NETWORK_FAILURE");
    });

    it("should return 503 for simulated network error via code 999999", async () => {
        const response = await fetch(`http://localhost:${port}/api/auth/phone/verify-otp`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                phoneNumber: "1234567890",
                code: "999999"
            })
        });

        expect(response.status).toBe(503);
        const data = await response.json();
        expect(data.error).toBe("NETWORK_FAILURE");
    });
});
