import React from "react";
import shapeData from "../../Data-json/shape-face.json";

function getShapeInfo(shape) {
  return shapeData.find(
    (item) => item.name.toLowerCase() === shape.toLowerCase()
  );
}

export default function DetectedShape({ detectedShape }) {
  if (!detectedShape) return null;

  const shapeInfo = getShapeInfo(detectedShape);

  if (!shapeInfo) return <p>There´s no data for this face shape.</p>;

  return (
    <div className="mt-6">
      {/* Title */}
      <h2 className="text-2xl font-bold">{shapeInfo.name}</h2>

      {/* Description */}
      <p className="mt-2">{shapeInfo.description}</p>

      <hr className="my-4" />

      {/* Glasses List */}
      <h3 className="text-xl font-semibold">Recommended Glasses</h3>
      <ul className="list-disc ml-4 mt-2">
        {shapeInfo.glasses.map((glassesObj, index) =>
          Object.entries(glassesObj).map(([type, desc]) => (
            <li key={`${type}-${index}`}>
              <strong>{type}: </strong> {desc}
            </li>
          ))
        )}
      </ul>

      <hr className="my-4" />

      {/* Images grouped by type */}
      <h3 className="text-xl font-semibold mb-2">Examples of Glasses</h3>

      {Object.entries(
        shapeInfo.pictures.reduce((acc, item) => {
          if (!acc[item.glasses]) acc[item.glasses] = [];
          acc[item.glasses].push(item.picture);
          return acc;
        }, {})
      ).map(([glassType, images]) => (
        <div key={glassType} className="mb-8">
          <h4 className="text-lg font-medium mb-4 text-center">{glassType}</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {images.map((img, i) => (
              <div
                key={i}
                className="max-w-xs mx-auto bg-white rounded-xl shadow-md overflow-hidden border border-gray-100 flex flex-col h-full transition hover:shadow-lg"
              >
                {/* Image (square, fixed) */}
                <div className="w-full aspect-square bg-gray-100 flex items-center justify-center p-3">
                  <img
                    src={img.trim()}
                    alt={glassType}
                    className="w-full h-full object-contain"
                  />
                </div>

                {/* Content (pushes to bottom) */}
                <div className="flex flex-col grow p-4">
                  <h5 className="text-center text-sm font-semibold text-emerald-800 mb-3">
                    {glassType}
                  </h5>

                  <button className="mt-auto w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-2 rounded-lg transition">
                    Watch glasses
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}