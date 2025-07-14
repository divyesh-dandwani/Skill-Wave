import React from "react";

export const Progress = ({ value, className = "" }) => {
  return (
    <div className={`w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 ${className}`}>
      <div
        className="bg-blue-600 h-2 rounded-full transition-all duration-300 ease-out"
        style={{ width: `${value}%` }}
      ></div>
    </div>
  );
};

export default Progress;