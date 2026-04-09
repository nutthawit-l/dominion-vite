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

test('Step 2: Player 2 Joins Room', async ({ page }) => {
  const ROOM_CODE = 'AB12'

  // Mock POST /rooms/join — no real room needed; test only covers P2's UI flow
  await page.route('**/api/v1/rooms/join', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        code: ROOM_CODE,
        status: 'WAITING',
        player1: {
          id: 'fake-host-id',
          googleId: 'fake-google-id',
          name: 'Player One',
          email: 'player1@example.com',
          googleAvatar: '',
          chosenAvatar: 'google',
        },
        player2: {
          id: 'dc04937ded93052d002346a275ac0110', // current player (suwan)
          googleId: '110555561403822523744',
          name: 'suwan suwan',
          email: 'suwan14797@gmail.com',
          googleAvatar: 'https://lh3.googleusercontent.com/a/ACg8ocIIQUVrmFmVZncxo-uQCgHAZOIhx8cWhp8-eaUUE7AfPRApMQ=s96-c',
          chosenAvatar: 'google',
        },
      }),
    })
  })

  // Mock WebSocket — simulate API broadcasting "Player 2 Joined"
  // Sequence: API->>App (WS broadcast) → App calls refreshRoom() → GET /rooms/AB12 → P2 sees "Waiting for Host to Start"
  await page.routeWebSocket(`ws://localhost:3000/api/v1/rooms/${ROOM_CODE}/ws*`, ws => {
    ws.send(JSON.stringify({ status: 'WAITING' }))
  })

  // Mock GET /rooms/AB12 so WaitingRoom refresh calls stay stable
  await page.route(`**/api/v1/rooms/${ROOM_CODE}`, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        code: ROOM_CODE,
        status: 'WAITING',
        player1: {
          id: 'fake-host-id',
          name: 'Player One',
          email: 'player1@example.com',
          googleAvatar: '',
          chosenAvatar: 'google',
        },
        player2: {
          id: 'dc04937ded93052d002346a275ac0110',
          name: 'suwan suwan',
          email: 'suwan14797@gmail.com',
          googleAvatar: 'https://lh3.googleusercontent.com/a/ACg8ocIIQUVrmFmVZncxo-uQCgHAZOIhx8cWhp8-eaUUE7AfPRApMQ=s96-c',
          chosenAvatar: 'google',
        },
      }),
    })
  })

  // Open site → P2 is already logged in (from auth.json)
  await page.goto('/')
  await expect(page.getByText('Create New Room')).toBeVisible()

  // P2 inputs 4-digit code → POST /rooms/join → WaitingRoom shown
  await page.getByPlaceholder('ROOM CODE').fill(ROOM_CODE)
  await page.getByRole('button', { name: 'Join' }).click()

  await expect(page.getByText('Room Code:')).toBeVisible({ timeout: 10000 })
  await expect(page.getByText(ROOM_CODE)).toBeVisible()

  // P2 sees "Waiting for Host to Start" — not the Start Game button
  await expect(page.getByText('Waiting for Host to Start')).toBeVisible()

  // P2 sees Leave Room — not Close Room
  await expect(page.getByRole('button', { name: 'Leave Room' })).toBeVisible()

  // Both players shown in WaitingRoom
  await expect(page.getByText('Player One')).toBeVisible()
  await expect(page.getByText('suwan suwan')).toBeVisible()

  // P2 leaves → back to Lobby
  await page.route('**/api/v1/rooms/*/leave', async (route) => route.fulfill({ status: 200, body: '{}' }))
  await page.getByRole('button', { name: 'Leave Room' }).click()
  await expect(page.getByText('Create New Room')).toBeVisible({ timeout: 10000 })
})


