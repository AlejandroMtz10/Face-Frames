import React from "react";
import ImageUploader from "../../Components/ImageUploader";
import { TbFaceId } from "react-icons/tb";

function Glasses() {
    return (
        <div>
            <div className="flex justify-center content-center items-center gap-2">
                <TbFaceId className="text-5xl font-bold text-blue-600 dark:text-emerald-500"/>
                <h1 className="text-4xl font-bold py-4 text-emerald-600 dark:text-white">
                    Face Shape Analyzer
                </h1>
            </div>
            <div className="text-center mt-6 flex flex-col items-center gap-6 px-4">
                <h3 className="text-xl">
                    Upload an image to analyze your face and discover the perfect glasses for you!
                </h3>
                <ImageUploader />
            </div>
        </div>
    );
}

export default Glasses;