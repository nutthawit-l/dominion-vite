package main

import (
	"dominion-api/internal/auth"
	"dominion-api/internal/game"
	"dominion-api/internal/room"
	"strings"

	"github.com/gofiber/fiber/v3"
	"github.com/gofiber/fiber/v3/middleware/cors"
)

type PlayCardRequest struct {
	CardID string `json:"cardId"`
}

type GoogleAuthRequest struct {
	IDToken string `json:"idToken"`
}

type UpdateAvatarRequest struct {
	Avatar string `json:"avatar"`
}

type JoinRoomRequest struct {
	Code string `json:"code"`
}

func getPlayer(c fiber.Ctx) *auth.Player {
	token := strings.TrimPrefix(c.Get("Authorization"), "Bearer ")
	return auth.GetPlayerByToken(token)
}

func main() {
	app := fiber.New()

	app.Use(cors.New(cors.Config{
		AllowOrigins: []string{"http://localhost:5173", "http://127.0.0.1:5173"},
		AllowHeaders: []string{"Origin", "Content-Type", "Accept", "Authorization"},
		AllowMethods: []string{"GET", "POST", "HEAD", "PUT", "DELETE", "PATCH", "OPTIONS"},
	}))

	// Auth Routes
	app.Post("/api/v1/auth/google", func(c fiber.Ctx) error {
		req := new(GoogleAuthRequest)
		if err := c.Bind().JSON(req); err != nil {
			return c.Status(400).JSON(fiber.Map{"error": "invalid request"})
		}
		info, err := auth.VerifyGoogleToken(req.IDToken)
		if err != nil {
			return c.Status(401).JSON(fiber.Map{"error": err.Error()})
		}
		player, token := auth.LoginOrCreate(info)
		return c.JSON(fiber.Map{"player": player, "sessionToken": token})
	})

	app.Put("/api/v1/auth/avatar", func(c fiber.Ctx) error {
		player := getPlayer(c)
		if player == nil {
			return c.Status(401).JSON(fiber.Map{"error": "unauthorized"})
		}
		req := new(UpdateAvatarRequest)
		if err := c.Bind().JSON(req); err != nil {
			return c.Status(400).JSON(fiber.Map{"error": "invalid request"})
		}
		auth.UpdateAvatar(player.ID, req.Avatar)
		// Return updated player
		updatedPlayer := auth.GetPlayerByToken(strings.TrimPrefix(c.Get("Authorization"), "Bearer "))
		return c.JSON(fiber.Map{"player": updatedPlayer})
	})

	// Room Routes
	app.Post("/api/v1/rooms", func(c fiber.Ctx) error {
		player := getPlayer(c)
		if player == nil {
			return c.Status(401).JSON(fiber.Map{"error": "unauthorized"})
		}
		r := room.Create(player)
		return c.JSON(r)
	})

	app.Post("/api/v1/rooms/join", func(c fiber.Ctx) error {
		player := getPlayer(c)
		if player == nil {
			return c.Status(401).JSON(fiber.Map{"error": "unauthorized"})
		}
		req := new(JoinRoomRequest)
		if err := c.Bind().JSON(req); err != nil {
			return c.Status(400).JSON(fiber.Map{"error": "invalid request"})
		}
		r, err := room.Join(req.Code, player)
		if err != nil {
			return c.Status(400).JSON(fiber.Map{"error": err.Error()})
		}
		return c.JSON(r)
	})

	app.Get("/api/v1/rooms/:code", func(c fiber.Ctx) error {
		player := getPlayer(c)
		if player == nil {
			return c.Status(401).JSON(fiber.Map{"error": "unauthorized"})
		}
		r := room.Get(c.Params("code"))
		if r == nil {
			return c.Status(404).JSON(fiber.Map{"error": "room not found"})
		}
		return c.JSON(r)
	})

	// Room Game Routes
	app.Post("/api/v1/rooms/:code/play", func(c fiber.Ctx) error {
		player := getPlayer(c)
		if player == nil {
			return c.Status(401).JSON(fiber.Map{"error": "unauthorized"})
		}
		r := room.Get(c.Params("code"))
		if r == nil {
			return c.Status(404).JSON(fiber.Map{"error": "room not found"})
		}
		req := new(PlayCardRequest)
		if err := c.Bind().JSON(req); err != nil {
			return c.Status(400).JSON(fiber.Map{"error": "invalid request body"})
		}
		var cardName string
		for _, card := range r.State.Deck.Hand {
			if card.ID == req.CardID {
				cardName = card.Name
				break
			}
		}
		if !r.State.Deck.PlayFromHand(req.CardID) {
			return c.Status(400).JSON(fiber.Map{"error": "card not found in hand"})
		}
		r.State.Log(player.Name + " played " + cardName + ".")
		return c.JSON(r)
	})

	app.Post("/api/v1/rooms/:code/return", func(c fiber.Ctx) error {
		player := getPlayer(c)
		if player == nil {
			return c.Status(401).JSON(fiber.Map{"error": "unauthorized"})
		}
		r := room.Get(c.Params("code"))
		if r == nil {
			return c.Status(404).JSON(fiber.Map{"error": "room not found"})
		}
		req := new(PlayCardRequest)
		if err := c.Bind().JSON(req); err != nil {
			return c.Status(400).JSON(fiber.Map{"error": "invalid request body"})
		}
		var cardName string
		for _, card := range r.State.Deck.Playground {
			if card.ID == req.CardID {
				cardName = card.Name
				break
			}
		}
		if !r.State.Deck.ReturnToHand(req.CardID) {
			return c.Status(400).JSON(fiber.Map{"error": "card not found in playground"})
		}
		r.State.Log(player.Name + " returned " + cardName + " to hand.")
		return c.JSON(r)
	})

	app.Post("/api/v1/rooms/:code/draw", func(c fiber.Ctx) error {
		player := getPlayer(c)
		if player == nil {
			return c.Status(401).JSON(fiber.Map{"error": "unauthorized"})
		}
		r := room.Get(c.Params("code"))
		if r == nil {
			return c.Status(404).JSON(fiber.Map{"error": "room not found"})
		}
		r.State.Deck.Draw(1)
		r.State.Log(player.Name + " drew a card.")
		return c.JSON(r)
	})

	app.Post("/api/v1/rooms/:code/next-phase", func(c fiber.Ctx) error {
		player := getPlayer(c)
		if player == nil {
			return c.Status(401).JSON(fiber.Map{"error": "unauthorized"})
		}
		r := room.Get(c.Params("code"))
		if r == nil {
			return c.Status(404).JSON(fiber.Map{"error": "room not found"})
		}
		r.State.NextPhase()
		r.State.Log(player.Name + " advanced the phase.")
		return c.JSON(r)
	})

	app.Post("/api/v1/rooms/:code/add-coin", func(c fiber.Ctx) error {
		player := getPlayer(c)
		if player == nil {
			return c.Status(401).JSON(fiber.Map{"error": "unauthorized"})
		}
		r := room.Get(c.Params("code"))
		if r == nil {
			return c.Status(404).JSON(fiber.Map{"error": "room not found"})
		}
		if r.State.Phase == game.ActionPhase || r.State.Phase == game.BuyPhase {
			r.State.Coins++
			r.State.Log(player.Name + " gained 1 Coin.")
		}
		return c.JSON(r)
	})

	app.Listen(":3000")
}
