import { test, expect } from '@playwright/test';

test('capture host portal', async ({ page }) => {
  await page.goto('http://localhost:3000');
  await page.waitForTimeout(2000);

  // Bypass the Staging Auth Gate
  await page.evaluate("document.querySelectorAll('.fixed').forEach(m => { if(m.className.includes('z-[100]')) m.remove() })");

  // Click on "Host" in the top navigation to go to the Host Portal
  await page.click('text=Host');

  // Wait for the Host Portal to render
  await page.waitForTimeout(3000);

  // Take a screenshot of the Host Portal
  await page.screenshot({ path: '/home/jules/verification/host-portal-fixed.png', fullPage: true });
});
