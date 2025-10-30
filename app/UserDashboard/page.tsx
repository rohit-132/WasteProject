"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ChevronDown,
  MapPin,
  Recycle,
  Bell,
  Calendar,
  Award,
  BarChart3,
  Globe,
  Search,
  Menu,
  X,
  UserCircle,
  Loader2,
  AlertCircle,
  TrendingUp,
  RefreshCw,
  Gift,
  User,
} from "lucide-react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";

// Interface for WasteReport matching the one in tickets page
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

// Interface for City Leaderboard data
interface City {
  city_name_lower: string;
  last_updated: string;
  total_users: number;
  city_name: string;
  pending_reports: number;
  total_reports: number;
  engagement_score: number;
  authority_score?: number;
  citizen_score?: number;
  total_score: number;
  id: string;
  rank: number;
}

interface LeaderboardResponse {
  cities: City[];
  last_updated: string;
  scoring_explanation: {
    authority_score: string;
    citizen_score: string;
    total_score: string;
  };
}

// Dynamically import the ReportWaste component with no SSR
const ReportWaste = dynamic(() => import("@/components/ReportWaste"), {
  ssr: false,
});

// Dynamically import the Recycler component with no SSR
const Recycler = dynamic(() => import("@/components/Recycler"), {
  ssr: false,
});

const Rewards = dynamic(() => import("@/components/rewards"), {
  ssr: false,
});

const Profile = dynamic(() => import("@/components/my-profile"), {
  ssr: false,
});

