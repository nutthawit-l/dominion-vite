package game

import "github.com/google/uuid"

type CardType string

const (
	Action       CardType = "ACTION"
	ActionAttack CardType = "ACTION_ATTACK"
	Treasure     CardType = "TREASURE"
	Victory      CardType = "VICTORY"
	Curse        CardType = "CURSE"
)

type Card struct {
	ID   string   `json:"id"`
	Name string   `json:"name"`
	Cost int      `json:"cost"`
	Type CardType `json:"type"`
}

func NewCopper() Card {
	return Card{
		ID:   uuid.New().String(),
		Name: "Copper",
		Cost: 0,
		Type: Treasure,
	}
}

func NewEstate() Card {
	return Card{
		ID:   uuid.New().String(),
		Name: "Estate",
		Cost: 2,
		Type: Victory,
	}
}
