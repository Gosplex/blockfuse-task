import { PITCH } from './constants';
import type { Player, MatchData } from '../components/Pitch/types';

export const generateMatchData = (): MatchData => {
  const players: Player[] = [];
  
  // Home team formation (4-4-2)
  const homePositions = [
    // Goalkeeper
    { x: PITCH.width * 0.1, y: PITCH.height * 0.5 },
    // Defenders
    { x: PITCH.width * 0.25, y: PITCH.height * 0.2 },
    { x: PITCH.width * 0.25, y: PITCH.height * 0.4 },
    { x: PITCH.width * 0.25, y: PITCH.height * 0.6 },
    { x: PITCH.width * 0.25, y: PITCH.height * 0.8 },
    // Midfielders
    { x: PITCH.width * 0.4, y: PITCH.height * 0.3 },
    { x: PITCH.width * 0.4, y: PITCH.height * 0.5 },
    { x: PITCH.width * 0.4, y: PITCH.height * 0.7 },
    // Forwards
    { x: PITCH.width * 0.6, y: PITCH.height * 0.4 },
    { x: PITCH.width * 0.6, y: PITCH.height * 0.6 }
  ];

  // Away team formation (4-3-3)
  const awayPositions = [
    // Goalkeeper
    { x: PITCH.width * 0.9, y: PITCH.height * 0.5 },
    // Defenders
    { x: PITCH.width * 0.75, y: PITCH.height * 0.2 },
    { x: PITCH.width * 0.75, y: PITCH.height * 0.4 },
    { x: PITCH.width * 0.75, y: PITCH.height * 0.6 },
    { x: PITCH.width * 0.75, y: PITCH.height * 0.8 },
    // Midfielders
    { x: PITCH.width * 0.6, y: PITCH.height * 0.3 },
    { x: PITCH.width * 0.6, y: PITCH.height * 0.5 },
    { x: PITCH.width * 0.6, y: PITCH.height * 0.7 },
    // Forwards
    { x: PITCH.width * 0.4, y: PITCH.height * 0.3 },
    { x: PITCH.width * 0.4, y: PITCH.height * 0.5 },
    { x: PITCH.width * 0.4, y: PITCH.height * 0.7 }
  ];

  // Add some randomness to positions
  homePositions.forEach((pos, i) => {
    players.push(createPlayer(i, 'home', pos.x, pos.y));
  });

  awayPositions.forEach((pos, i) => {
    players.push(createPlayer(i+11, 'away', pos.x, pos.y));
  });

  return {
    players,
    ball: {
      x: PITCH.width / 2,
      y: PITCH.height / 2
    }
  };
};

function createPlayer(id: number, team: 'home' | 'away', baseX: number, baseY: number): Player {
  return {
    id,
    x: baseX + (Math.random() * 20 - 10), // ±10px randomness
    y: baseY + (Math.random() * 20 - 10),
    team,
    number: (id % 11) + 1
  };
}