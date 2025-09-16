import React, { useState } from 'react';
import Board from '../components/tictactoe/Board';

const TicTacToePage: React.FC = () => {
  const [history, setHistory] = useState([Array(9).fill(null)]);
  const [currentMove, setCurrentMove] = useState(0);
  const xIsNext = currentMove % 2 === 0;
  const currentSquares = history[currentMove];

  function handlePlay(nextSquares: Array<'X' | 'O' | null>) {
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

  function handleClick(i: number) {
    if (calculateWinner(currentSquares) || currentSquares[i]) {
      return;
    }
    const nextSquares = currentSquares.slice();
    if (xIsNext) {
      nextSquares[i] = 'X';
    } else {
      nextSquares[i] = 'O';
    }
    handlePlay(nextSquares);
  }

  const winner = calculateWinner(currentSquares);
  let status;
  if (winner) {
    status = 'Winner: ' + winner;
  } else {
    status = 'Next player: ' + (xIsNext ? 'X' : 'O');
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <main className="p-8 bg-white rounded-lg shadow-2xl">
        <h1 className="mb-6 text-4xl font-bold text-center text-gray-800">Tic-Tac-Toe</h1>
        <div className="flex flex-row gap-8">
          <div className="flex flex-col items-center">
            <div className="mb-4 text-2xl font-semibold text-gray-700">{status}</div>
            <Board squares={currentSquares} onSquareClick={handleClick} />
          </div>
          <div className="mt-8">
            <h2 className="mb-4 text-2xl font-bold text-center text-gray-800">Move History</h2>
            <ol className="pl-0 list-none">{moves}</ol>
          </div>
        </div>
      </main>
    </div>
  );
};

function calculateWinner(squares: Array<'X' | 'O' | null>) {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];
  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i];
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return squares[a];
    }
  }
  return null;
}

export default TicTacToePage;