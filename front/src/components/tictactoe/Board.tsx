import React from 'react';
import Square from './Square';

interface BoardProps {
  squares: Array<'X' | 'O' | null>;
  onSquareClick: (i: number) => void;
}

const Board: React.FC<BoardProps> = ({ squares, onSquareClick }) => {
  const renderSquare = (i: number) => {
    return <Square value={squares[i]} onClick={() => onSquareClick(i)} />;
  };

  return (
    <div className="grid grid-cols-3 gap-2 p-4 bg-gray-200 rounded-lg shadow-lg">
      {squares.map((_, i) => renderSquare(i))}
    </div>
  );
};

export default Board;