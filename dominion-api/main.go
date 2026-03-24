package main

import (
	"dominion-api/internal/game"
	"github.com/gofiber/fiber/v3"
	"github.com/gofiber/fiber/v3/middleware/cors"
)

func main() {
	app := fiber.New()

	// Initializing Middleware
	app.Use(cors.New())

	gameState := game.NewPlayerState()

	// Game Phase Manager Routes
	app.Get("/api/v1/game/status", func(c fiber.Ctx) error {
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
        }
        return c.JSON(gameState)
    })

	app.Listen(":3000")
}