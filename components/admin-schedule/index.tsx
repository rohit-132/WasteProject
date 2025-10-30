"use client";

import { useState, useEffect } from "react";
import {
  Calendar,
  Clock,
  MapPin,
  FileText,
  User,
  CheckCircle,
  Trash2,
  RefreshCw,
  AlertCircle,
  Search,
  ChevronDown,
  Filter,
  ArrowLeft,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

// Define the Pickup interface based on the API response
interface Pickup {
  id: string;
  user_id: string;
  description: string;
  location: string;
  pickup_date: string;
  status: "pending" | "in_progress" | "completed" | "cancelled";
  created_at: string;
  updated_at: string;
  notes: string;
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const [pickups, setPickups] = useState<Pickup[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPickup, setSelectedPickup] = useState<Pickup | null>(null);
  const [newStatus, setNewStatus] = useState<string>("");
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState<string>("pickup_date");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const itemsPerPage = 10;

  // Fetch all pickups
  useEffect(() => {
    const fetchPickups = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch("http://127.0.0.1:8000/api/pickup/all");

        if (!response.ok) {
          throw new Error(`Failed to fetch pickups: ${response.status}`);
        }

        const data = await response.json();
        setPickups(data);
      } catch (err: any) {
        console.error("Error fetching pickups:", err);
        setError(err.message || "Failed to load pickups");

        // For demo purposes, set some mock data if API fails
        setPickups([
          {
            id: "pickup_001",
            user_id: "user_123",
            description: "Household waste collection",
            location: "123 Green Street, Eco City",
            pickup_date: "2025-04-10T10:00:00Z",
            status: "pending",
            created_at: "2025-04-04T07:21:07.385Z",
            updated_at: "2025-04-04T07:21:07.385Z",
            notes: "Please collect from front yard",
          },
          {
            id: "pickup_002",
            user_id: "user_456",
            description: "Garden waste pickup",
            location: "456 Forest Avenue, Green Town",
            pickup_date: "2025-04-12T14:30:00Z",
            status: "in_progress",
            created_at: "2025-04-03T14:30:00Z",
            updated_at: "2025-04-05T09:15:00Z",
            notes: "Large amount of tree branches",
          },
          {
            id: "pickup_003",
            user_id: "user_789",
            description: "Electronics recycling",
            location: "789 Tech Road, Smart City",
            pickup_date: "2025-04-15T11:00:00Z",
            status: "completed",
            created_at: "2025-04-02T10:45:00Z",
            updated_at: "2025-04-06T16:20:00Z",
            notes: "Old computer and TV for recycling",
          },
          {
            id: "pickup_004",
            user_id: "user_234",
            description: "Construction debris",
            location: "234 Builder Lane, New Town",
            pickup_date: "2025-04-18T09:00:00Z",
            status: "pending",
            created_at: "2025-04-05T08:30:00Z",
            updated_at: "2025-04-05T08:30:00Z",
            notes: "From bathroom renovation",
          },
          {
            id: "pickup_005",
            user_id: "user_567",
            description: "Glass recycling",
            location: "567 Crystal Street, Glass City",
            pickup_date: "2025-04-20T13:00:00Z",
            status: "cancelled",
            created_at: "2025-04-01T11:20:00Z",
            updated_at: "2025-04-07T14:10:00Z",
            notes: "Large boxes of glass bottles",
          },
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchPickups();
  }, []);

  // Filter pickups based on status and search query
  const filteredPickups = pickups.filter((pickup) => {
    const matchesStatus =
      statusFilter === "all" || pickup.status === statusFilter;
    const matchesSearch =
      searchQuery === "" ||
      pickup.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pickup.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pickup.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pickup.user_id.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesStatus && matchesSearch;
  });

  // Sort filtered pickups
  const sortedPickups = [...filteredPickups].sort((a, b) => {
    let aValue: any = a[sortField as keyof Pickup];
    let bValue: any = b[sortField as keyof Pickup];

    // For dates, convert to timestamps for comparison
    if (
      sortField === "pickup_date" ||
      sortField === "created_at" ||
      sortField === "updated_at"
    ) {
      aValue = new Date(aValue as string).getTime();
      bValue = new Date(bValue as string).getTime();
    }

    // String comparison
    if (typeof aValue === "string" && typeof bValue === "string") {
      return sortDirection === "asc"
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    }

    // Number comparison
    return sortDirection === "asc"
      ? Number(aValue) - Number(bValue)
      : Number(bValue) - Number(aValue);
  });

  // Pagination
  const lastPage = Math.max(1, Math.ceil(sortedPickups.length / itemsPerPage));
  const currentItems = sortedPickups.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Handle sorting
  const handleSort = (field: string) => {
    if (field === sortField) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  // Update pickup status
  const updatePickupStatus = async (pickupId: string, status: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `http://127.0.0.1:8000/api/pickup/${pickupId}/status/${status}`,
        {
          method: "PUT",
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to update status: ${response.status}`);
      }

      // Update the pickup in the local state
      setPickups((prevPickups) =>
        prevPickups.map((pickup) =>
          pickup.id === pickupId
            ? {
                ...pickup,
                status: status as any,
                updated_at: new Date().toISOString(),
              }
            : pickup
        )
      );

      setSelectedPickup(null);
      setNewStatus("");
    } catch (err: any) {
      console.error("Error updating pickup status:", err);
      setError(err.message || "Failed to update pickup status");
    } finally {
      setLoading(false);
    }
  };

  // Format date from ISO string
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Get status badge color
  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "in_progress":
        return "bg-blue-100 text-blue-800";
      case "completed":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Get status icon
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="h-4 w-4" />;
      case "in_progress":
        return <RefreshCw className="h-4 w-4" />;
      case "completed":
        return <CheckCircle className="h-4 w-4" />;
      case "cancelled":
        return <Trash2 className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  // Check if user is admin (This would come from auth system)
  useEffect(() => {
    const checkIfAdmin = () => {
      // In a real app, this would verify admin status
      const userRole = localStorage.getItem("userRole") || "user";

      if (userRole !== "admin") {
        // Redirect non-admin users
        router.push("/");
      }
    };

    checkIfAdmin();
  }, [router]);

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-800">
            Admin Dashboard
          </h1>
          <p className="text-slate-600 mt-1">
            Manage and monitor all waste pickup requests
          </p>
        </div>
      </div>

      {/* Filters and search */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4 items-end">
          <div className="flex-grow">
            <label
              htmlFor="search"
              className="block text-sm font-medium text-slate-700 mb-1"
            >
              Search
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input
                id="search"
                type="text"
                placeholder="Search by description, location, ID or user ID..."
                className="pl-10 pr-4 py-2 border border-slate-200 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          <div>
            <label
              htmlFor="statusFilter"
              className="block text-sm font-medium text-slate-700 mb-1"
            >
              Status
            </label>
            <div className="relative">
              <select
                id="statusFilter"
                className="appearance-none bg-white border border-slate-200 rounded-md pl-4 pr-10 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5 pointer-events-none" />
            </div>
          </div>
          <div>
            <button
              className="inline-flex items-center px-4 py-2 border border-slate-300 rounded-md shadow-sm text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              onClick={() => {
                setSearchQuery("");
                setStatusFilter("all");
                setSortField("pickup_date");
                setSortDirection("asc");
              }}
            >
              <Filter className="mr-2 h-4 w-4 text-slate-500" />
              Reset Filters
            </button>
          </div>
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded-md shadow-sm">
          <div className="flex items-center">
            <AlertCircle className="w-5 h-5 mr-2" />
            <p>{error}</p>
          </div>
        </div>
      )}

      {/* Dashboard stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">
                Total Pickups
              </p>
              <p className="text-2xl font-bold text-slate-800">
                {pickups.length}
              </p>
            </div>
            <div className="p-2 bg-green-100 rounded-md">
              <FileText className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Pending</p>
              <p className="text-2xl font-bold text-slate-800">
                {pickups.filter((p) => p.status === "pending").length}
              </p>
            </div>
            <div className="p-2 bg-yellow-100 rounded-md">
              <Clock className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">In Progress</p>
              <p className="text-2xl font-bold text-slate-800">
                {pickups.filter((p) => p.status === "in_progress").length}
              </p>
            </div>
            <div className="p-2 bg-blue-100 rounded-md">
              <RefreshCw className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Completed</p>
              <p className="text-2xl font-bold text-slate-800">
                {pickups.filter((p) => p.status === "completed").length}
              </p>
            </div>
            <div className="p-2 bg-green-100 rounded-md">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Loading state */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
        </div>
      ) : (
        <>
          {/* No pickups message */}
          {filteredPickups.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm p-8 text-center">
              <div className="mb-4">
                <Calendar className="h-12 w-12 text-slate-400 mx-auto" />
              </div>
              <h3 className="text-xl font-medium text-slate-700 mb-2">
                No pickups found
              </h3>
              <p className="text-slate-500 mb-6">
                {searchQuery || statusFilter !== "all"
                  ? "Try changing your search criteria"
                  : "There are no scheduled pickups in the system yet"}
              </p>
            </div>
          ) : (
            /* Pickups table */
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200">
                  <thead className="bg-slate-50">
                    <tr>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider cursor-pointer"
                        onClick={() => handleSort("id")}
                      >
                        <div className="flex items-center">
                          ID
                          {sortField === "id" && (
                            <span className="ml-1">
                              {sortDirection === "asc" ? "↑" : "↓"}
                            </span>
                          )}
                        </div>
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider cursor-pointer"
                        onClick={() => handleSort("description")}
                      >
                        <div className="flex items-center">
                          Description
                          {sortField === "description" && (
                            <span className="ml-1">
                              {sortDirection === "asc" ? "↑" : "↓"}
                            </span>
                          )}
                        </div>
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider cursor-pointer"
                        onClick={() => handleSort("user_id")}
                      >
                        <div className="flex items-center">
                          User
                          {sortField === "user_id" && (
                            <span className="ml-1">
                              {sortDirection === "asc" ? "↑" : "↓"}
                            </span>
                          )}
                        </div>
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider cursor-pointer"
                        onClick={() => handleSort("location")}
                      >
                        <div className="flex items-center">
                          Location
                          {sortField === "location" && (
                            <span className="ml-1">
                              {sortDirection === "asc" ? "↑" : "↓"}
                            </span>
                          )}
                        </div>
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider cursor-pointer"
                        onClick={() => handleSort("pickup_date")}
                      >
                        <div className="flex items-center">
                          Pickup Date
                          {sortField === "pickup_date" && (
                            <span className="ml-1">
                              {sortDirection === "asc" ? "↑" : "↓"}
                            </span>
                          )}
                        </div>
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider cursor-pointer"
                        onClick={() => handleSort("status")}
                      >
                        <div className="flex items-center">
                          Status
                          {sortField === "status" && (
                            <span className="ml-1">
                              {sortDirection === "asc" ? "↑" : "↓"}
                            </span>
                          )}
                        </div>
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider"
                      >
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-slate-200">
                    {currentItems.map((pickup) => (
                      <tr key={pickup.id} className="hover:bg-slate-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                          {pickup.id}
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-slate-900">
                            {pickup.description}
                          </div>
                          {pickup.notes && (
                            <div className="text-xs text-slate-500 mt-1 italic">
                              Note: {pickup.notes}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <User className="h-4 w-4 text-slate-400 mr-2" />
                            <div className="text-sm text-slate-500">
                              {pickup.user_id}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-start">
                            <MapPin className="h-4 w-4 text-slate-400 mt-0.5 mr-1 flex-shrink-0" />
                            <div className="text-sm text-slate-500">
                              {pickup.location}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-slate-500">
                            {formatDate(pickup.pickup_date)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(
                              pickup.status
                            )}`}
                          >
                            <span className="flex items-center">
                              <span className="mr-1">
                                {getStatusIcon(pickup.status)}
                              </span>
                              {pickup.status.replace("_", " ")}
                            </span>
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex justify-end space-x-2">
                            <button
                              onClick={() => {
                                setSelectedPickup(pickup);
                                setNewStatus("in_progress");
                              }}
                              className="bg-blue-100 text-blue-700 hover:bg-blue-200 p-2 rounded-md transition-colors"
                              title="Change Status"
                              disabled={
                                pickup.status === "completed" ||
                                pickup.status === "cancelled"
                              }
                            >
                              <RefreshCw className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() =>
                                updatePickupStatus(pickup.id, "completed")
                              }
                              className="bg-green-100 text-green-700 hover:bg-green-200 p-2 rounded-md transition-colors"
                              title="Mark as Completed"
                              disabled={
                                pickup.status === "completed" ||
                                pickup.status === "cancelled"
                              }
                            >
                              <CheckCircle className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() =>
                                updatePickupStatus(pickup.id, "cancelled")
                              }
                              className="bg-red-100 text-red-700 hover:bg-red-200 p-2 rounded-md transition-colors"
                              title="Cancel Pickup"
                              disabled={
                                pickup.status === "completed" ||
                                pickup.status === "cancelled"
                              }
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {lastPage > 1 && (
                <div className="px-6 py-3 flex items-center justify-between border-t border-slate-200">
                  <div className="flex-1 flex justify-between sm:hidden">
                    <button
                      onClick={() =>
                        setCurrentPage(Math.max(1, currentPage - 1))
                      }
                      disabled={currentPage === 1}
                      className={`relative inline-flex items-center px-4 py-2 border border-slate-300 text-sm font-medium rounded-md ${
                        currentPage === 1
                          ? "bg-slate-100 text-slate-400"
                          : "bg-white text-slate-700 hover:bg-slate-50"
                      }`}
                    >
                      Previous
                    </button>
                    <button
                      onClick={() =>
                        setCurrentPage(Math.min(lastPage, currentPage + 1))
                      }
                      disabled={currentPage === lastPage}
                      className={`ml-3 relative inline-flex items-center px-4 py-2 border border-slate-300 text-sm font-medium rounded-md ${
                        currentPage === lastPage
                          ? "bg-slate-100 text-slate-400"
                          : "bg-white text-slate-700 hover:bg-slate-50"
                      }`}
                    >
                      Next
                    </button>
                  </div>
                  <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm text-slate-700">
                        Showing{" "}
                        <span className="font-medium">
                          {(currentPage - 1) * itemsPerPage + 1}
                        </span>{" "}
                        to{" "}
                        <span className="font-medium">
                          {Math.min(
                            currentPage * itemsPerPage,
                            filteredPickups.length
                          )}
                        </span>{" "}
                        of{" "}
                        <span className="font-medium">
                          {filteredPickups.length}
                        </span>{" "}
                        results
                      </p>
                    </div>
                    <div>
                      <nav
                        className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px"
                        aria-label="Pagination"
                      >
                        <button
                          onClick={() =>
                            setCurrentPage(Math.max(1, currentPage - 1))
                          }
                          disabled={currentPage === 1}
                          className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-slate-300 text-sm font-medium ${
                            currentPage === 1
                              ? "bg-slate-100 text-slate-400"
                              : "bg-white text-slate-500 hover:bg-slate-50"
                          }`}
                        >
                          <span className="sr-only">Previous</span>
                          <ArrowLeft className="h-5 w-5" />
                        </button>
                        {Array.from({ length: lastPage }, (_, i) => i + 1).map(
                          (page) => (
                            <button
                              key={page}
                              onClick={() => setCurrentPage(page)}
                              className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                                currentPage === page
                                  ? "z-10 bg-green-50 border-green-500 text-green-600"
                                  : "bg-white border-slate-300 text-slate-500 hover:bg-slate-50"
                              }`}
                            >
                              {page}
                            </button>
                          )
                        )}
                        <button
                          onClick={() =>
                            setCurrentPage(Math.min(lastPage, currentPage + 1))
                          }
                          disabled={currentPage === lastPage}
                          className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-slate-300 text-sm font-medium ${
                            currentPage === lastPage
                              ? "bg-slate-100 text-slate-400"
                              : "bg-white text-slate-500 hover:bg-slate-50"
                          }`}
                        >
                          <span className="sr-only">Next</span>
                          <ArrowRight className="h-5 w-5" />
                        </button>
                      </nav>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* Status change modal */}
      {selectedPickup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h2 className="text-xl font-bold text-slate-800 mb-4">
              Change Pickup Status
            </h2>
            <p className="mb-4 text-slate-600">Update status for pickup:</p>
            <div className="mb-4 p-4 bg-slate-50 rounded-md">
              <div className="flex items-start">
                <div className="flex-shrink-0 bg-green-100 p-2 rounded-md">
                  <FileText className="h-5 w-5 text-green-600" />
                </div>
                <div className="ml-4">
                  <div className="text-sm font-medium text-slate-900">
                    {selectedPickup.description}
                  </div>
                  <div className="text-sm text-slate-500">
                    ID: {selectedPickup.id}
                  </div>
                  <div className="text-sm text-slate-500 flex items-center mt-1">
                    <User className="h-4 w-4 mr-1 text-slate-400" />
                    {selectedPickup.user_id}
                  </div>
                  <div className="text-sm text-slate-500 flex items-center mt-1">
                    <MapPin className="h-4 w-4 mr-1 text-slate-400" />
                    {selectedPickup.location}
                  </div>
                  <div className="text-sm text-slate-500 flex items-center mt-1">
                    <Calendar className="h-4 w-4 mr-1 text-slate-400" />
                    {formatDate(selectedPickup.pickup_date)}
                  </div>
                  {selectedPickup.notes && (
                    <div className="text-xs text-slate-500 mt-2 italic">
                      Note: {selectedPickup.notes}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="mb-4">
              <label
                htmlFor="status"
                className="block text-sm font-medium text-slate-700 mb-1"
              >
                New Status
              </label>
              <select
                id="status"
                className="w-full border border-slate-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
              >
                <option value="" disabled>
                  Select status
                </option>
                <option value="pending">Pending</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setSelectedPickup(null)}
                className="px-4 py-2 border border-slate-300 text-slate-700 rounded-md hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => updatePickupStatus(selectedPickup.id, newStatus)}
                className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors"
                disabled={!newStatus || newStatus === selectedPickup.status}
              >
                Update Status
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
