
import React from 'react';

interface SquareProps {
  value: 'X' | 'O' | null;
  onClick: () => void;
}

const Square: React.FC<SquareProps> = ({ value, onClick }) => {
  const style = value === 'X' ? 'text-blue-500' : 'text-red-500';

  return (
    <button
      className={`w-24 h-24 bg-white border-2 border-gray-300 flex items-center justify-center text-5xl font-bold transition-colors duration-200 ease-in-out hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${style}`}
      onClick={onClick}
    >
      {value}
    </button>
  );
};

export default Square;
