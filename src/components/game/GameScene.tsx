import { useRef, useEffect, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Sky } from '@react-three/drei';
import { GameEngine } from '../../lib/systems/GameEngine';
import { Field } from './Field';
import { Player } from './Player';
import { Ball } from './Ball';
import { GameHUD } from './GameHUD';
import { PlayerData, BallData, GameState } from '../../types/game';

function GameLoop() {
  const gameEngine = useRef<GameEngine | null>(null);
  const [players, setPlayers] = useState<PlayerData[]>([]);
  const [ball, setBall] = useState<BallData | null>(null);
  const [gameState, setGameState] = useState<GameState | null>(null);

  useEffect(() => {
    gameEngine.current = new GameEngine();
    setPlayers(gameEngine.current.getPlayers());
    setBall(gameEngine.current.getBall());
    setGameState(gameEngine.current.getGameState());

    return () => {
      gameEngine.current?.cleanup();
    };
  }, []);

  useFrame((_, delta) => {
    if (gameEngine.current) {
      gameEngine.current.update(delta);
      setPlayers([...gameEngine.current.getPlayers()]);
      setBall({ ...gameEngine.current.getBall() });
      setGameState({ ...gameEngine.current.getGameState() });
    }
  });

  if (!ball || !gameState) return null;

  const fieldDimensions = gameEngine.current?.getFieldDimensions();

  return (
    <>
      {fieldDimensions && <Field dimensions={fieldDimensions} />}
      {players.map((player) => (
        <Player key={player.id} player={player} />
      ))}
      <Ball ball={ball} />
    </>
  );
}

export function GameScene() {
  const gameEngineRef = useRef<GameEngine | null>(null);
  const [gameState, setGameState] = useState<GameState>({
    score: { home: 0, away: 0 },
    time: 0,
    half: 1,
    isPaused: false,
    isGameOver: false,
    possession: 'home',
    controlledPlayer: '',
  });

  useEffect(() => {
    gameEngineRef.current = new GameEngine();
    
    const interval = setInterval(() => {
      if (gameEngineRef.current) {
        setGameState({ ...gameEngineRef.current.getGameState() });
      }
    }, 100);

    return () => {
      clearInterval(interval);
      gameEngineRef.current?.cleanup();
    };
  }, []);

  const handlePause = () => {
    gameEngineRef.current?.togglePause();
  };

  return (
    <div className="w-full h-screen bg-gradient-to-b from-sky-400 to-sky-200">
      <Canvas shadows>
        <PerspectiveCamera makeDefault position={[0, 25, 35]} fov={60} />
        <OrbitControls
          enablePan={false}
          minDistance={20}
          maxDistance={60}
          maxPolarAngle={Math.PI / 2.2}
          target={[0, 0, 0]}
        />

        {/* Lighting */}
        <ambientLight intensity={0.6} />
        <directionalLight
          position={[20, 40, 20]}
          intensity={1.5}
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
          shadow-camera-left={-50}
          shadow-camera-right={50}
          shadow-camera-top={50}
          shadow-camera-bottom={-50}
        />
        <directionalLight position={[-20, 30, -20]} intensity={0.8} />

        {/* Sky */}
        <Sky sunPosition={[100, 20, 100]} />

        {/* Game */}
        <GameLoop />
      </Canvas>

      <GameHUD gameState={gameState} onPause={handlePause} />
    </div>
  );
}
