import { chromium } from "playwright";
import fs from "node:fs/promises";
import path from "node:path";

const outputDir = path.resolve("artifacts", "progress-screenshots");

const pages = [
  { name: "01-dashboard.png", url: "http://localhost:5174/" },
  { name: "02-problems-list.png", url: "http://localhost:5174/problems" },
  { name: "03-problem-detail.png", url: "http://localhost:5174/problems/two-sum" },
  { name: "04-submission-history.png", url: "http://localhost:5174/submissions" },
  { name: "05-leaderboard.png", url: "http://localhost:5174/leaderboard" },
  { name: "06-profile.png", url: "http://localhost:5174/profile" },
  { name: "07-admin.png", url: "http://localhost:5174/admin" }
];

async function ensureDir() {
  await fs.mkdir(outputDir, { recursive: true });
}

async function login(page) {
  await page.goto("http://localhost:5174/login", { waitUntil: "networkidle" });
  await page.getByPlaceholder("you@example.com").fill("nadia@example.com");
  await page.getByPlaceholder("Enter password").fill("password123");
  await page.getByRole("button", { name: /login/i }).click();
  await page.waitForURL("**/dashboard", { timeout: 15000 }).catch(() => page.waitForURL("**/", { timeout: 15000 }));
}

async function capture() {
  await ensureDir();
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 1100 } });

  await login(page);

  for (const item of pages) {
    await page.goto(item.url, { waitUntil: "networkidle" });
    await page.screenshot({
      path: path.join(outputDir, item.name),
      fullPage: true
    });
  }

  await browser.close();
  console.log(`Saved screenshots to ${outputDir}`);
}

capture().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
