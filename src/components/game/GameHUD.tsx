import { GameState } from '../../types/game';

interface GameHUDProps {
  gameState: GameState;
  onPause: () => void;
}

export function GameHUD({ gameState, onPause }: GameHUDProps) {
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 pointer-events-none">
      {/* Top HUD */}
      <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-start">
        {/* Score */}
        <div className="bg-black/70 backdrop-blur-sm rounded-lg px-6 py-3 pointer-events-auto">
          <div className="flex items-center gap-4 text-white font-bold">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-blue-500"></div>
              <span className="text-2xl">{gameState.score.home}</span>
            </div>
            <span className="text-gray-400">-</span>
            <div className="flex items-center gap-2">
              <span className="text-2xl">{gameState.score.away}</span>
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
            </div>
          </div>
        </div>

        {/* Time and Half */}
        <div className="bg-black/70 backdrop-blur-sm rounded-lg px-6 py-3">
          <div className="text-white text-center">
            <div className="text-sm text-gray-400">
              {gameState.half === 1 ? '1ST HALF' : '2ND HALF'}
            </div>
            <div className="text-2xl font-bold">{formatTime(gameState.time)}</div>
          </div>
        </div>

        {/* Pause button */}
        <button
          onClick={onPause}
          className="bg-black/70 backdrop-blur-sm rounded-lg px-4 py-3 pointer-events-auto hover:bg-black/90 transition-colors"
        >
          <svg
            className="w-6 h-6 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            {gameState.isPaused ? (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
              />
            ) : (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 9v6m4-6v6"
              />
            )}
          </svg>
        </button>
      </div>

      {/* Controls guide */}
      <div className="absolute bottom-4 left-4 bg-black/70 backdrop-blur-sm rounded-lg p-4 text-white text-sm">
        <div className="font-bold mb-2">CONTROLS</div>
        <div className="space-y-1 text-gray-300">
          <div>WASD / Arrows - Move</div>
          <div>Shift - Sprint</div>
          <div>Space - Shoot</div>
          <div>Q/E - Pass</div>
          <div>X/C - Tackle</div>
        </div>
      </div>

      {/* Possession indicator */}
      <div className="absolute bottom-4 right-4 bg-black/70 backdrop-blur-sm rounded-lg p-4">
        <div className="text-white text-sm font-bold mb-2">POSSESSION</div>
        <div className="flex items-center gap-2">
          <div
            className={`w-3 h-3 rounded-full ${
              gameState.possession === 'home' ? 'bg-blue-500' : 'bg-red-500'
            }`}
          ></div>
          <span className="text-white">
            {gameState.possession === 'home' ? 'HOME' : 'AWAY'}
          </span>
        </div>
      </div>

      {/* Game Over overlay */}
      {gameState.isGameOver && (
        <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center pointer-events-auto">
          <div className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl p-8 text-center max-w-md">
            <h2 className="text-4xl font-bold text-white mb-4">FULL TIME!</h2>
            <div className="text-6xl font-bold text-white mb-6">
              {gameState.score.home} - {gameState.score.away}
            </div>
            <div className="text-xl text-white mb-8">
              {gameState.score.home > gameState.score.away
                ? '🏆 HOME TEAM WINS!'
                : gameState.score.away > gameState.score.home
                ? '🏆 AWAY TEAM WINS!'
                : '🤝 DRAW!'}
            </div>
            <button
              onClick={() => window.location.reload()}
              className="bg-white text-blue-600 px-8 py-3 rounded-lg font-bold hover:bg-gray-100 transition-colors"
            >
              PLAY AGAIN
            </button>
          </div>
        </div>
      )}

      {/* Pause overlay */}
      {gameState.isPaused && !gameState.isGameOver && (
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center pointer-events-auto">
          <div className="bg-black/90 rounded-2xl p-8 text-center">
            <h2 className="text-4xl font-bold text-white mb-4">PAUSED</h2>
            <button
              onClick={onPause}
              className="bg-blue-600 text-white px-8 py-3 rounded-lg font-bold hover:bg-blue-700 transition-colors"
            >
              RESUME
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
