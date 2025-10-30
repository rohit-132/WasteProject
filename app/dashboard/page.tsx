"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Calendar, User, Settings, Trash2 } from "lucide-react";

export default function DashboardPage() {
  const [isAdmin, setIsAdmin] = useState(false);

  // Check if user is admin (This would typically come from an auth system)
  useEffect(() => {
    // Mock auth check - in a real app, this would come from your auth system
    const checkUserRole = () => {
      const userRole = localStorage.getItem("userRole") || "user";
      setIsAdmin(userRole === "admin");
    };

    checkUserRole();
  }, []);

  // Mock login function for demonstration
  const loginAsUser = () => {
    localStorage.setItem("userRole", "user");
    localStorage.setItem("userId", "user_123");
    setIsAdmin(false);
    window.location.reload();
  };

  const loginAsAdmin = () => {
    localStorage.setItem("userRole", "admin");
    localStorage.setItem("userId", "admin_001");
    setIsAdmin(true);
    window.location.reload();
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-5xl">
      <header className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold text-slate-800 mb-4">
          Waste Management System
        </h1>
        <p className="text-xl text-slate-600 max-w-3xl mx-auto">
          Schedule waste pickups and manage your recycling conveniently
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        <div className="bg-white rounded-lg shadow-sm p-8 border-t-4 border-green-500">
          <div className="flex items-center mb-4">
            <Calendar className="h-8 w-8 text-green-500 mr-3" />
            <h2 className="text-2xl font-bold text-slate-800">My Pickups</h2>
          </div>
          <p className="text-slate-600 mb-6">
            View all your scheduled waste collections and track their status.
          </p>
          <Link
            href="/schedule-pickups"
            className="inline-block bg-green-500 hover:bg-green-600 text-white font-medium px-6 py-3 rounded-md transition-colors"
          >
            View My Pickups
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-8 border-t-4 border-slate-500">
          {isAdmin ? (
            <>
              <div className="flex items-center mb-4">
                <Settings className="h-8 w-8 text-slate-500 mr-3" />
                <h2 className="text-2xl font-bold text-slate-800">
                  Admin Dashboard
                </h2>
              </div>
              <p className="text-slate-600 mb-6">
                Manage all waste pickups, update status, and monitor collection
                requests.
              </p>
              <Link
                href="/admin/dashboard"
                className="inline-block bg-slate-500 hover:bg-slate-600 text-white font-medium px-6 py-3 rounded-md transition-colors"
              >
                Go to Dashboard
              </Link>
            </>
          ) : (
            <>
              <div className="flex items-center mb-4">
                <Trash2 className="h-8 w-8 text-slate-500 mr-3" />
                <h2 className="text-2xl font-bold text-slate-800">
                  Recycling Tips
                </h2>
              </div>
              <p className="text-slate-600 mb-6">
                Learn how to properly sort and prepare your recyclables for
                better environmental impact.
              </p>
              <Link
                href="#"
                className="inline-block bg-slate-500 hover:bg-slate-600 text-white font-medium px-6 py-3 rounded-md transition-colors"
              >
                View Tips
              </Link>
            </>
          )}
        </div>
      </div>

      {!isAdmin && (
        <div className="mb-16">
          <div className="bg-white rounded-lg shadow-sm p-8 border-t-4 border-blue-500">
            <div className="flex items-center mb-4">
              <Calendar className="h-8 w-8 text-blue-500 mr-3" />
              <h2 className="text-2xl font-bold text-slate-800">
                User-Only Schedule Pickup
              </h2>
            </div>
            <p className="text-slate-600 mb-6">
              This special page is only accessible to regular users, not
              administrators. Schedule your waste pickups here.
            </p>
            <Link
              href="/user-schedule-pickup"
              className="inline-block bg-blue-500 hover:bg-blue-600 text-white font-medium px-6 py-3 rounded-md transition-colors"
            >
              Access User-Only Page
            </Link>
          </div>
        </div>
      )}

      {/* Demo login buttons - only for demonstration */}
      <div className="mt-12 bg-slate-50 p-6 rounded-lg">
        <h3 className="font-medium text-slate-700 mb-4">
          Demo Login (For Testing)
        </h3>
        <div className="flex gap-4">
          <button
            onClick={loginAsUser}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 rounded-md text-slate-700 text-sm"
          >
            Login as User
          </button>
          <button
            onClick={loginAsAdmin}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 rounded-md text-slate-700 text-sm"
          >
            Login as Admin
          </button>
        </div>
        <p className="text-xs text-slate-500 mt-2">
          Note: In a real app, this would be replaced by proper authentication.
        </p>
      </div>
    </div>
  );
}
