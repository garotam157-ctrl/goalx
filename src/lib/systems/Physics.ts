import { Vector3 } from 'three';
import { PlayerData, BallData, FieldDimensions } from '../../types/game';

export class PhysicsEngine {
  private gravity = -9.8;
  private friction = 0.98;
  private ballFriction = 0.97;
  private fieldDimensions: FieldDimensions;

  constructor(fieldDimensions: FieldDimensions) {
    this.fieldDimensions = fieldDimensions;
  }

  updateBall(ball: BallData, deltaTime: number): void {
    // Apply gravity
    if (ball.position.y > 0.15) {
      ball.velocity.y += this.gravity * deltaTime;
    }

    // Apply velocity
    ball.position.x += ball.velocity.x * deltaTime;
    ball.position.y += ball.velocity.y * deltaTime;
    ball.position.z += ball.velocity.z * deltaTime;

    // Ground collision
    if (ball.position.y <= 0.15) {
      ball.position.y = 0.15;
      ball.velocity.y = Math.abs(ball.velocity.y) * 0.6; // Bounce with energy loss
      
      // Stop bouncing if velocity is too low
      if (Math.abs(ball.velocity.y) < 0.5) {
        ball.velocity.y = 0;
      }
    }

    // Apply friction
    ball.velocity.x *= this.ballFriction;
    ball.velocity.z *= this.ballFriction;
    
    // Stop ball if velocity is very low
    if (Math.abs(ball.velocity.x) < 0.01) ball.velocity.x = 0;
    if (Math.abs(ball.velocity.z) < 0.01) ball.velocity.z = 0;

    // Field boundaries
    const halfWidth = this.fieldDimensions.width / 2;
    const halfLength = this.fieldDimensions.length / 2;

    if (Math.abs(ball.position.x) > halfWidth) {
      ball.position.x = Math.sign(ball.position.x) * halfWidth;
      ball.velocity.x *= -0.5;
    }

    if (Math.abs(ball.position.z) > halfLength) {
      ball.position.z = Math.sign(ball.position.z) * halfLength;
      ball.velocity.z *= -0.5;
    }
  }

  updatePlayer(player: PlayerData, deltaTime: number): void {
    // Apply velocity
    player.position.x += player.velocity.x * deltaTime;
    player.position.z += player.velocity.z * deltaTime;

    // Apply friction
    player.velocity.x *= this.friction;
    player.velocity.z *= this.friction;

    // Field boundaries
    const halfWidth = this.fieldDimensions.width / 2 - 1;
    const halfLength = this.fieldDimensions.length / 2 - 1;

    player.position.x = Math.max(-halfWidth, Math.min(halfWidth, player.position.x));
    player.position.z = Math.max(-halfLength, Math.min(halfLength, player.position.z));
  }

  checkBallPlayerCollision(ball: BallData, player: PlayerData): boolean {
    const distance = ball.position.distanceTo(player.position);
    return distance < 0.8; // Collision threshold
  }

  kickBall(ball: BallData, direction: Vector3, power: number): void {
    ball.velocity.x = direction.x * power;
    ball.velocity.y = direction.y * power * 0.5;
    ball.velocity.z = direction.z * power;
    ball.owner = null;
  }

  passBall(ball: BallData, from: Vector3, to: Vector3, power: number): void {
    const direction = new Vector3().subVectors(to, from).normalize();
    this.kickBall(ball, direction, power);
  }

  shootBall(ball: BallData, direction: Vector3, power: number): void {
    ball.velocity.x = direction.x * power;
    ball.velocity.y = Math.abs(direction.y) * power * 0.3 + 2; // Add lift
    ball.velocity.z = direction.z * power;
    ball.owner = null;
  }

  checkGoal(ball: BallData): 'home' | 'away' | null {
    const halfLength = this.fieldDimensions.length / 2;
    const goalWidth = this.fieldDimensions.goalWidth / 2;

    // Check if ball crossed goal line
    if (Math.abs(ball.position.x) < goalWidth && ball.position.y < this.fieldDimensions.goalHeight) {
      if (ball.position.z > halfLength) {
        return 'home'; // Home team scored (ball in away goal)
      } else if (ball.position.z < -halfLength) {
        return 'away'; // Away team scored (ball in home goal)
      }
    }

    return null;
  }
}
