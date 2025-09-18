import React, { useState, useEffect, useMemo, useCallback } from 'react';
import GomokuBoard from '../../components/gomoku/GomokuBoard';
import { GomokuAI } from '../../utils/gomokuAI';

type GameMode = 'pvp' | 'pvc';
type Difficulty = 'easy' | 'medium' | 'hard';

const GomokuPage: React.FC = () => {
  const boardSize = 15;
  const [history, setHistory] = useState<(('B' | 'W' | null)[][])[]>([Array(boardSize).fill(null).map(() => Array(boardSize).fill(null))]);
  const [currentMove, setCurrentMove] = useState(0);
  const [gameMode, setGameMode] = useState<GameMode>('pvc');
  const [difficulty, setDifficulty] = useState<Difficulty>('medium');
  const [isGameStarted, setIsGameStarted] = useState(false);
  const [playerColor, setPlayerColor] = useState<'B' | 'W'>('B'); // Player can choose color

  // AI color is the opposite of player's color
  const aiPlayer = useMemo(() => (playerColor === 'B' ? 'W' : 'B'), [playerColor]);
  
  // Memoize the AI instance, re-creating it if settings change
  const gomokuAI = useMemo(() => new GomokuAI(boardSize, aiPlayer, difficulty), [boardSize, aiPlayer, difficulty]);

  const blackIsNext = currentMove % 2 === 0;
  const currentSquares = history[currentMove];

  const handlePlay = useCallback((nextSquares: ('B' | 'W' | null)[][]) => {
    const nextHistory = [...history.slice(0, currentMove + 1), nextSquares];
    setHistory(nextHistory);
    setCurrentMove(nextHistory.length - 1);
  }, [history, currentMove]);


  function jumpTo(nextMove: number) {
    setCurrentMove(nextMove);
  }

  const moves = history.map((squares, move) => {
    let description;
    if (move > 0) {
      description = 'Go to move #' + move;
    } else {
      description = 'Go to game start';
    }
    return (
      <li key={move} className="mb-2">
        <button 
          className={`w-full px-4 py-2 rounded-lg transition-colors duration-200 ease-in-out ${currentMove === move ? 'bg-indigo-500 text-white' : 'bg-gray-200 hover:bg-gray-300'}`}
          onClick={() => jumpTo(move)}
        >
          {description}
        </button>
      </li>
    );
  });

  // AI move logic
  useEffect(() => {
    if (gameMode === 'pvc' && isGameStarted && !calculateWinner(currentSquares)) {
      const isAiTurn = (blackIsNext && aiPlayer === 'B') || (!blackIsNext && aiPlayer === 'W');
      if (isAiTurn) {
        const timer = setTimeout(() => {
          const aiMove = gomokuAI.getBestMove(currentSquares);
          if (aiMove) {
            const nextSquares = currentSquares.map((r) => r.slice());
            if (nextSquares[aiMove.row][aiMove.col] === null) { // Ensure the spot is empty
              nextSquares[aiMove.row][aiMove.col] = aiPlayer;
              handlePlay(nextSquares);
            }
          }
        }, 500); // A small delay to make the AI's move feel more natural
        return () => clearTimeout(timer);
      }
    }
  }, [gameMode, isGameStarted, currentSquares, blackIsNext, aiPlayer, gomokuAI, handlePlay]);

  function handleClick(row: number, col: number) {
    if (!isGameStarted || calculateWinner(currentSquares) || currentSquares[row][col]) {
      return;
    }

    const isPlayerTurn = (blackIsNext && playerColor === 'B') || (!blackIsNext && playerColor === 'W');

    if (gameMode === 'pvc' && !isPlayerTurn) {
      return; // Not player's turn in PVC mode
    }

    const nextSquares = currentSquares.map((r) => r.slice());
    nextSquares[row][col] = blackIsNext ? 'B' : 'W';
    handlePlay(nextSquares);
  }

  function startNewGame() {
    const emptyBoard = Array(boardSize).fill(null).map(() => Array(boardSize).fill(null));
    setHistory([emptyBoard]);
    setCurrentMove(0);
    setIsGameStarted(true);
  }

  function resetGame() {
    const emptyBoard = Array(boardSize).fill(null).map(() => Array(boardSize).fill(null));
    setHistory([emptyBoard]);
    setCurrentMove(0);
    setIsGameStarted(false);
  }

  const winner = calculateWinner(currentSquares);
  let status;
  const isAiTurn = gameMode === 'pvc' && ((blackIsNext && aiPlayer === 'B') || (!blackIsNext && aiPlayer === 'W'));

  if (winner) {
    status = `Winner: ${winner === 'B' ? 'Black' : 'White'}${gameMode === 'pvc' && winner === aiPlayer ? ' (Computer)' : ''}`;
  } else if (!isGameStarted) {
    status = 'Select game mode and start playing!';
  } else if (isAiTurn) {
    status = 'Computer is thinking...';
  } else {
    const nextPlayer = blackIsNext ? 'Black' : 'White';
    const playerIndicator = gameMode === 'pvc' ? ' (You)' : '';
    status = `Next player: ${nextPlayer}${playerIndicator}`;
  }

  // Game setup screen
  if (!isGameStarted) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <main className="p-8 bg-white rounded-lg shadow-2xl max-w-lg w-full">
          <h1 className="mb-8 text-4xl font-bold text-center text-gray-800">Gomoku</h1>

          <div className="mb-8">
            <h2 className="mb-4 text-2xl font-semibold text-center text-gray-700">Select Game Mode</h2>
            <div className="space-y-4">
              <button
                className={`w-full p-4 rounded-lg border-2 transition-colors duration-200 ${gameMode === 'pvp' ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'}`}
                onClick={() => setGameMode('pvp')}
              >
                <div className="text-left">
                  <div className="font-semibold">Player vs Player</div>
                  <div className="text-sm opacity-75">Play with a friend</div>
                </div>
              </button>

              <button
                className={`w-full p-4 rounded-lg border-2 transition-colors duration-200 ${gameMode === 'pvc' ? 'border-green-500 bg-green-50 text-green-700' : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'}`}
                onClick={() => setGameMode('pvc')}
              >
                <div className="text-left">
                  <div className="font-semibold">Player vs Computer</div>
                  <div className="text-sm opacity-75">Play against AI</div>
                </div>
              </button>
            </div>
          </div>

          {gameMode === 'pvc' && (
            <>
              <div className="mb-8">
                <h3 className="mb-4 text-xl font-semibold text-center text-gray-700">Choose Your Color</h3>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    className={`p-3 rounded-lg border-2 transition-colors duration-200 text-center ${playerColor === 'B' ? 'border-black bg-gray-200 font-bold' : 'border-gray-300 bg-white'}`}
                    onClick={() => setPlayerColor('B')}
                  >
                    Black (First)
                  </button>
                  <button
                    className={`p-3 rounded-lg border-2 transition-colors duration-200 text-center ${playerColor === 'W' ? 'border-black bg-gray-200 font-bold' : 'border-gray-300 bg-white'}`}
                    onClick={() => setPlayerColor('W')}
                  >
                    White (Second)
                  </button>
                </div>
              </div>

              <div className="mb-8">
                <h3 className="mb-4 text-xl font-semibold text-center text-gray-700">Select Difficulty</h3>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    className={`p-3 rounded-lg border-2 transition-colors duration-200 text-center ${difficulty === 'easy' ? 'border-green-500 bg-green-50 text-green-700' : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'}`}
                    onClick={() => setDifficulty('easy')}
                  >
                    Easy
                  </button>
                  <button
                    className={`p-3 rounded-lg border-2 transition-colors duration-200 text-center ${difficulty === 'medium' ? 'border-yellow-500 bg-yellow-50 text-yellow-700' : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'}`}
                    onClick={() => setDifficulty('medium')}
                  >
                    Medium
                  </button>
                  <button
                    className={`p-3 rounded-lg border-2 transition-colors duration-200 text-center ${difficulty === 'hard' ? 'border-red-500 bg-red-50 text-red-700' : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'}`}
                    onClick={() => setDifficulty('hard')}
                  >
                    Hard
                  </button>
                </div>
              </div>
            </>
          )}

          <button
            className="w-full py-3 px-6 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-colors duration-200"
            onClick={startNewGame}
          >
            Start Game
          </button>
        </main>
      </div>
    );
  }

  // Main game screen
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <main className="p-8 bg-white rounded-lg shadow-2xl">
        <h1 className="mb-6 text-4xl font-bold text-center text-gray-800">Gomoku</h1>

        <div className="mb-4 flex justify-center gap-4">
          <button
            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors duration-200"
            onClick={resetGame}
          >
            New Game
          </button>
          <div className="px-4 py-2 bg-gray-100 rounded-lg text-gray-700">
            Mode: {gameMode === 'pvp' ? 'Player vs Player' : `Player vs Computer (${difficulty.charAt(0).toUpperCase() + difficulty.slice(1)})`}
          </div>
        </div>

        <div className="flex flex-row gap-8">
          <div className="flex flex-col items-center">
            <div className="mb-4 text-2xl font-semibold text-gray-700">{status}</div>
            <GomokuBoard squares={currentSquares} onSquareClick={handleClick} blackIsNext={blackIsNext} />
          </div>
          <div className="mt-8">
            <h2 className="mb-4 text-2xl font-bold text-center text-gray-800">Move History</h2>
            <ol className="pl-0 list-none h-96 overflow-y-auto">{moves}</ol>
          </div>
        </div>
      </main>
    </div>
  );
};

