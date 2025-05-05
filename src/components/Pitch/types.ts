export interface Coordinate {
    x: number;
    y: number;
  }
  
  export interface PitchStyle {
    background: string;
    lineColor: string;
    lineWidth: number;
  }
  
  export interface Player {
    id: number;
    x: number;
    y: number;
    team: 'home' | 'away';
    number: number;
  }
  
  export interface MatchData {
    players: Player[];
    ball: {
      x: number;
      y: number;
    };
  }