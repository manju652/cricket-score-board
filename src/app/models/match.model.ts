export interface Player {
  name: string;
  runs: number;
  balls: number;
}

export interface Match {
  teamA: string;
  teamB: string;
  totalOvers: number;

  score: number;
  wickets: number;
  extras: number;

  currentOver: number;
  balls: number;
  ruleType: 'gully' | 'international';

  striker: Player;
  nonStriker: Player;
}