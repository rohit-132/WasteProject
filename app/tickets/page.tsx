"use client";

import { useState, useEffect, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  AlertCircle,
  CheckCircle,
  Clock,
  Filter,
  MapPin,
  RefreshCw,
  Trash2,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  ChevronUp,
  Info,
  UserCircle,
  Clipboard,
  CalendarClock,
  Loader2,
  CheckCircle2,
} from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";

interface WasteReport {
  _id: string;
  is_valid: boolean;
  message: string;
  confidence_score: number;
  severity: "Medium" | "High" | "Critical";
  location: string;
  description: string;
  timestamp: string;
  waste_types: string;
  status: "pending" | "in_progress" | "resolved";
  submitted_by: {
    user_id?: string;
    username?: string;
    email?: string;
  };
  // Additional fields
  dustbin_present?: boolean;
  dustbin_full?: boolean;
  dustbin_fullness_percentage?: number;
  waste_outside?: boolean;
  waste_outside_description?: string;
  recyclable_items?: string;
  is_recyclable?: boolean;
  recyclable_notes?: string;
  time_appears_valid?: boolean;
  lighting_condition?: string;
  time_analysis_notes?: string;
  description_matches_image?: boolean;
  description_match_confidence?: number;
  description_match_notes?: string;
  additional_data?: any;
  waste_type_confidences?: string;
  image_url?: string;
}

interface WasteReportsResponse {
  count: number;
  results: WasteReport[];
}

// Keep the MOCK_WASTE_REPORTS as fallback data in case the API fails
const MOCK_WASTE_REPORTS: WasteReport[] = [];

function TicketsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [reports, setReports] = useState<WasteReport[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedReportId, setExpandedReportId] = useState<string | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);

  // Filtering and pagination
  const [severity, setSeverity] = useState<string>(
    searchParams.get("severity") || ""
  );
  const [status, setStatus] = useState<string>(
    searchParams.get("status") || ""
  );
  const [location, setLocation] = useState<string>(
    searchParams.get("location") || ""
  );
  const [skip, setSkip] = useState<number>(
    parseInt(searchParams.get("skip") || "0")
  );
  const [limit, setLimit] = useState<number>(
    parseInt(searchParams.get("limit") || "10")
  );

  const fetchReports = async () => {
    try {
      setLoading(true);
      setError(null);

      // Build query parameters
      const queryParams = new URLSearchParams();
      queryParams.append("skip", skip.toString());
      queryParams.append("limit", limit.toString());
      if (severity) queryParams.append("severity", severity);
      if (status) queryParams.append("status", status);
      if (location) queryParams.append("location", location);

      // API fetching logic with better error handling
      let apiData = null;
      let apiError = null;

      try {
        const response = await fetch(
          `http://127.0.0.1:8000/api/waste/reports?${queryParams.toString()}`
        );

        if (response.ok) {
          apiData = await response.json();
          console.log(apiData);
        } else {
          // Log the error but don't throw an exception
          console.log(`API responded with status: ${response.status}`);
          apiError = `API unavailable (${response.status})`;
        }
      } catch (error) {
        // Network errors (CORS, connection refused, etc.)
        console.log("Network error when fetching from API:", error);
        apiError = "Network error";
      }

      if (apiData) {
        setReports(apiData.results);
        setTotalCount(apiData.count);
      } else {
        throw new Error("error in seting report");
      }
    } catch (err) {
      setError("Failed to load waste reports. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [skip, limit]);

  const handleFilter = () => {
    setSkip(0); // Reset pagination when filtering
    fetchReports();
  };

  const resetFilters = () => {
    setSeverity("");
    setStatus("");
    setLocation("");
    setSkip(0);
    fetchReports();
  };

  const handleNextPage = () => {
    if (skip + limit < totalCount) {
      setSkip(skip + limit);
    }
  };

  const handlePrevPage = () => {
    if (skip - limit >= 0) {
      setSkip(skip - limit);
    }
  };

  const toggleReportDetails = (reportId: string) => {
    if (expandedReportId === reportId) {
      setExpandedReportId(null);
    } else {
      setExpandedReportId(reportId);
    }
  };

  const handleUpdateStatus = (reportId: string) => {
    setUpdatingStatus(reportId);

    // Simulate API call with timeout
    setTimeout(() => {
      // Update the report status in the UI
      setReports((prevReports) =>
        prevReports.map((report) =>
          report._id === reportId
            ? { ...report, status: "in_progress" }
            : report
        )
      );
      setUpdatingStatus(null);
    }, 1500);
  };

  // Function to navigate to verify cleanup page
  const handleVerifyCleanup = (reportId: string) => {
    router.push(`/verify-cleanup/${reportId}`);
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "Critical":
        return "bg-red-500";
      case "High":
        return "bg-orange-500";
      case "Medium":
        return "bg-yellow-500";
      default:
        return "bg-gray-500";
    }
  };

  const getSeverityBgColor = (severity: string) => {
    switch (severity) {
      case "Critical":
        return "bg-red-50 border-red-100";
      case "High":
        return "bg-orange-50 border-orange-100";
      case "Medium":
        return "bg-yellow-50 border-yellow-100";
      default:
        return "bg-gray-50 border-gray-100";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "resolved":
        return "bg-green-500";
      case "in_progress":
        return "bg-green-600";
      case "pending":
        return "bg-yellow-500";
      default:
        return "bg-gray-500";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#e8f5e9] to-[#c8e6c9] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white/90 backdrop-blur-lg rounded-2xl shadow-xl p-8 border border-[#c8e6c9]"
        >
          <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
            <div>
              <h1 className="text-3xl font-bold text-[#2e7d32] mb-2">
                Waste Reports
              </h1>
              <p className="text-gray-600">
                View and manage waste reports from your community
              </p>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={fetchReports}
              className="flex items-center gap-2 bg-[#2e7d32] text-white px-6 py-3 rounded-lg shadow-md hover:shadow-lg transition-all"
            >
              <RefreshCw className="w-5 h-5" />
              Refresh Data
            </motion.button>
          </div>

          {/* Filters */}
          <div className="mb-8 p-6 bg-[#f1f8e9] rounded-xl shadow-sm border border-[#dcedc8]">
            <h2 className="text-lg font-semibold text-[#33691e] mb-4">
              Filter Reports
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-[#33691e] mb-2">
                  Severity
                </label>
                <select
                  value={severity}
                  onChange={(e) => setSeverity(e.target.value)}
                  className="w-full p-3 border border-[#c8e6c9] rounded-lg focus:ring-2 focus:ring-[#2e7d32] focus:border-transparent transition-all"
                >
                  <option value="">All Severities</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                  <option value="Critical">Critical</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#33691e] mb-2">
                  Status
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full p-3 border border-[#c8e6c9] rounded-lg focus:ring-2 focus:ring-[#2e7d32] focus:border-transparent transition-all"
                >
                  <option value="">All Statuses</option>
                  <option value="pending">Pending</option>
                  <option value="in_progress">In Progress</option>
                  <option value="resolved">Resolved</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#33691e] mb-2">
                  Location
                </label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Search by location..."
                  className="w-full p-3 border border-[#c8e6c9] rounded-lg focus:ring-2 focus:ring-[#2e7d32] focus:border-transparent transition-all"
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={resetFilters}
                className="px-6 py-3 bg-[#f1f8e9] text-[#33691e] rounded-lg hover:bg-[#dcedc8] transition-all font-medium border border-[#c8e6c9]"
              >
                Reset Filters
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleFilter}
                className="px-6 py-3 bg-[#2e7d32] text-white rounded-lg hover:bg-[#1b5e20] transition-all shadow-md font-medium flex items-center gap-2"
              >
                <Filter className="w-4 h-4" />
                Apply Filters
              </motion.button>
            </div>
          </div>

          {/* Error State */}
          {error && (
            <div className="mb-8 p-4 bg-red-50 text-red-600 rounded-lg flex items-center gap-2 border border-red-100">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Loading State */}
          {loading ? (
            <div className="flex justify-center items-center p-24">
              <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-[#2e7d32]"></div>
            </div>
          ) : reports.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-xl shadow-sm border border-[#c8e6c9]">
              <div className="mb-4 bg-[#f1f8e9] p-6 inline-block rounded-full">
                <Trash2 className="w-16 h-16 mx-auto text-[#558b2f]" />
              </div>
              <h3 className="text-2xl font-medium text-[#33691e] mb-2">
                No Waste Reports Found
              </h3>
              <p className="text-gray-600 max-w-md mx-auto">
                Try adjusting your filters or check back later when new reports
                are submitted.
              </p>
            </div>
          ) : (
            <>
              {/* Stats Summary */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <div className="bg-[#e8f5e9] p-4 rounded-xl border border-[#c8e6c9] flex items-center">
                  <div className="bg-[#c8e6c9] p-3 rounded-lg mr-4">
                    <CheckCircle className="w-6 h-6 text-[#2e7d32]" />
                  </div>
                  <div>
                    <div className="text-xs uppercase font-medium text-[#2e7d32] tracking-wide">
                      Resolved
                    </div>
                    <div className="text-2xl font-bold text-[#1b5e20]">
                      {reports.filter((r) => r.status === "resolved").length}
                    </div>
                  </div>
                </div>
                <div className="bg-[#e8f5e9] p-4 rounded-xl border border-[#c8e6c9] flex items-center">
                  <div className="bg-[#c8e6c9] p-3 rounded-lg mr-4">
                    <Clock className="w-6 h-6 text-[#2e7d32]" />
                  </div>
                  <div>
                    <div className="text-xs uppercase font-medium text-[#2e7d32] tracking-wide">
                      In Progress
                    </div>
                    <div className="text-2xl font-bold text-[#1b5e20]">
                      {reports.filter((r) => r.status === "in_progress").length}
                    </div>
                  </div>
                </div>
                <div className="bg-[#e8f5e9] p-4 rounded-xl border border-[#c8e6c9] flex items-center">
                  <div className="bg-[#c8e6c9] p-3 rounded-lg mr-4">
                    <AlertCircle className="w-6 h-6 text-[#558b2f]" />
                  </div>
                  <div>
                    <div className="text-xs uppercase font-medium text-[#2e7d32] tracking-wide">
                      Pending
                    </div>
                    <div className="text-2xl font-bold text-[#1b5e20]">
                      {reports.filter((r) => r.status === "pending").length}
                    </div>
                  </div>
                </div>
              </div>

              {/* Tickets List */}
              <div className="space-y-6">
                {reports.map((report) => (
                  <div key={report._id}>
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className={`bg-white rounded-xl shadow-md border overflow-hidden transition-all ${
                        expandedReportId === report._id
                          ? "ring-2 ring-[#2e7d32]"
                          : "hover:shadow-lg border-[#e0e0e0]"
                      }`}
                    >
                      {/* Main Card Content */}
                      <div
                        className={`p-6 cursor-pointer ${getSeverityBgColor(
                          report.severity
                        )}`}
                        onClick={() => toggleReportDetails(report._id)}
                      >
                        <div className="flex flex-col md:flex-row justify-between items-start mb-4 gap-3">
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-4 h-4 rounded-full ${getSeverityColor(
                                report.severity
                              )}`}
                            ></div>
                            <h3 className="text-xl font-semibold text-gray-800">
                              {report.location || "Unknown Location"}
                            </h3>
                          </div>
                          <div className="flex items-center gap-3">
                            <div
                              className={`px-4 py-1.5 rounded-full text-xs font-medium ${getStatusColor(
                                report.status
                              )} text-white`}
                            >
                              {report.status}
                            </div>
                            <div className="bg-[#f1f8e9] text-[#33691e] px-3 py-1 rounded-full text-xs font-medium border border-[#c8e6c9]">
                              {report.severity}
                            </div>
                          </div>
                        </div>

                        <p className="text-gray-700 mb-5 line-clamp-2">
                          {report.message}
                        </p>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <MapPin className="w-4 h-4 text-[#2e7d32] flex-shrink-0" />
                            <span className="truncate">
                              {report.location || "Unknown"}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Clock className="w-4 h-4 text-[#2e7d32] flex-shrink-0" />
                            <span>
                              {new Date(report.timestamp).toLocaleString()}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <UserCircle className="w-4 h-4 text-[#2e7d32] flex-shrink-0" />
                            <span>
                              {report.submitted_by?.username || "Anonymous"}
                            </span>
                          </div>
                        </div>

                        {report.waste_types && (
                          <div className="mb-4">
                            <div className="text-sm font-medium text-[#33691e] mb-2">
                              Waste Types:
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {report.waste_types
                                .split(",")
                                .map((type, index) => (
                                  <span
                                    key={index}
                                    className="bg-[#e8f5e9] text-[#2e7d32] px-3 py-1 rounded-full text-xs font-medium border border-[#c8e6c9]"
                                  >
                                    {type.trim()}
                                  </span>
                                ))}
                            </div>
                          </div>
                        )}

                        <div className="flex justify-between items-center border-t border-[#e0e0e0] pt-4 mt-4">
                          <div className="text-gray-500 text-sm">
                            ID: {report._id.substring(report._id.length - 8)}
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleReportDetails(report._id);
                            }}
                            className="flex items-center gap-1 text-[#2e7d32] hover:text-[#1b5e20] font-medium transition-colors"
                          >
                            {expandedReportId === report._id ? (
                              <>
                                Hide Details
                                <ChevronUp className="w-5 h-5" />
                              </>
                            ) : (
                              <>
                                View Details
                                <ChevronDown className="w-5 h-5" />
                              </>
                            )}
                          </button>
                        </div>
                      </div>

                      {/* Expanded Details */}
                      <AnimatePresence>
                        {expandedReportId === report._id && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            className="border-t border-[#e0e0e0] overflow-hidden"
                          >
                            <div className="p-6 bg-white">
                              <h4 className="text-xl font-semibold text-[#33691e] mb-4 flex items-center gap-2">
                                <Info className="w-5 h-5 text-[#2e7d32]" />
                                Report Details
                              </h4>

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                <div className="space-y-4">
                                  <div>
                                    <h5 className="text-sm font-medium text-[#558b2f] mb-1">
                                      Description
                                    </h5>
                                    <p className="text-gray-800 bg-[#f1f8e9] p-3 rounded-lg border border-[#dcedc8]">
                                      {report.description ||
                                        "No description provided"}
                                    </p>
                                  </div>

                                  <div>
                                    <h5 className="text-sm font-medium text-[#558b2f] mb-1">
                                      Analysis Message
                                    </h5>
                                    <p className="text-gray-800 bg-[#f1f8e9] p-3 rounded-lg border border-[#dcedc8]">
                                      {report.message}
                                    </p>
                                  </div>

                                  {report.waste_outside_description && (
                                    <div>
                                      <h5 className="text-sm font-medium text-[#558b2f] mb-1">
                                        Waste Outside Description
                                      </h5>
                                      <p className="text-gray-800 bg-[#f1f8e9] p-3 rounded-lg border border-[#dcedc8]">
                                        {report.waste_outside_description}
                                      </p>
                                    </div>
                                  )}

                                  {report.recyclable_notes && (
                                    <div>
                                      <h5 className="text-sm font-medium text-[#558b2f] mb-1">
                                        Recycling Notes
                                      </h5>
                                      <p className="text-gray-800 bg-[#f1f8e9] p-3 rounded-lg border border-[#dcedc8]">
                                        {report.recyclable_notes}
                                      </p>
                                    </div>
                                  )}
                                </div>

                                <div className="space-y-4">
                                  <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-[#f1f8e9] p-3 rounded-lg border border-[#dcedc8]">
                                      <h5 className="text-sm font-medium text-[#558b2f] mb-1">
                                        Confidence Score
                                      </h5>
                                      <p className="text-gray-800 font-medium">
                                        {report.confidence_score}%
                                      </p>
                                    </div>
                                    <div className="bg-[#f1f8e9] p-3 rounded-lg border border-[#dcedc8]">
                                      <h5 className="text-sm font-medium text-[#558b2f] mb-1">
                                        Lighting
                                      </h5>
                                      <p className="text-gray-800 font-medium capitalize">
                                        {report.lighting_condition || "Unknown"}
                                      </p>
                                    </div>
                                  </div>

                                  <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-[#f1f8e9] p-3 rounded-lg border border-[#dcedc8]">
                                      <h5 className="text-sm font-medium text-[#558b2f] mb-1">
                                        Dustbin Present
                                      </h5>
                                      <p className="text-gray-800 font-medium">
                                        {report.dustbin_present ? "Yes" : "No"}
                                      </p>
                                    </div>
                                    {report.dustbin_present && (
                                      <div className="bg-[#f1f8e9] p-3 rounded-lg border border-[#dcedc8]">
                                        <h5 className="text-sm font-medium text-[#558b2f] mb-1">
                                          Dustbin Fullness
                                        </h5>
                                        <p className="text-gray-800 font-medium">
                                          {report.dustbin_fullness_percentage}%
                                        </p>
                                      </div>
                                    )}
                                  </div>

                                  <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-[#f1f8e9] p-3 rounded-lg border border-[#dcedc8]">
                                      <h5 className="text-sm font-medium text-[#558b2f] mb-1">
                                        Waste Outside
                                      </h5>
                                      <p className="text-gray-800 font-medium">
                                        {report.waste_outside ? "Yes" : "No"}
                                      </p>
                                    </div>
                                    <div className="bg-[#f1f8e9] p-3 rounded-lg border border-[#dcedc8]">
                                      <h5 className="text-sm font-medium text-[#558b2f] mb-1">
                                        Recyclable
                                      </h5>
                                      <p className="text-gray-800 font-medium">
                                        {report.is_recyclable ? "Yes" : "No"}
                                      </p>
                                    </div>
                                  </div>

                                  {report.recyclable_items && (
                                    <div>
                                      <h5 className="text-sm font-medium text-[#558b2f] mb-1">
                                        Recyclable Items
                                      </h5>
                                      <div className="flex flex-wrap gap-2">
                                        {report.recyclable_items
                                          .split(",")
                                          .map((item, index) => (
                                            <span
                                              key={index}
                                              className="bg-[#e8f5e9] text-[#2e7d32] px-3 py-1 rounded-full text-xs font-medium border border-[#c8e6c9]"
                                            >
                                              {item.trim()}
                                            </span>
                                          ))}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </div>

                              {/* Action Buttons */}
                              <div className="flex flex-col md:flex-row gap-3 mt-6 pt-6 border-t border-[#e0e0e0]">
                                <button
                                  onClick={() => handleUpdateStatus(report._id)}
                                  disabled={
                                    updatingStatus === report._id ||
                                    report.status !== "pending"
                                  }
                                  className={`flex-1 py-3 px-4 rounded-lg font-medium flex items-center justify-center gap-2 transition-all ${
                                    report.status !== "pending"
                                      ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                                      : "bg-[#2e7d32] hover:bg-[#1b5e20] text-white"
                                  }`}
                                >
                                  {updatingStatus === report._id ? (
                                    <>
                                      <Loader2 className="w-5 h-5 animate-spin" />
                                      Action Started...
                                    </>
                                  ) : (
                                    <>
                                      <Clipboard className="w-5 h-5" />
                                      Update Status
                                    </>
                                  )}
                                </button>

                                <button
                                  onClick={() =>
                                    handleVerifyCleanup(report._id)
                                  }
                                  disabled={report.status === "resolved"}
                                  className={`flex-1 py-3 px-4 rounded-lg font-medium flex items-center justify-center gap-2 transition-all ${
                                    report.status === "resolved"
                                      ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                                      : "bg-[#1976d2] hover:bg-[#1565c0] text-white"
                                  }`}
                                >
                                  <CheckCircle2 className="w-5 h-5" />
                                  Verify Cleanup
                                </button>

                                <button className="flex-1 bg-[#f1f8e9] hover:bg-[#dcedc8] text-[#33691e] py-3 px-4 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors border border-[#c8e6c9]">
                                  <CalendarClock className="w-5 h-5" />
                                  Schedule Pickup
                                </button>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              <div className="mt-8 flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="text-sm text-[#33691e]">
                  Showing {skip + 1} to{" "}
                  {Math.min(skip + reports.length, totalCount)} of {totalCount}{" "}
                  reports
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={handlePrevPage}
                    disabled={skip === 0}
                    className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors ${
                      skip === 0
                        ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                        : "bg-[#e8f5e9] text-[#2e7d32] hover:bg-[#c8e6c9] border border-[#c8e6c9]"
                    }`}
                  >
                    <ChevronLeft className="w-5 h-5" />
                    Previous
                  </button>
                  <button
                    onClick={handleNextPage}
                    disabled={skip + limit >= totalCount}
                    className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors ${
                      skip + limit >= totalCount
                        ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                        : "bg-[#e8f5e9] text-[#2e7d32] hover:bg-[#c8e6c9] border border-[#c8e6c9]"
                    }`}
                  >
                    Next
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </>
          )}
        </motion.div>
      </div>
    </div>
  );
}

export default function TicketsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gradient-to-b from-[#f8f8f8] to-[#e8f5e9] flex items-center justify-center">
          <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl p-8 text-center max-w-md w-full mx-4">
            <div className="flex flex-col items-center space-y-4">
              <Loader2 className="w-12 h-12 text-[#2e7d32] animate-spin" />
              <h2 className="text-xl font-semibold text-gray-800">
                Loading Tickets
              </h2>
              <p className="text-gray-600">
                Please wait while we load your waste reports...
              </p>
            </div>
          </div>
        </div>
      }
    >
      <TicketsContent />
    </Suspense>
  );
}
