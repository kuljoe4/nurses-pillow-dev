import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  console.log('Navigating to http://localhost:3000');
  await page.goto('http://localhost:3000');
  await page.waitForTimeout(5000);

  console.log('Trying to remove auth gate');
  await page.evaluate("document.querySelectorAll('.fixed').forEach(m => { if(m.className.includes('z-[100]')) m.remove() })");
  await page.waitForTimeout(1000);

  console.log('Taking screenshot');
  await page.screenshot({ path: '/home/jules/verification/home-page.png', fullPage: true });

  await browser.close();
  console.log('Done');
})();
