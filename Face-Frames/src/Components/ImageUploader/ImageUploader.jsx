import React, { useState, useCallback } from "react";
import { analyzeFaceWithLuxand } from "../../utils/luxandApi.js";
import { calculateFaceShape, getLensRecommendation } from "../../utils/faceShape.js";
import { FiUploadCloud } from "react-icons/fi";
import { TbLoader2 } from "react-icons/tb";


export default function ImageUploader() {
    const [preview, setPreview] = useState(null);
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [faceShape, setFaceShape] = useState({ shape: null, recommendation: null });
    const [error, setError] = useState(null);
    const [isDragging, setIsDragging] = useState(false);

    // Unified function to handle file processing
    const processFile = useCallback((selectedFile) => {
        if (!selectedFile) return;

        // Supported file types
        const validTypes = ['image/jpeg', 'image/png', 'image/webp'];

        if (!validTypes.includes(selectedFile.type)) {
            setError("Unsupported file format. Please use JPEG, PNG, or WebP.");
            setFile(null);
            setPreview(null);
            return;
        }

        setFile(selectedFile);
        // Create object URL for image preview
        setPreview(URL.createObjectURL(selectedFile)); 
        setError(null);
        setFaceShape({ shape: null, recommendation: null });
    }, []);

    // Handle file input change
    const handleImageChange = (e) => {
        const selectedFile = e.target.files[0];
        processFile(selectedFile);
    };

    // Handle file drop event
    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        const droppedFile = e.dataTransfer.files[0];
        if (droppedFile) {
            processFile(droppedFile);
        }
    };

    // Prevent default behavior for drag events
    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragging(true);
    };

    // Reset drag state when leaving the zone
    const handleDragLeave = (e) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleAnalyze = async () => {
        if (!file) {
            setError("Please select or drop an image first.");
            return;
        }

        setLoading(true);
        setError(null);
        setFaceShape({ shape: null, recommendation: null });

        try {
            // Call API function
            const apiResponse = await analyzeFaceWithLuxand(file); 

            const detectedFaces = apiResponse.landmarks;
            // Check for success status and if landmarks array contains data
            const isFaceDetected = apiResponse.status === "success" && Array.isArray(detectedFaces) && detectedFaces.length > 0;

            if (isFaceDetected) {
                // Face landmarks are in the first element of the 'landmarks' array
                const firstFaceLandmarks = detectedFaces[0]; 
                
                // Classify face shape
                const shape = calculateFaceShape(firstFaceLandmarks);
                const recommendation = getLensRecommendation(shape);

                setFaceShape({ shape, recommendation });

            } else {
                // Handle API error or no detection
                let detectionError = "Luxand API did not detect any faces in the image. Ensure the face is clear and well-lit.";

                if (apiResponse && apiResponse.status === "failure") {
                    detectionError = `API Error: ${apiResponse.message}`;
                } 
                
                setError(detectionError);
                setFaceShape({ shape: "N/A", recommendation: "Please try with a different image." });
            }

        } catch (err) {
            console.error(err);
            setError(err.message || "An unexpected error occurred during analysis.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center p-4 font-sans w-full">
            <div className="w-full max-w-2xl">
                <div className="bg-white dark:bg-emerald-900 rounded-xl shadow-2xl p-6 sm:p-8 border border-gray-200">

                    {/* Image Upload/Drop Zone Section */}
                    <div className="mb-8 flex flex-col items-center">
                        
                        {/* Drop Zone */}
                        <div 
                            onDrop={handleDrop}
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            className={`w-full p-10 mb-4 rounded-xl border-2 border-dashed transition duration-300 ${
                                isDragging ? 'border-indigo-500 bg-indigo-50' : 'border-gray-300 hover:border-indigo-400'
                            } cursor-pointer`}
                        >
                            <label htmlFor="file-upload" className="flex flex-col items-center justify-center text-center">
                                {/* Preview / Placeholder */}
                                <div className="w-32 h-32 bg-gray-100 rounded-lg flex items-center justify-center text-gray-600 overflow-hidden mb-4 border-2 border-gray-300 shadow-inner">
                                    {preview ? (
                                        <img
                                            src={preview}
                                            alt="Image Preview"
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <FiUploadCloud className="w-8 h-8 text-gray-400" />
                                    )}
                                </div>
                                <p className="text-gray-700 dark:text-white font-semibold text-lg">
                                    {preview ? "Image Selected" : "Click to Upload or Drag and Drop"}
                                </p>
                                <p className="text-sm text-gray-500 dark:text-gray-200">
                                    Supported formats: JPEG, PNG, WebP
                                </p>
                            </label>
                            {/* Hidden File Input */}
                            <input
                                id="file-upload"
                                type="file"
                                accept="image/jpeg,image/png,image/webp"
                                className="hidden"
                                onChange={handleImageChange}
                            />
                        </div>
                    </div>

                    {/* Analysis Button */}
                    <button
                        onClick={handleAnalyze}
                        disabled={loading || !file}
                        className="w-full py-3 mb-6 bg-indigo-600 text-white font-extrabold text-lg rounded-xl hover:bg-indigo-700 disabled:bg-indigo-300 transition duration-150 shadow-lg"
                    >
                        {loading ? (
                            <div className="flex items-center justify-center">
                                <TbLoader2 className="h-5 w-5 text-white animate-spin" />
                                Analyzing...
                            </div>
                        ) : (
                            "Analyze Face"
                        )}
                    </button>

                    {/* Results Section */}
                    <div className="space-y-4">
                        {/* Error Display */}
                        {error && (
                            <div className="bg-red-100 p-4 rounded-lg border border-red-300">
                                <p className="text-red-700 font-semibold">Error:</p>
                                <p className="text-sm text-red-600">{error}</p>
                            </div>
                        )}

                        {/* Shape Result */}
                        <div className="bg-emerald-50 p-4 rounded-lg border border-emerald-300">
                            <p className="text-sm font-medium text-emerald-800">Detected Face Shape:</p>
                            <p id="faceShapeResult" className="text-2xl font-bold text-emerald-700 mt-1">
                                {faceShape.shape || "--"}
                            </p>
                        </div>

                        {/* Recommendation */}
                        <div className="bg-blue-50 p-4 rounded-lg border border-blue-300">
                            <p className="text-sm font-medium text-blue-800">Eyewear Recommendation:</p>
                            <p id="recommendationResult" className="text-blue-700 mt-1">
                                {faceShape.recommendation || "Upload an image to start."}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}