export default function Dashboard() {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [activePage, setActivePage] = useState("overview");
  const [recentTickets, setRecentTickets] = useState<WasteReport[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedTicketId, setExpandedTicketId] = useState<string | null>(null);
  const [cityLeaderboard, setCityLeaderboard] = useState<City[]>([]);
  const [leaderboardLastUpdated, setLeaderboardLastUpdated] =
    useState<string>("");
  const [leaderboardLoading, setLeaderboardLoading] = useState(false);
  const [leaderboardError, setLeaderboardError] = useState<string | null>(null);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  const handleNavigation = (page: string) => {
    setActivePage(page);
    closeSidebar();

    // Fetch leaderboard data when leaderboard page is selected
    if (page === "leaderboard") {
      fetchCityLeaderboard();
    }
  };

  // Function to fetch recent tickets
  const fetchRecentTickets = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Try to fetch from API first
      try {
        const response = await fetch(
          "http://127.0.0.1:8000/api/waste/reports?limit=3"
        );

        if (response.ok) {
          const data = await response.json();
          setRecentTickets(data.results);
          return;
        }
      } catch (error) {
        console.log("Error fetching from API:", error);
      }

      // If API fails, get from localStorage
      const localReports = JSON.parse(
        localStorage.getItem("wasteReports") || "[]"
      );

      if (localReports.length > 0) {
        // Get the most recent 3 reports
        setRecentTickets(localReports.slice(0, 3));
      } else {
        setRecentTickets([]);
      }
    } catch (err) {
      setError("Failed to load recent tickets");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  // Function to fetch city leaderboard data
  const fetchCityLeaderboard = async () => {
    try {
      setLeaderboardLoading(true);
      setLeaderboardError(null);

      const response = await fetch(
        "http://localhost:8000/api/cities/leaderboard?limit=10"
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch leaderboard data: ${response.status}`);
      }

      const data: LeaderboardResponse = await response.json();
      setCityLeaderboard(data.cities);
      setLeaderboardLastUpdated(data.last_updated);
    } catch (err: any) {
      console.error("Error fetching city leaderboard:", err);
      setLeaderboardError(err.message || "Failed to load leaderboard data");

      // Set mock data if API fails
      setCityLeaderboard([
        {
          city_name_lower: "sangamner",
          last_updated: "2025-04-04T07:37:22.618000",
          total_users: 1,
          city_name: "Sangamner",
          pending_reports: 4,
          total_reports: 9,
          engagement_score: 2,
          total_score: 0.55,
          id: "67ef8b23a8fd49d35469a180",
          rank: 1,
        },
        {
          city_name_lower: "pune",
          last_updated: "2025-04-04T07:42:54.158000",
          total_users: 2,
          city_name: "Pune",
          pending_reports: 11,
          total_reports: 16,
          engagement_score: 1.5,
          authority_score: 0,
          citizen_score: 0.75,
          total_score: 0.375,
          id: "67ef8c33a8fd49d35469a181",
          rank: 2,
        },
      ]);
      setLeaderboardLastUpdated("2025-04-04T11:04:21.563571");
    } finally {
      setLeaderboardLoading(false);
    }
  };

  // Fetch tickets when component mounts
  useEffect(() => {
    if (activePage === "overview") {
      fetchRecentTickets();
    }
  }, [activePage]);

  // Function to format date from timestamp
  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    return {
      month: date.toLocaleString("default", { month: "short" }).toUpperCase(),
      day: date.getDate(),
    };
  };

  // Function to navigate to report page
  const handleReportWaste = () => {
    handleNavigation("report-waste");
  };

  // Function to toggle expanded ticket details
  const toggleTicketDetails = (ticketId: string) => {
    if (expandedTicketId === ticketId) {
      setExpandedTicketId(null);
    } else {
      setExpandedTicketId(ticketId);
    }
  };

  const renderRecentTickets = () => {
    if (isLoading) {
      return (
        <div className="flex justify-center items-center p-12">
          <Loader2 className="w-8 h-8 text-green-500 animate-spin" />
        </div>
      );
    }

    if (error) {
      return (
        <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg flex items-center gap-2">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      );
    }

    if (recentTickets.length === 0) {
      return (
        <div className="text-center p-8 bg-gray-50 rounded-lg">
          <p className="text-gray-500">No recent tickets found</p>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {recentTickets.map((ticket) => {
          const date = formatDate(ticket.timestamp);
          const isExpanded = expandedTicketId === ticket._id;

          return (
            <div
              key={ticket._id}
              className={`bg-white rounded-lg border shadow-sm overflow-hidden transition-all ${
                isExpanded ? "border-green-500" : "border-slate-100"
              }`}
            >
              <div
                className="flex cursor-pointer"
                onClick={() => toggleTicketDetails(ticket._id)}
              >
                <div className="bg-green-100 text-green-500 flex flex-col items-center justify-center w-20 py-3">
                  <div className="text-sm font-medium">{date.month}</div>
                  <div className="text-2xl font-bold">{date.day}</div>
                </div>
                <div className="flex-1 flex items-center justify-between px-4 py-3">
                  <div>
                    <div className="flex items-center">
                      <h3 className="font-medium text-slate-800">
                        {ticket.waste_types || "General Waste"}
                      </h3>
                      <span
                        className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
                          ticket.status === "pending"
                            ? "bg-yellow-100 text-yellow-700"
                            : ticket.status === "in_progress"
                            ? "bg-blue-100 text-blue-700"
                            : "bg-green-100 text-green-700"
                        }`}
                      >
                        {ticket.status}
                      </span>
                    </div>
                    <p className="text-slate-600 text-sm">{ticket.location}</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleTicketDetails(ticket._id);
                      }}
                      className="px-4 py-1.5 border border-slate-200 text-slate-700 rounded hover:bg-slate-50 text-sm font-medium"
                    >
                      {isExpanded ? "Hide" : "View"}
                    </button>
                  </div>
                </div>
              </div>

              {/* Expanded ticket details */}
              {isExpanded && (
                <div className="border-t border-slate-200 p-4 bg-gray-50">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <div>
                        <h4 className="text-sm font-medium text-slate-500">
                          Description
                        </h4>
                        <p className="text-slate-800 mt-1">
                          {ticket.description || "No description provided"}
                        </p>
                      </div>

                      <div>
                        <h4 className="text-sm font-medium text-slate-500">
                          Message
                        </h4>
                        <p className="text-slate-800 mt-1">{ticket.message}</p>
                      </div>

                      {ticket.recyclable_items && (
                        <div>
                          <h4 className="text-sm font-medium text-slate-500">
                            Recyclable Items
                          </h4>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {ticket.recyclable_items
                              .split(",")
                              .map((item, i) => (
                                <span
                                  key={i}
                                  className="px-2 py-1 bg-green-50 text-green-700 text-xs rounded-full"
                                >
                                  {item.trim()}
                                </span>
                              ))}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <h4 className="text-sm font-medium text-slate-500">
                            Severity
                          </h4>
                          <p className="text-slate-800 mt-1">
                            {ticket.severity}
                          </p>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-slate-500">
                            Confidence
                          </h4>
                          <p className="text-slate-800 mt-1">
                            {ticket.confidence_score}%
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <h4 className="text-sm font-medium text-slate-500">
                            Submitted
                          </h4>
                          <p className="text-slate-800 mt-1">
                            {new Date(ticket.timestamp).toLocaleString()}
                          </p>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-slate-500">
                            Status
                          </h4>
                          <p className="text-slate-800 mt-1 capitalize">
                            {ticket.status}
                          </p>
                        </div>
                      </div>

                      {ticket.image_url && (
                        <div>
                          <h4 className="text-sm font-medium text-slate-500">
                            Image
                          </h4>
                          <div className="mt-1 rounded-md overflow-hidden">
                            <Image
                              src={ticket.image_url}
                              alt="Waste report"
                              width={300}
                              height={200}
                              className="w-full h-auto object-cover"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  const renderContent = () => {
    if (activePage === "report-waste") {
      return <ReportWaste />;
    } else if (activePage === "recycler") {
      return <Recycler />;
    } else if (activePage === "leaderboard") {
      return (
        <div className="bg-white/70 backdrop-blur-sm rounded-xl shadow-sm border border-white/20 p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-slate-800">
              City Leaderboard
            </h2>
            <div className="text-sm text-slate-600">
              Updated:{" "}
              {leaderboardLastUpdated
                ? new Date(leaderboardLastUpdated).toLocaleString()
                : "Loading..."}
            </div>
          </div>

          {leaderboardError && (
            <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-lg flex items-center gap-2">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span>{leaderboardError}</span>
            </div>
          )}

          {leaderboardLoading ? (
            <div className="flex justify-center items-center p-12">
              <Loader2 className="w-8 h-8 text-green-500 animate-spin" />
            </div>
          ) : (
            <>
              <div className="bg-green-50 p-4 rounded-lg mb-6">
                <h3 className="font-semibold text-slate-800 mb-2">
                  Scoring System
                </h3>
                <div className="grid md:grid-cols-3 gap-4 text-sm">
                  <div className="bg-white p-3 rounded-lg border border-green-100">
                    <p className="font-medium text-green-700 mb-1">
                      Authority Score
                    </p>
                    <p className="text-slate-600">
                      50% of total - Measures municipal responsiveness and
                      resolution efficiency
                    </p>
                  </div>
                  <div className="bg-white p-3 rounded-lg border border-green-100">
                    <p className="font-medium text-green-700 mb-1">
                      Citizen Score
                    </p>
                    <p className="text-slate-600">
                      50% of total - Measures citizen engagement and responsible
                      reporting
                    </p>
                  </div>
                  <div className="bg-white p-3 rounded-lg border border-green-100">
                    <p className="font-medium text-green-700 mb-1">
                      Total Score
                    </p>
                    <p className="text-slate-600">
                      Combined score determining overall ranking
                    </p>
                  </div>
                </div>
              </div>

              <div className="overflow-hidden rounded-lg border border-slate-200">
                <table className="min-w-full divide-y divide-slate-200">
                  <thead className="bg-slate-50">
                    <tr>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider"
                      >
                        Rank
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider"
                      >
                        City
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider"
                      >
                        Users
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider"
                      >
                        Reports
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider"
                      >
                        Total Score
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-slate-200">
                    {cityLeaderboard.map((city) => (
                      <tr key={city.id} className="hover:bg-slate-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm
                            ${
                              city.rank === 1
                                ? "bg-yellow-100 text-yellow-800"
                                : city.rank === 2
                                ? "bg-slate-200 text-slate-800"
                                : city.rank === 3
                                ? "bg-amber-100 text-amber-800"
                                : "bg-slate-100 text-slate-600"
                            }`}
                          >
                            {city.rank}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-slate-900">
                            {city.city_name}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-slate-700">
                            {city.total_users}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex flex-col">
                            <span className="text-sm text-slate-700">
                              {city.total_reports} total
                            </span>
                            <span className="text-xs text-amber-600">
                              {city.pending_reports} pending
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-green-600">
                            {city.total_score.toFixed(2)}
                          </div>
                          <div className="mt-1 w-32 h-2 bg-slate-100 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-green-500 rounded-full"
                              style={{
                                width: `${Math.min(
                                  city.total_score * 100,
                                  100
                                )}%`,
                              }}
                            ></div>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex justify-center mt-6">
                <button
                  onClick={fetchCityLeaderboard}
                  className="flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-md hover:bg-green-200 transition-colors"
                >
                  <RefreshCw className="h-4 w-4" />
                  Refresh Leaderboard
                </button>
              </div>
            </>
          )}
        </div>
      );
    } else if (activePage === "rewards") {
      return <Rewards />;
    } else if (activePage === "my-profile") {
      return <Profile />;
    } else {
      return (
        <>
          {/* Welcome Section */}
          <div className="mb-8">
            <h1 className="text-2xl md:text-3xl font-bold text-slate-800 mb-2">
              Welcome back, Shourya!
            </h1>
            <p className="text-slate-600">
              Track your waste management activities and recycling impact.
            </p>
          </div>

          {/* Navigation Tabs - simplified to match image */}
          <div className="border-b border-slate-200 mb-8">
            <div className="flex overflow-x-auto hide-scrollbar">
              <button
                onClick={() => setActiveTab("overview")}
                className={`px-8 py-3 text-sm font-medium border-b-2 ${
                  activeTab === "overview"
                    ? "border-green-500 text-green-500"
                    : "border-transparent text-slate-600 hover:text-slate-800 hover:border-slate-300"
                }`}
              >
                Overview
              </button>
              <button
                onClick={() => setActiveTab("bins")}
                className={`px-8 py-3 text-sm font-medium border-b-2 ${
                  activeTab === "bins"
                    ? "border-green-500 text-green-500"
                    : "border-transparent text-slate-600 hover:text-slate-800 hover:border-slate-300"
                }`}
              >
                Smart Bins
              </button>
              <button
                onClick={() => setActiveTab("recycling")}
                className={`px-8 py-3 text-sm font-medium border-b-2 ${
                  activeTab === "recycling"
                    ? "border-green-500 text-green-500"
                    : "border-transparent text-slate-600 hover:text-slate-800 hover:border-slate-300"
                }`}
              >
                Recycling
              </button>
              <button
                onClick={() => setActiveTab("reports")}
                className={`px-8 py-3 text-sm font-medium border-b-2 ${
                  activeTab === "reports"
                    ? "border-green-500 text-green-500"
                    : "border-transparent text-slate-600 hover:text-slate-800 hover:border-slate-300"
                }`}
              >
                Reports
              </button>
            </div>
          </div>

          {/* Stats Cards - Reduced to simplify UI */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <div
              onClick={handleReportWaste}
              className="bg-white/70 backdrop-blur-sm rounded-xl shadow-sm border border-white/20 p-6 relative overflow-hidden cursor-pointer hover:shadow-md transition-all"
            >
              <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-green-100 rounded-full opacity-70"></div>
              <div className="relative z-10">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center text-green-500 mb-4">
                  <Calendar className="h-6 w-6" />
                </div>
                <h3 className="text-slate-800 font-bold text-xl mb-1">
                  Report Waste
                </h3>
                <p className="text-slate-600 mb-3">
                  Help keep our environment clean
                </p>
                <div className="mt-1 p-3 bg-green-50 rounded-lg border border-green-100 text-green-700 text-sm italic">
                  "The greatest threat to our planet is the belief that someone
                  else will save it."
                </div>
              </div>
            </div>

            <div className="bg-white/70 backdrop-blur-sm rounded-xl shadow-sm border border-white/20 p-6 relative overflow-hidden">
              <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-green-100 rounded-full opacity-70"></div>
              <div className="relative z-10">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center text-green-500 mb-4">
                  <Award className="h-6 w-6" />
                </div>
                <h3 className="text-slate-800 font-bold text-2xl mb-1">10</h3>
                <p className="text-slate-600">Reward Points</p>
                <div className="mt-3 text-green-500 text-sm font-medium flex items-center">
                  <span>55 points to next reward</span>
                </div>
              </div>
            </div>
          </div>

          {/* Nearby Smart Bins */}
          {/* <div className="bg-white/70 backdrop-blur-sm rounded-xl shadow-sm border border-white/20 p-6 mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-slate-800">
                Nearby Smart Bins
              </h2>
              <Link
                href="#"
                className="text-green-500 hover:text-green-600 text-sm font-medium"
              >
                View All
              </Link>
            </div>
            <div className="overflow-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="text-left text-sm font-medium text-slate-500 border-b border-slate-200">
                    <th className="pb-3 pl-1">Location</th>
                    <th className="pb-3">Distance</th>
                    <th className="pb-3">Status</th>
                    <th className="pb-3">Fill Level</th>
                    <th className="pb-3 pr-1">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-slate-100">
                    <td className="py-3 pl-1">
                      <div className="flex items-center">
                        <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-500 mr-3">
                          <MapPin className="h-4 w-4" />
                        </div>
                        <span className="font-medium text-slate-700">
                          Central Park
                        </span>
                      </div>
                    </td>
                    <td className="py-3 text-slate-600">0.8 km</td>
                    <td className="py-3">
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-600">
                        Available
                      </span>
                    </td>
                    <td className="py-3">
                      <div className="w-24 h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-green-500 rounded-full"
                          style={{ width: "30%" }}
                        ></div>
                      </div>
                      <span className="text-xs text-slate-500 mt-1">30%</span>
                    </td>
                    <td className="py-3 pr-1">
                      <button className="px-3 py-1 text-sm text-green-500 hover:text-green-600 font-medium">
                        Navigate
                      </button>
                    </td>
                  </tr>
                  <tr className="border-b border-slate-100">
                    <td className="py-3 pl-1">
                      <div className="flex items-center">
                        <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-500 mr-3">
                          <MapPin className="h-4 w-4" />
                        </div>
                        <span className="font-medium text-slate-700">
                          Main Street
                        </span>
                      </div>
                    </td>
                    <td className="py-3 text-slate-600">1.2 km</td>
                    <td className="py-3">
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-600">
                        Available
                      </span>
                    </td>
                    <td className="py-3">
                      <div className="w-24 h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-amber-500 rounded-full"
                          style={{ width: "75%" }}
                        ></div>
                      </div>
                      <span className="text-xs text-slate-500 mt-1">75%</span>
                    </td>
                    <td className="py-3 pr-1">
                      <button className="px-3 py-1 text-sm text-green-500 hover:text-green-600 font-medium">
                        Navigate
                      </button>
                    </td>
                  </tr>
                  <tr className="border-b border-slate-100">
                    <td className="py-3 pl-1">
                      <div className="flex items-center">
                        <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-500 mr-3">
                          <MapPin className="h-4 w-4" />
                        </div>
                        <span className="font-medium text-slate-700">
                          City Hall
                        </span>
                      </div>
                    </td>
                    <td className="py-3 text-slate-600">1.5 km</td>
                    <td className="py-3">
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-600">
                        Full
                      </span>
                    </td>
                    <td className="py-3">
                      <div className="w-24 h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-red-500 rounded-full"
                          style={{ width: "95%" }}
                        ></div>
                      </div>
                      <span className="text-xs text-slate-500 mt-1">95%</span>
                    </td>
                    <td className="py-3 pr-1">
                      <button className="px-3 py-1 text-sm text-slate-400 cursor-not-allowed font-medium">
                        Navigate
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div> */}

          {/* Recent Tickets */}
          <div className="bg-white/70 backdrop-blur-sm rounded-xl shadow-sm border border-white/20 p-6 mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-slate-800">
                Recent Tickets
              </h2>
              <button
                onClick={handleReportWaste}
                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Report Waste
              </button>
            </div>

            {renderRecentTickets()}
          </div>
        </>
      );
    }
  };

  return (
    <div className="flex min-h-screen bg-[#EFF4EF] relative overflow-hidden">
      {/* Background gradient circles */}
      <div className="fixed top-20 left-10 w-64 h-64 bg-green-300 rounded-full opacity-20 filter blur-3xl animate-pulse"></div>
      <div
        className="fixed bottom-10 right-10 w-80 h-80 bg-green-400 rounded-full opacity-10 filter blur-3xl animate-pulse"
        style={{ animationDelay: "1s" }}
      ></div>
      <div
        className="fixed top-1/3 left-1/2 w-96 h-96 bg-green-200 rounded-full opacity-10 filter blur-3xl animate-pulse"
        style={{ animationDelay: "2s" }}
      ></div>

      {/* Mobile Sidebar Backdrop */}
      <div
        className={`fixed inset-0 bg-black/50 backdrop-blur-sm z-50 transition-opacity duration-300 md:hidden ${
          sidebarOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={closeSidebar}
      >
        <div
          className={`absolute top-0 left-0 h-full w-3/4 max-w-xs bg-white/70 backdrop-blur-md shadow-xl transition-transform duration-300 ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-6 flex flex-col h-full">
            <div className="flex items-center justify-between mb-8">
              <Link
                href="/"
                className="text-green-500 text-2xl font-bold"
                onClick={closeSidebar}
              >
                ECOWASTE
              </Link>
              <button
                onClick={toggleSidebar}
                className="text-slate-700 hover:text-green-500"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <nav className="flex flex-col space-y-4">
              <button
                onClick={() => handleNavigation("dashboard")}
                className="text-slate-700 hover:text-green-500 transition-colors py-2 flex items-center gap-3"
              >
                <BarChart3 className="h-5 w-5" />
                Dashboard
              </button>
              <button
                onClick={() => closeSidebar()}
                className="text-slate-700 hover:text-green-500 transition-colors py-2 flex items-center gap-3"
              >
                <MapPin className="h-5 w-5" />
                Bin Locator
              </button>
              <button
                onClick={() => handleNavigation("report-waste")}
                className="text-slate-700 hover:text-green-500 transition-colors py-2 flex items-center gap-3"
              >
                <Calendar className="h-5 w-5" />
                Report Waste
              </button>
              <button
                onClick={() => handleNavigation("recycler")}
                className="text-slate-700 hover:text-green-500 transition-colors py-2 flex items-center gap-3"
              >
                <Recycle className="h-5 w-5" />
                Recycler
              </button>
              <button
                onClick={() => handleNavigation("leaderboard")}
                className="text-slate-700 hover:text-green-500 transition-colors py-2 flex items-center gap-3"
              >
                <TrendingUp className="h-5 w-5" />
                Leaderboard
              </button>
            </nav>
            <div className="mt-auto pt-8">
              <Link
                href="#"
                className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-md transition-all shadow-md hover:shadow-lg w-full text-center block"
                onClick={closeSidebar}
              >
                Sign Out
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Desktop Glassmorphic Sidebar - Vertical with enhanced shadow */}
      <aside className="hidden md:block w-64 bg-white/30 backdrop-blur-md border-r border-white/20 h-screen fixed top-0 left-0 overflow-y-auto shadow-[5px_0px_25px_rgba(0,0,0,0.1)] z-40">
        <div className="px-6 py-8">
          <Link
            href="/"
            className="text-green-500 text-2xl font-bold block mb-10"
          >
            ECOWASTE
          </Link>

          <nav className="space-y-2">
            <button
              onClick={() => handleNavigation("overview")}
              className={`flex w-full items-center gap-3 px-4 py-3 ${
                activePage === "overview"
                  ? "text-green-500 font-medium"
                  : "text-slate-700 hover:text-green-500 transition-colors"
              }`}
            >
              <BarChart3 className="h-5 w-5" />
              <span>Dashboard</span>
            </button>
            <button
              onClick={() => handleNavigation("my-profile")}
              className={`flex w-full items-center gap-3 px-4 py-3 ${
                activePage === "my-profile"
                  ? "text-green-500 font-medium"
                  : "text-slate-700 hover:text-green-500 transition-colors"
              }`}
            >
              <User className="h-5 w-5" />
              <span>Profile</span>
            </button>

            <Link href="/waste-deposits">
              <button className="flex w-full items-center gap-3 px-4 py-3 text-slate-700 hover:text-green-500 transition-colors">
                <MapPin className="h-5 w-5" />
                <span>Bin Locator</span>
              </button>
            </Link>

            <button
              onClick={() => handleNavigation("report-waste")}
              className={`flex w-full items-center gap-3 px-4 py-3 ${
                activePage === "report-waste"
                  ? "text-green-500 font-medium"
                  : "text-slate-700 hover:text-green-500 transition-colors"
              }`}
            >
              <Calendar className="h-5 w-5" />
              <span>Report Waste</span>
            </button>

            <button
              onClick={() => handleNavigation("recycler")}
              className={`flex w-full items-center gap-3 px-4 py-3 ${
                activePage === "recycler"
                  ? "text-green-500 font-medium"
                  : "text-slate-700 hover:text-green-500 transition-colors"
              }`}
            >
              <Recycle className="h-5 w-5" />
              <span>Recycler</span>
            </button>
            {/* <Link href="/wallet">
              <button className="flex w-full items-center gap-3 px-4 py-3 text-slate-700 hover:text-green-500 transition-colors">
                <Award className="h-5 w-5" />
                <span>Rewards</span>
              </button>
            </Link> */}
            <button
              onClick={() => handleNavigation("rewards")}
              className={`flex w-full items-center gap-3 px-4 py-3 ${
                activePage === "rewards"
                  ? "text-green-500 font-medium"
                  : "text-slate-700 hover:text-green-500 transition-colors"
              }`}
            >
              <Gift className="h-5 w-5" />
              <span>Rewards</span>
            </button>

            <button
              onClick={() => handleNavigation("leaderboard")}
              className={`flex w-full items-center gap-3 px-4 py-3 ${
                activePage === "leaderboard"
                  ? "text-green-500 font-medium"
                  : "text-slate-700 hover:text-green-500 transition-colors"
              }`}
            >
              <TrendingUp className="h-5 w-5" />
              <span>Leaderboard</span>
            </button>

            <button className="flex w-full items-center gap-3 px-4 py-3 text-slate-700 hover:text-green-500 transition-colors">
              <Globe className="h-5 w-5" />
              <span>Schedule Pickup</span>
            </button>
          </nav>

          <div className="mt-auto pt-16">
            <div className="p-4 bg-green-50/80 backdrop-blur-sm rounded-xl border border-green-100/80 shadow-sm">
              <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-white mb-3">
                <Recycle className="h-6 w-6" />
              </div>
              <h3 className="text-slate-800 font-bold mb-1">Need help?</h3>
              <p className="text-slate-600 text-sm mb-3">
                Learn how to maximize your waste management efficiency
              </p>
              <button className="w-full bg-white hover:bg-green-50 text-green-500 border border-green-200 py-2 rounded-lg text-sm font-medium transition-colors">
                View Guide
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main content with margin-left for sidebar and overflow-auto */}
      <div className="flex-1 flex flex-col md:ml-64 overflow-auto">
        {/* Glassmorphic floating navbar - adjusted position */}
        <header className="fixed top-4 left-1/2 transform -translate-x-1/2 md:left-[calc(16rem+((100vw-16rem)/2))] md:-translate-x-1/2 w-[95%] md:w-[calc(95%-16rem)] max-w-7xl z-50 bg-white/50 backdrop-blur-lg rounded-2xl shadow-lg border border-white/20">
          <div className="container mx-auto px-6 py-4 flex items-center justify-between">
            <div className="flex items-center">
              <button
                className="mr-4 text-slate-700 hover:text-green-500 md:hidden"
                onClick={toggleSidebar}
                aria-label="Open menu"
              >
                <Menu className="h-6 w-6" />
              </button>
              <Link
                href="/"
                className="text-green-500 text-2xl font-bold md:hidden"
              >
                ECOWASTE
              </Link>
            </div>
            <div className="hidden md:flex items-center bg-white/30 backdrop-blur-md rounded-full pl-4 pr-1 py-1 border border-white/30">
              <Search className="h-4 w-4 text-slate-400 mr-2" />
              <input
                type="text"
                placeholder="Search..."
                className="bg-transparent border-none outline-none text-slate-700 placeholder-slate-400 w-48"
              />
              <button className="bg-green-500 hover:bg-green-600 text-white rounded-full p-2 transition-colors ml-2">
                <Search className="h-4 w-4" />
              </button>
            </div>
            <div className="flex items-center gap-4">
              <button className="text-slate-700 hover:text-green-500 relative">
                <Bell className="h-6 w-6" />
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-4 h-4 flex items-center justify-center rounded-full">
                  3
                </span>
              </button>
              <div className="relative flex items-center">
                <button className="flex items-center gap-2 bg-white/40 hover:bg-white/60 px-3 py-1.5 rounded-full transition-colors">
                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white">
                    <UserCircle className="h-6 w-6" />
                  </div>
                  <span className="text-slate-700 font-medium hidden md:inline-block">
                    Shourya
                  </span>
                  <ChevronDown className="h-4 w-4 text-slate-500" />
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 px-4 md:px-8 py-6 pb-12 mt-20">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}