test('Step 3: Sync State', async ({ page }) => {
  const ROOM_CODE = 'AB12'
  let player2Joined = false
  let triggerP2Join!: () => void
  // The test manually fires this after asserting the disabled state
  const p2JoinSignal = new Promise<void>(resolve => { triggerP2Join = resolve })

  // Mock POST /rooms — P1 (suwan) creates a room; no P2 yet
  await page.route('**/api/v1/rooms', async (route) => {
    if (route.request().method() !== 'POST') return route.continue()
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        code: ROOM_CODE,
        status: 'WAITING',
        player1: {
          id: 'dc04937ded93052d002346a275ac0110', // current player (suwan) is host
          name: 'suwan suwan',
          email: 'suwan14797@gmail.com',
          googleAvatar: 'https://lh3.googleusercontent.com/a/ACg8ocIIQUVrmFmVZncxo-uQCgHAZOIhx8cWhp8-eaUUE7AfPRApMQ=s96-c',
          chosenAvatar: 'google',
        },
        player2: null,
      }),
    })
  })

  // Mock WebSocket — holds until the test manually calls triggerP2Join()
  // Sequence: API->>App (WS broadcast) → App calls refreshRoom() → GET /rooms/AB12 → P1 sees Start Game enabled
  await page.routeWebSocket(`ws://localhost:3000/api/v1/rooms/${ROOM_CODE}/ws*`, ws => {
    p2JoinSignal.then(() => {
      player2Joined = true // next GET /rooms/AB12 returns P2
      ws.send(JSON.stringify({ status: 'WAITING' }))
    })
  })

  // Mock GET /rooms/AB12 — returns P2 only after WS broadcast sets player2Joined
  await page.route(`**/api/v1/rooms/${ROOM_CODE}`, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        code: ROOM_CODE,
        status: 'WAITING',
        player1: {
          id: 'dc04937ded93052d002346a275ac0110',
          name: 'suwan suwan',
          email: 'suwan14797@gmail.com',
          googleAvatar: 'https://lh3.googleusercontent.com/a/ACg8ocIIQUVrmFmVZncxo-uQCgHAZOIhx8cWhp8-eaUUE7AfPRApMQ=s96-c',
          chosenAvatar: 'google',
        },
        player2: player2Joined ? {
          id: 'fake-p2-id',
          name: 'Player Two',
          email: 'player2@example.com',
          googleAvatar: '',
          chosenAvatar: 'google',
        } : null,
      }),
    })
  })

  // Open site → P1 (suwan) is already logged in (from auth.json)
  await page.goto('/')
  await expect(page.getByText('Create New Room')).toBeVisible()

  // P1 creates room → POST /rooms → WaitingRoom shown with only P1
  await page.getByText('Create New Room').click()
  await expect(page.getByText('Room Code:')).toBeVisible({ timeout: 10000 })
  await expect(page.getByText(ROOM_CODE)).toBeVisible()

  // P1 sees Start Game disabled and P2 slot empty
  await expect(page.getByRole('button', { name: 'Start Game' })).toBeDisabled()
  await expect(page.getByText('Waiting...')).toBeVisible()

  // Simulate API broadcasting "Player 2 Joined" via WebSocket
  triggerP2Join()

  // WS broadcast → refreshRoom() → Start Game enabled, P2 shown
  await expect(page.getByRole('button', { name: 'Start Game' })).toBeEnabled({ timeout: 10000 })
  await expect(page.getByText('Player Two')).toBeVisible()

  // P1 closes room → back to Lobby
  await page.route('**/api/v1/rooms/AB12', async (route) => {
    if (route.request().method() === 'DELETE') return route.fulfill({ status: 200, body: '{}' })
    return route.continue()
  })
  await page.getByRole('button', { name: 'Close Room' }).click()
  await expect(page.getByText('Create New Room')).toBeVisible({ timeout: 10000 })
})

test('Step 4: Player 1 Kicks Player 2', async ({ page }) => {
  const ROOM_CODE = 'AB12'
  let player2Present = true
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let wsRoute: any

  const player1 = {
    id: 'dc04937ded93052d002346a275ac0110',
    name: 'suwan suwan',
    email: 'suwan14797@gmail.com',
    googleAvatar: 'https://lh3.googleusercontent.com/a/ACg8ocIIQUVrmFmVZncxo-uQCgHAZOIhx8cWhp8-eaUUE7AfPRApMQ=s96-c',
    chosenAvatar: 'google',
  }
  const player2 = {
    id: 'fake-p2-id',
    name: 'Player Two',
    email: 'player2@example.com',
    googleAvatar: '',
    chosenAvatar: 'google',
  }

  // Mock POST /rooms — room created with P2 already present (both players in WaitingRoom)
  await page.route('**/api/v1/rooms', async (route) => {
    if (route.request().method() !== 'POST') return route.continue()
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ code: ROOM_CODE, status: 'WAITING', player1, player2 }),
    })
  })

  // Capture WS connection — kick route will use it to broadcast the event
  await page.routeWebSocket(`ws://localhost:3000/api/v1/rooms/${ROOM_CODE}/ws*`, ws => {
    wsRoute = ws
  })

  // Mock GET /rooms/AB12 — P2 disappears after kick
  // Mock DELETE /rooms/AB12 — close room at the end
  await page.route(`**/api/v1/rooms/${ROOM_CODE}`, async (route) => {
    if (route.request().method() === 'DELETE') return route.fulfill({ status: 200, body: '{}' })
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        code: ROOM_CODE,
        status: 'WAITING',
        player1,
        player2: player2Present ? player2 : null,
      }),
    })
  })

  // Mock POST /rooms/kick — fulfill then broadcast kick event via WS
  // Sequence: POST kick → API removes P2 → WS broadcast → P1 calls refreshRoom() → UI updates
  await page.route(`**/api/v1/rooms/${ROOM_CODE}/kick`, async (route) => {
    await route.fulfill({ status: 200, contentType: 'application/json', body: '{}' })
    player2Present = false
    wsRoute?.send(JSON.stringify({ kickedPlayerID: player2.id }))
  })

  // Open site → P1 (suwan) is already logged in (from auth.json)
  await page.goto('/')
  await expect(page.getByText('Create New Room')).toBeVisible()

  // P1 creates room → WaitingRoom shown with both players
  await page.getByText('Create New Room').click()
  await expect(page.getByText('Room Code:')).toBeVisible({ timeout: 10000 })
  await expect(page.getByText('Player Two')).toBeVisible()
  await expect(page.getByRole('button', { name: 'Start Game' })).toBeEnabled()

  // P1 clicks the kick (×) button next to P2
  await page.getByTitle('Kick Player').click()

  // WS broadcasts kickedPlayerID → refreshRoom() → P2 removed, Start Game disabled
  await expect(page.getByRole('button', { name: 'Start Game' })).toBeDisabled({ timeout: 10000 })
  await expect(page.getByText('Waiting...')).toBeVisible()
  await expect(page.getByText('Player Two')).not.toBeVisible()

  // P1 closes room → back to Lobby
  await page.getByRole('button', { name: 'Close Room' }).click()
  await expect(page.getByText('Create New Room')).toBeVisible({ timeout: 10000 })
})
