package main

import (
	"dominion-api/internal/game"
	"github.com/gofiber/fiber/v3"
	"github.com/gofiber/fiber/v3/middleware/cors"
)

type PlayCardRequest struct {
	CardID string `json:"cardId"`
}

func main() {
	app := fiber.New()

	// Initializing Middleware
	app.Use(cors.New(cors.Config{
		AllowOrigins: []string{"http://localhost:5173", "http://127.0.0.1:5173"},
		AllowHeaders: []string{"Origin, Content-Type, Accept"},
		AllowMethods: []string{"GET, POST, HEAD, PUT, DELETE, PATCH, OPTIONS"},
	}))

	gameState := game.NewPlayerState()

	// Game Phase Manager Routes
	app.Get("/api/v1/game/status", func(c fiber.Ctx) error {
		return c.JSON(gameState)
	})

	app.Post("/api/v1/game/start", func(c fiber.Ctx) error {
		gameState = game.NewPlayerState()
		return c.JSON(gameState)
	})

	app.Post("/api/v1/game/play", func(c fiber.Ctx) error {
		req := new(PlayCardRequest)
		if err := c.Bind().JSON(req); err != nil {
			return c.Status(400).JSON(fiber.Map{"error": "invalid request body"})
		}

		var playedCardName string
		for _, card := range gameState.Deck.Hand {
			if card.ID == req.CardID {
				playedCardName = card.Name
				break
			}
		}

		// Discard it (play it)
		success := gameState.Deck.DiscardFromHand(req.CardID)
		if !success {
			return c.Status(400).JSON(fiber.Map{"error": "card not found in hand"})
		}

		gameState.Log("Played " + playedCardName + ".")

		// Find the actual card object from discard pile so we know what was played
		// In a real game, playing a card moves it to a "PlayArea" and triggers effects.
		// For now we just discard it.
		
		return c.JSON(gameState)
	})

	app.Post("/api/v1/game/draw", func(c fiber.Ctx) error {
		gameState.Deck.Draw(1)
		gameState.Log("Drew a card.")
		return c.JSON(gameState)
	})

	app.Post("/api/v1/game/next-phase", func(c fiber.Ctx) error {
		gameState.NextPhase()
		return c.JSON(gameState)
	})

    // Action/Buy increment for testing
    app.Post("/api/v1/game/add-coin", func(c fiber.Ctx) error {
        if gameState.Phase == game.ActionPhase || gameState.Phase == game.BuyPhase {
            gameState.Coins++
			gameState.Log("Gained 1 Coin.")
        }
        return c.JSON(gameState)
    })

	app.Listen(":3000")
}