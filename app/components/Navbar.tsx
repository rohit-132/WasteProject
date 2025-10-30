"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, Calendar, Settings, LogOut } from "lucide-react";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const pathname = usePathname();

  // Check if current path is active
  const isActive = (path: string) => {
    return pathname === path || pathname.startsWith(`${path}/`);
  };

  // Check if user is admin
  useEffect(() => {
    const userRole = localStorage.getItem("userRole") || "user";
    setIsAdmin(userRole === "admin");
  }, []);

  // Toggle mobile menu
  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  // Logout function
  const handleLogout = () => {
    localStorage.removeItem("userRole");
    localStorage.removeItem("userId");
    window.location.href = "/dashboard";
  };

  return (
    <nav className="bg-white shadow-sm">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/dashboard" className="flex-shrink-0 flex items-center">
              <span className="text-green-600 font-bold text-xl">EcoWaste</span>
            </Link>
            {/* Desktop navigation */}
            <div className="hidden md:ml-6 md:flex md:space-x-4">
              <Link
                href="/schedule-pickups"
                className={`inline-flex items-center px-3 py-2 border-b-2 text-sm font-medium ${
                  isActive("/schedule-pickups")
                    ? "border-green-500 text-green-600"
                    : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
                }`}
              >
                <Calendar className="mr-2 h-4 w-4" />
                My Pickups
              </Link>
              {!isAdmin && (
                <Link
                  href="/user-schedule-pickup"
                  className={`inline-flex items-center px-3 py-2 border-b-2 text-sm font-medium ${
                    isActive("/user-schedule-pickup")
                      ? "border-green-500 text-green-600"
                      : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
                  }`}
                >
                  <Calendar className="mr-2 h-4 w-4" />
                  Schedule Pickup (Users Only)
                </Link>
              )}
              {isAdmin && (
                <>
                  <Link
                    href="/admin/dashboard"
                    className={`inline-flex items-center px-3 py-2 border-b-2 text-sm font-medium ${
                      isActive("/admin/dashboard")
                        ? "border-green-500 text-green-600"
                        : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
                    }`}
                  >
                    <Settings className="mr-2 h-4 w-4" />
                    Admin Dashboard
                  </Link>
                  <Link
                    href="/admin-schedule-pickup"
                    className={`inline-flex items-center px-3 py-2 border-b-2 text-sm font-medium ${
                      isActive("/admin-schedule-pickup")
                        ? "border-green-500 text-green-600"
                        : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
                    }`}
                  >
                    <Calendar className="mr-2 h-4 w-4" />
                    Schedule For User
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="flex md:hidden">
            <button
              onClick={toggleMenu}
              type="button"
              className="inline-flex items-center justify-center p-2 rounded-md text-slate-400 hover:text-slate-500 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-green-500"
              aria-controls="mobile-menu"
              aria-expanded="false"
            >
              <span className="sr-only">Open main menu</span>
              {isOpen ? (
                <X className="block h-6 w-6" aria-hidden="true" />
              ) : (
                <Menu className="block h-6 w-6" aria-hidden="true" />
              )}
            </button>
          </div>

          {/* Desktop right navigation */}
          <div className="hidden md:flex md:items-center">
            <button
              onClick={handleLogout}
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-slate-500 hover:text-slate-700"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="md:hidden" id="mobile-menu">
          <div className="px-2 pt-2 pb-3 space-y-1">
            <Link
              href="/schedule-pickups"
              className={`block px-3 py-2 rounded-md text-base font-medium ${
                isActive("/schedule-pickups")
                  ? "bg-green-50 text-green-600"
                  : "text-slate-500 hover:bg-slate-100 hover:text-slate-700"
              }`}
              onClick={toggleMenu}
            >
              <span className="flex items-center">
                <Calendar className="mr-2 h-4 w-4" />
                My Pickups
              </span>
            </Link>
            {!isAdmin && (
              <Link
                href="/user-schedule-pickup"
                className={`block px-3 py-2 rounded-md text-base font-medium ${
                  isActive("/user-schedule-pickup")
                    ? "bg-green-50 text-green-600"
                    : "text-slate-500 hover:bg-slate-100 hover:text-slate-700"
                }`}
                onClick={toggleMenu}
              >
                <span className="flex items-center">
                  <Calendar className="mr-2 h-4 w-4" />
                  Schedule Pickup (Users Only)
                </span>
              </Link>
            )}
            {isAdmin && (
              <>
                <Link
                  href="/admin/dashboard"
                  className={`block px-3 py-2 rounded-md text-base font-medium ${
                    isActive("/admin/dashboard")
                      ? "bg-green-50 text-green-600"
                      : "text-slate-500 hover:bg-slate-100 hover:text-slate-700"
                  }`}
                  onClick={toggleMenu}
                >
                  <span className="flex items-center">
                    <Settings className="mr-2 h-4 w-4" />
                    Admin Dashboard
                  </span>
                </Link>
                <Link
                  href="/admin-schedule-pickup"
                  className={`block px-3 py-2 rounded-md text-base font-medium ${
                    isActive("/admin-schedule-pickup")
                      ? "bg-green-50 text-green-600"
                      : "text-slate-500 hover:bg-slate-100 hover:text-slate-700"
                  }`}
                  onClick={toggleMenu}
                >
                  <span className="flex items-center">
                    <Calendar className="mr-2 h-4 w-4" />
                    Schedule For User
                  </span>
                </Link>
              </>
            )}
            <button
              onClick={() => {
                handleLogout();
                toggleMenu();
              }}
              className="w-full text-left block px-3 py-2 rounded-md text-base font-medium text-slate-500 hover:bg-slate-100 hover:text-slate-700"
            >
              <span className="flex items-center">
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </span>
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}
