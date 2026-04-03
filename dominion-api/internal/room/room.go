package room

import (
	"dominion-api/internal/auth"
	"dominion-api/internal/game"
	"encoding/json"
	"fmt"
	"math/rand"
	"strings"
	"sync"
)

type Room struct {
	Code            string            `json:"code"`
	Player1         *auth.Player      `json:"player1"`
	Player2         *auth.Player      `json:"player2"`
	State           *game.PlayerState `json:"state"`
	CurrentPlayerID string            `json:"currentPlayerID"`
	Status          string            `json:"status"`
	KickedPlayerID  string            `json:"kickedPlayerID,omitempty"`
	subscribers     []chan []byte
	subMu           sync.Mutex
	mu              sync.RWMutex
}

var (
	rooms  = map[string]*Room{}
	roomMu sync.RWMutex
)

func Create(player *auth.Player) *Room {
	roomMu.Lock()
	defer roomMu.Unlock()

	code := generateCode()
	r := &Room{
		Code:            code,
		Player1:         player,
		State:           game.NewPlayerState(),
		CurrentPlayerID: player.ID,
		Status:          "WAITING",
	}
	rooms[code] = r
	return r
}

func Join(code string, player *auth.Player) (*Room, error) {
	roomMu.Lock()
	defer roomMu.Unlock()

	r, ok := rooms[strings.ToUpper(code)]
	if !ok {
		return nil, fmt.Errorf("room not found")
	}

	// Player1 is already in the room (e.g. reconnecting); return without changes.
	if r.Player1.ID == player.ID {
		return r, nil
	}

	// Room is full if Player2 slot is taken by a different player.
	// r.Player2 != nil — มี Player2 อยู่แล้ว
	// r.Player2.ID != player.ID — และ player คนนี้ไม่ใช่ Player2 คนเดิม
	if r.Player2 != nil && r.Player2.ID != player.ID {
		return nil, fmt.Errorf("room is full")
	}

	r.Player2 = player
	return r, nil
}

func Get(code string) *Room {
	roomMu.RLock()
	defer roomMu.RUnlock()
	return rooms[strings.ToUpper(code)]
}

// Leave handles a player leaving the room.
func (r *Room) Leave(player *auth.Player) {
	roomMu.Lock()
	defer roomMu.Unlock()

	if r.Player2 != nil && r.Player2.ID == player.ID {
		r.Player2 = nil
	} else if r.Player1 != nil && r.Player1.ID == player.ID {
		// If Host leaves, we can just delete the room as a fallback.
		delete(rooms, r.Code)
	}
}

// Kick removes a player by ID from the room and sets KickedPlayerID.
func (r *Room) Kick(targetID string) {
	roomMu.Lock()
	defer roomMu.Unlock()

	if r.Player2 != nil && r.Player2.ID == targetID {
		r.Player2 = nil
		r.KickedPlayerID = targetID
	}
}

// Close destroys the room, sets status to closed, and kicks everyone.
func (r *Room) Close() {
	roomMu.Lock()
	delete(rooms, r.Code)
	roomMu.Unlock()

	r.mu.Lock()
	r.Status = "CLOSED"
	r.mu.Unlock()

	data, _ := json.Marshal(r)
	r.subMu.Lock()
	defer r.subMu.Unlock()
	for _, ch := range r.subscribers {
		select {
		case ch <- data:
		default:
		}
		close(ch)
	}
	r.subscribers = nil
}

// SwapTurn switches CurrentPlayerID to the other player (called at end of turn).
func (r *Room) SwapTurn() {
	if r.Player2 == nil {
		return
	}
	if r.CurrentPlayerID == r.Player1.ID {
		r.CurrentPlayerID = r.Player2.ID
	} else {
		r.CurrentPlayerID = r.Player1.ID
	}
}

// StartGame changes the room status to playing.
func (r *Room) StartGame() {
	r.Status = "PLAYING"
}

// Subscribe returns a channel that receives the serialized room state on each Broadcast.
func (r *Room) Subscribe() chan []byte {
	ch := make(chan []byte, 4)
	r.subMu.Lock()
	r.subscribers = append(r.subscribers, ch)
	r.subMu.Unlock()
	return ch
}

// Unsubscribe removes and closes the channel.
func (r *Room) Unsubscribe(ch chan []byte) {
	r.subMu.Lock()
	defer r.subMu.Unlock()
	for i, s := range r.subscribers {
		if s == ch {
			r.subscribers = append(r.subscribers[:i], r.subscribers[i+1:]...)
			close(s)
			return
		}
	}
}

// Broadcast sends the current room state to all subscribers.
func (r *Room) Broadcast() {
	data, err := json.Marshal(r)
	if err != nil {
		return
	}
	r.subMu.Lock()
	defer r.subMu.Unlock()
	for _, ch := range r.subscribers {
		select {
		case ch <- data:
		default:
		}
	}
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
