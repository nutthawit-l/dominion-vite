package room

import (
	"dominion-api/internal/auth"
	"dominion-api/internal/game"
	"fmt"
	"math/rand"
	"strings"
	"sync"
)

type Room struct {
	Code    string            `json:"code"`
	Player1 *auth.Player      `json:"player1"`
	Player2 *auth.Player      `json:"player2"`
	State   *game.PlayerState `json:"state"`
}

var (
	rooms = map[string]*Room{}
	mu    sync.RWMutex
)

func Create(player *auth.Player) *Room {
	mu.Lock()
	defer mu.Unlock()

	code := generateCode()
	r := &Room{
		Code:    code,
		Player1: player,
		State:   game.NewPlayerState(),
	}
	rooms[code] = r
	return r
}

func Join(code string, player *auth.Player) (*Room, error) {
	mu.Lock()
	defer mu.Unlock()

	r, ok := rooms[strings.ToUpper(code)]
	if !ok {
		return nil, fmt.Errorf("room not found")
	}
	if r.Player1.ID == player.ID {
		return r, nil
	}
	if r.Player2 != nil && r.Player2.ID != player.ID {
		return nil, fmt.Errorf("room is full")
	}
	r.Player2 = player
	return r, nil
}

func Get(code string) *Room {
	mu.RLock()
	defer mu.RUnlock()
	return rooms[strings.ToUpper(code)]
}

func generateCode() string {
	const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"
	for {
		b := make([]byte, 4)
		for i := range b {
			b[i] = chars[rand.Intn(len(chars))]
		}
		code := string(b)
		if _, exists := rooms[code]; !exists {
			return code
		}
	}
}
