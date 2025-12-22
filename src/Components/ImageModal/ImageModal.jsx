import React from "react";

const ImageModal = ({ imageUrl, altText, onClose }) => {
  return (
    // Dark background (Overlay)
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 transition-opacity duration-300"
      onClick={onClose}
    >
      {/* Modal container */}
      <div
        className="bg-white rounded-lg shadow-2xl m-4 max-w-3xl w-full p-6 relative"
        onClick={(e) => e.stopPropagation()} // Previene que el clic dentro cierre el modal
      >
        {/* Button close */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-700 hover:text-gray-900 text-2xl font-bold z-10"
        >
          &times;
        </button>

        {/* Big picture */}
        <div className="mb-4">
          <img
            src={imageUrl}
            alt={altText}
            className="w-full h-auto max-h-[80vh] object-contain rounded-lg"
          />
        </div>

        {/* Glasses text */}
        <div className="text-center p-2 border-t pt-4">
          <h2 className="text-2xl font-semibold text-gray-800">{altText}</h2>
        </div>
      </div>
    </div>
  );
};

export default ImageModal;
