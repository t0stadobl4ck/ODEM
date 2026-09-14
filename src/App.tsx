import { useState, useEffect, useCallback, useRef } from 'react';

// Constantes del juego
const GRID_SIZE = 20;
const CELL_SIZE = 25;
const INITIAL_SPEED = 150;
const SPEED_INCREMENT = 5;
const MIN_SPEED = 50;

type Position = { x: number; y: number };
type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';

function App() {
  const [snake, setSnake] = useState<Position[]>([{ x: 10, y: 10 }]);
  const [food, setFood] = useState<Position>({ x: 15, y: 15 });
  const [direction, setDirection] = useState<Direction>('RIGHT');
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(() => {
    const saved = localStorage.getItem('snakeHighScore');
    return saved ? parseInt(saved) : 0;
  });
  const [isPaused, setIsPaused] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [speed, setSpeed] = useState(INITIAL_SPEED);

  const directionRef = useRef<Direction>(direction);
  const gameLoopRef = useRef<number | null>(null);

  // Generar comida en posición aleatoria
  const generateFood = useCallback((currentSnake: Position[]): Position => {
    let newFood: Position;
    do {
      newFood = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE),
      };
    } while (currentSnake.some(segment => segment.x === newFood.x && segment.y === newFood.y));
    return newFood;
  }, []);

  // Reiniciar el juego
  const resetGame = () => {
    const initialSnake = [{ x: 10, y: 10 }];
    setSnake(initialSnake);
    setFood(generateFood(initialSnake));
    setDirection('RIGHT');
    directionRef.current = 'RIGHT';
    setGameOver(false);
    setScore(0);
    setSpeed(INITIAL_SPEED);
    setIsPaused(false);
    setGameStarted(true);
  };

  // Mover la serpiente
  const moveSnake = useCallback(() => {
    if (gameOver || isPaused) return;

    setSnake(prevSnake => {
      const head = { ...prevSnake[0] };
      const currentDirection = directionRef.current;

      switch (currentDirection) {
        case 'UP':
          head.y -= 1;
          break;
        case 'DOWN':
          head.y += 1;
          break;
        case 'LEFT':
          head.x -= 1;
          break;
        case 'RIGHT':
          head.x += 1;
          break;
      }

      // Verificar colisión con las paredes
      if (head.x < 0 || head.x >= GRID_SIZE || head.y < 0 || head.y >= GRID_SIZE) {
        setGameOver(true);
        return prevSnake;
      }

      // Verificar colisión con el cuerpo
      if (prevSnake.some(segment => segment.x === head.x && segment.y === head.y)) {
        setGameOver(true);
        return prevSnake;
      }

      const newSnake = [head, ...prevSnake];

      // Verificar si come la comida
      if (head.x === food.x && head.y === food.y) {
        setScore(prev => {
          const newScore = prev + 10;
          if (newScore > highScore) {
            setHighScore(newScore);
            localStorage.setItem('snakeHighScore', newScore.toString());
          }
          return newScore;
        });
        setFood(generateFood(newSnake));
        setSpeed(prev => Math.max(MIN_SPEED, prev - SPEED_INCREMENT));
      } else {
        newSnake.pop();
      }

      return newSnake;
    });
  }, [food, gameOver, isPaused, generateFood, highScore]);

  // Game loop
  useEffect(() => {
    if (gameStarted && !gameOver && !isPaused) {
      gameLoopRef.current = window.setInterval(moveSnake, speed);
    }
    return () => {
      if (gameLoopRef.current) {
        clearInterval(gameLoopRef.current);
      }
    };
  }, [moveSnake, gameStarted, gameOver, isPaused, speed]);

  // Controles de teclado
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (!gameStarted && e.key === ' ') {
        resetGame();
        return;
      }

      if (e.key === ' ') {
        setIsPaused(prev => !prev);
        return;
      }

      const currentDir = directionRef.current;

      switch (e.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
          if (currentDir !== 'DOWN') {
            setDirection('UP');
            directionRef.current = 'UP';
          }
          break;
        case 'ArrowDown':
        case 's':
        case 'S':
          if (currentDir !== 'UP') {
            setDirection('DOWN');
            directionRef.current = 'DOWN';
          }
          break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
          if (currentDir !== 'RIGHT') {
            setDirection('LEFT');
            directionRef.current = 'LEFT';
          }
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
          if (currentDir !== 'LEFT') {
            setDirection('RIGHT');
            directionRef.current = 'RIGHT';
          }
          break;
      }

      e.preventDefault();
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [gameStarted]);

  // Controles táctiles
  const handleDirectionButton = (newDirection: Direction) => {
    const currentDir = directionRef.current;
    if (
      (newDirection === 'UP' && currentDir !== 'DOWN') ||
      (newDirection === 'DOWN' && currentDir !== 'UP') ||
      (newDirection === 'LEFT' && currentDir !== 'RIGHT') ||
      (newDirection === 'RIGHT' && currentDir !== 'LEFT')
    ) {
      setDirection(newDirection);
      directionRef.current = newDirection;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-green-900 to-gray-900 flex flex-col items-center justify-center p-4">
      {/* Título */}
      <h1 className="text-4xl md:text-5xl font-bold text-green-400 mb-4 text-center drop-shadow-lg">
        🐍 Juego de la Serpiente
      </h1>

      {/* Puntuación */}
      <div className="flex gap-6 mb-4 text-lg">
        <div className="bg-gray-800/80 px-4 py-2 rounded-lg border border-green-500/30">
          <span className="text-green-300">Puntos: </span>
          <span className="text-white font-bold">{score}</span>
        </div>
        <div className="bg-gray-800/80 px-4 py-2 rounded-lg border border-yellow-500/30">
          <span className="text-yellow-300">Récord: </span>
          <span className="text-white font-bold">{highScore}</span>
        </div>
      </div>

      {/* Tablero del juego */}
      <div
        className="relative border-4 border-green-500 rounded-lg shadow-2xl shadow-green-500/20 bg-gray-900/90"
        style={{
          width: GRID_SIZE * CELL_SIZE,
          height: GRID_SIZE * CELL_SIZE,
        }}
      >
        {/* Cuadrícula de fondo */}
        {Array.from({ length: GRID_SIZE * GRID_SIZE }).map((_, index) => {
          const x = index % GRID_SIZE;
          const y = Math.floor(index / GRID_SIZE);
          const isDark = (x + y) % 2 === 0;
          return (
            <div
              key={index}
              className={`absolute ${isDark ? 'bg-gray-900' : 'bg-gray-800/50'}`}
              style={{
                width: CELL_SIZE,
                height: CELL_SIZE,
                left: x * CELL_SIZE,
                top: y * CELL_SIZE,
              }}
            />
          );
        })}

        {/* Serpiente */}
        {snake.map((segment, index) => (
          <div
            key={index}
            className={`absolute rounded-sm transition-all duration-75 ${
              index === 0
                ? 'bg-green-400 shadow-lg shadow-green-400/50 z-10'
                : 'bg-green-500'
            }`}
            style={{
              width: CELL_SIZE - 2,
              height: CELL_SIZE - 2,
              left: segment.x * CELL_SIZE + 1,
              top: segment.y * CELL_SIZE + 1,
              opacity: index === 0 ? 1 : Math.max(0.4, 1 - index * 0.02),
            }}
          >
            {index === 0 && (
              <div className="flex items-center justify-center w-full h-full text-xs">
                {direction === 'RIGHT' && '👀'}
                {direction === 'LEFT' && '👀'}
                {direction === 'UP' && '👀'}
                {direction === 'DOWN' && '👀'}
              </div>
            )}
          </div>
        ))}

        {/* Comida */}
        <div
          className="absolute flex items-center justify-center animate-pulse"
          style={{
            width: CELL_SIZE,
            height: CELL_SIZE,
            left: food.x * CELL_SIZE,
            top: food.y * CELL_SIZE,
          }}
        >
          <span className="text-xl">🍎</span>
        </div>

        {/* Pantalla de inicio */}
        {!gameStarted && !gameOver && (
          <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center rounded-lg z-20">
            <div className="text-6xl mb-4">🐍</div>
            <h2 className="text-2xl font-bold text-green-400 mb-2">¡Bienvenido!</h2>
            <p className="text-gray-300 mb-4 text-center px-4">
              Usa las flechas o WASD para moverte
            </p>
            <button
              onClick={resetGame}
              className="bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-8 rounded-lg text-lg transition-all transform hover:scale-105 shadow-lg"
            >
              🎮 Jugar
            </button>
            <p className="text-gray-500 mt-3 text-sm">o presiona ESPACIO</p>
          </div>
        )}

        {/* Pantalla de Game Over */}
        {gameOver && (
          <div className="absolute inset-0 bg-black/85 flex flex-col items-center justify-center rounded-lg z-20">
            <div className="text-5xl mb-3">💀</div>
            <h2 className="text-3xl font-bold text-red-400 mb-2">¡Game Over!</h2>
            <p className="text-xl text-white mb-1">
              Puntuación: <span className="text-green-400 font-bold">{score}</span>
            </p>
            {score === highScore && score > 0 && (
              <p className="text-yellow-400 font-bold mb-2 animate-bounce">
                🏆 ¡Nuevo Récord! 🏆
              </p>
            )}
            <button
              onClick={resetGame}
              className="mt-4 bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-8 rounded-lg text-lg transition-all transform hover:scale-105 shadow-lg"
            >
              🔄 Reintentar
            </button>
          </div>
        )}

        {/* Pausa */}
        {isPaused && !gameOver && gameStarted && (
          <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center rounded-lg z-20">
            <div className="text-5xl mb-3">⏸️</div>
            <h2 className="text-2xl font-bold text-yellow-400 mb-2">Pausado</h2>
            <p className="text-gray-300">Presiona ESPACIO para continuar</p>
          </div>
        )}
      </div>

      {/* Controles táctiles para móvil */}
      <div className="mt-6 md:hidden">
        <div className="grid grid-cols-3 gap-2 w-40 mx-auto">
          <div></div>
          <button
            onTouchStart={() => handleDirectionButton('UP')}
            className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 rounded-lg active:bg-green-600 text-xl"
          >
            ↑
          </button>
          <div></div>
          <button
            onTouchStart={() => handleDirectionButton('LEFT')}
            className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 rounded-lg active:bg-green-600 text-xl"
          >
            ←
          </button>
          <button
            onTouchStart={() => handleDirectionButton('DOWN')}
            className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 rounded-lg active:bg-green-600 text-xl"
          >
            ↓
          </button>
          <button
            onTouchStart={() => handleDirectionButton('RIGHT')}
            className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 rounded-lg active:bg-green-600 text-xl"
          >
            →
          </button>
        </div>
      </div>

      {/* Instrucciones */}
      <div className="mt-6 text-center text-gray-400 text-sm max-w-md">
        <p className="mb-1">
          <span className="text-green-400 font-semibold">Controles:</span> Flechas del teclado o WASD
        </p>
        <p className="mb-1">
          <span className="text-green-400 font-semibold">Pausar:</span> Barra espaciadora
        </p>
        <p>
          <span className="text-green-400 font-semibold">Objetivo:</span> Come las 🍎 para crecer y ganar puntos
        </p>
      </div>
    </div>
  );
}

export default App;
