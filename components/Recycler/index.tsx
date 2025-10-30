"use client";

import { useState, useRef } from "react";
import { motion } from "framer-motion";
import {
  Camera,
  Upload,
  Loader2,
  Recycle,
  AlertCircle,
  X,
  ImageIcon,
  CheckCircle2,
  Trash2,
  Info,
  Leaf,
  Trash,
} from "lucide-react";
import Image from "next/image";

interface WasteCategory {
  type: string;
  material: string;
  is_recyclable: boolean;
  recycling_process: string;
  recycling_value: string;
  environmental_impact: string;
}

interface OverallAnalysis {
  total_recyclable_percentage: number;
  primary_material: string;
  recycling_recommendation: string;
  environmental_notes: string;
}

interface WasteAnalysisResponse {
  main_category: string;
  main_category_confidence: number;
  waste_categories: WasteCategory[];
  overall_analysis: OverallAnalysis;
  confidence_score: number;
}

type UploadMode = "camera" | "gallery";

export default function Recycler() {
  const [image, setImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [description, setDescription] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [analysisResult, setAnalysisResult] =
    useState<WasteAnalysisResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [uploadMode, setUploadMode] = useState<UploadMode>("gallery");
  const videoRef = useRef<HTMLVideoElement>(null);
  const [showCamera, setShowCamera] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "environment",
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      });

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play();
        };
      }
      setStream(mediaStream);
      setShowCamera(true);
    } catch (err) {
      console.error("Camera error:", err);
      setError("Camera access denied or not available");
      setShowCamera(false);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => {
        track.stop();
      });
      setStream(null);
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setShowCamera(false);
  };

  const captureImage = () => {
    if (videoRef.current) {
      const canvas = document.createElement("canvas");
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0);
        canvas.toBlob((blob) => {
          if (blob) {
            const file = new File([blob], "waste-image.jpg", {
              type: "image/jpeg",
            });
            setImage(file);
            setPreviewUrl(URL.createObjectURL(file));
            setAnalysisResult(null);
            stopCamera();
          }
        }, "image/jpeg");
      }
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
      setPreviewUrl(URL.createObjectURL(file));
      setAnalysisResult(null);
    }
  };

  const handleReset = () => {
    setImage(null);
    setPreviewUrl("");
    setDescription("");
    setAnalysisResult(null);
    setError(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!image) return;

    setIsLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("image", image);

      const response = await fetch(
        "http://127.0.0.1:8000/waste-categorization/analyze",
        {
          method: "POST",
          body: formData,
        }
      );

      if (!response.ok) {
        throw new Error("Analysis failed");
      }

      const data = await response.json();
      setAnalysisResult(data);
    } catch (err) {
      setError("Failed to analyze waste. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const getRecyclabilityColor = (isRecyclable: boolean) => {
    return isRecyclable
      ? "bg-green-100 text-green-700"
      : "bg-red-100 text-red-600";
  };

  const getValueColor = (value: string) => {
    switch (value.toLowerCase()) {
      case "high":
        return "bg-green-100 text-green-700";
      case "medium":
        return "bg-amber-100 text-amber-700";
      case "low":
        return "bg-red-100 text-red-600";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <div className="py-6">
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-slate-800 mb-2">
          Recycling Analyzer
        </h1>
        <p className="text-slate-600">
          Upload a photo of waste items to determine what can be recycled and
          how
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Upload Section */}
        <div className="lg:col-span-1">
          <div className="bg-white/70 backdrop-blur-sm rounded-xl shadow-sm border border-white/20 p-6 mb-6">
            <h2 className="text-xl font-bold text-slate-800 mb-6">
              Upload Waste Image
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Upload Mode Toggle */}
              <div className="flex justify-center space-x-2 mb-4">
                <button
                  type="button"
                  onClick={() => setUploadMode("camera")}
                  className={`flex-1 px-4 py-2 rounded-lg flex items-center justify-center gap-2 transition-colors ${
                    uploadMode === "camera"
                      ? "bg-green-500 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  <Camera className="w-5 h-5" />
                  <span>Camera</span>
                </button>
                <button
                  type="button"
                  onClick={() => setUploadMode("gallery")}
                  className={`flex-1 px-4 py-2 rounded-lg flex items-center justify-center gap-2 transition-colors ${
                    uploadMode === "gallery"
                      ? "bg-green-500 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  <ImageIcon className="w-5 h-5" />
                  <span>Gallery</span>
                </button>
              </div>

              <div className="relative">
                {uploadMode === "camera" ? (
                  <>
                    {!showCamera && !previewUrl && (
                      <div
                        onClick={startCamera}
                        className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-green-500 transition-colors bg-gray-50/50 backdrop-blur-sm"
                      >
                        <div className="flex flex-col items-center">
                          <Camera className="w-12 h-12 text-green-500 mb-4" />
                          <p className="text-slate-700">Click to open camera</p>
                          <p className="text-sm text-slate-500 mt-2">
                            Take a photo of the waste items
                          </p>
                        </div>
                      </div>
                    )}

                    {showCamera && (
                      <div className="relative rounded-lg overflow-hidden bg-black">
                        <video
                          ref={videoRef}
                          autoPlay
                          playsInline
                          muted
                          className="w-full h-64 object-cover"
                        />
                        <div className="absolute inset-0 flex items-center justify-center">
                          {!stream && (
                            <div className="text-white text-center">
                              <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2" />
                              <p>Initializing camera...</p>
                            </div>
                          )}
                        </div>
                        <div className="absolute bottom-4 right-4">
                          <button
                            type="button"
                            onClick={captureImage}
                            className="bg-green-500 text-white p-3 rounded-full shadow-lg hover:bg-green-600 transition-colors"
                          >
                            <Camera className="w-6 h-6" />
                          </button>
                        </div>
                        <div className="absolute top-4 right-4">
                          <button
                            type="button"
                            onClick={stopCamera}
                            className="bg-red-500 text-white p-2 rounded-full shadow-lg hover:bg-red-600 transition-colors"
                          >
                            <X className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <>
                    {!previewUrl && (
                      <div
                        onClick={() => fileInputRef.current?.click()}
                        className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-green-500 transition-colors bg-gray-50/50 backdrop-blur-sm"
                      >
                        <input
                          type="file"
                          ref={fileInputRef}
                          onChange={handleImageUpload}
                          accept="image/*"
                          className="hidden"
                        />
                        <div className="flex flex-col items-center">
                          <Upload className="w-12 h-12 text-green-500 mb-4" />
                          <p className="text-slate-700">
                            Click to select from gallery
                          </p>
                          <p className="text-sm text-slate-500 mt-2">
                            PNG, JPG, JPEG (max. 5MB)
                          </p>
                        </div>
                      </div>
                    )}
                  </>
                )}

                {previewUrl && (
                  <div className="relative rounded-lg overflow-hidden">
                    <Image
                      src={previewUrl}
                      alt="Waste preview"
                      width={800}
                      height={400}
                      className="w-full h-64 object-cover rounded-lg"
                    />
                    <div className="absolute bottom-4 right-4 flex gap-2">
                      <button
                        type="button"
                        onClick={handleReset}
                        className="bg-red-500 text-white p-2 rounded-full shadow-lg hover:bg-red-600 transition-colors"
                      >
                        <X className="w-5 h-5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (uploadMode === "camera") {
                            startCamera();
                          } else {
                            fileInputRef.current?.click();
                          }
                        }}
                        className="bg-green-500 text-white p-2 rounded-full shadow-lg hover:bg-green-600 transition-colors"
                      >
                        {uploadMode === "camera" ? (
                          <Camera className="w-5 h-5" />
                        ) : (
                          <ImageIcon className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Description (Optional) */}
              <div>
                <label
                  htmlFor="description"
                  className="block text-sm font-medium text-slate-700 mb-1"
                >
                  Description (Optional)
                </label>
                <textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white/50 backdrop-blur-sm"
                  placeholder="Add any details about the waste items..."
                  rows={3}
                />
              </div>

              {/* Submit Button */}
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleReset}
                  className="flex-1 py-3 px-4 rounded-lg border border-gray-300 text-gray-700 font-medium transition-colors hover:bg-gray-50"
                >
                  Reset
                </button>
                <button
                  type="submit"
                  disabled={!image || isLoading}
                  className={`flex-1 py-3 px-4 rounded-lg text-white font-medium ${
                    !image || isLoading
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-green-500 hover:bg-green-600"
                  }`}
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center">
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Analyzing...
                    </div>
                  ) : (
                    "Analyze Waste"
                  )}
                </button>
              </div>
            </form>

            {error && (
              <div className="mt-4 p-4 bg-red-50 text-red-600 rounded-lg flex items-center space-x-2">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}
          </div>

          {analysisResult && (
            <div className="bg-white/70 backdrop-blur-sm rounded-xl shadow-sm border border-white/20 p-6">
              <h2 className="text-xl font-bold text-slate-800 mb-4">
                Overall Analysis
              </h2>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-slate-700">Main Category:</span>
                  <span className="font-medium text-slate-900">
                    {analysisResult.main_category}
                  </span>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-700">Recyclable Content:</span>
                    <span className="font-medium text-slate-900">
                      {
                        analysisResult.overall_analysis
                          .total_recyclable_percentage
                      }
                      %
                    </span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-green-500 rounded-full"
                      style={{
                        width: `${analysisResult.overall_analysis.total_recyclable_percentage}%`,
                      }}
                    ></div>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-700">Primary Material:</span>
                  <span className="font-medium text-slate-900">
                    {analysisResult.overall_analysis.primary_material}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-700">Confidence Score:</span>
                  <span className="font-medium text-slate-900">
                    {analysisResult.confidence_score}%
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Analysis Results */}
        <div className="lg:col-span-2">
          {analysisResult ? (
            <>
              <div className="bg-white/70 backdrop-blur-sm rounded-xl shadow-sm border border-white/20 p-6 mb-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-slate-800">
                    Recycling Recommendation
                  </h2>
                  <div className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                    {analysisResult.confidence_score}% Confidence
                  </div>
                </div>

                <div className="p-4 bg-green-50/70 backdrop-blur-sm rounded-lg border border-green-100 mb-4">
                  <div className="flex gap-3">
                    <div className="flex-shrink-0">
                      <Recycle className="w-6 h-6 text-green-500" />
                    </div>
                    <p className="text-slate-700">
                      {analysisResult.overall_analysis.recycling_recommendation}
                    </p>
                  </div>
                </div>

                <div className="p-4 bg-blue-50/70 backdrop-blur-sm rounded-lg border border-blue-100">
                  <div className="flex gap-3">
                    <div className="flex-shrink-0">
                      <Leaf className="w-6 h-6 text-blue-500" />
                    </div>
                    <p className="text-slate-700">
                      {analysisResult.overall_analysis.environmental_notes}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white/70 backdrop-blur-sm rounded-xl shadow-sm border border-white/20 p-6">
                <h2 className="text-xl font-bold text-slate-800 mb-6">
                  Material Breakdown
                </h2>

                <div className="space-y-4">
                  {analysisResult.waste_categories.map((category, index) => (
                    <div
                      key={index}
                      className="bg-white/80 backdrop-blur-sm border border-slate-100 rounded-lg overflow-hidden shadow-sm"
                    >
                      <div
                        className="flex items-center justify-between p-4 cursor-pointer"
                        onClick={() =>
                          setActiveCategory(
                            activeCategory === category.type
                              ? null
                              : category.type
                          )
                        }
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                              category.is_recyclable
                                ? "bg-green-100 text-green-600"
                                : "bg-red-100 text-red-600"
                            }`}
                          >
                            {category.is_recyclable ? (
                              <Recycle className="h-6 w-6" />
                            ) : (
                              <Trash className="h-6 w-6" />
                            )}
                          </div>
                          <div>
                            <h3 className="font-medium text-slate-800">
                              {category.type}
                            </h3>
                            <p className="text-sm text-slate-600">
                              {category.material}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRecyclabilityColor(
                              category.is_recyclable
                            )}`}
                          >
                            {category.is_recyclable
                              ? "Recyclable"
                              : "Not Recyclable"}
                          </span>
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getValueColor(
                              category.recycling_value
                            )}`}
                          >
                            {category.recycling_value.charAt(0).toUpperCase() +
                              category.recycling_value.slice(1)}{" "}
                            Value
                          </span>
                        </div>
                      </div>

                      {activeCategory === category.type && (
                        <div className="px-4 py-3 bg-slate-50/50 backdrop-blur-sm border-t border-slate-100">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1">
                              <p className="text-sm font-medium text-slate-700">
                                Recycling Process:
                              </p>
                              <p className="text-sm text-slate-600">
                                {category.recycling_process}
                              </p>
                            </div>
                            <div className="space-y-1">
                              <p className="text-sm font-medium text-slate-700">
                                Environmental Impact:
                              </p>
                              <p className="text-sm text-slate-600">
                                {category.environmental_impact}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div className="bg-white/70 backdrop-blur-sm rounded-xl shadow-sm border border-white/20 p-6 h-full flex flex-col items-center justify-center text-center">
              {isLoading ? (
                <div className="py-12">
                  <Loader2 className="w-12 h-12 text-green-500 animate-spin mx-auto mb-4" />
                  <h3 className="text-xl font-medium text-slate-800 mb-2">
                    Analyzing Waste
                  </h3>
                  <p className="text-slate-600 max-w-md mx-auto">
                    Our AI is analyzing your image to identify waste materials
                    and recyclability...
                  </p>
                </div>
              ) : (
                <div className="py-12">
                  <Info className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                  <h3 className="text-xl font-medium text-slate-800 mb-2">
                    No Analysis Yet
                  </h3>
                  <p className="text-slate-600 max-w-md mx-auto">
                    Upload an image of waste materials to receive detailed
                    recycling information and recommendations.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
