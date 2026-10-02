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

        # Click "Search housing ->" instead of Explore Stays (since it might just be text in the header and Search Housing is the main CTA)
        await page.click("text=Search housing")

        # Give it a few seconds to load the next view then screenshot it
        await page.wait_for_timeout(3000)
        await page.screenshot(path="verification/search-view.png")
        print("Screenshot saved to verification/search-view.png")

        await browser.close()

if __name__ == "__main__":
    asyncio.run(main())
