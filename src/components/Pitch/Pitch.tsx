// Pitch.tsx
import React, { useState, useEffect, useRef } from 'react';
import './Pitch.css';
import { PITCH } from '../../utils/constants';
import { generateMatchData } from '../../utils/generateMatchData';
import type { MatchData } from './types';
import crowdSoundFile from '../../assets/sounds/crowd.mp3';
import goalSoundFile from '../../assets/sounds/goal.mp3';
import goalAnimation from '../../assets/animations/goal.json';
import Lottie from 'lottie-react';

interface PitchProps {
  score: { home: number; away: number };
  setScore: React.Dispatch<React.SetStateAction<{ home: number; away: number }>>;
  matchStarted: boolean;
  hasInteracted: boolean;
}

const Pitch: React.FC<PitchProps> = ({ score, setScore, matchStarted, hasInteracted }) => {
  const [matchData, setMatchData] = useState<MatchData>(generateMatchData());
  const [targetPlayerId, setTargetPlayerId] = useState<number | null>(null);
  const [goalScored, setGoalScored] = useState<'home' | 'away' | null>(null);
  const [ballTrail, setBallTrail] = useState<{ x: number; y: number; opacity: number }[]>([]);
  const [isRandomGoalAnimating, setIsRandomGoalAnimating] = useState(false);
  const [showGoalAnimation, setShowGoalAnimation] = useState(false);
  const crowdSoundRef = useRef<HTMLAudioElement | null>(null);
  const goalSoundRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (!matchStarted) return;

    // Initialize sound effects from assets
    crowdSoundRef.current = new Audio(crowdSoundFile);
    crowdSoundRef.current.loop = true;
    crowdSoundRef.current.volume = 0.3;
    goalSoundRef.current = new Audio(goalSoundFile);
    goalSoundRef.current.volume = 0.8;

    // Play crowd sound after user interaction
    if (hasInteracted && crowdSoundRef.current) {
      crowdSoundRef.current.play().catch((error) => console.error('Crowd sound playback failed:', error));
    }

    // Ball movement and player-driven goals
    const movementInterval = setInterval(() => {
      if (!matchStarted || isRandomGoalAnimating) return;

      setMatchData((prevData) => {
        const newData = generateMatchData();
        const randomPlayer = newData.players[Math.floor(Math.random() * newData.players.length)];
        setTargetPlayerId(randomPlayer.id);

        const ballSpeed = 0.1;
        const dx = randomPlayer.x - prevData.ball.x;
        const dy = randomPlayer.y - prevData.ball.y;

        const newBallX = prevData.ball.x + dx * ballSpeed;
        const newBallY = prevData.ball.y + dy * ballSpeed;

        setBallTrail((prev) => [
          { x: newBallX, y: newBallY, opacity: 1 },
          ...prev.slice(0, 4).map((trail) => ({ ...trail, opacity: trail.opacity - 0.2 })),
        ]);

        let goalTeam: 'home' | 'away' | null = null;
        if (newBallX <= 5 && newBallY >= PITCH.goalArea.yOffset && newBallY <= PITCH.goalArea.yOffset + PITCH.goalArea.height) {
          goalTeam = 'away';
        } else if (newBallX >= PITCH.width - 5 && newBallY >= PITCH.goalArea.yOffset && newBallY <= PITCH.goalArea.yOffset + PITCH.goalArea.height) {
          goalTeam = 'home';
        }

        console.log(score);
        console.log(targetPlayerId);

        if (goalTeam) {
          setScore((prev) => ({
            ...prev,
            [goalTeam]: prev[goalTeam] + 1,
          }));
          setGoalScored(goalTeam);
          setBallTrail([]);
          setShowGoalAnimation(true);
          if (goalSoundRef.current && hasInteracted) {
            goalSoundRef.current.currentTime = 0;
            goalSoundRef.current.play().catch((error) => console.error('Goal sound playback failed:', error));
          }
          
          setTimeout(() => {
            setGoalScored(null);
            setShowGoalAnimation(false);
          }, 3000);
          
          return {
            ...newData,
            ball: { x: PITCH.width / 2, y: PITCH.height / 2 },
          };
        }

        return {
          ...newData,
          ball: { x: newBallX, y: newBallY },
        };
      });
    }, 100);

    // Compulsory random goal every 30 seconds
    const randomGoalInterval = setInterval(() => {
      if (!matchStarted) return;
      
      const goalTeam = Math.random() < 0.5 ? 'home' : 'away';
      setIsRandomGoalAnimating(true);

      const targetX = goalTeam === 'home' ? PITCH.width : 0;
      const targetY = PITCH.goalArea.yOffset + PITCH.goalArea.height / 2;

      let startTime: number | null = null;
      const animationDuration = 1000;

      const animateBall = (timestamp: number) => {
        if (!startTime) startTime = timestamp;
        const progress = Math.min((timestamp - startTime) / animationDuration, 1);

        setMatchData((prev) => {
          const startX = prev.ball.x;
          const startY = prev.ball.y;
          const newX = startX + (targetX - startX) * progress;
          const newY = startY + (targetY - startY) * progress;

          setBallTrail((prevTrail) => [
            { x: newX, y: newY, opacity: 1 },
            ...prevTrail.slice(0, 4).map((trail) => ({ ...trail, opacity: trail.opacity - 0.2 })),
          ]);

          return {
            ...prev,
            ball: { x: newX, y: newY },
          };
        });

        if (progress < 1) {
          requestAnimationFrame(animateBall);
        } else {
          setScore((prev) => ({
            ...prev,
            [goalTeam]: prev[goalTeam] + 1,
          }));
          setGoalScored(goalTeam);
          setBallTrail([]);
          setShowGoalAnimation(true);
          if (goalSoundRef.current && hasInteracted) {
            goalSoundRef.current.currentTime = 0;
            goalSoundRef.current.play().catch((error) => console.error('Goal sound playback failed:', error));
          }
          
          setMatchData((prev) => ({
            ...prev,
            ball: { x: PITCH.width / 2, y: PITCH.height / 2 },
          }));
          
          setTimeout(() => {
            setGoalScored(null);
            setShowGoalAnimation(false);
            setIsRandomGoalAnimating(false);
          }, 3000);
        }
      };

      requestAnimationFrame(animateBall);
    }, 30000);

    return () => {
      clearInterval(movementInterval);
      clearInterval(randomGoalInterval);
      if (crowdSoundRef.current) {
        crowdSoundRef.current.pause();
        crowdSoundRef.current.currentTime = 0;
      }
      if (goalSoundRef.current) {
        goalSoundRef.current.pause();
        goalSoundRef.current.currentTime = 0;
      }
    };
  }, [setScore, matchStarted, hasInteracted]);

  if (!matchStarted) return null;

  return (
    <div className="pitch-container">
      {showGoalAnimation && (
        <div className="goal-animation-overlay">
          <Lottie 
            animationData={goalAnimation} 
            loop={false} 
            autoplay={true}
            style={{ width: 300, height: 300 }}
          />
        </div>
      )}

      <svg
        className="pitch-svg"
        width={PITCH.width}
        height={PITCH.height}
        viewBox={`0 0 ${PITCH.width} ${PITCH.height}`}
      >
        <rect width="100%" height="100%" fill={PITCH.background} />

        <rect
          x="0"
          y="0"
          width={PITCH.width}
          height={PITCH.height}
          fill="none"
          stroke={PITCH.lineColor}
          strokeWidth={PITCH.lineWidth * 2}
        />
        <line
          x1={PITCH.width / 2}
          y1="0"
          x2={PITCH.width / 2}
          y2={PITCH.height}
          stroke={PITCH.lineColor}
          strokeWidth={PITCH.lineWidth}
        />
        <circle
          cx={PITCH.width / 2}
          cy={PITCH.height / 2}
          r={PITCH.centerCircleRadius}
          fill="none"
          stroke={PITCH.lineColor}
          strokeWidth={PITCH.lineWidth}
        />

        <rect
          x="0"
          y={PITCH.penaltyArea.yOffset}
          width={PITCH.penaltyArea.width}
          height={PITCH.penaltyArea.height}
          fill="none"
          stroke={PITCH.lineColor}
          strokeWidth={PITCH.lineWidth}
        />

        <rect
          x={PITCH.width - PITCH.penaltyArea.width}
          y={PITCH.penaltyArea.yOffset}
          width={PITCH.penaltyArea.width}
          height={PITCH.penaltyArea.height}
          fill="none"
          stroke={PITCH.lineColor}
          strokeWidth={PITCH.lineWidth}
        />

        <rect
          x="0"
          y={PITCH.goalArea.yOffset}
          width={PITCH.goalArea.width}
          height={PITCH.goalArea.height}
          fill="none"
          stroke={goalScored === 'away' ? 'yellow' : PITCH.lineColor}
          strokeWidth={PITCH.lineWidth}
        >
          {goalScored === 'away' && (
            <animate
              attributeName="stroke"
              values="yellow;white;yellow"
              dur="0.5s"
              repeatCount="6"
            />
          )}
        </rect>

        <rect
          x={PITCH.width - PITCH.goalArea.width}
          y={PITCH.goalArea.yOffset}
          width={PITCH.goalArea.width}
          height={PITCH.goalArea.height}
          fill="none"
          stroke={goalScored === 'home' ? 'yellow' : PITCH.lineColor}
          strokeWidth={PITCH.lineWidth}
        >
          {goalScored === 'home' && (
            <animate
              attributeName="stroke"
              values="yellow;white;yellow"
              dur="0.5s"
              repeatCount="6"
            />
          )}
        </rect>

        {goalScored && (
          <g>
            {[...Array(20)].map((_, i) => {
              const x = goalScored === 'home' ? PITCH.width - 50 : 50;
              const y = PITCH.height / 2 + (Math.random() * 100 - 50);
              return (
                <path
                  key={i}
                  d="M0,-2 L0.59,0.81 L2.83,0.92 L0.95,1.55 L1.41,3.42 L0,2.31 L-1.41,3.42 L-0.95,1.55 L-2.83,0.92 L-0.59,0.81 Z"
                  fill="yellow"
                  transform={`translate(${x + Math.random() * 20 - 10}, ${y}) scale(0.5)`}
                >
                  <animate
                    attributeName="opacity"
                    from="1"
                    to="0"
                    dur="2s"
                    begin={`${Math.random() * 0.5}s`}
                    fill="freeze"
                  />
                </path>
              );
            })}
          </g>
        )}

        {matchData.players.map((player) => (
          <g key={player.id} transform={`translate(${player.x - 12}, ${player.y - 20}) scale(0.8)`}>
            <path
              d="M12 5 Q10 0 8 0 H4 Q2 0 0 5 L0 15 Q0 20 5 20 H7 Q12 20 17 20 H19 Q24 20 24 15 L24 5 Q24 0 22 0 H16 Q14 0 12 5 Z"
              fill={player.team === 'home' ? '#3498db' : '#e74c3c'}
              stroke="white"
              strokeWidth="0.5"
            />
            <circle cx="12" cy="3" r="3" fill="#f0c7a3" />
            <rect x="7" y="15" width="10" height="5" fill="black" />
            <text x="12" y="12" textAnchor="middle" fill="white" fontSize="8" fontWeight="bold">
              {player.number}
            </text>
          </g>
        ))}

        {ballTrail.map((trail, i) => (
          <circle
            key={i}
            cx={trail.x}
            cy={trail.y}
            r="3"
            fill="white"
            opacity={trail.opacity}
          />
        ))}

        <g transform={`translate(${matchData.ball.x}, ${matchData.ball.y})`}>
          <circle r="5" fill="white" stroke="black" strokeWidth="0.5">
            <animate
              attributeName="cy"
              values="0;-2;0"
              dur="0.3s"
              repeatCount="indefinite"
            />
          </circle>
          <path
            d="M0,0 L2,0 A2,2 0 0,1 0,2 A2,2 0 0,1 -2,0 A2,2 0 0,1 0,-2 A2,2 0 0,1 2,0 Z"
            fill="none"
            stroke="black"
            strokeWidth="0.3"
          >
            <animateTransform
              attributeName="transform"
              type="rotate"
              from="0 0 0"
              to="360 0 0"
              dur="1s"
              repeatCount="indefinite"
            />
          </path>
        </g>
      </svg>
    </div>
  );
};

export default Pitch;
