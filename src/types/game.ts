import { Vector3 } from 'three';

export interface PlayerData {
  id: string;
  position: Vector3;
  velocity: Vector3;
  team: 'home' | 'away';
  number: number;
  isControlled: boolean;
  stamina: number;
  speed: number;
  skill: number;
}

export interface BallData {
  position: Vector3;
  velocity: Vector3;
  spin: Vector3;
  owner: string | null;
}

export interface GameState {
  score: {
    home: number;
    away: number;
  };
  time: number;
  half: 1 | 2;
  isPaused: boolean;
  isGameOver: boolean;
  possession: 'home' | 'away';
  controlledPlayer: string;
}

export interface ControlState {
  moveX: number;
  moveY: number;
  sprint: boolean;
  pass: boolean;
  shoot: boolean;
  tackle: boolean;
  switchPlayer: boolean;
}

export type GameMode = 'match' | 'training' | 'penalty';

export interface FieldDimensions {
  width: number;
  length: number;
  goalWidth: number;
  goalHeight: number;
  penaltyBoxWidth: number;
  penaltyBoxLength: number;
}
