"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Calendar,
  Clock,
  MapPin,
  Trash2,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";

interface PickupRequest {
  id: string;
  location: string;
  date: string;
  time: string;
  status: "pending" | "scheduled" | "completed" | "verified";
  wasteType: string;
  description: string;
  verificationStatus?: "pending" | "verified";
}

// Mock data for testing
const mockPickupRequests: PickupRequest[] = [
  {
    id: "1",
    location: "123 Main Street, City Center",
    date: "",
    time: "",
    status: "pending",
    wasteType: "Household Waste",
    description: "Large amount of household waste accumulated over the weekend",
    verificationStatus: "pending",
  },
  {
    id: "2",
    location: "456 Park Avenue, Residential Area",
    date: "",
    time: "",
    status: "pending",
    wasteType: "Recyclables",
    description: "Cardboard and paper waste from office cleanup",
    verificationStatus: "pending",
  },
  {
    id: "3",
    location: "789 Market Street, Commercial District",
    date: "2024-04-05",
    time: "14:00",
    status: "scheduled",
    wasteType: "Organic Waste",
    description: "Food waste from local restaurants",
    verificationStatus: "pending",
  },
];

export default function PickupManagementPage() {
  const router = useRouter();
  const [pickups, setPickups] = useState<PickupRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedTime, setSelectedTime] = useState<string>("");

  useEffect(() => {
    fetchPickupRequests();
  }, []);

  const fetchPickupRequests = async () => {
    try {
      setLoading(true);
      setError(null);

      // For testing purposes, use mock data
      // In production, replace this with actual API call
      setPickups(mockPickupRequests);

      // Uncomment this when backend is ready
      /*
      const response = await fetch("http://127.0.0.1:8000/api/pickup-requests");
      
      if (!response.ok) {
        throw new Error("Failed to fetch pickup requests");
      }

      const data = await response.json();
      setPickups(Array.isArray(data) ? data : []);
      */
    } catch (error) {
      console.error("Error fetching pickup requests:", error);
      setError("Failed to load pickup requests. Please try again later.");
      setPickups([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSchedulePickup = async (pickupId: string) => {
    if (!selectedDate || !selectedTime) {
      alert("Please select both date and time");
      return;
    }

    try {
      // For testing purposes, update the mock data
      setPickups((prevPickups) =>
        prevPickups.map((pickup) =>
          pickup.id === pickupId
            ? {
                ...pickup,
                date: selectedDate,
                time: selectedTime,
                status: "scheduled",
                verificationStatus: "pending",
              }
            : pickup
        )
      );

      setSelectedDate("");
      setSelectedTime("");
    } catch (error) {
      console.error("Error scheduling pickup:", error);
      alert("Failed to schedule pickup. Please try again.");
    }
  };

  const handleVerifyCollection = async (pickupId: string) => {
    try {
      // For testing purposes, update the mock data
      setPickups((prevPickups) =>
        prevPickups.map((pickup) =>
          pickup.id === pickupId
            ? {
                ...pickup,
                status: "verified",
                verificationStatus: "verified",
              }
            : pickup
        )
      );
    } catch (error) {
      console.error("Error verifying collection:", error);
      alert("Failed to verify collection. Please try again.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#f8f8f8] to-[#e8f5e9] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#2e7d32]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f8f8f8] to-[#e8f5e9] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl overflow-hidden border border-[#e0e0e0]"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-[#2e7d32] to-[#1b5e20] p-8 text-center">
            <h1 className="text-2xl font-bold text-white mb-2">
              Waste Pickup Management
            </h1>
            <p className="text-white/80">
              Schedule and manage waste pickup requests
            </p>
          </div>

          {/* Content */}
          <div className="p-8">
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 p-4 bg-red-50 text-red-600 rounded-lg flex items-center"
              >
                <AlertCircle className="w-5 h-5 mr-2" />
                {error}
              </motion.div>
            )}

            <div className="space-y-6">
              {/* Pickup Requests */}
              {pickups.length > 0 ? (
                pickups.map((pickup) => (
                  <motion.div
                    key={pickup.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="bg-[#f8f8f8] rounded-xl p-6"
                  >
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center">
                          <MapPin className="w-5 h-5 text-[#2e7d32] mr-2" />
                          <span className="font-semibold">
                            {pickup.location}
                          </span>
                        </div>
                        <div className="flex items-center">
                          <Trash2 className="w-5 h-5 text-[#2e7d32] mr-2" />
                          <span>{pickup.wasteType}</span>
                        </div>
                        <p className="text-gray-600">{pickup.description}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        {pickup.status === "pending" ? (
                          <AlertCircle className="w-5 h-5 text-yellow-500" />
                        ) : pickup.status === "scheduled" ? (
                          <Clock className="w-5 h-5 text-blue-500" />
                        ) : pickup.status === "verified" ? (
                          <CheckCircle2 className="w-5 h-5 text-green-500" />
                        ) : (
                          <CheckCircle2 className="w-5 h-5 text-gray-500" />
                        )}
                        <span className="text-sm font-medium">
                          {pickup.status === "pending"
                            ? "Pending"
                            : pickup.status === "scheduled"
                            ? "Scheduled"
                            : pickup.status === "verified"
                            ? "Verified"
                            : "Completed"}
                        </span>
                      </div>
                    </div>

                    {pickup.status === "pending" && (
                      <div className="mt-4 space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="flex items-center">
                            <Calendar className="w-5 h-5 text-[#2e7d32] mr-2" />
                            <input
                              type="date"
                              value={selectedDate}
                              onChange={(e) => setSelectedDate(e.target.value)}
                              className="border rounded-lg px-3 py-2 w-full"
                            />
                          </div>
                          <div className="flex items-center">
                            <Clock className="w-5 h-5 text-[#2e7d32] mr-2" />
                            <input
                              type="time"
                              value={selectedTime}
                              onChange={(e) => setSelectedTime(e.target.value)}
                              className="border rounded-lg px-3 py-2 w-full"
                            />
                          </div>
                        </div>
                        <button
                          onClick={() => handleSchedulePickup(pickup.id)}
                          className="w-full bg-[#2e7d32] text-white py-2 rounded-lg hover:bg-[#1b5e20] transition-colors"
                        >
                          Schedule Pickup
                        </button>
                      </div>
                    )}

                    {pickup.status === "scheduled" && (
                      <div className="mt-4">
                        <button
                          onClick={() => handleVerifyCollection(pickup.id)}
                          className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
                        >
                          <CheckCircle2 className="w-5 h-5 mr-2" />
                          Verify Collection
                        </button>
                      </div>
                    )}

                    {pickup.status === "verified" && (
                      <div className="mt-4 p-3 bg-green-50 text-green-700 rounded-lg flex items-center">
                        <CheckCircle2 className="w-5 h-5 mr-2" />
                        <span>
                          Collection verified on{" "}
                          {new Date().toLocaleDateString()}
                        </span>
                      </div>
                    )}
                  </motion.div>
                ))
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-600">No pickup requests available</p>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
