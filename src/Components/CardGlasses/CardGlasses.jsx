import React, { useState } from "react";
import ImageModal from "../ImageModal";

const CardGlasses = ({ glassesData }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const { glasses, picture } = glassesData;

    const openModal = () => setIsModalOpen(true);
    const closeModal = () => setIsModalOpen(false);

    return (
        <>
            {/* Card structure */}
            <div className="max-w-xs mx-auto bg-white rounded-lg shadow-xl overflow-hidden transform transition duration-300 hover:shadow-2xl hover:scale-[1.02] border border-gray-100 flex flex-col h-full">
            {/* Glasses picture */}
            <div className="relative w-full aspect-4/3 bg-gray-100 flex items-center justify-center p-2"> 
                <img
                    src={picture}
                    alt={glasses}
                    className="w-full h-full object-contain bg-white"
                />
            </div>

            {/* Content */}
            <div className="flex flex-col grow p-4">
                <div className="mt-auto mb-2"> 
                    <h3 className="text-xl font-semibold text-emerald-900 leading-tight text-center ">
                        {glasses}
                    </h3>
                </div>
                {/* Button to open the picture */}
                <button
                    onClick={openModal}
                    className="w-full bg-blue-500 dark:bg-teal-500 text-white  font-bold py-3 px-4 rounded-lg shadow-lg dark:hover:bg-teal-600 hover:bg-blue-600 transition duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-opacity-50"
                >
                    Watch glasses
                </button>
            </div>
        </div>

            {/* Modal - Show with a condition */}
            {isModalOpen && (
                <ImageModal imageUrl={picture} altText={glasses} onClose={closeModal} />
            )}
        </>
    );
};

export default CardGlasses;
