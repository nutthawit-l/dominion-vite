package auth

import (
	"crypto/rand"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"sync"
	"time"
)

type Player struct {
	ID           string `json:"id"`
	GoogleID     string `json:"googleId"`
	Name         string `json:"name"`
	Email        string `json:"email"`
	GoogleAvatar string `json:"googleAvatar"`
	ChosenAvatar string `json:"chosenAvatar"`
}

// Google ID token's payload (https://developers.google.com/identity/openid-connect/openid-connect#an-id-tokens-payload)
type GoogleTokenInfo struct {
	Sub     string `json:"sub"`
	Email   string `json:"email"`
	Name    string `json:"name"`
	Picture string `json:"picture"`
	Error   string `json:"error"`
}

var (
	playersByGoogleID = map[string]*Player{}
	playersByID       = map[string]*Player{}
	sessions          = map[string]sessionEntry{}
	mu                sync.RWMutex
)

type sessionEntry struct {
	playerID  string
	expiresAt time.Time
}

func VerifyGoogleToken(idToken string) (*GoogleTokenInfo, error) {
	resp, err := http.Get("https://oauth2.googleapis.com/tokeninfo?id_token=" + idToken)
	if err != nil {
		return nil, fmt.Errorf("failed to contact Google: %w", err)
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, fmt.Errorf("failed to read response: %w", err)
	}

	var info GoogleTokenInfo
	if err := json.Unmarshal(body, &info); err != nil {
		return nil, fmt.Errorf("failed to parse response: %w", err)
	}

	if info.Error != "" || resp.StatusCode != 200 {
		return nil, fmt.Errorf("invalid token: %s", info.Error)
	}
	if info.Sub == "" {
		return nil, fmt.Errorf("invalid token: missing sub")
	}
	return &info, nil
}

func LoginOrCreate(info *GoogleTokenInfo) (*Player, string) {
	mu.Lock()
	defer mu.Unlock()

	player, exists := playersByGoogleID[info.Sub]
	if !exists {
		id := generateID()
		player = &Player{
			ID:           id,
			GoogleID:     info.Sub,
			Name:         info.Name,
			Email:        info.Email,
			GoogleAvatar: info.Picture,
			ChosenAvatar: "google",
		}
		playersByGoogleID[info.Sub] = player
		playersByID[id] = player
	} else {
		player.Name = info.Name
		player.GoogleAvatar = info.Picture
	}

	token := generateID()
	sessions[token] = sessionEntry{
		playerID:  player.ID,
		expiresAt: time.Now().Add(24 * time.Hour),
	}

	return player, token
}

func GetPlayerByToken(token string) *Player {
	mu.RLock()
	defer mu.RUnlock()

	entry, ok := sessions[token]
	if !ok || time.Now().After(entry.expiresAt) {
		return nil
	}
	return playersByID[entry.playerID]
}

func UpdateAvatar(playerID, chosenAvatar string) bool {
	mu.Lock()
	defer mu.Unlock()

	player, ok := playersByID[playerID]
	if !ok {
		return false
	}
	player.ChosenAvatar = chosenAvatar
	return true
}

func generateID() string {
	b := make([]byte, 16)
	rand.Read(b)
	return hex.EncodeToString(b)
}
