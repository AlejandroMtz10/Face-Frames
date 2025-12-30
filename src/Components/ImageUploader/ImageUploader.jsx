import React, { useState, useCallback, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FiUploadCloud } from "react-icons/fi";
import { TbLoader2 } from "react-icons/tb";

import {
    calculateFaceShape,
    getFaceShapeData,
} from "../../utils/face_shape.jsx";

let faceLandmarker = null;

export default function ImageUploader() {
    const navigate = useNavigate();
    const imageRef = useRef(null);

    const [file, setFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const [loading, setLoading] = useState(false);
    const [modelsLoaded, setModelsLoaded] = useState(false);
    const [error, setError] = useState(null);
    const [isDragging, setIsDragging] = useState(false);
    const [faceShape, setFaceShape] = useState({
        shape: null,
        accuracy: 0,
    });

    // Load MediaPipe once
    useEffect(() => {
        const loadModel = async () => {
        try {
            const { FaceLandmarker, FilesetResolver } = await import(
                "@mediapipe/tasks-vision"
            );

            const resolver = await FilesetResolver.forVisionTasks(
                "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/wasm"
            );

            faceLandmarker = await FaceLandmarker.createFromOptions(resolver, {
                baseOptions: {
                    modelAssetPath: "/models/face_landmarker.task",
                    delegate: "CPU",
                },
                runningMode: "IMAGE",
                numFaces: 1,
            });

            setModelsLoaded(true);
        } catch {
            setError("Face analysis model could not be loaded.");
        }
        };

        loadModel();
    }, []);

    const processFile = useCallback((selectedFile) => {
        if (!selectedFile) return;

        const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
        if (!allowedTypes.includes(selectedFile.type)) {
            setError("Unsupported image format.");
        return;
        }

        setFile(selectedFile);
        setPreview(URL.createObjectURL(selectedFile));
        setFaceShape({ shape: null, accuracy: 0 });
        setError(null);
    }, []);

    const handleAnalyze = async () => {
        if (!file || !modelsLoaded || !faceLandmarker) return;

        setLoading(true);
        setError(null);

        try {
            const img = imageRef.current;
            const result = faceLandmarker.detect(img);

            if (!result.faceLandmarks.length) {
                setError("No face detected.");
                return;
            }

            const landmarks = result.faceLandmarks[0].map((p) => ({
                x: p.x * img.naturalWidth,
                y: p.y * img.naturalHeight,
            }));

            const resultShape = calculateFaceShape({ positions: landmarks });
            setFaceShape(resultShape);
        } catch {
            setError("Face analysis failed.");
        } finally {
            setLoading(false);
        }
    };

const handleViewDetails = () => {
    navigate("/DashboardResult", {
        state: {
            shape: faceShape.shape,
            confidence: faceShape.accuracy,
            faceImage: preview,
            faceData: getFaceShapeData(faceShape.shape),
        },
    });
};

    return (
        <div className="w-full flex justify-center p-4">
            <div className="w-full max-w-2xl bg-white rounded-xl shadow-xl p-6">
                {preview && (
                    <img
                        ref={imageRef}
                        src={preview}
                        alt="hidden-face"
                        className="hidden"
                    />
                )}

                {/* Upload */}
                <div
                    onDrop={(e) => {
                        e.preventDefault();
                        setIsDragging(false);
                        processFile(e.dataTransfer.files[0]);
                    }}
                    onDragOver={(e) => e.preventDefault()}
                    onDragEnter={() => setIsDragging(true)}
                    onDragLeave={() => setIsDragging(false)}
                    className={`border-2 border-dashed rounded-xl p-8 mb-6 text-center transition
                        ${
                        isDragging
                            ? "border-blue-500 bg-blue-50"
                            : "border-gray-300"
                        }`}
                >
                    <label className="cursor-pointer">
                        <input
                            type="file"
                            accept="image/*"
                            hidden
                            onChange={(e) => processFile(e.target.files[0])}
                        />

                        <div className="w-32 h-32 mx-auto mb-4 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
                            {preview ? (
                                <img
                                src={preview}
                                alt="preview"
                                className="w-full h-full object-cover"
                                />
                            ) : (
                                <FiUploadCloud className="w-8 h-8 text-gray-400" />
                            )}
                        </div>

                        <p className="font-semibold text-gray-700">
                            {preview ? "Image selected" : "Click or drag an image"}
                        </p>
                    </label>
                </div>
                <p className="text-lg text-gray-900 dark:text-emerald-800 pb-2">
                    Note: Upload a clear photo of your face for best results and try it 3 times for a better result.
                </p>
                {/* Analyze */}
                <button
                    onClick={handleAnalyze}
                    disabled={!file || loading || !modelsLoaded}
                    className="w-full py-3 bg-blue-600 text-white font-bold rounded-xl disabled:opacity-50"
                >
                    {loading ? (
                        <span className="flex items-center justify-center">
                            <TbLoader2 className="animate-spin mr-2" />
                            Processing...
                        </span>
                    ) : (
                        "Analyze Face"
                    )}
                </button>

                {error && (
                    <div className="mt-4 bg-red-100 text-red-700 p-3 rounded-lg">
                        {error}
                    </div>
                )}

                <div className="mt-6 bg-emerald-50 text-center p-4 rounded-lg">
                    <p className="text-sm text-emerald-800">Detected Shape</p>
                    <p className="text-2xl font-bold text-emerald-700">
                        {faceShape.shape || "--"}
                    </p>
                </div>

                {faceShape.shape && (
                    <button
                        onClick={handleViewDetails}
                        className="w-full mt-4 py-3 bg-cyan-600 text-white font-bold rounded-xl"
                    >
                        View Details
                    </button>
                )}
            </div>
        </div>
    );
}
