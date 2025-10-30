"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  User,
  Mail,
  Calendar,
  MapPin,
  Shield,
  Award,
  Coins,
  Loader2,
  AlertCircle,
  ArrowUpRight,
  ChevronRight,
  TrendingUp,
  Layout,
  Settings,
  Edit,
} from "lucide-react";

interface Badge {
  total_reports: number;
  badges: string[];
  current_badge_level: string | null;
  badge_updated_at: string;
  next_badge: string;
  reports_needed: number;
}

interface Wallet {
  balance: number;
  total_earned: number;
  total_spent: number;
  updated_at: string;
}

interface City {
  name: string;
  state: string;
  country: string;
  rank: number;
  total_reports: number;
  resolved_reports: number;
  total_users: number;
  authority_score: number;
  citizen_score: number;
  total_score: number;
}

interface UserProfile {
  id: string;
  name: string;
  email: string;
  picture: string;
  google_id: string;
  city: City;
  created_at: string;
  updated_at: string;
  badge: Badge;
  wallet: Wallet;
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Normally this would come from auth state
  const userId = "67efd860b7a02833ff2863db";

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(
          `http://localhost:8000/api/users/${userId}/profile`
        );

        if (!response.ok) {
          throw new Error(`Failed to fetch profile: ${response.status}`);
        }

