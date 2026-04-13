// SimplePagination.jsx
import React from 'react';

const SimplePagination = ({ current, total, onPageChange }) => {
  const pages = Array.from({ length: total }, (_, i) => i + 1);
  return (
    <div className="flex gap-2 justify-center mt-4">
      {pages.map((p) => (
        <button
          key={p}
          onClick={() => onPageChange(p)}
          className={`px-3 py-1 border rounded ${p === current ? 'bg-blue-500 text-white' : 'bg-gray-100'}`}
        >
          {p}
        </button>
      ))}
    </div>
  );
};

export default SimplePagination;