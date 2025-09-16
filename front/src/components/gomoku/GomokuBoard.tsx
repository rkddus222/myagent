import React from 'react';
import GomokuSquare from './GomokuSquare';

interface GomokuBoardProps {
  squares: ('B' | 'W' | null)[][];
  onSquareClick: (row: number, col: number) => void;
  blackIsNext: boolean;
}

const GomokuBoard: React.FC<GomokuBoardProps> = ({ squares, onSquareClick, blackIsNext }) => {
  const boardSize = 15;

  const renderSquare = (row: number, col: number) => {
    return (
      <GomokuSquare
        key={`${row}-${col}`}
        value={squares[row][col]}
        onClick={() => onSquareClick(row, col)}
        isNext={blackIsNext}
      />
    );
  };

  const board = [];
  for (let i = 0; i < boardSize; i++) {
    const row = [];
    for (let j = 0; j < boardSize; j++) {
      row.push(renderSquare(i, j));
    }
    board.push(<div key={i} className="flex">{row}</div>);
  }

  return (
    <div className="bg-yellow-700 p-4 rounded-lg shadow-lg">
      <div className="grid grid-cols-15 gap-0">{board}</div>
    </div>
  );
};

export default GomokuBoard;