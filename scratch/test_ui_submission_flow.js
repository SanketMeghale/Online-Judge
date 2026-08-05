import { chromium } from "playwright";

(async () => {
  console.log("Launching browser to test submission UI flow on port 8080...");
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  try {
    await page.goto("http://localhost:8080/problems/two-sum", { waitUntil: "networkidle" });
    console.log("Navigated to Two Sum problem workspace.");

    // Click Submit button
    const submitBtn = await page.locator("button:has-text('Submit')").first();
    if (await submitBtn.isVisible()) {
      await submitBtn.click();
      console.log("Clicked Submit button.");
    }

    // Wait 2.5 seconds for evaluation polling/socket update
    await page.waitForTimeout(2500);

    // Capture screenshot of result
    const screenshotPath = "C:/Users/Admin/.gemini/antigravity/brain/799bb6b1-b41f-4bb3-8b17-a84a4a4b3ce6/.tempmediaStorage/submission_fixed.png";
    await page.screenshot({ path: screenshotPath, fullPage: false });
    console.log(`Saved screenshot to ${screenshotPath}`);
  } catch (err) {
    console.error("Test error:", err);
  } finally {
    await browser.close();
  }
})();
