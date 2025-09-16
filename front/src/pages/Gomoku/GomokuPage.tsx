import React, { useState } from 'react';
import GomokuBoard from '../../components/gomoku/GomokuBoard';

const GomokuPage: React.FC = () => {
  const boardSize = 15;
  const [history, setHistory] = useState([Array(boardSize).fill(Array(boardSize).fill(null))]);
  const [currentMove, setCurrentMove] = useState(0);
  const blackIsNext = currentMove % 2 === 0;
  const currentSquares = history[currentMove];

  function handlePlay(nextSquares: ('B' | 'W' | null)[][]) {
    const nextHistory = [...history.slice(0, currentMove + 1), nextSquares];
    setHistory(nextHistory);
    setCurrentMove(nextHistory.length - 1);
  }

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

  function handleClick(row: number, col: number) {
    if (calculateWinner(currentSquares) || currentSquares[row][col]) {
      return;
    }
    const nextSquares = currentSquares.map((r: any) => r.slice());
    nextSquares[row][col] = blackIsNext ? 'B' : 'W';
    handlePlay(nextSquares);
  }

  const winner = calculateWinner(currentSquares);
  let status;
  if (winner) {
    status = 'Winner: ' + winner;
  } else {
    status = 'Next player: ' + (blackIsNext ? 'Black' : 'White');
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <main className="p-8 bg-white rounded-lg shadow-2xl">
        <h1 className="mb-6 text-4xl font-bold text-center text-gray-800">Gomoku</h1>
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
    const col = squares.map(row => row[i]);
    const winner = checkLine(col);
    if (winner) return winner;
  }

  // Check diagonals
  for (let i = 0; i < boardSize * 2 - 1; i++) {
    const diag1 = [];
    const diag2 = [];
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