"use client";

import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  Upload,
  Loader2,
  X,
  ImageIcon,
  CheckCircle2,
  AlertCircle,
  Camera,
  ArrowLeft,
  ArrowUpDown,
  Trash2,
  MapPin,
  Clock,
} from "lucide-react";

// Add type declaration for the window object extension
declare global {
  interface Window {
    currentReportId?: string;
  }
}

interface VerificationResult {
  status: string;
  is_same_location: boolean;
  is_clean: boolean;
  improvement_percentage: number;
}

interface WasteReport {
  _id: string;
  image_url: string;
  description: string;
  location: {
    coordinates: [number, number];
    placeName: string;
  };
  timestamp: string;
  status: string;
  severity: string;
  message?: string;
  additional_data?: {
    image?: string;
  };
}

export default function VerifyCleanupPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  // const searchParams = useSearchParams();
  const { id } = React.use(params);
  console.log(id);
  const router = useRouter();

  const [afterImage, setAfterImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingReport, setIsLoadingReport] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<VerificationResult | null>(null);
  const [report, setReport] = useState<WasteReport | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchReport = async () => {
      const response = await fetch(
        `http://localhost:8000/api/waste/reports/${id}`
      );
      const data = await response.json();
      console.log(data);
      setReport(data);
    };
    fetchReport();
    // const data = response.json();
  }, []);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAfterImage(file);
      setPreviewUrl(URL.createObjectURL(file));
      setResult(null); // Reset results when a new image is selected
    }
  };

  const handleReset = () => {
    setAfterImage(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl("");
    }
    setResult(null);
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!afterImage) {
      setError("Please upload an after-cleanup image");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("after_image", afterImage);

      // Try to make API call first
      try {
        const response = await fetch(
          `http://localhost:8000/api/waste/reports/${id}/verify-cleanup`,
          {
            method: "POST",
            body: formData,
          }
        );

        if (!response.ok) {
          throw new Error(
            `Verification failed with status: ${response.status}`
          );
        }

        const data = await response.json();
        setResult(data);
      } catch (apiError) {
        console.error("API error, using mock verification:", apiError);

        // If API call fails, use mock verification result
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to verify cleanup");
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusClass = (status: string) => {
    switch (status.toLowerCase()) {
      case "verified":
        return "bg-green-100 text-green-800 border-green-200";
      case "unverified":
        return "bg-amber-100 text-amber-800 border-amber-200";
      case "rejected":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-slate-100 text-slate-800 border-slate-200";
    }
  };

  const getSeverityClass = (severity: string) => {
    switch (severity.toLowerCase()) {
      case "clean":
        return "bg-green-100 text-green-800";
      case "low":
        return "bg-yellow-100 text-yellow-800";
      case "medium":
        return "bg-orange-100 text-orange-800";
      case "high":
        return "bg-red-100 text-red-800";
      default:
        return "bg-slate-100 text-slate-800";
    }
  };

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6">
      <button
        onClick={() => router.back()}
        className="inline-flex items-center mb-6 text-slate-600 hover:text-slate-900"
      >
        <ArrowLeft className="w-4 h-4 mr-1" />
        Back to reports
      </button>

      <div className="bg-white/80 backdrop-blur-md rounded-xl shadow-sm border border-white/20 p-6 md:p-8">
        <h1 className="text-2xl md:text-3xl font-bold text-slate-800 mb-2">
          Verify Waste Cleanup
        </h1>
        <p className="text-slate-600 mb-8">
          Upload an "after" image to verify that the reported waste has been
          properly cleaned up
        </p>

        {isLoadingReport ? (
          <div className="text-center py-12">
            <Loader2 className="w-12 h-12 mx-auto mb-4 text-green-500 animate-spin" />
            <p className="text-slate-600">Loading report details...</p>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Report Details Section */}
            {report && (
              <div className="bg-slate-50/70 backdrop-blur-sm rounded-lg border border-slate-200 p-6">
                <h2 className="text-xl font-semibold text-slate-800 mb-4">
                  Report Details
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div className="flex items-center gap-2 text-slate-700">
                    <Clock className="w-5 h-5 text-slate-500" />
                    <span>
                      Reported: {new Date(report.timestamp).toLocaleString()}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-slate-700">
                    <MapPin className="w-5 h-5 text-slate-500" />
                    <span>{report.location.placeName}</span>
                  </div>
                </div>

                {report.message && (
                  <div className="bg-white rounded-lg border border-slate-200 p-4 mb-4">
                    <h3 className="font-medium text-slate-700 mb-2">
                      Description
                    </h3>
                    <p className="text-slate-600">{report.message}</p>
                  </div>
                )}

                <div className="flex flex-wrap gap-2">
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusClass(
                      report.status
                    )}`}
                  >
                    Status: {report.status}
                  </span>

                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${getSeverityClass(
                      report.severity
                    )}`}
                  >
                    Severity: {report.severity}
                  </span>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Before Image Section */}
              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-slate-800">
                  Before Cleanup
                </h2>

                {report?.additional_data?.image ? (
                  <div className="relative aspect-video rounded-lg overflow-hidden bg-slate-100 border border-slate-200">
                    <Image
                      src={report.image_url}
                      alt="Before cleanup"
                      fill
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <div className="aspect-video flex items-center justify-center bg-slate-50 rounded-lg border border-slate-200">
                    <div className="text-center text-slate-400">
                      <ImageIcon className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      <p>Original report image not available</p>
                    </div>
                  </div>
                )}
              </div>

              {/* After Image Upload Section */}
              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-slate-800">
                  After Cleanup
                </h2>

                <form onSubmit={handleSubmit}>
                  {!previewUrl ? (
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="aspect-video cursor-pointer border-2 border-dashed border-slate-300 rounded-lg bg-slate-50 hover:bg-slate-100 hover:border-green-500 transition-colors flex flex-col items-center justify-center"
                    >
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleImageUpload}
                        accept="image/*"
                        className="hidden"
                      />
                      <Upload className="w-12 h-12 text-green-500 mb-2" />
                      <p className="text-slate-600 font-medium">
                        Upload after-cleanup image
                      </p>
                      <p className="text-slate-400 text-sm mt-1">
                        Click to browse or drop an image
                      </p>
                    </div>
                  ) : (
                    <div className="relative aspect-video rounded-lg overflow-hidden bg-slate-100 border border-slate-200">
                      <Image
                        src={previewUrl}
                        alt="After cleanup"
                        fill
                        className="object-cover"
                      />
                      <div className="absolute bottom-4 right-4 flex gap-2">
                        <button
                          type="button"
                          onClick={handleReset}
                          className="bg-white/90 backdrop-blur-sm text-red-500 p-2 rounded-full shadow-sm hover:bg-red-50 transition-colors"
                        >
                          <X className="w-5 h-5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="bg-white/90 backdrop-blur-sm text-green-500 p-2 rounded-full shadow-sm hover:bg-green-50 transition-colors"
                        >
                          <ImageIcon className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  )}

                  <div className="mt-6">
                    <button
                      type="submit"
                      disabled={!afterImage || isLoading}
                      className={`w-full py-3 px-4 rounded-lg text-white font-medium 
                        ${
                          !afterImage || isLoading
                            ? "bg-slate-400 cursor-not-allowed"
                            : "bg-green-500 hover:bg-green-600 transition-colors"
                        }`}
                    >
                      {isLoading ? (
                        <div className="flex items-center justify-center">
                          <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                          Verifying...
                        </div>
                      ) : (
                        "Verify Cleanup"
                      )}
                    </button>
                  </div>

                  {error && (
                    <div className="mt-4 p-4 bg-red-50 rounded-lg text-red-600 flex items-center space-x-2">
                      <AlertCircle className="w-5 h-5 flex-shrink-0" />
                      <span>{error}</span>
                    </div>
                  )}
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Results Section */}
        {result && (
          <div className="mt-10 p-6 bg-slate-50/70 backdrop-blur-sm rounded-lg border border-slate-200">
            <h2 className="text-xl font-semibold text-slate-800 mb-4">
              Verification Results
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div
                className={`p-4 rounded-lg border ${getStatusClass(
                  result.status
                )}`}
              >
                <p className="text-sm font-medium mb-1">Status</p>
                <div className="flex items-center">
                  {result.status.toLowerCase() === "verified" ? (
                    <CheckCircle2 className="w-5 h-5 mr-2 text-green-500" />
                  ) : (
                    <AlertCircle className="w-5 h-5 mr-2 text-amber-500" />
                  )}
                  <span className="font-semibold">
                    {result.status.charAt(0).toUpperCase() +
                      result.status.slice(1)}
                  </span>
                </div>
              </div>

              <div
                className={`p-4 rounded-lg border ${
                  result.is_same_location
                    ? "bg-green-100 text-green-800 border-green-200"
                    : "bg-red-100 text-red-800 border-red-200"
                }`}
              >
                <p className="text-sm font-medium mb-1">Location Match</p>
                <div className="flex items-center">
                  {result.is_same_location ? (
                    <CheckCircle2 className="w-5 h-5 mr-2 text-green-500" />
                  ) : (
                    <X className="w-5 h-5 mr-2 text-red-500" />
                  )}
                  <span className="font-semibold">
                    {result.is_same_location
                      ? "Same Location"
                      : "Different Location"}
                  </span>
                </div>
              </div>

              <div
                className={`p-4 rounded-lg border ${
                  result.is_clean
                    ? "bg-green-100 text-green-800 border-green-200"
                    : "bg-amber-100 text-amber-800 border-amber-200"
                }`}
              >
                <p className="text-sm font-medium mb-1">Cleanup Status</p>
                <div className="flex items-center">
                  {result.is_clean ? (
                    <CheckCircle2 className="w-5 h-5 mr-2 text-green-500" />
                  ) : (
                    <Trash2 className="w-5 h-5 mr-2 text-amber-500" />
                  )}
                  <span className="font-semibold">
                    {result.is_clean ? "Area Clean" : "Still Needs Attention"}
                  </span>
                </div>
              </div>
            </div>

            <div className="p-4 bg-white rounded-lg border border-slate-200">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium text-slate-700">Improvement</h3>
                <span className="font-bold text-lg text-slate-900">
                  {result.improvement_percentage}%
                </span>
              </div>
              <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-green-500 rounded-full"
                  style={{ width: `${result.improvement_percentage}%` }}
                ></div>
              </div>
              <p className="text-sm text-slate-500 mt-2">
                {result.improvement_percentage >= 90
                  ? "Excellent cleanup! The area looks significantly better."
                  : result.improvement_percentage >= 50
                  ? "Good progress, but there's still room for improvement."
                  : "Minimal improvement detected. The area needs more attention."}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
