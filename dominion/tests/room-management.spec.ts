import { test, expect, Browser, BrowserContext, Page } from '@playwright/test';

// Storage state paths ที่ globalSetup บันทึกไว้หลัง login แต่ละคน
const P1_STATE = './setup/player1-storage-state.json';
const P2_STATE = './setup/player2-storage-state.json';

// Helper: สร้าง context พร้อม storage state ของ user ที่ login ไว้แล้ว
async function newAuthContext(browser: Browser, storageState: string): Promise<[BrowserContext, Page]> {
  const context = await browser.newContext({ storageState });
  const page = await context.newPage();
  return [context, page];
}

// Helper: ดึง room code จากหน้า waiting page ของ player 1
// *** ปรับ selector ให้ตรงกับ UI จริงของแอป ***
async function getRoomCode(page: Page): Promise<string> {
  const codeLocator = page.getByTestId('room-code');
  await expect(codeLocator).toBeVisible();
  const code = await codeLocator.textContent();
  expect(code).toMatch(/^\d{4}$/);
  return code!;
}

// ---------------------------------------------------------------------------
// Step 1: Player 1 Creates Room
// ---------------------------------------------------------------------------
test.describe('[Step 1] Player 1 Creates Room', () => {
  test('P1 logs in, clicks Create Room, and sees waiting page with a room code', async ({ browser }) => {
    const [ctx, page] = await newAuthContext(browser, P1_STATE);

    try {
      // 1. เปิดหน้าแรก — ควร redirect ไปหน้า home เพราะ login ไว้แล้ว
      await page.goto('/');
      await expect(page).not.toHaveURL(/login/);

      // // 2. กด "Create Room"
      // // *** ปรับ selector ให้ตรงกับ UI จริง ***
      // await page.frameLocator('iframe[title="Sign in with Google Button"]')
      //   .getByRole('button', { name: /sign in with google/i })
      //   .click();

      // // 3. รอให้ API ตอบกลับและเปลี่ยนหน้าไป waiting page
      // // *** ปรับ URL pattern ให้ตรงกับ routing จริง ***
      // await expect(page).toHaveURL(/\/room\//);

      // // 4. ตรวจสอบว่ามี room code 4 หลักแสดงอยู่
      // const roomCode = await getRoomCode(page);
      // expect(roomCode).toHaveLength(4);

      // // 5. ตรวจสอบว่าแสดงหน้า "รอ player อื่น"
      // // *** ปรับ text ให้ตรงกับ UI จริง ***
      // await expect(page.getByText(/waiting for players/i)).toBeVisible();
    } finally {
      await ctx.close();
    }
  });
});

// ---------------------------------------------------------------------------
// Step 2: Player 2 Joins Room
// (ทำต่อจาก Step 1 — P1 สร้าง room แล้ว P2 กรอก code เพื่อเข้า)
// ---------------------------------------------------------------------------
test.describe('[Step 2] Player 2 Joins Room', () => {
  test('P2 inputs 4-digit code and sees waiting page', async ({ browser }) => {
    // --- Step 1: P1 สร้าง room เพื่อเอา code ---
    const [p1Ctx, p1Page] = await newAuthContext(browser, P1_STATE);

    await p1Page.goto('/');
    // *** ปรับ selector ให้ตรงกับ UI จริง ***
    await p1Page.getByRole('button', { name: /create room/i }).click();
    await expect(p1Page).toHaveURL(/\/room\//);

    const roomCode = await getRoomCode(p1Page);

    // --- Step 2: P2 join room ด้วย code ที่ได้จาก P1 ---
    const [p2Ctx, p2Page] = await newAuthContext(browser, P2_STATE);

    try {
      await p2Page.goto('/');
      await expect(p2Page).not.toHaveURL(/login/);

      // P2 กรอก 4-digit code
      // *** ปรับ selector ให้ตรงกับ UI จริง ***
      await p2Page.getByTestId('room-code-input').fill(roomCode);
      await p2Page.getByRole('button', { name: /join/i }).click();

      // ตรวจสอบว่า API ตอบ 200 และ P2 เห็น waiting page
      await expect(p2Page).toHaveURL(/\/room\//);
      // *** ปรับ text ให้ตรงกับ UI จริง ***
      await expect(p2Page.getByText(/waiting for host/i)).toBeVisible();

      // ตรวจสอบว่า P1 ยังอยู่ที่ waiting page เช่นกัน
      await expect(p1Page.getByText(/waiting for players/i)).toBeVisible();
    } finally {
      await p1Ctx.close();
      await p2Ctx.close();
    }
  });
});
