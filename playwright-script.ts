import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  // Navigate to the app (assuming it's running on port 3000)
  await page.goto('http://localhost:3000');
  await page.waitForTimeout(1000); // Wait for auth gate to mount

  // Dismiss any staging auth modals by setting a cookie or simulating login if needed
  await page.evaluate(() => {
    // The auth gate intercepts pointers. Remove it from DOM.
    const modals = document.querySelectorAll('.z-\\[100\\]');
    modals.forEach(el => el.remove());
  });

  await page.waitForTimeout(500);

  // Wait for the Dates popover trigger to appear
  await page.waitForSelector('text=Assignment dates', { state: 'visible' });

  // Find the button inside the Dates section and click it forceably
  const datesButton = page.locator('text=Assignment dates').locator('..').locator('button').first();
  await datesButton.click({ force: true });

  // Wait for the popover to animate in (it uses framer-motion)
  await page.waitForTimeout(800);

  // Take a screenshot of the opened dates popover
  await page.screenshot({ path: 'verification/screenshots/verification_dates_popover_update.png', fullPage: true });

  console.log("Screenshots captured successfully.");
  await browser.close();
})();
