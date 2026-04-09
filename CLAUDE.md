# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

All commands below assume you are in the appropriate subdirectory unless using `make`.

### Frontend (`dominion/`)
```bash
pnpm install          # install dependencies
pnpm dev              # start dev server (or: make run-frontend)
pnpm build            # tsc -b && vite build
pnpm lint             # eslint .
```

### Backend (`dominion-api/`)
```bash
go mod download       # install dependencies (or: make install-backend)
air                   # start with hot reload (or: make run-backend)
go run main.go        # start without hot reload
```

### Testing (Playwright, from `dominion/`)
```bash
make install-test     # install Playwright browsers
npx playwright test                        # run all tests
npx playwright test tests/example.spec.ts  # run a single test file
npx playwright test --project=chromium    # run on one browser
npx playwright show-report                # open HTML report
```

## Architecture

This is a two-player online Dominion card game with a React/TypeScript frontend and a Go backend.

### Frontend (`dominion/src/`)

- **`App.tsx`** — Top-level router between Lobby, WaitingRoom, and GameBoard components. Also contains the `GameBoard` component with drag-and-drop card play mechanics and the live game log.
- **`contexts/AuthContext.tsx`** — Central state hub: Google OAuth session, player info, room state, and all API calls to the backend. Components consume this via `useAuth()`.
- **`lib/Card.tsx`** — Defines all card types (basic + kingdom cards) and their properties.
- **`components/`** — UI fragments: `Login`, `Lobby`, `WaitingRoom`, `ProfileBadge`, `AvatarPickerModal`.

State is managed via React Context + `localStorage` for persistence across reloads. Tailwind CSS v4 is used for styling.

### Backend (`dominion-api/`)

Go + Fiber v3 HTTP framework.

- **`main.go`** — Route definitions and server bootstrap.
- **`internal/auth/`** — Google OAuth verification, player store (token → player mapping).
- **`internal/room/`** — Room creation/joining/lifecycle, WebSocket broadcast to all players in a room.
- **`internal/game/`** — Core game mechanics: deck management, card phases, turn logic.

### Key data flows

**Auth**: Frontend sends Google ID token → backend verifies with Google, returns a session token stored in `localStorage`.

**Room lifecycle**: Player creates room (gets a 4-digit code) → second player joins → host starts game → both enter `GameBoard`. The full room event flow (join, kick, leave, close) is documented as a sequence diagram in `README.md`.

**Real-time sync**: A WebSocket connection per player at `/rooms/{code}/ws` carries game state updates. The backend broadcasts the full game state to all players in a room on every state change.

**Card play**: Drag a card from hand to the playground area → `POST /rooms/{code}/play`; drag back → `POST /rooms/{code}/return`.

### Environment

Frontend requires `VITE_GOOGLE_CLIENT_ID` (see `dominion/.env.example`). Backend API runs on port `3000`; frontend dev server proxies to it.
