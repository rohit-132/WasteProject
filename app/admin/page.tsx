"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import React from "react";
import {
  ChevronDown,
  MapPin,
  Recycle,
  Bell,
  Calendar,
  Award,
  BarChart3,
  TicketIcon,
  Search,
  Menu,
  X,
  UserCircle,
  ClipboardList,
  TrendingUp,
  BrainCircuit,
  Users,
  Loader2,
  AlertCircle,
  Clock,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import AdminSchedule from "@/components/admin-schedule";

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
  image_url?: string;
}

// Keep the MOCK_WASTE_REPORTS as fallback data in case the API fails
const MOCK_WASTE_REPORTS: WasteReport[] = [
  {
    _id: "TKT-2023",
    is_valid: true,
    message: "Large amount of plastic waste detected near residential area",
    confidence_score: 89,
    severity: "High",
    location: "Central Park",
    description: "Pile of plastic bottles and bags on the roadside",
    timestamp: "2024-03-22T09:30:00Z",
    waste_types: "Plastic, Household",
    status: "pending",
    submitted_by: {
      username: "John D.",
    },
  },
  {
    _id: "TKT-2022",
    is_valid: true,
    message: "Construction debris blocking drainage",
    confidence_score: 95,
    severity: "Critical",
    location: "Main Street",
    description:
      "Construction waste blocking street drainage causing water pooling",
    timestamp: "2024-03-21T14:20:00Z",
    waste_types: "Construction, Debris",
    status: "in_progress",
    submitted_by: {
      username: "Sarah M.",
    },
  },
  {
    _id: "TKT-2021",
    is_valid: true,
    message: "Hazardous Waste",
    confidence_score: 85,
    severity: "Medium",
    location: "West Avenue",
    description: "Chemical containers leaking into ground near industrial area",
    timestamp: "2024-03-17T13:40:00Z",
    waste_types: "Industrial, Chemical, Hazardous",
    status: "pending",
    submitted_by: {
      username: "Michael T.",
    },
  },
  {
    _id: "TKT-2020",
    is_valid: true,
    message: "Electronic waste improperly disposed",
    confidence_score: 91,
    severity: "High",
    location: "Tech District",
    description: "Old electronics and batteries dumped near water body",
    timestamp: "2024-03-19T11:15:00Z",
    waste_types: "Electronic, Hazardous",
    status: "resolved",
    submitted_by: {
      username: "Laura K.",
    },
  },
];

