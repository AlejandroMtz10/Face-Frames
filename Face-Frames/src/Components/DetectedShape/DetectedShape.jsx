import React from "react";
import shapeData from "../../Data-json/shape-face.json";

function getShapeInfo(shape) {
    return shapeData.find(
        item => item.name.toLowerCase() === shape.toLowerCase()
    );
}

export default function DetectedShape({ detectedShape }) {

    if (!detectedShape) return null;

    const shapeInfo = getShapeInfo(detectedShape);

    if (!shapeInfo) return <p>No hay datos para esta forma de rostro.</p>;

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
                <div key={glassType} className="mb-6">
                    <h4 className="text-lg font-medium mb-2">{glassType}</h4>

                    <div className="flex flex-wrap justify-center gap-4">
                        {images.map((img, i) => (
                            <div
                                key={i}
                                className="w-40 p-2 border rounded-lg shadow-sm bg-white"
                            >
                                <img
                                    src={img.trim()}
                                    alt={glassType}
                                    className="w-full rounded-md"
                                />
                            </div>
                        ))}
                    </div>
                </div>
            ))}

        </div>
    );
}