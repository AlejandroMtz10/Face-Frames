import React from "react";
import { motion as Motion } from "framer-motion";

export default function DashboardResult({
  shape,
  confidence,
  onBack,
  faceImage,
  faceData,
}) {
  // SOLO bloqueamos si no hay shape (dato obligatorio)
  if (!shape) return null;

  // Datos opcionales por si no viene faceData
  const descriptionText = faceData?.description || "No description available.";
  const glassesList = faceData?.glasses?.[0] || {};
  const pictures = faceData?.pictures || [];

  const confidenceValue = confidence || 90;

  return (
    <Motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full min-h-screen bg-white text-gray-900 p-6"
    >
      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Face Shape Analysis</h1>

        <button
          onClick={onBack}
          className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-700"
        >
          ← Back
        </button>
      </div>

      {/* TOP GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* LEFT: FACE IMAGE + SHAPE */}
        <div className="bg-gray-50 rounded-xl p-6 shadow">
          <h2 className="text-xl font-semibold mb-4">Detected Face Shape</h2>

          <div className="w-full aspect-square bg-gray-200 rounded-xl overflow-hidden flex items-center justify-center">
            {faceImage ? (
              <img src={faceImage} alt="Face" className="w-full h-full object-cover" />
            ) : (
              <p className="text-gray-500">No image</p>
            )}
          </div>

          <p className="text-center mt-4 text-2xl font-bold text-blue-700">
            {shape}
          </p>
        </div>

        {/* MIDDLE: CONFIDENCE BAR */}
        <div className="bg-gray-50 rounded-xl p-6 shadow">
          <h2 className="text-xl font-semibold mb-4">Confidence Level</h2>

          <div className="flex items-end justify-center h-64">
            <div className="w-20 bg-gray-300 rounded-xl overflow-hidden flex flex-col justify-end">
              <div
                className="bg-blue-600 rounded-xl"
                style={{ height: `${confidenceValue}%` }}
              ></div>
            </div>
          </div>

          <p className="text-center mt-4 text-xl font-bold">
            {confidenceValue}% accuracy
          </p>
        </div>

        {/* RIGHT: DESCRIPTION */}
        <div className="bg-gray-50 rounded-xl p-6 shadow">
          <h2 className="text-xl font-semibold mb-4">Shape Description</h2>
          <p className="text-gray-700 leading-relaxed">{descriptionText}</p>
        </div>
      </div>

      {/* RECOMMENDATIONS */}
      <div className="mt-10 bg-gray-50 p-6 rounded-xl shadow">
        <h2 className="text-2xl font-semibold mb-4">Recommended Glasses</h2>

        <ul className="space-y-4">
          {Object.entries(glassesList).map(([type, text], index) => (
            <li key={index} className="border-l-4 border-blue-600 pl-4">
              <p className="font-semibold text-lg">{type}</p>
              <p className="text-gray-700">{text}</p>
            </li>
          ))}
        </ul>
      </div>

      {/* PICTURES */}
      <div className="mt-10">
        <h2 className="text-2xl font-semibold mb-4">Example Glasses</h2>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
          {pictures.map((item, index) => (
            <div
              key={index}
              className="bg-gray-100 p-2 rounded-xl shadow hover:shadow-lg transition"
            >
              <img
                src={item.picture}
                alt={item.glasses}
                className="w-full h-36 object-cover rounded-xl"
              />
              <p className="text-center text-sm mt-2 text-gray-600">
                {item.glasses}
              </p>
            </div>
          ))}
        </div>
      </div>
    </Motion.div>
  );
}
