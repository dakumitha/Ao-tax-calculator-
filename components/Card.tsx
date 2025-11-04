import React from 'react';

const Card: React.FC<{ title: React.ReactNode; children: React.ReactNode, className?: string }> = ({ title, children, className }) => (
  <div className={`card bg-white p-4 md:p-6 rounded-lg shadow-md mb-6 ${className}`}>
    <div className="border-b pb-3 mb-4 no-print">
      {typeof title === 'string' ? (
        <h2 className="text-xl font-semibold text-gray-800">{title}</h2>
      ) : (
        title
      )}
    </div>
    {children}
  </div>
);

export default Card;
