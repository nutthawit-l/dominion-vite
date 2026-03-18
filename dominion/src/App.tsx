import copperImg from './assets/Copper.jpg'
import './App.css'

function App() {
  return (
    <>
      <div className="main">
        {/* Board */}
        <div className="gold-province"></div>
        <div className="kingdoms"></div>
        <div className="game-logs"></div>
        <div className="playground"></div>

        {/* Opponent */}
        <div className="opponent-profile"></div>
        <div className="opponent-victory-point"></div>
        <div className="opponent-deck"></div>
        <div className="opponent-hand"></div>
        <div className="opponent-discard-pile"></div>

        {/* Player */}
        <div className="deck"></div>
        <div className="hand">
          <div className="card-fan-container">
            <div className="card-fan-item"><Card /></div>
            <div className="card-fan-item"><Card /></div>
            <div className="card-fan-item"><Card /></div>
            <div className="card-fan-item"><Card /></div>
            <div className="card-fan-item"><Card /></div>
            <div className="card-fan-item"><Card /></div>
            <div className="card-fan-item"><Card /></div>
          </div>
        </div>
        <div className="discard-pile"></div>
        <div className="trash"></div>
        <div className="player-profile"></div>
        <div className="player-victory-point"></div>
        <div className="action-gold-buy-couter"></div>

        {/* Button */}
        <div className="hamburger-menu"></div>
        <div className="kingdom-zoom"></div>
        <div className="undo"></div>
        <div className="end-buys"></div>
        <div className="play-treasures"></div>
      </div>
    </>
  )
}

function Card() {
  return (
    <div className="dominion-card">
      <img src={copperImg} alt="Copper Card" />
    </div>
  )
}

export default App
