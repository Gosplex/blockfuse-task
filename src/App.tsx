// App.tsx
import React, { useState, useEffect } from 'react';
import Pitch from './components/Pitch/Pitch';
import './index.css';

function App() {
  const [score, setScore] = useState<{ home: number; away: number }>({ home: 0, away: 0 });
  const [minutes, setMinutes] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const [matchStarted, setMatchStarted] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);

  useEffect(() => {
    if (!matchStarted || !hasInteracted) return;

    const interval = setInterval(() => {
      setSeconds((prev) => {
        if (minutes >= 90) {
          clearInterval(interval);
          return prev;
        }
        if (prev === 59) {
          setMinutes((m) => m + 1);
          return 0;
        }
        return prev + 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [matchStarted, minutes, hasInteracted]);

  const formatTime = (min: number, sec: number) => {
    const m = min.toString().padStart(2, '0');
    const s = sec.toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const handleStartMatch = () => {
    setHasInteracted(true);
    setMatchStarted(true);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <h1 style={{ textAlign: 'center', marginBottom: '20px' }}>BlockFuse Web 3 League</h1>

      {!matchStarted ? (
        <button
          onClick={handleStartMatch}
          style={{
            padding: '12px 24px',
            fontSize: '18px',
            fontWeight: 'bold',
            backgroundColor: '#27ae60',
            color: '#fff',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
          }}
        >
          Start Match
        </button>
      ) : (
        <>
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              marginBottom: '15px',
              backgroundColor: '#222',
              color: 'white',
              padding: '10px 30px',
              borderRadius: '10px',
              boxShadow: '0 4px 8px rgba(0, 0, 0, 0.3)',
              fontFamily: 'Arial, sans-serif',
              gap: '25px',
            }}
          >
            <span style={{ color: '#3498db', fontSize: '26px', fontWeight: 'bold' }}>
              Home: {score.home}
            </span>
            <span
              style={{
                fontSize: '24px',
                fontWeight: 'bold',
                backgroundColor: '#111',
                padding: '8px 16px',
                borderRadius: '8px',
                border: '2px solid #555',
                fontFamily: 'monospace',
                color: '#00ff00',
              }}
            >
              ⏱ {formatTime(minutes, seconds)}
            </span>
            <span style={{ color: '#e74c3c', fontSize: '26px', fontWeight: 'bold' }}>
              Away: {score.away}
            </span>
          </div>
          <Pitch 
            score={score} 
            setScore={setScore} 
            matchStarted={matchStarted} 
            hasInteracted={hasInteracted} 
          />
        </>
      )}
    </div>
  );
}

console.log(React); 

export default App;