function calculateWinner(squares: ('B' | 'W' | null)[][]) {
  const boardSize = 15;

  function checkLine(line: ('B' | 'W' | null)[]) {
    let count = 0;
    let player = null;
    for (const stone of line) {
      if (stone) {
        if (stone === player) {
          count++;
        } else {
          player = stone;
          count = 1;
        }
        if (count === 5) {
          return player;
        }
      } else {
        count = 0;
        player = null;
      }
    }
    return null;
  }

  // Check rows
  for (let i = 0; i < boardSize; i++) {
    const winner = checkLine(squares[i]);
    if (winner) return winner;
  }

  // Check columns
  for (let i = 0; i < boardSize; i++) {
    const col: ('B' | 'W' | null)[] = squares.map(row => row[i]);
    const winner = checkLine(col);
    if (winner) return winner;
  }

  // Check diagonals
  for (let i = 0; i < boardSize * 2 - 1; i++) {
    const diag1: ('B' | 'W' | null)[] = [];
    const diag2: ('B' | 'W' | null)[] = [];
    for (let j = 0; j <= i; j++) {
      if (j < boardSize && i - j < boardSize) {
        diag1.push(squares[j][i - j]);
        diag2.push(squares[j][boardSize - 1 - (i - j)]);
      }
    }
    const winner1 = checkLine(diag1);
    if (winner1) return winner1;
    const winner2 = checkLine(diag2);
    if (winner2) return winner2;
  }

  return null;
}

export default GomokuPage;
