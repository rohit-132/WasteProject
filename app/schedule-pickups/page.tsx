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
} from "lucide-react";
import Link from "next/link";

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

export default function SchedulePickupsPage() {
  const [pickups, setPickups] = useState<Pickup[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPickup, setSelectedPickup] = useState<Pickup | null>(null);
  const [newStatus, setNewStatus] = useState<string>("");
  const [userId, setUserId] = useState<string | null>(null);

  // Check if the user is admin (This would typically come from an auth system)
  useEffect(() => {
    // Mock auth check - in a real app, this would come from your auth system
    const checkUserRole = async () => {
      try {
        // Mock implementation - replace with actual auth check
        const userRole = localStorage.getItem("userRole") || "user";
        setIsAdmin(userRole === "admin");

        // Set user ID for user-specific views
        const currentUserId = localStorage.getItem("userId") || "user_123";
        setUserId(currentUserId);
      } catch (err) {
        console.error("Error checking user role:", err);
        setIsAdmin(false);
      }
    };

    checkUserRole();
  }, []);

  // Fetch pickups based on user role
  useEffect(() => {
    const fetchPickups = async () => {
      setLoading(true);
      setError(null);

      try {
        let url = "http://127.0.0.1:8000/api/pickup/all";

        if (!isAdmin && userId) {
          url = `http://127.0.0.1:8000/api/pickup/user/${userId}`;
        }

        const response = await fetch(url);

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
            user_id: "user_123",
            description: "Electronics recycling",
            location: "123 Green Street, Eco City",
            pickup_date: "2025-04-15T11:00:00Z",
            status: "completed",
            created_at: "2025-04-02T10:45:00Z",
            updated_at: "2025-04-06T16:20:00Z",
            notes: "Old computer and TV for recycling",
          },
        ]);
      } finally {
        setLoading(false);
      }
    };

    if (userId || isAdmin) {
      fetchPickups();
    }
  }, [isAdmin, userId]);

  // Filter pickups based on status and search query
  const filteredPickups = pickups.filter((pickup) => {
    const matchesStatus =
      statusFilter === "all" || pickup.status === statusFilter;
    const matchesSearch =
      searchQuery === "" ||
      pickup.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pickup.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pickup.id.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesStatus && matchesSearch;
  });

  // Update pickup status (admin only)
  const updatePickupStatus = async (pickupId: string, status: string) => {
    if (!isAdmin) return;

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

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-800">
            {isAdmin ? "Manage All Pickups" : "My Scheduled Pickups"}
          </h1>
          <p className="text-slate-600 mt-1">
            {isAdmin
              ? "View and manage all scheduled waste pickups"
              : "View and track your scheduled waste pickups"}
          </p>
        </div>

        {!isAdmin && (
          <Link
            href="/schedule-new-pickup"
            className="mt-4 md:mt-0 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md transition-all shadow-sm hover:shadow-md flex items-center"
          >
            <Calendar className="w-4 h-4 mr-2" />
            Schedule New Pickup
          </Link>
        )}
      </div>

      {/* Filters and search */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by description, location or ID..."
              className="pl-10 pr-4 py-2 border border-slate-200 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative">
              <select
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
                  : isAdmin
                  ? "There are no scheduled pickups in the system yet"
                  : "You haven't scheduled any waste pickups yet"}
              </p>
              {!isAdmin && (
                <Link
                  href="/schedule-new-pickup"
                  className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md transition-all shadow-sm hover:shadow-md inline-flex items-center"
                >
                  <Calendar className="w-4 h-4 mr-2" />
                  Schedule Your First Pickup
                </Link>
              )}
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
                        className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider"
                      >
                        Pickup Details
                      </th>
                      {isAdmin && (
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider"
                        >
                          User
                        </th>
                      )}
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider"
                      >
                        Location
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider"
                      >
                        Date & Time
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider"
                      >
                        Status
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
                    {filteredPickups.map((pickup) => (
                      <tr key={pickup.id} className="hover:bg-slate-50">
                        <td className="px-6 py-4">
                          <div className="flex items-start">
                            <div className="flex-shrink-0 bg-green-100 p-2 rounded-md">
                              <FileText className="h-5 w-5 text-green-600" />
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-slate-900">
                                {pickup.description}
                              </div>
                              <div className="text-sm text-slate-500">
                                ID: {pickup.id}
                              </div>
                              {pickup.notes && (
                                <div className="text-xs text-slate-500 mt-1 italic">
                                  Note: {pickup.notes}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                        {isAdmin && (
                          <td className="px-6 py-4">
                            <div className="flex items-center">
                              <User className="h-4 w-4 text-slate-400 mr-2" />
                              <div className="text-sm text-slate-500">
                                {pickup.user_id}
                              </div>
                            </div>
                          </td>
                        )}
                        <td className="px-6 py-4">
                          <div className="flex items-start">
                            <MapPin className="h-4 w-4 text-slate-400 mt-0.5 mr-1 flex-shrink-0" />
                            <div className="text-sm text-slate-500">
                              {pickup.location}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-start">
                            <Clock className="h-4 w-4 text-slate-400 mt-0.5 mr-1 flex-shrink-0" />
                            <div className="text-sm text-slate-500">
                              {formatDate(pickup.pickup_date)}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`px-2 py-1 text-xs rounded-full ${getStatusColor(
                              pickup.status
                            )}`}
                          >
                            {pickup.status.replace("_", " ")}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          {isAdmin ? (
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
                          ) : (
                            <Link
                              href={`/pickup-details/${pickup.id}`}
                              className="text-green-600 hover:text-green-800 font-medium text-sm"
                            >
                              View Details
                            </Link>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}

      {/* Status change modal for admin */}
      {isAdmin && selectedPickup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h2 className="text-xl font-bold text-slate-800 mb-4">
              Change Pickup Status
            </h2>
            <p className="mb-4 text-slate-600">
              Update status for pickup:{" "}
              <span className="font-medium">{selectedPickup.description}</span>
            </p>

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