        const data = await response.json();
        setProfile(data);
      } catch (err) {
        console.error("Error fetching profile:", err);
        setError("Failed to load profile. Please try again later.");

        // Set mock data for demonstration if needed
        // setProfile(mockData);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [userId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#f8f8f8] to-[#e8f5e9] flex items-center justify-center">
        <div className="flex flex-col items-center">
          <Loader2 className="w-12 h-12 text-green-500 animate-spin mb-4" />
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#f8f8f8] to-[#e8f5e9] py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl p-8 border border-[#e0e0e0] text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              Error Loading Profile
            </h2>
            <p className="text-gray-600 mb-6">
              {error || "Unable to load profile data"}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Format dates
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Calculate progress to next badge
  const calculateBadgeProgress = () => {
    if (!profile.badge.next_badge || !profile.badge.reports_needed) return 0;

    const totalRequired =
      profile.badge.total_reports + profile.badge.reports_needed;
    const current = profile.badge.total_reports;

    return Math.min(Math.round((current / totalRequired) * 100), 100);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f8f8f8] to-[#e8f5e9] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl p-8 border border-[#e0e0e0]"
        >
          {/* Profile Header */}
          <div className="flex flex-col md:flex-row items-center md:items-start gap-8 mb-10">
            <div className="relative">
              <Image
                src={profile.picture || "/Indian_map1.png"}
                alt={profile.name}
                width={150}
                height={150}
                className="rounded-full border-4 border-white shadow-md"
                unoptimized={profile.picture?.includes("googleusercontent.com")}
                onError={(e) => {
                  // Fallback to the default image if the profile picture fails to load
                  const target = e.target as HTMLImageElement;
                  target.src = "/Indian_map1.png";
                }}
              />
              <button className="absolute bottom-2 right-2 bg-white rounded-full p-2 shadow-md hover:bg-gray-100 transition-colors">
                <Edit className="w-4 h-4 text-gray-600" />
              </button>
            </div>
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-3xl font-bold text-gray-800 mb-2">
                {profile.name}
              </h1>
              <div className="flex items-center justify-center md:justify-start gap-2 mb-6">
                <MapPin className="h-4 w-4 text-gray-500" />
                <span className="text-gray-600">
                  {profile.city.name}, {profile.city.state},{" "}
                  {profile.city.country}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                <div className="flex flex-col items-center md:items-start">
                  <div className="flex items-center text-gray-600 mb-1">
                    <Mail className="w-4 h-4 mr-2" />
                    <span>Email</span>
                  </div>
                  <span className="text-gray-800 font-medium">
                    {profile.email}
                  </span>
                </div>

                <div className="flex flex-col items-center md:items-start">
                  <div className="flex items-center text-gray-600 mb-1">
                    <Calendar className="w-4 h-4 mr-2" />
                    <span>Joined</span>
                  </div>
                  <span className="text-gray-800 font-medium">
                    {formatDate(profile.created_at)}
                  </span>
                </div>

                <div className="flex flex-col items-center md:items-start">
                  <div className="flex items-center text-gray-600 mb-1">
                    <TrendingUp className="w-4 h-4 mr-2" />
                    <span>City Rank</span>
                  </div>
                  <span className="text-gray-800 font-medium">
                    #{profile.city.rank}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <Link
                href="/wallet"
                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors"
              >
                <Coins className="w-4 h-4" />
                View Wallet
              </Link>
              <button className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-gray-50 transition-colors">
                <Settings className="w-4 h-4" />
                Settings
              </button>
            </div>
          </div>

          {/* Stats and Badges */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            {/* Badge Progress */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 col-span-1 md:col-span-3">
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                <Award className="w-6 h-6 text-green-500 mr-2" />
                Badge Progress
              </h2>

              <div className="flex flex-col sm:flex-row items-center gap-6">
                <div className="relative w-24 h-24 flex-shrink-0">
                  <div className="absolute inset-0 rounded-full border-4 border-gray-100"></div>
                  <svg className="w-full h-full" viewBox="0 0 36 36">
                    <path
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="#E5E7EB"
                      strokeWidth="3"
                      strokeDasharray="100, 100"
                    />
                    <path
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="#10B981"
                      strokeWidth="3"
                      strokeDasharray={`${calculateBadgeProgress()}, 100`}
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center text-xl font-bold text-green-600">
                    {calculateBadgeProgress()}%
                  </div>
                </div>

                <div className="flex-1">
                  <div className="mb-4">
                    <p className="text-gray-600 mb-1">Current Badge Level</p>
                    <p className="text-2xl font-bold text-gray-800 capitalize">
                      {profile.badge.current_badge_level || "None yet"}
                    </p>
                  </div>

                  <div>
                    <p className="text-gray-600 mb-1">Next Badge</p>
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-gray-800 capitalize flex items-center">
                        <Award className="w-4 h-4 mr-1 text-green-500" />
                        {profile.badge.next_badge} Badge
                      </p>
                      <p className="text-gray-600 text-sm">
                        {profile.badge.reports_needed} more reports needed
                      </p>
                    </div>
                    <div className="w-full h-2 bg-gray-100 rounded-full mt-2 overflow-hidden">
                      <div
                        className="h-full bg-green-500 rounded-full"
                        style={{ width: `${calculateBadgeProgress()}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* City Stats */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                <MapPin className="w-5 h-5 text-green-500 mr-2" />
                City Statistics
              </h3>

              <div className="space-y-4">
                <div>
                  <p className="text-gray-600 text-sm mb-1">City Name</p>
                  <p className="text-gray-800 font-medium capitalize">
                    {profile.city.name}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-gray-600 text-sm mb-1">Total Reports</p>
                    <p className="text-gray-800 font-medium">
                      {profile.city.total_reports}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600 text-sm mb-1">Resolved</p>
                    <p className="text-gray-800 font-medium">
                      {profile.city.resolved_reports}
                    </p>
                  </div>
                </div>

                <div>
                  <p className="text-gray-600 text-sm mb-1">Active Users</p>
                  <p className="text-gray-800 font-medium">
                    {profile.city.total_users}
                  </p>
                </div>

                <div>
                  <p className="text-gray-600 text-sm mb-1">Rank</p>
                  <p className="text-2xl font-bold text-green-600">
                    #{profile.city.rank}
                  </p>
                </div>
              </div>
            </div>

            {/* Badges */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                <Award className="w-5 h-5 text-green-500 mr-2" />
                Badge Collection
              </h3>

              <div className="space-y-4">
                <div>
                  <p className="text-gray-600 text-sm mb-1">
                    Total Reports Submitted
                  </p>
                  <p className="text-2xl font-bold text-gray-800">
                    {profile.badge.total_reports}
                  </p>
                </div>

                {profile.badge.badges && profile.badge.badges.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {profile.badge.badges.map((badge, index) => (
                      <div
                        key={index}
                        className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium"
                      >
                        {badge}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-gray-50 rounded-lg p-4 text-center">
                    <p className="text-gray-500 text-sm">
                      No badges earned yet
                    </p>
                    <p className="text-gray-600 text-xs mt-1">
                      Keep reporting waste to earn badges!
                    </p>
                  </div>
                )}

                <div>
                  <Link
                    href="/badges"
                    className="text-green-600 hover:text-green-700 font-medium flex items-center justify-center gap-1 mt-4"
                  >
                    View all available badges
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </div>

            {/* Wallet */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                <Coins className="w-5 h-5 text-green-500 mr-2" />
                Eco-Wallet
              </h3>

              <div className="space-y-4">
                <div className="bg-green-500 text-white p-4 rounded-lg mb-4">
                  <p className="text-sm opacity-85 mb-1">Current Balance</p>
                  <p className="text-3xl font-bold">{profile.wallet.balance}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-gray-600 text-sm mb-1">Total Earned</p>
                    <p className="text-gray-800 font-medium">
                      {profile.wallet.total_earned}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600 text-sm mb-1">Total Spent</p>
                    <p className="text-gray-800 font-medium">
                      {profile.wallet.total_spent}
                    </p>
                  </div>
                </div>

                <div>
                  <p className="text-gray-600 text-sm mb-1">Last Updated</p>
                  <p className="text-gray-800 text-sm">
                    {formatDate(profile.wallet.updated_at)}
                  </p>
                </div>

                <div>
                  <Link
                    href="/wallet"
                    className="bg-green-100 hover:bg-green-200 text-green-700 font-medium py-2 px-4 rounded-lg mt-2 flex items-center justify-center gap-2 transition-colors"
                  >
                    <Coins className="w-4 h-4" />
                    Go to Wallet
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* User Actions */}
          {/* <div className="flex flex-wrap gap-4 justify-center md:justify-end">
            <Link
              href="/report-waste"
              className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg font-medium flex items-center gap-2 transition-colors"
            >
              Report Waste
              <ArrowUpRight className="w-4 h-4" />
            </Link>
            <Link
              href="/dashboard"
              className="border border-gray-300 text-gray-700 px-6 py-3 rounded-lg flex items-center gap-2 hover:bg-gray-50 transition-colors font-medium"
            >
              <Layout className="w-4 h-4" />
              Dashboard
            </Link>
          </div> */}
        </motion.div>
      </div>
    </div>
  );
}
