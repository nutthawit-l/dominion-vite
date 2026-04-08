import { test, expect } from '@playwright/test'

test('Step 1: Player 1 Creates Room', async ({ page }) => {
  // Open site → Lobby shown
  await page.goto('/')
  await expect(page.getByText('DOMINION')).toBeVisible()
  await expect(page.getByText('Create New Room')).toBeVisible()

  // Click "Create New Room" → POST /rooms → WaitingRoom shown
  await page.getByText('Create New Room').click()
  await expect(page.getByText('Room Code:')).toBeVisible({ timeout: 10000 })

  // Room code is a 4-character string
  const codeEl = page.locator('text=/^[A-Z0-9]{4}$/')
  await expect(codeEl).toBeVisible()

  // Host is Player 1, Player 2 slot is empty
  await expect(page.getByText('Host')).toBeVisible()
  await expect(page.getByText('VS')).toBeVisible()
  await expect(page.getByText('Waiting...')).toBeVisible()

  // Start Game disabled until Player 2 joins
  await expect(page.getByRole('button', { name: 'Start Game' })).toBeDisabled()

  // Host closes room → back to Lobby
  await page.getByRole('button', { name: 'Close Room' }).click()
  await expect(page.getByText('Create New Room')).toBeVisible({ timeout: 10000 })
})
