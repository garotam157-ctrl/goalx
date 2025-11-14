import { Vector3 } from 'three';
import { PlayerData, BallData, GameState, FieldDimensions } from '../../types/game';
import { PhysicsEngine } from './Physics';
import { ControlsManager } from './Controls';

export class GameEngine {
  private physics: PhysicsEngine;
  private controls: ControlsManager;
  private players: PlayerData[] = [];
  private ball: BallData;
  private gameState: GameState;
  private fieldDimensions: FieldDimensions = {
    width: 40,
    length: 60,
    goalWidth: 7,
    goalHeight: 2.5,
    penaltyBoxWidth: 18,
    penaltyBoxLength: 16,
  };

  constructor() {
    this.physics = new PhysicsEngine(this.fieldDimensions);
    this.controls = new ControlsManager();
    
    this.ball = {
      position: new Vector3(0, 0.15, 0),
      velocity: new Vector3(0, 0, 0),
      spin: new Vector3(0, 0, 0),
      owner: null,
    };

    this.gameState = {
      score: { home: 0, away: 0 },
      time: 0,
      half: 1,
      isPaused: false,
      isGameOver: false,
      possession: 'home',
      controlledPlayer: '',
    };

    this.initializePlayers();
  }

  private initializePlayers(): void {
    // Home team (blue) - 5 players
    const homePositions = [
      new Vector3(0, 0, -20), // Goalkeeper
      new Vector3(-8, 0, -10), // Defender left
      new Vector3(8, 0, -10), // Defender right
      new Vector3(-5, 0, 0), // Midfielder left
      new Vector3(5, 0, 0), // Midfielder right
    ];

    homePositions.forEach((pos, i) => {
      this.players.push({
        id: `home-${i}`,
        position: pos.clone(),
        velocity: new Vector3(0, 0, 0),
        team: 'home',
        number: i + 1,
        isControlled: i === 4, // Control midfielder
        stamina: 100,
        speed: 8 + Math.random() * 2,
        skill: 70 + Math.random() * 20,
      });
    });

    // Away team (red) - 5 players
    const awayPositions = [
      new Vector3(0, 0, 20), // Goalkeeper
      new Vector3(-8, 0, 10), // Defender left
      new Vector3(8, 0, 10), // Defender right
      new Vector3(-5, 0, 0), // Midfielder left
      new Vector3(5, 0, 0), // Midfielder right
    ];

    awayPositions.forEach((pos, i) => {
      this.players.push({
        id: `away-${i}`,
        position: pos.clone(),
        velocity: new Vector3(0, 0, 0),
        team: 'away',
        number: i + 1,
        isControlled: false,
        stamina: 100,
        speed: 8 + Math.random() * 2,
        skill: 70 + Math.random() * 20,
      });
    });

    this.gameState.controlledPlayer = 'home-4';
  }

  update(deltaTime: number): void {
    if (this.gameState.isPaused || this.gameState.isGameOver) return;

    // Update game time
    this.gameState.time += deltaTime;

    // Update controls
    const controlState = this.controls.update();

    // Update controlled player
    const controlledPlayer = this.players.find(p => p.id === this.gameState.controlledPlayer);
    if (controlledPlayer) {
      const speedMultiplier = controlState.sprint ? 1.5 : 1.0;
      controlledPlayer.velocity.x = controlState.moveX * controlledPlayer.speed * speedMultiplier;
      controlledPlayer.velocity.z = -controlState.moveY * controlledPlayer.speed * speedMultiplier;

      // Ball control
      if (this.physics.checkBallPlayerCollision(this.ball, controlledPlayer)) {
        this.ball.owner = controlledPlayer.id;
        
        // Pass
        if (controlState.pass) {
          const nearestTeammate = this.findNearestTeammate(controlledPlayer);
          if (nearestTeammate) {
            this.physics.passBall(this.ball, controlledPlayer.position, nearestTeammate.position, 15);
          }
        }

        // Shoot
        if (controlState.shoot) {
          const goalDirection = new Vector3(0, 0, controlledPlayer.team === 'home' ? 1 : -1);
          this.physics.shootBall(this.ball, goalDirection, 20);
        }
      }
    }

    // Update all players
    this.players.forEach(player => {
      if (!player.isControlled) {
        this.updateAI(player, deltaTime);
      }
      this.physics.updatePlayer(player, deltaTime);
    });

    // Update ball
    this.physics.updateBall(this.ball, deltaTime);

    // Check for goals
    const goal = this.physics.checkGoal(this.ball);
    if (goal) {
      this.handleGoal(goal);
    }

    // Check game end
    if (this.gameState.time >= 300) { // 5 minutes per half
      if (this.gameState.half === 1) {
        this.startSecondHalf();
      } else {
        this.gameState.isGameOver = true;
      }
    }
  }

  private updateAI(player: PlayerData, deltaTime: number): void {
    // Simple AI: move towards ball or defensive position
    const toBall = new Vector3().subVectors(this.ball.position, player.position);
    const distanceToBall = toBall.length();

    if (distanceToBall < 15) {
      // Chase ball
      toBall.normalize();
      player.velocity.x = toBall.x * player.speed * 0.7;
      player.velocity.z = toBall.z * player.speed * 0.7;
    } else {
      // Return to position
      const homeZ = player.team === 'home' ? -10 : 10;
      const toHome = new Vector3(0, 0, homeZ).sub(player.position);
      if (toHome.length() > 2) {
        toHome.normalize();
        player.velocity.x = toHome.x * player.speed * 0.3;
        player.velocity.z = toHome.z * player.speed * 0.3;
      }
    }
  }

  private findNearestTeammate(player: PlayerData): PlayerData | null {
    let nearest: PlayerData | null = null;
    let minDistance = Infinity;

    this.players.forEach(p => {
      if (p.team === player.team && p.id !== player.id) {
        const distance = p.position.distanceTo(player.position);
        if (distance < minDistance) {
          minDistance = distance;
          nearest = p;
        }
      }
    });

    return nearest;
  }

  private handleGoal(team: 'home' | 'away'): void {
    this.gameState.score[team]++;
    this.resetPositions();
  }

  private resetPositions(): void {
    this.ball.position.set(0, 0.15, 0);
    this.ball.velocity.set(0, 0, 0);
    
    // Reset players to initial positions
    this.players.forEach(player => {
      const index = parseInt(player.id.split('-')[1]);
      const z = player.team === 'home' ? -20 + index * 5 : 20 - index * 5;
      player.position.set(0, 0, z);
      player.velocity.set(0, 0, 0);
    });
  }

  private startSecondHalf(): void {
    this.gameState.half = 2;
    this.gameState.time = 0;
    this.resetPositions();
  }

  getPlayers(): PlayerData[] {
    return this.players;
  }

  getBall(): BallData {
    return this.ball;
  }

  getGameState(): GameState {
    return this.gameState;
  }

  getFieldDimensions(): FieldDimensions {
    return this.fieldDimensions;
  }

  togglePause(): void {
    this.gameState.isPaused = !this.gameState.isPaused;
  }

  cleanup(): void {
    this.controls.cleanup();
  }
}
