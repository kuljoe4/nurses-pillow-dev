import asyncio
from playwright.async_api import async_playwright

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        page = await browser.new_page(viewport={"width": 1280, "height": 800})

        # Navigate to the local dev server
        await page.goto("http://localhost:3000")

        # Bypass the auth gate modal by removing it from the DOM
        # (Using the script specifically from memory AGENTS.md instruction)
        await page.evaluate("document.querySelectorAll('.fixed.inset-0.z-\\[100\\]').forEach(m => m.remove())")

        # Fallback to bypass via session storage just in case:
        await page.evaluate("sessionStorage.setItem('np_staging_auth_lawrence', 'true'); sessionStorage.setItem('np_staging_user', 'client');")
        await page.reload()

        # Wait for the main page to load
        await page.wait_for_selector("text=Explore Stays", timeout=5000)

        # Click "Explore Stays"
        await page.click("text=Explore Stays")

        # Wait for listings to appear
        await page.wait_for_selector("button:has-text('View details')", timeout=10000)

        # Click the first "View details" button
        await page.locator("button:has-text('View details')").first.click()

        # Wait for the listing detail modal
        await page.wait_for_selector("text=Request to book", timeout=10000)

        # Click "Request to book"
        await page.click("text=Request to book")

        # Wait for the itemized checkout modal to appear (e.g., look for "Total")
        await page.wait_for_selector("text=Total", timeout=10000)

        # Take a screenshot
        await page.screenshot(path="verification/checkout-modal.png")

        print("Screenshot saved to verification/checkout-modal.png")
        await browser.close()

if __name__ == "__main__":
    asyncio.run(main())
