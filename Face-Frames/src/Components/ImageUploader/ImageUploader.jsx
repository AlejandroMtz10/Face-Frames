import React, { useState, useCallback, useRef, useEffect } from "react";
import { calculateFaceShape } from "../../utils/face_shape.jsx";
import DetectedShape from "../DetectedShape";
import { FiUploadCloud } from "react-icons/fi";
import { TbLoader2 } from "react-icons/tb";

import * as faceapi from "face-api.js";

export default function ImageUploader() {
    const [preview, setPreview] = useState(null);
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [modelsLoaded, setModelsLoaded] = useState(false);
    const [faceShape, setFaceShape] = useState({ shape: null });
    const [error, setError] = useState(null);
    const [isDragging, setIsDragging] = useState(false);

    const imageRef = useRef(null);

    // Load models once
    useEffect(() => {
        const loadModels = async () => {
            try {
                setLoading(true);

                await Promise.all([
                    faceapi.nets.ssdMobilenetv1.loadFromUri("/models"),
                    faceapi.nets.faceLandmark68Net.loadFromUri("/models"),
                ]);

                setModelsLoaded(true);
            } catch (err) {
                console.error("Model load error:", err);
                setError("No se pudieron cargar los modelos. Verifica /public/models.");
            } finally {
                setLoading(false);
            }
        };

        loadModels();
    }, []);

    const processFile = useCallback((selectedFile) => {
        if (!selectedFile) return;

        const validTypes = ["image/jpeg", "image/png", "image/webp"];
        if (!validTypes.includes(selectedFile.type)) {
            setError("Formato no compatible.");
            return;
        }

        setFile(selectedFile);
        setPreview(URL.createObjectURL(selectedFile));
        setError(null);
        setFaceShape({ shape: null });
    }, []);

    const handleImageChange = (e) => processFile(e.target.files[0]);

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        processFile(e.dataTransfer.files[0]);
    };

    const handleAnalyze = async () => {
        if (!file) return setError("Selecciona una imagen primero.");
        if (!modelsLoaded) return setError("Modelos aún cargándose...");

        setLoading(true);
        setError(null);

        try {
            const img = await faceapi.bufferToImage(file);
            imageRef.current = img;

            const options = new faceapi.SsdMobilenetv1Options({
                minConfidence: 0.5,
            });

            const detection = await faceapi
                .detectSingleFace(img, options)
                .withFaceLandmarks();

            if (!detection) {
                setError("No se detectó ningún rostro.");
                return;
            }

            const positions = detection.landmarks.positions.map((p) => ({
                x: p.x,
                y: p.y,
            }));

            const shape = calculateFaceShape({ positions });

            setFaceShape({ shape });
        } catch (err) {
            console.error("Analysis error:", err);
            setError("Ocurrió un error durante el análisis.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center p-4 font-sans w-full">
            <div className="w-full max-w-2xl">

                <div className="bg-white rounded-xl shadow-2xl p-6">

                    {preview && (
                        <img ref={imageRef} alt="face-hidden" style={{ display: "none" }} />
                    )}

                    {/* Upload area */}
                    <div className="mb-8 flex flex-col items-center">
                        <div
                            onDrop={handleDrop}
                            onDragOver={(e) => e.preventDefault()}
                            onDragEnter={() => setIsDragging(true)}
                            onDragLeave={() => setIsDragging(false)}
                            className={`w-full p-10 mb-4 rounded-xl border-2 border-dashed 
                                ${isDragging ? "border-blue-500 bg-blue-50" : "border-gray-300"}
                            `}
                        >
                            <label htmlFor="file-upload" className="flex flex-col items-center cursor-pointer">
                                <div className="w-32 h-32 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden mb-4 border-2 border-gray-300 shadow-inner">
                                    {preview ? (
                                        <img src={preview} className="w-full h-full object-cover" />
                                    ) : (
                                        <FiUploadCloud className="w-8 h-8 text-gray-400" />
                                    )}
                                </div>

                                <p className="text-gray-700 text-lg font-semibold">
                                    {preview ? "Imagen seleccionada" : "Haz clic o arrastra una imagen"}
                                </p>
                            </label>

                            <input
                                id="file-upload"
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={handleImageChange}
                            />
                        </div>
                    </div>

                    <button
                        onClick={handleAnalyze}
                        disabled={loading || !file || !modelsLoaded}
                        className="w-full py-3 mb-6 bg-blue-600 text-white font-bold text-lg rounded-xl"
                    >
                        {loading ? (
                            <span className="flex items-center justify-center">
                                <TbLoader2 className="h-5 w-5 animate-spin mr-2" />
                                Procesando...
                            </span>
                        ) : (
                            "Analizar rostro"
                        )}
                    </button>

                    {error && (
                        <div className="bg-red-100 p-4 rounded-lg mb-4">
                            <p className="text-red-700 font-semibold">{error}</p>
                        </div>
                    )}

                    <div className="bg-emerald-50 p-4 rounded-lg mb-4 text-center">
                        <p className="text-sm font-medium text-emerald-800">Forma detectada:</p>
                        <p className="text-2xl font-bold text-emerald-700">{faceShape.shape || "--"}</p>
                    </div>

                    <div className="mt-6 text-center">
                        {faceShape.shape && <DetectedShape detectedShape={faceShape.shape} />}
                    </div>

                </div>
            </div>
        </div>
    );
}