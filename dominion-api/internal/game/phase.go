package game

type Phase string

const (
	ActionPhase  Phase = "ACTION"
	BuyPhase     Phase = "BUY"
	CleanupPhase Phase = "CLEANUP"
)

type PlayerState struct {
	Actions int   `json:"actions"`
	Buys    int   `json:"buys"`
	Coins   int   `json:"coins"`
	Phase   Phase `json:"phase"`
}

func NewPlayerState() *PlayerState {
	return &PlayerState{
		Actions: 1,
		Buys:    1,
		Coins:   0,
		Phase:   ActionPhase,
	}
}

func (s *PlayerState) NextPhase() {
	switch s.Phase {
	case ActionPhase:
		s.Phase = BuyPhase
	case BuyPhase:
		s.Phase = CleanupPhase
	case CleanupPhase:
		s.Phase = ActionPhase
		s.ResetTurn()
	}
}

func (s *PlayerState) ResetTurn() {
	s.Actions = 1
	s.Buys = 1
	s.Coins = 0
}
