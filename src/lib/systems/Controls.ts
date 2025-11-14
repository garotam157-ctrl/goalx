import { ControlState } from '../../types/game';

export class ControlsManager {
  private keys: Set<string> = new Set();
  private touches: Map<number, { x: number; y: number }> = new Map();
  private controlState: ControlState = {
    moveX: 0,
    moveY: 0,
    sprint: false,
    pass: false,
    shoot: false,
    tackle: false,
    switchPlayer: false,
  };

  constructor() {
    this.setupKeyboardListeners();
    this.setupTouchListeners();
  }

  private setupKeyboardListeners(): void {
    window.addEventListener('keydown', (e) => {
      this.keys.add(e.key.toLowerCase());
    });

    window.addEventListener('keyup', (e) => {
      this.keys.delete(e.key.toLowerCase());
    });
  }

  private setupTouchListeners(): void {
    window.addEventListener('touchstart', (e) => {
      for (let i = 0; i < e.touches.length; i++) {
        const touch = e.touches[i];
        this.touches.set(touch.identifier, { x: touch.clientX, y: touch.clientY });
      }
    });

    window.addEventListener('touchmove', (e) => {
      e.preventDefault();
      for (let i = 0; i < e.touches.length; i++) {
        const touch = e.touches[i];
        this.touches.set(touch.identifier, { x: touch.clientX, y: touch.clientY });
      }
    });

    window.addEventListener('touchend', (e) => {
      for (let i = 0; i < e.changedTouches.length; i++) {
        const touch = e.changedTouches[i];
        this.touches.delete(touch.identifier);
      }
    });
  }

  update(): ControlState {
    // Reset state
    this.controlState.moveX = 0;
    this.controlState.moveY = 0;
    this.controlState.pass = false;
    this.controlState.shoot = false;
    this.controlState.tackle = false;
    this.controlState.switchPlayer = false;

    // Keyboard controls
    if (this.keys.has('w') || this.keys.has('arrowup')) this.controlState.moveY = 1;
    if (this.keys.has('s') || this.keys.has('arrowdown')) this.controlState.moveY = -1;
    if (this.keys.has('a') || this.keys.has('arrowleft')) this.controlState.moveX = -1;
    if (this.keys.has('d') || this.keys.has('arrowright')) this.controlState.moveX = 1;
    
    this.controlState.sprint = this.keys.has('shift');
    this.controlState.pass = this.keys.has('q') || this.keys.has('e');
    this.controlState.shoot = this.keys.has(' ') || this.keys.has('enter');
    this.controlState.tackle = this.keys.has('x') || this.keys.has('c');
    this.controlState.switchPlayer = this.keys.has('tab');

    // Touch controls (virtual joystick)
    if (this.touches.size > 0) {
      const firstTouch = Array.from(this.touches.values())[0];
      const centerX = window.innerWidth / 4;
      const centerY = window.innerHeight / 2;
      
      const deltaX = firstTouch.x - centerX;
      const deltaY = firstTouch.y - centerY;
      
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
      if (distance > 20) {
        this.controlState.moveX = deltaX / 50;
        this.controlState.moveY = -deltaY / 50;
        
        // Clamp values
        this.controlState.moveX = Math.max(-1, Math.min(1, this.controlState.moveX));
        this.controlState.moveY = Math.max(-1, Math.min(1, this.controlState.moveY));
      }
    }

    return this.controlState;
  }

  getControlState(): ControlState {
    return { ...this.controlState };
  }

  cleanup(): void {
    this.keys.clear();
    this.touches.clear();
  }
}
