package game

import (
	"math/rand"
	"time"
)

// DeckManager handles operations related to a player's deck, hand, and discard pile
type DeckManager struct {
	Deck        []Card `json:"deck"`
	Hand        []Card `json:"hand"`
	DiscardPile []Card `json:"discardPile"`
	Playground  []Card `json:"playGround"`
	rng         *rand.Rand
}

// NewDeckManager initializes a new deck manager with an initial deck.
func NewDeckManager(initialDeck []Card) *DeckManager {
	source := rand.NewSource(time.Now().UnixNano())
	rng := rand.New(source)

	dm := &DeckManager{
		Deck:        make([]Card, len(initialDeck)),
		Hand:        []Card{},
		DiscardPile: []Card{},
		rng:         rng,
	}

	copy(dm.Deck, initialDeck)
	dm.Shuffle()
	return dm
}

// Shuffle randomly reorders the cards in the deck
func (dm *DeckManager) Shuffle() {
	dm.rng.Shuffle(len(dm.Deck), func(i, j int) {
		dm.Deck[i], dm.Deck[j] = dm.Deck[j], dm.Deck[i]
	})
}

// Draw populates the hand with count cards from the top of the deck.
// If the deck runs out, it shuffles the discard pile into the deck.
func (dm *DeckManager) Draw(count int) []Card {
	drawnCards := make([]Card, 0, count)

	for i := 0; i < count; i++ {
		if len(dm.Deck) == 0 {
			if len(dm.DiscardPile) > 0 {
				// Shuffle discard pile into deck
				dm.Deck = make([]Card, len(dm.DiscardPile))
				copy(dm.Deck, dm.DiscardPile)
				dm.DiscardPile = []Card{}
				dm.Shuffle()
			} else {
				// No more cards available to draw
				break
			}
		}

		// Pop from end of slice (top of deck)
		lastIdx := len(dm.Deck) - 1
		card := dm.Deck[lastIdx]
		dm.Deck = dm.Deck[:lastIdx]

		drawnCards = append(drawnCards, card)
	}

	dm.Hand = append(dm.Hand, drawnCards...)
	return drawnCards
}

// PlayFromHand removes a card from the hand by ID and places it in the Playground.
func (dm *DeckManager) PlayFromHand(cardID string) bool {
	for i, card := range dm.Hand {
		if card.ID == cardID {
			// Remove from hand
			dm.Hand = append(dm.Hand[:i], dm.Hand[i+1:]...)
			// Add to Playground
			dm.Playground = append(dm.Playground, card)
			return true
		}
	}
	return false
}

// ReturnToHand removes a card from the Playground by ID and places it back in the hand.
func (dm *DeckManager) ReturnToHand(cardID string) bool {
	for i, card := range dm.Playground {
		if card.ID == cardID {
			dm.Playground = append(dm.Playground[:i], dm.Playground[i+1:]...)
			dm.Hand = append(dm.Hand, card)
			return true
		}
	}
	return false
}

// DiscardFromHand removes a card from the hand by ID and places it in the discard pile.
func (dm *DeckManager) DiscardFromHand(cardID string) bool {
	for i, card := range dm.Hand {
		if card.ID == cardID {
			// Remove from hand
			dm.Hand = append(dm.Hand[:i], dm.Hand[i+1:]...)
			// Add to discard pile
			dm.DiscardPile = append(dm.DiscardPile, card)
			return true
		}
	}
	return false
}

// DiscardAllHand moves all cards from the hand to the discard pile.
func (dm *DeckManager) DiscardAllHand() {
	dm.DiscardPile = append(dm.DiscardPile, dm.Hand...)
	dm.Hand = []Card{}
}

// DiscardPlayed moves played cards into the discard pile.
func (dm *DeckManager) DiscardPlayed(played []Card) {
	dm.DiscardPile = append(dm.DiscardPile, played...)
}

type Destination string

const (
	DestDiscard Destination = "discard"
	DestHand    Destination = "hand"
	DestDeck    Destination = "deck"
	DestTopDeck Destination = "topDeck"
)

// Gain adds a card to a specified destination.
func (dm *DeckManager) Gain(card Card, dest Destination) {
	switch dest {
	case DestDiscard:
		dm.DiscardPile = append(dm.DiscardPile, card)
	case DestHand:
		dm.Hand = append(dm.Hand, card)
	case DestDeck:
		// Bottom of deck (beginning of slice)
		dm.Deck = append([]Card{card}, dm.Deck...)
	case DestTopDeck:
		// Top of deck (end of slice)
		dm.Deck = append(dm.Deck, card)
	}
}
