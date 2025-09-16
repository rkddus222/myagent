import React from 'react';

interface GomokuSquareProps {
  value: 'B' | 'W' | null;
  onClick: () => void;
  isNext: boolean;
}

const GomokuSquare: React.FC<GomokuSquareProps> = ({ value, onClick, isNext }) => {
  const stone = value ? (
    <div
      className={`w-6 h-6 rounded-full ${value === 'B' ? 'bg-black' : 'bg-white'} shadow-md`}
    />
  ) : null;

  const hoverStone = !value && isNext ? (
    <div
      className={`w-6 h-6 rounded-full ${isNext ? 'bg-gray-400 opacity-50' : ''}`}
    />
  ) : null;

  return (
    <div
      className="w-8 h-8 flex items-center justify-center bg-yellow-600 border border-gray-700"
      onClick={onClick}
    >
      <div className="relative w-full h-full flex items-center justify-center">
        {stone}
        <div className="absolute inset-0 flex items-center justify-center">{hoverStone}</div>
      </div>
    </div>
  );
};

export default GomokuSquare;