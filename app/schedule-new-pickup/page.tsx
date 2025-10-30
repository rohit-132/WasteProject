"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Calendar,
  Clock,
  MapPin,
  FileText,
  ArrowLeft,
  Send,
} from "lucide-react";
import Link from "next/link";

export default function ScheduleNewPickupPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    description: "",
    location: "",
    pickup_date: "",
    pickup_time: "10:00",
    notes: "",
  });

  // Handle form input changes
  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Get user ID from localStorage (in a real app, this would come from auth context)
      const userId = localStorage.getItem("userId") || "user_123";

      // Combine date and time for API
      const pickupDateTime = new Date(
        `${formData.pickup_date}T${formData.pickup_time}:00`
      );

      // Create request payload
      const payload = {
        id: `pickup_${Date.now()}`, // Generate a temporary ID (the backend might override this)
        user_id: userId,
        description: formData.description,
        location: formData.location,
        pickup_date: pickupDateTime.toISOString(),
        status: "pending",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        notes: formData.notes,
      };

      // Send request to API
      const response = await fetch(
        "http://127.0.0.1:8000/api/pickup/schedule",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to schedule pickup: ${response.status}`);
      }

      // Show success message
      setSuccess(true);

      // Reset form
      setFormData({
        description: "",
        location: "",
        pickup_date: "",
        pickup_time: "10:00",
        notes: "",
      });

      // Redirect after short delay
      setTimeout(() => {
        router.push("/schedule-pickups");
      }, 2000);
    } catch (err: any) {
      console.error("Error scheduling pickup:", err);
      setError(err.message || "Failed to schedule pickup");

      // For demo purposes, simulate success if API fails
      if (process.env.NODE_ENV === "development") {
        setSuccess(true);
        setTimeout(() => {
          router.push("/schedule-pickups");
        }, 2000);
      }
    } finally {
      setLoading(false);
    }
  };

  // Get tomorrow's date for min date input
  const getTomorrowDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split("T")[0];
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <div className="flex items-center mb-6">
        <Link
          href="/schedule-pickups"
          className="text-slate-600 hover:text-slate-800 mr-4"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-2xl md:text-3xl font-bold text-slate-800">
          Schedule New Pickup
        </h1>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6 md:p-8">
        {success ? (
          <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-green-500"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-green-700">
                  Your pickup has been successfully scheduled! Redirecting...
                </p>
              </div>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg
                      className="h-5 w-5 text-red-500"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-6">
              {/* Description */}
              <div>
                <label
                  htmlFor="description"
                  className="block text-sm font-medium text-slate-700 mb-1"
                >
                  Waste Description
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FileText className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    type="text"
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    required
                    placeholder="e.g. Household waste, Garden waste, Electronics..."
                    className="pl-10 block w-full rounded-md border-slate-200 shadow-sm focus:border-green-500 focus:ring-green-500"
                  />
                </div>
                <p className="mt-1 text-sm text-slate-500">
                  Describe the type of waste you want to have picked up
                </p>
              </div>

              {/* Location */}
              <div>
                <label
                  htmlFor="location"
                  className="block text-sm font-medium text-slate-700 mb-1"
                >
                  Pickup Location
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <MapPin className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    type="text"
                    id="location"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    required
                    placeholder="Enter your full address"
                    className="pl-10 block w-full rounded-md border-slate-200 shadow-sm focus:border-green-500 focus:ring-green-500"
                  />
                </div>
                <p className="mt-1 text-sm text-slate-500">
                  Provide the complete address where the waste should be picked
                  up
                </p>
              </div>

              {/* Date and Time */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="pickup_date"
                    className="block text-sm font-medium text-slate-700 mb-1"
                  >
                    Pickup Date
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Calendar className="h-5 w-5 text-slate-400" />
                    </div>
                    <input
                      type="date"
                      id="pickup_date"
                      name="pickup_date"
                      value={formData.pickup_date}
                      onChange={handleChange}
                      min={getTomorrowDate()}
                      required
                      className="pl-10 block w-full rounded-md border-slate-200 shadow-sm focus:border-green-500 focus:ring-green-500"
                    />
                  </div>
                </div>
                <div>
                  <label
                    htmlFor="pickup_time"
                    className="block text-sm font-medium text-slate-700 mb-1"
                  >
                    Preferred Time
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Clock className="h-5 w-5 text-slate-400" />
                    </div>
                    <input
                      type="time"
                      id="pickup_time"
                      name="pickup_time"
                      value={formData.pickup_time}
                      onChange={handleChange}
                      required
                      className="pl-10 block w-full rounded-md border-slate-200 shadow-sm focus:border-green-500 focus:ring-green-500"
                    />
                  </div>
                </div>
              </div>

              {/* Notes */}
              <div>
                <label
                  htmlFor="notes"
                  className="block text-sm font-medium text-slate-700 mb-1"
                >
                  Additional Notes (Optional)
                </label>
                <textarea
                  id="notes"
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  rows={3}
                  placeholder="Any special instructions or details about the pickup..."
                  className="block w-full rounded-md border-slate-200 shadow-sm focus:border-green-500 focus:ring-green-500"
                />
                <p className="mt-1 text-sm text-slate-500">
                  Additional information that might help with the pickup
                </p>
              </div>

              {/* Submit button */}
              <div className="flex justify-end pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 ${
                    loading ? "opacity-70 cursor-not-allowed" : ""
                  }`}
                >
                  {loading ? (
                    <>
                      <svg
                        className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Processing...
                    </>
                  ) : (
                    <>
                      <Send className="mr-2 h-4 w-4" />
                      Schedule Pickup
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
