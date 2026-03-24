package game

type Phase string

const (
	ActionPhase  Phase = "ACTION"
	BuyPhase     Phase = "BUY"
	CleanupPhase Phase = "CLEANUP"
)

type PlayerState struct {
	Actions int          `json:"actions"`
	Buys    int          `json:"buys"`
	Coins   int          `json:"coins"`
	Phase   Phase        `json:"phase"`
	Deck    *DeckManager `json:"deckManager"`
	Logs    []string     `json:"logs"`
}

func (s *PlayerState) Log(msg string) {
	s.Logs = append(s.Logs, msg)
}

func NewPlayerState() *PlayerState {
	// Initialize with 7 Coppers and 3 Estates
	initialDeck := make([]Card, 0, 10)
	for i := 0; i < 7; i++ {
		initialDeck = append(initialDeck, NewCopper())
	}
	for i := 0; i < 3; i++ {
		initialDeck = append(initialDeck, NewEstate())
	}

	deck := NewDeckManager(initialDeck)
	deck.Draw(5)

	state := &PlayerState{
		Actions: 1,
		Buys:    1,
		Coins:   0,
		Phase:   ActionPhase,
		Deck:    deck,
		Logs:    []string{"Game started. Drew 5 cards."},
	}
	return state
}

func (s *PlayerState) NextPhase() {
	switch s.Phase {
	case ActionPhase:
		s.Phase = BuyPhase
		s.Log("Entered Buy Phase.")
	case BuyPhase:
		s.Phase = CleanupPhase
		s.Log("Entered Cleanup Phase.")
	case CleanupPhase:
		s.Phase = ActionPhase
		s.ResetTurn()
		// Also discard hand and played cards, then draw 5 (simplified here)
		s.Deck.DiscardAllHand()
		s.Deck.Draw(5)
		s.Log("Turn ended. Discarded hand and drew 5 new cards. Entered Action Phase.")
	}
}

func (s *PlayerState) ResetTurn() {
	s.Actions = 1
	s.Buys = 1
	s.Coins = 0
}

