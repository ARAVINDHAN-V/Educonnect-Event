import React from "react";

const ViewModeToggle = ({ viewMode, setViewMode }) => {
  return (
    <div className="flex rounded-md shadow-sm">
      <button
        type="button"
        className={`relative inline-flex items-center px-3 py-2 rounded-l-md border border-gray-300 ${
          viewMode === "grid"
            ? "bg-blue-50 text-blue-700 border-blue-500 z-10"
            : "bg-white text-gray-700"
        }`}
        onClick={() => setViewMode("grid")}
      >
        <span className="sr-only">Grid view</span>
        <div className="grid grid-cols-2 gap-0.5">
          <div className="w-2 h-2 bg-current rounded-sm" />
          <div className="w-2 h-2 bg-current rounded-sm" />
          <div className="w-2 h-2 bg-current rounded-sm" />
          <div className="w-2 h-2 bg-current rounded-sm" />
        </div>
      </button>
      <button
        type="button"
        className={`relative inline-flex items-center px-3 py-2 rounded-r-md border border-gray-300 ${
          viewMode === "list"
            ? "bg-blue-50 text-blue-700 border-blue-500 z-10"
            : "bg-white text-gray-700"
        }`}
        onClick={() => setViewMode("list")}
      >
        <span className="sr-only">List view</span>
        <div className="flex flex-col space-y-1">
          <div className="w-5 h-1 bg-current rounded-sm" />
          <div className="w-5 h-1 bg-current rounded-sm" />
          <div className="w-5 h-1 bg-current rounded-sm" />
        </div>
      </button>
    </div>
  );
};

export default ViewModeToggle;