export default function AdminDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [activeView, setActiveView] = useState("dashboard");
  const [tickets, setTickets] = useState<WasteReport[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [skip, setSkip] = useState(0);
  const [limit, setLimit] = useState(4);
  const [sortField, setSortField] = useState<string>("");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [expandedTicketId, setExpandedTicketId] = useState<string | null>(null);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      setError(null);

      // Build query parameters
      const queryParams = new URLSearchParams();
      queryParams.append("skip", skip.toString());
      queryParams.append("limit", limit.toString());

      // API fetching logic with better error handling
      let apiData = null;
      let apiError = null;

      try {
        const response = await fetch(
          `http://127.0.0.1:8000/api/waste/reports?${queryParams.toString()}`,
          { credentials: "include" }
        );

        if (response.ok) {
          apiData = await response.json();
        } else {
          console.log(`API responded with status: ${response.status}`);
          apiError = `API unavailable (${response.status})`;
        }
      } catch (error) {
        console.log("Network error when fetching from API:", error);
        apiError = "Network error";
      }

      // Get localStorage reports regardless of API status
      const localReports = JSON.parse(
        localStorage.getItem("wasteReports") || "[]"
      );

      if (apiData) {
        // API call was successful, merge with local reports
        if (localReports.length > 0) {
          // Create a set of existing IDs to avoid duplicates
          const existingIds = new Set(
            apiData.results.map((report: WasteReport) => report._id)
          );

          // Add local reports that aren't already in the API results
          const uniqueLocalReports = localReports.filter(
            (report: WasteReport) => !existingIds.has(report._id)
          );

          // Update the data with combined results
          apiData.results = [...uniqueLocalReports, ...apiData.results];
          apiData.count += uniqueLocalReports.length;
        }

        let sortedResults = apiData.results;
        if (sortField) {
          sortedResults = sortTickets(sortedResults);
        }

        setTickets(sortedResults);
        setTotalCount(apiData.count);
      } else {
        // API call failed, use localStorage or mock data
        if (localReports.length > 0) {
          let reportData = localReports.slice(0, limit);
          if (sortField) {
            reportData = sortTickets(reportData);
          }
          setTickets(reportData);
          setTotalCount(localReports.length);
          setError(`Using locally saved reports. ${apiError}`);
        } else {
          // If no local reports, fallback to mock data
          let mockData = [...MOCK_WASTE_REPORTS];
          if (sortField) {
            mockData = sortTickets(mockData);
          }
          setTickets(mockData);
          setTotalCount(MOCK_WASTE_REPORTS.length);
          setError(`Using demo data. ${apiError}`);
        }
      }
    } catch (err) {
      setError("Failed to load waste reports. Please try again.");
      console.error(err);
      setTickets(MOCK_WASTE_REPORTS);
    } finally {
      setLoading(false);
    }
  };

  // New function to handle sorting
  const sortTickets = (data: WasteReport[]) => {
    return [...data].sort((a, b) => {
      let aValue, bValue;

      switch (sortField) {
        case "type":
          aValue = a.waste_types?.split(",")[0] || "";
          bValue = b.waste_types?.split(",")[0] || "";
          break;
        case "location":
          aValue = a.location || "";
          bValue = b.location || "";
          break;
        case "severity":
          aValue = a.severity || "";
          bValue = b.severity || "";
          break;
        case "status":
          aValue = a.status || "";
          bValue = b.status || "";
          break;
        case "requester":
          aValue = a.submitted_by?.username || "";
          bValue = b.submitted_by?.username || "";
          break;
        default:
          return 0;
      }

      if (sortDirection === "asc") {
        return aValue.localeCompare(bValue);
      } else {
        return bValue.localeCompare(aValue);
      }
    });
  };

  // Function to handle sort change
  const handleSort = (field: string) => {
    if (sortField === field) {
      // Toggle direction if already sorting by this field
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      // Set new field and default to ascending
      setSortField(field);
      setSortDirection("asc");
    }

    // Re-sort the current data
    setTickets((tickets) => sortTickets([...tickets]));
  };

  // Function to render sort icon
  const renderSortIcon = (field: string) => {
    if (sortField !== field) {
      return (
        <ArrowUpDown className="h-4 w-4 ml-1 inline-block text-slate-400" />
      );
    }
    return sortDirection === "asc" ? (
      <ArrowUp className="h-4 w-4 ml-1 inline-block text-green-500" />
    ) : (
      <ArrowDown className="h-4 w-4 ml-1 inline-block text-green-500" />
    );
  };

  // Function to determine status badge color
  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-amber-100 text-amber-600";
      case "in_progress":
        return "bg-green-100 text-green-600";
      case "scheduled":
        return "bg-blue-100 text-blue-600";
      case "completed":
      case "resolved":
        return "bg-purple-100 text-purple-600";
      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  // Function to toggle ticket details
  const toggleTicketDetails = (ticketId: string) => {
    if (expandedTicketId === ticketId) {
      setExpandedTicketId(null);
    } else {
      setExpandedTicketId(ticketId);
    }
  };

  // Function to determine action button based on status
  const getActionButton = (status: string, ticketId: string) => {
    const isExpanded = expandedTicketId === ticketId;

    if (isExpanded) {
      return (
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleTicketDetails(ticketId);
          }}
          className="px-3 py-1 text-sm text-green-500 hover:text-green-600 font-medium"
        >
          Hide
        </button>
      );
    }

    switch (status) {
      case "pending":
        return (
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleTicketDetails(ticketId);
            }}
            className="px-3 py-1 text-sm text-green-500 hover:text-green-600 font-medium"
          >
            Assign
          </button>
        );
      case "in_progress":
        return (
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleTicketDetails(ticketId);
            }}
            className="px-3 py-1 text-sm text-green-500 hover:text-green-600 font-medium"
          >
            View
          </button>
        );
      case "scheduled":
        return (
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleTicketDetails(ticketId);
            }}
            className="px-3 py-1 text-sm text-green-500 hover:text-green-600 font-medium"
          >
            Reschedule
          </button>
        );
      case "completed":
      case "resolved":
        return (
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleTicketDetails(ticketId);
            }}
            className="px-3 py-1 text-sm text-green-500 hover:text-green-600 font-medium"
          >
            Details
          </button>
        );
      default:
        return (
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleTicketDetails(ticketId);
            }}
            className="px-3 py-1 text-sm text-green-500 hover:text-green-600 font-medium"
          >
            View
          </button>
        );
    }
  };

  // Function to get severity color
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "Critical":
        return "bg-red-100 text-red-600";
      case "High":
        return "bg-orange-100 text-orange-600";
      case "Medium":
        return "bg-yellow-100 text-yellow-600";
      default:
        return "bg-gray-100 text-gray-600";
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
              <Link
                href="/admin"
                className="text-slate-700 hover:text-green-500 transition-colors py-2 flex items-center gap-3"
                onClick={() => {
                  setActiveView("dashboard");
                  closeSidebar();
                }}
              >
                <BarChart3 className="h-5 w-5" />
                Dashboard
              </Link>
              <Link
                href="#"
                className="text-slate-700 hover:text-green-500 transition-colors py-2 flex items-center gap-3"
                onClick={() => {
                  setActiveView("tickets");
                  closeSidebar();
                }}
              >
                <TicketIcon className="h-5 w-5" />
                Tickets
              </Link>
              <Link
                href="/"
                className="text-slate-700 hover:text-green-500 transition-colors py-2 flex items-center gap-3"
                onClick={() => {
                  setActiveView("schedule");
                  closeSidebar();
                }}
              >
                <Calendar className="h-5 w-5" />
                Scheduled Pickups
              </Link>
              {/* <Link
                href="#"
                className="text-slate-700 hover:text-green-500 transition-colors py-2 flex items-center gap-3"
                onClick={() => {
                  setActiveView("recycling");
                  closeSidebar();
                }}
              >
                <Recycle className="h-5 w-5" />
                Recyclable Returns
              </Link> */}
              <Link
                href="#"
                className="text-slate-700 hover:text-green-500 transition-colors py-2 flex items-center gap-3"
                onClick={closeSidebar}
              >
                <TrendingUp className="h-5 w-5" />
                Leaderboard
              </Link>
              <Link
                href="#"
                className="text-slate-700 hover:text-green-500 transition-colors py-2 flex items-center gap-3"
                onClick={closeSidebar}
              >
                <BrainCircuit className="h-5 w-5" />
                AI City Report
              </Link>
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
            <Link
              href="/admin"
              className="flex items-center gap-3 px-4 py-3 text-green-500 font-medium"
              onClick={() => setActiveView("dashboard")}
            >
              <BarChart3 className="h-5 w-5" />
              <span>Dashboard</span>
            </Link>

            <Link
              href="/tickets"
              className="flex items-center gap-3 px-4 py-3 text-slate-700 hover:text-green-500 transition-colors"
              onClick={() => setActiveView("tickets")}
            >
              <TicketIcon className="h-5 w-5" />
              <span>Tickets</span>
            </Link>

            <Link
              href="#"
              className="flex items-center gap-3 px-4 py-3 text-slate-700 hover:text-green-500 transition-colors"
              onClick={() => setActiveView("schedule")}
            >
              <Calendar className="h-5 w-5" />
              <span>Scheduled Pickups</span>
            </Link>
            {/* 
            <Link
              href="#"
              className="flex items-center gap-3 px-4 py-3 text-slate-700 hover:text-green-500 transition-colors"
              onClick={() => setActiveView("recycling")}
            >
              <Recycle className="h-5 w-5" />
              <span>Recyclable Returns</span>
            </Link> */}

            <Link
              href="#"
              className="flex items-center gap-3 px-4 py-3 text-slate-700 hover:text-green-500 transition-colors"
              onClick={closeSidebar}
            >
              <TrendingUp className="h-5 w-5" />
              <span>Leaderboard</span>
            </Link>

            <Link
              href="#"
              className="flex items-center gap-3 px-4 py-3 text-slate-700 hover:text-green-500 transition-colors"
              onClick={closeSidebar}
            >
              <BrainCircuit className="h-5 w-5" />
              <span>AI City Report</span>
            </Link>
          </nav>

          <div className="mt-auto pt-16">
            <div className="p-4 bg-green-50/80 backdrop-blur-sm rounded-xl border border-green-100/80 shadow-sm">
              <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-white mb-3">
                <Bell className="h-6 w-6" />
              </div>
              <h3 className="text-slate-800 font-bold mb-1">New updates</h3>
              <p className="text-slate-600 text-sm mb-3">
                City recycling targets have been updated for Q2 2023
              </p>
              <button className="w-full bg-white hover:bg-green-50 text-green-500 border border-green-200 py-2 rounded-lg text-sm font-medium transition-colors">
                View Changes
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
              <div className="hidden md:block">
                <span className="font-medium text-slate-700">
                  Admin Dashboard
                </span>
              </div>
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
                  5
                </span>
              </button>
              <div className="relative flex items-center">
                <button className="flex items-center gap-2 bg-white/40 hover:bg-white/60 px-3 py-1.5 rounded-full transition-colors">
                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white">
                    <UserCircle className="h-6 w-6" />
                  </div>
                  <span className="text-slate-700 font-medium hidden md:inline-block">
                    S.G.Wikhe
                  </span>
                  <ChevronDown className="h-4 w-4 text-slate-500" />
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 px-4 md:px-8 py-6 pb-12 mt-20">
          {/* Welcome Section */}
          <div className="mb-8">
            <h1 className="text-2xl md:text-3xl font-bold text-slate-800 mb-2">
              Admin Dashboard
            </h1>
            <p className="text-slate-600">
              Monitor waste collection activities and manage city-wide
              operations.
            </p>
          </div>

          {/* Render content based on activeView */}
          {activeView === "schedule" ? (
            <div className="bg-white/70 backdrop-blur-sm rounded-xl shadow-sm border border-white/20 p-6 mb-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-slate-800">
                  Schedule Management
                </h2>
              </div>
              <AdminSchedule />
            </div>
          ) : (
            <>
              {/* Navigation Tabs */}
              {/* <div className="border-b border-slate-200 mb-8">
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
                    onClick={() => setActiveTab("metrics")}
                    className={`px-8 py-3 text-sm font-medium border-b-2 ${
                      activeTab === "metrics"
                        ? "border-green-500 text-green-500"
                        : "border-transparent text-slate-600 hover:text-slate-800 hover:border-slate-300"
                    }`}
                  >
                    Metrics
                  </button>
                  <button
                    onClick={() => setActiveTab("users")}
                    className={`px-8 py-3 text-sm font-medium border-b-2 ${
                      activeTab === "users"
                        ? "border-green-500 text-green-500"
                        : "border-transparent text-slate-600 hover:text-slate-800 hover:border-slate-300"
                    }`}
                  >
                    Users
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
              </div> */}

              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-white/70 backdrop-blur-sm rounded-xl shadow-sm border border-white/20 p-6 relative overflow-hidden">
                  <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-green-100 rounded-full opacity-70"></div>
                  <div className="relative z-10">
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center text-green-500 mb-4">
                      <TicketIcon className="h-6 w-6" />
                    </div>
                    <h3 className="text-slate-800 font-bold text-2xl mb-1">
                      {totalCount}
                    </h3>
                    <p className="text-slate-600">Active Tickets</p>
                    <div className="mt-3 text-green-500 text-sm font-medium flex items-center">
                      <span>+12% from last month</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white/70 backdrop-blur-sm rounded-xl shadow-sm border border-white/20 p-6 relative overflow-hidden">
                  <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-green-100 rounded-full opacity-70"></div>
                  <div className="relative z-10">
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center text-green-500 mb-4">
                      <Calendar className="h-6 w-6" />
                    </div>
                    <h3 className="text-slate-800 font-bold text-2xl mb-1">
                      47
                    </h3>
                    <p className="text-slate-600">Scheduled Pickups</p>
                    <div className="mt-3 text-green-500 text-sm font-medium flex items-center">
                      <span>Today: 8 pickups</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white/70 backdrop-blur-sm rounded-xl shadow-sm border border-white/20 p-6 relative overflow-hidden">
                  <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-green-100 rounded-full opacity-70"></div>
                  <div className="relative z-10">
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center text-green-500 mb-4">
                      <Recycle className="h-6 w-6" />
                    </div>
                    <h3 className="text-slate-800 font-bold text-2xl mb-1">
                      1,458 kg
                    </h3>
                    <p className="text-slate-600">Total Recycled</p>
                    <div className="mt-3 text-green-500 text-sm font-medium flex items-center">
                      <span>+8% from last month</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white/70 backdrop-blur-sm rounded-xl shadow-sm border border-white/20 p-6 relative overflow-hidden">
                  <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-green-100 rounded-full opacity-70"></div>
                  <div className="relative z-10">
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center text-green-500 mb-4">
                      <Users className="h-6 w-6" />
                    </div>
                    <h3 className="text-slate-800 font-bold text-2xl mb-1">
                      1,254
                    </h3>
                    <p className="text-slate-600">Active Users</p>
                    <div className="mt-3 text-green-500 text-sm font-medium flex items-center">
                      <span>+24 new today</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent Tickets */}
              <div className="bg-white/70 backdrop-blur-sm rounded-xl shadow-sm border border-white/20 p-6 mb-8">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-slate-800">
                    Recent Tickets
                  </h2>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={fetchTickets}
                      className="text-green-500 hover:text-green-600 text-sm flex items-center gap-1"
                      disabled={loading}
                    >
                      {loading && <Loader2 className="h-3 w-3 animate-spin" />}
                      Refresh
                    </button>
                    <Link
                      href="/tickets"
                      className="text-green-500 hover:text-green-600 text-sm font-medium"
                    >
                      View All
                    </Link>
                  </div>
                </div>

                {error && (
                  <div className="p-4 mb-4 text-red-600 bg-red-50 rounded-lg flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 flex-shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                <div className="overflow-auto">
                  <table className="min-w-full">
                    <thead>
                      <tr className="text-left text-sm font-medium text-slate-500 border-b border-slate-200">
                        <th
                          className="pb-3 pl-1 cursor-pointer hover:text-slate-800 transition-colors"
                          onClick={() => handleSort("type")}
                        >
                          Type {renderSortIcon("type")}
                        </th>
                        <th
                          className="pb-3 cursor-pointer hover:text-slate-800 transition-colors"
                          onClick={() => handleSort("location")}
                        >
                          Location {renderSortIcon("location")}
                        </th>
                        <th
                          className="pb-3 cursor-pointer hover:text-slate-800 transition-colors"
                          onClick={() => handleSort("severity")}
                        >
                          Severity {renderSortIcon("severity")}
                        </th>
                        <th
                          className="pb-3 cursor-pointer hover:text-slate-800 transition-colors"
                          onClick={() => handleSort("status")}
                        >
                          Status {renderSortIcon("status")}
                        </th>
                        <th
                          className="pb-3 cursor-pointer hover:text-slate-800 transition-colors"
                          onClick={() => handleSort("requester")}
                        >
                          Requested By {renderSortIcon("requester")}
                        </th>
                        <th className="pb-3 pr-1">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {loading ? (
                        <tr>
                          <td
                            colSpan={6}
                            className="py-8 text-center text-slate-500"
                          >
                            <div className="flex items-center justify-center space-x-2">
                              <Loader2 className="h-5 w-5 animate-spin text-green-500" />
                              <span>Loading tickets...</span>
                            </div>
                          </td>
                        </tr>
                      ) : tickets.length === 0 ? (
                        <tr>
                          <td
                            colSpan={6}
                            className="py-8 text-center text-slate-500"
                          >
                            No tickets found
                          </td>
                        </tr>
                      ) : (
                        tickets.map((ticket) => (
                          <React.Fragment key={`ticket-fragment-${ticket._id}`}>
                            <tr
                              key={`ticket-row-${ticket._id}`}
                              className={`border-b border-slate-100 ${
                                expandedTicketId === ticket._id
                                  ? "bg-green-50"
                                  : "hover:bg-gray-50"
                              } cursor-pointer transition-colors`}
                              onClick={() => toggleTicketDetails(ticket._id)}
                            >
                              <td className="py-3 pl-1 text-slate-600">
                                {ticket.waste_types?.split(",")[0] || "Unknown"}
                              </td>
                              <td className="py-3 text-slate-600">
                                {ticket.location}
                              </td>
                              <td className="py-3">
                                <span
                                  className={`px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(
                                    ticket.severity
                                  )}`}
                                >
                                  {ticket.severity}
                                </span>
                              </td>
                              <td className="py-3">
                                <span
                                  className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                                    ticket.status
                                  )}`}
                                >
                                  {ticket.status === "in_progress"
                                    ? "In Progress"
                                    : ticket.status === "pending"
                                    ? "Pending"
                                    : ticket.status === "resolved"
                                    ? "Resolved"
                                    : ticket.status}
                                </span>
                              </td>
                              <td className="py-3 text-slate-600">
                                {ticket.submitted_by?.username || "Anonymous"}
                              </td>
                              <td className="py-3 pr-1">
                                {getActionButton(ticket.status, ticket._id)}
                              </td>
                            </tr>

                            {/* Expanded details section */}
                            {expandedTicketId === ticket._id && (
                              <tr key={`ticket-details-${ticket._id}`}>
                                <td colSpan={6} className="bg-green-50/50">
                                  <div className="p-4 border-t border-green-100">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                      <div className="space-y-4">
                                        <div>
                                          <h3 className="text-sm font-medium text-slate-500 mb-2">
                                            Description
                                          </h3>
                                          <p className="text-slate-800 bg-white p-3 rounded-lg border border-slate-100">
                                            {ticket.description ||
                                              "No description provided"}
                                          </p>
                                        </div>

                                        <div>
                                          <h3 className="text-sm font-medium text-slate-500 mb-2">
                                            Message
                                          </h3>
                                          <p className="text-slate-800 bg-white p-3 rounded-lg border border-slate-100">
                                            {ticket.message}
                                          </p>
                                        </div>

                                        <div>
                                          <h3 className="text-sm font-medium text-slate-500 mb-2">
                                            Waste Types
                                          </h3>
                                          <div className="flex flex-wrap gap-2">
                                            {ticket.waste_types
                                              .split(",")
                                              .map((type, index) => (
                                                <span
                                                  key={index}
                                                  className="inline-block px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs"
                                                >
                                                  {type.trim()}
                                                </span>
                                              ))}
                                          </div>
                                        </div>
                                      </div>

                                      <div className="space-y-4">
                                        <div className="bg-white p-4 rounded-lg border border-slate-100">
                                          <h3 className="text-sm font-medium text-slate-500 mb-2">
                                            Ticket Information
                                          </h3>
                                          <div className="grid grid-cols-2 gap-4">
                                            <div>
                                              <p className="text-xs text-slate-500">
                                                ID
                                              </p>
                                              <p className="text-slate-700">
                                                {ticket._id}
                                              </p>
                                            </div>
                                            <div>
                                              <p className="text-xs text-slate-500">
                                                Submitted At
                                              </p>
                                              <p className="text-slate-700">
                                                {new Date(
                                                  ticket.timestamp
                                                ).toLocaleString()}
                                              </p>
                                            </div>
                                            <div>
                                              <p className="text-xs text-slate-500">
                                                Confidence Score
                                              </p>
                                              <p className="text-slate-700">
                                                {ticket.confidence_score}%
                                              </p>
                                            </div>
                                            <div>
                                              <p className="text-xs text-slate-500">
                                                Status
                                              </p>
                                              <p className="text-slate-700 capitalize">
                                                {ticket.status}
                                              </p>
                                            </div>
                                          </div>
                                        </div>

                                        {ticket.image_url && (
                                          <div>
                                            <h3 className="text-sm font-medium text-slate-500 mb-2">
                                              Image
                                            </h3>
                                            <div className="bg-white p-1 border border-slate-100 rounded-lg overflow-hidden">
                                              <Image
                                                src={ticket.image_url}
                                                alt="Waste Report"
                                                width={400}
                                                height={300}
                                                className="w-full h-auto object-cover rounded"
                                              />
                                            </div>
                                          </div>
                                        )}
                                      </div>
                                    </div>

                                    <div className="flex justify-end mt-4 pt-4 border-t border-slate-100">
                                      <div className="flex gap-2">
                                        <Link
                                          href={`/tickets?id=${ticket._id}`}
                                          className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded text-sm font-medium transition-colors flex items-center gap-2"
                                        >
                                          <TicketIcon className="h-4 w-4" />
                                          View in Tickets Page
                                        </Link>
                                      </div>
                                    </div>
                                  </div>
                                </td>
                              </tr>
                            )}
                          </React.Fragment>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* City Statistics Overview */}
              <div className="bg-white/70 backdrop-blur-sm rounded-xl shadow-sm border border-white/20 p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-slate-800">
                    City Recycling Progress
                  </h2>
                  <select className="bg-white/50 backdrop-blur-md border border-slate-200 text-slate-700 rounded-md px-3 py-1.5 text-sm">
                    <option>Last 7 Days</option>
                    <option>Last 30 Days</option>
                    <option>Last 90 Days</option>
                    <option>This Year</option>
                  </select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                  <div className="p-4 border border-slate-100 rounded-lg bg-white">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-sm font-medium text-slate-500">
                        Plastic
                      </h3>
                      <span className="text-xs text-green-500">+5%</span>
                    </div>
                    <div className="flex items-end gap-2">
                      <span className="text-2xl font-bold text-slate-800">
                        532 kg
                      </span>
                      <span className="text-xs text-slate-500 pb-1">
                        Goal: 750 kg
                      </span>
                    </div>
                    <div className="mt-3 w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-green-500 rounded-full"
                        style={{ width: "71%" }}
                      ></div>
                    </div>
                  </div>

                  <div className="p-4 border border-slate-100 rounded-lg bg-white">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-sm font-medium text-slate-500">
                        Paper
                      </h3>
                      <span className="text-xs text-green-500">+12%</span>
                    </div>
                    <div className="flex items-end gap-2">
                      <span className="text-2xl font-bold text-slate-800">
                        421 kg
                      </span>
                      <span className="text-xs text-slate-500 pb-1">
                        Goal: 500 kg
                      </span>
                    </div>
                    <div className="mt-3 w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-green-500 rounded-full"
                        style={{ width: "84%" }}
                      ></div>
                    </div>
                  </div>

                  <div className="p-4 border border-slate-100 rounded-lg bg-white">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-sm font-medium text-slate-500">
                        Glass
                      </h3>
                      <span className="text-xs text-amber-500">-2%</span>
                    </div>
                    <div className="flex items-end gap-2">
                      <span className="text-2xl font-bold text-slate-800">
                        215 kg
                      </span>
                      <span className="text-xs text-slate-500 pb-1">
                        Goal: 320 kg
                      </span>
                    </div>
                    <div className="mt-3 w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-amber-500 rounded-full"
                        style={{ width: "67%" }}
                      ></div>
                    </div>
                  </div>

                  <div className="p-4 border border-slate-100 rounded-lg bg-white">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-sm font-medium text-slate-500">
                        E-Waste
                      </h3>
                      <span className="text-xs text-green-500">+8%</span>
                    </div>
                    <div className="flex items-end gap-2">
                      <span className="text-2xl font-bold text-slate-800">
                        89 kg
                      </span>
                      <span className="text-xs text-slate-500 pb-1">
                        Goal: 100 kg
                      </span>
                    </div>
                    <div className="mt-3 w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-green-500 rounded-full"
                        style={{ width: "89%" }}
                      ></div>
                    </div>
                  </div>
                </div>

                <div className="text-center">
                  <div className="inline-block bg-green-50 px-4 py-2 rounded-xl">
                    <span className="text-green-600 font-medium">
                      Overall City Recycling Target: 72% Complete
                    </span>
                  </div>
                </div>
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
}
