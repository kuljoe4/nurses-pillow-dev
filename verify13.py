import asyncio
from playwright.async_api import async_playwright

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        page = await browser.new_page(viewport={"width": 1280, "height": 800})

        # Navigate to the local dev server
        await page.goto("http://localhost:3000")

        # Bypass via session storage
        await page.evaluate("sessionStorage.setItem('np_staging_auth_lawrence', 'true'); sessionStorage.setItem('np_staging_user', 'client');")
        await page.reload()

        # Wait for the main page to load
        await page.wait_for_selector("text=Search housing", timeout=5000)

        # Click "Search housing"
        await page.click("text=Search housing")

        # Wait for listings to appear and the "Book Stay" button
        await page.wait_for_selector("text=Book Stay", timeout=10000)

        # Click the first "Details" or "Book Stay" button
        await page.locator("text=Details").first.click()

        # Wait for the listing detail modal
        await page.wait_for_selector("text=Request to book", timeout=10000)

        # Take a screenshot to see what is happening before clicking Request to Book
        await page.screenshot(path="verification/before-request-to-book.png")
        print("Screenshot saved to verification/before-request-to-book.png")

        # Click "Request to book"
        await page.click("text=Request to book")

        await page.wait_for_timeout(3000)

        # Take a screenshot
        await page.screenshot(path="verification/checkout-modal.png")
        print("Screenshot saved to verification/checkout-modal.png")

        await browser.close()

if __name__ == "__main__":
    asyncio.run(main())
