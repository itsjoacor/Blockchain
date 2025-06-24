import React from "react";

const MintingChecklist = ({ steps }) => {
  return (
    <div className="bg-gray-800 p-6 rounded-lg shadow mb-6">
      <h2 className="text-xl font-semibold mb-4 text-white">📝 Progreso del Minteo</h2>
      <ul className="space-y-3">
        {steps.map((step, index) => (
          <li key={index} className="flex items-center">
            {step.status === "completed" ? (
              <span className="text-green-400 mr-2">✅</span>
            ) : step.status === "in-progress" ? (
              <span className="text-yellow-400 animate-pulse mr-2">⏳</span>
            ) : (
              <span className="text-gray-400 mr-2">🔲</span>
            )}
            <span className="text-gray-200">{step.label}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default MintingChecklist;
