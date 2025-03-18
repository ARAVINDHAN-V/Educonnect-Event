import React from "react";

const Skeleton = ({ count = 1, height = "16", className = "" }) => {
  return (
    <>
      {[...Array(count)].map((_, index) => (
        <div
          key={index}
          className={`animate-pulse bg-gray-200 rounded h-${height} ${className}`}
        />
      ))}
    </>
  );
};

export default Skeleton;