"use client";

import { useState, useEffect, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Loader2,
  Leaf,
  Recycle,
  Shield,
  AlertCircle,
  CheckCircle,
  UserCog,
  User,
  Lock,
  Mail,
} from "lucide-react";
import Image from "next/image";

interface UserData {
  email: string;
  name: string;
  picture: string;
}

interface AdminLoginFormData {
  username: string;
  password: string;
}

interface AdminRegisterFormData {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
}

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [user, setUser] = useState<UserData | null>(null);

  // Admin login states
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [loginFormData, setLoginFormData] = useState<AdminLoginFormData>({
    username: "",
    password: "",
  });
  const [registerFormData, setRegisterFormData] =
    useState<AdminRegisterFormData>({
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
    });

  useEffect(() => {
    const error = searchParams.get("error");
    const success = searchParams.get("success");
    if (error) setError(error);
    if (success) setSuccess("Login successful!");
  }, [searchParams]);

  const handleGoogleLogin = () => {
    setLoading(true);
    setError(null);

    // Redirect to backend authentication endpoint
    window.location.href = "http://localhost:8000/auth/google/login";
  };

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        "http://127.0.0.1:8000/auth/authority/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username: loginFormData.username,
            password: loginFormData.password,
          }),
          credentials: "include", // Important for storing cookies
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.detail || "Login failed");
      }

      const data = await response.json();
      setSuccess("Admin login successful!");

      // Redirect to admin dashboard after successful login
      setTimeout(() => {
        router.push("/admin");
      }, 1000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to login");
    } finally {
      setLoading(false);
    }
  };

  const handleAdminRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Validate password match
    if (registerFormData.password !== registerFormData.confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(
        "http://127.0.0.1:8000/auth/authority/register",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username: registerFormData.username,
            email: registerFormData.email,
            role: "authority",
            password: registerFormData.password,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.detail || "Registration failed");
      }

      setSuccess("Admin registration successful! You can now log in.");
      setIsRegistering(false);
      // Clear registration form
      setRegisterFormData({
        username: "",
        email: "",
        password: "",
        confirmPassword: "",
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to register");
    } finally {
      setLoading(false);
    }
  };

  const handleLoginInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setLoginFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleRegisterInputChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = e.target;
    setRegisterFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Determine content height for animation
  const getContentHeight = () => {
    if (isAdminMode && isRegistering) return "h-[600px]";
    if (isAdminMode) return "h-[400px]";
    return "h-[500px]";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-100 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-md"
      >
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/30 p-8"
        >
          {/* Header */}
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="text-center mb-8"
          >
            <div className="flex justify-center mb-4">
              <div className="relative">
                <Leaf className="w-12 h-12 text-green-500 animate-pulse" />
                <Recycle className="w-8 h-8 text-green-500 absolute -bottom-2 -right-2 animate-spin-slow" />
              </div>
            </div>
            <h1 className="text-3xl font-bold text-slate-800 mb-2">ECOWASTE</h1>
            <p className="text-slate-600">
              Sustainable Waste Management Platform
            </p>
          </motion.div>

          {/* Toggle between user and admin mode */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="flex mb-6 bg-slate-100 rounded-xl p-1"
          >
            <button
              className={`flex-1 py-3 px-4 rounded-lg transition-all duration-300 font-medium ${
                !isAdminMode
                  ? "bg-white shadow-sm text-green-600"
                  : "text-slate-600 hover:text-slate-800"
              }`}
              onClick={() => setIsAdminMode(false)}
            >
              <User className="w-4 h-4 inline-block mr-2" />
              User
            </button>
            <button
              className={`flex-1 py-3 px-4 rounded-lg transition-all duration-300 font-medium ${
                isAdminMode
                  ? "bg-white shadow-sm text-green-600"
                  : "text-slate-600 hover:text-slate-800"
              }`}
              onClick={() => setIsAdminMode(true)}
            >
              <UserCog className="w-4 h-4 inline-block mr-2" />
              Admin
            </button>
          </motion.div>

          {/* Messages */}
          <AnimatePresence mode="wait">
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                className="mb-4 p-4 bg-red-50 border border-red-200 text-red-600 rounded-xl flex items-center"
              >
                <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0" />
                <span className="text-sm">{error}</span>
              </motion.div>
            )}

            {success && (
              <motion.div
                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                className="mb-4 p-4 bg-green-50 border border-green-200 text-green-600 rounded-xl flex items-center"
              >
                <CheckCircle className="w-5 h-5 mr-2 flex-shrink-0" />
                <span className="text-sm">{success}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* User Info */}
          {user && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 bg-slate-50 rounded-xl border border-slate-200"
            >
              <div className="flex items-center space-x-3">
                <Image
                  src={user.picture}
                  alt={user.name}
                  width={40}
                  height={40}
                  className="rounded-full"
                />
                <div>
                  <p className="font-medium text-slate-800">{user.name}</p>
                  <p className="text-sm text-slate-500">{user.email}</p>
                </div>
              </div>
            </motion.div>
          )}

          {/* Content Container */}
          <motion.div
            layout
            className={`relative ${getContentHeight()} overflow-hidden`}
          >
            <AnimatePresence mode="wait">
              {/* Regular User Section */}
              {!isAdminMode && (
                <motion.div
                  key="user-section"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.4 }}
                  className="space-y-6"
                >
                  {/* Features */}
                  <div className="grid grid-cols-2 gap-4">
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                      className="bg-slate-50 p-4 rounded-xl text-center border border-slate-200"
                    >
                      <Recycle className="w-6 h-6 text-green-500 mx-auto mb-2" />
                      <p className="text-sm text-slate-700 font-medium">
                        Track Waste
                      </p>
                    </motion.div>
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 }}
                      className="bg-slate-50 p-4 rounded-xl text-center border border-slate-200"
                    >
                      <Shield className="w-6 h-6 text-green-500 mx-auto mb-2" />
                      <p className="text-sm text-slate-700 font-medium">
                        Secure Access
                      </p>
                    </motion.div>
                  </div>

                  {/* Login Button */}
                  <motion.button
                    whileHover={{ scale: 1.02, backgroundColor: "#f8f9fa" }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleGoogleLogin}
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-3 p-4 bg-white border border-slate-200 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <Loader2 className="w-5 h-5 text-green-500 animate-spin" />
                    ) : (
                      <>
                        <svg
                          className="w-5 h-5"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                        >
                          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                        </svg>
                        <span className="text-slate-700 font-medium">
                          Continue with Google
                        </span>
                      </>
                    )}
                  </motion.button>
                </motion.div>
              )}

              {/* Admin Login Section */}
              {isAdminMode && !isRegistering && (
                <motion.form
                  key="admin-login"
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.4 }}
                  onSubmit={handleAdminLogin}
                  className="space-y-5 absolute top-0 left-0 w-full"
                >
                  <motion.div layout>
                    <label
                      htmlFor="username"
                      className="block text-sm font-medium text-slate-700 mb-1"
                    >
                      Username
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <User className="h-5 w-5 text-slate-400" />
                      </div>
                      <input
                        id="username"
                        name="username"
                        type="text"
                        autoComplete="username"
                        required
                        value={loginFormData.username}
                        onChange={handleLoginInputChange}
                        className="bg-white/50 backdrop-blur-sm py-3 px-4 pl-10 block w-full border border-white/30 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent shadow-sm text-base"
                        placeholder="Enter your username"
                      />
                    </div>
                  </motion.div>

                  <motion.div layout>
                    <label
                      htmlFor="password"
                      className="block text-sm font-medium text-slate-700 mb-1"
                    >
                      Password
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Lock className="h-5 w-5 text-slate-400" />
                      </div>
                      <input
                        id="password"
                        name="password"
                        type="password"
                        autoComplete="current-password"
                        required
                        value={loginFormData.password}
                        onChange={handleLoginInputChange}
                        className="bg-white/50 backdrop-blur-sm py-3 px-4 pl-10 block w-full border border-white/30 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent shadow-sm text-base"
                        placeholder="Enter your password"
                      />
                    </div>
                  </motion.div>

                  <motion.button
                    layout
                    whileHover={{ scale: 1.02, backgroundColor: "#00b046" }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-2 py-4 px-4 bg-green-500 text-white rounded-lg font-medium shadow-sm hover:shadow-md transition-all duration-200 text-lg"
                  >
                    {loading ? (
                      <Loader2 className="w-6 h-6 animate-spin" />
                    ) : (
                      <>
                        <Shield className="w-6 h-6" />
                        Admin Login
                      </>
                    )}
                  </motion.button>

                  <motion.div layout className="text-center mt-4">
                    <button
                      type="button"
                      onClick={() => setIsRegistering(true)}
                      className="text-green-600 hover:text-green-700 text-sm font-medium"
                    >
                      Don't have an admin account? Register
                    </button>
                  </motion.div>
                </motion.form>
              )}

              {/* Admin Register Section */}
              {isAdminMode && isRegistering && (
                <motion.form
                  key="admin-register"
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.4 }}
                  onSubmit={handleAdminRegister}
                  className="space-y-5 absolute top-0 left-0 w-full"
                >
                  <motion.div layout>
                    <label
                      htmlFor="register-username"
                      className="block text-sm font-medium text-slate-700 mb-1"
                    >
                      Username
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <User className="h-5 w-5 text-slate-400" />
                      </div>
                      <input
                        id="register-username"
                        name="username"
                        type="text"
                        autoComplete="username"
                        required
                        value={registerFormData.username}
                        onChange={handleRegisterInputChange}
                        className="bg-white/50 backdrop-blur-sm py-3 px-4 pl-10 block w-full border border-white/30 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent shadow-sm text-base"
                        placeholder="Choose a username"
                      />
                    </div>
                  </motion.div>

                  <motion.div layout>
                    <label
                      htmlFor="register-email"
                      className="block text-sm font-medium text-slate-700 mb-1"
                    >
                      Email
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Mail className="h-5 w-5 text-slate-400" />
                      </div>
                      <input
                        id="register-email"
                        name="email"
                        type="email"
                        autoComplete="email"
                        required
                        value={registerFormData.email}
                        onChange={handleRegisterInputChange}
                        className="bg-white/50 backdrop-blur-sm py-3 px-4 pl-10 block w-full border border-white/30 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent shadow-sm text-base"
                        placeholder="Enter your email"
                      />
                    </div>
                  </motion.div>

                  <motion.div layout>
                    <label
                      htmlFor="register-password"
                      className="block text-sm font-medium text-slate-700 mb-1"
                    >
                      Password
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Lock className="h-5 w-5 text-slate-400" />
                      </div>
                      <input
                        id="register-password"
                        name="password"
                        type="password"
                        autoComplete="new-password"
                        required
                        value={registerFormData.password}
                        onChange={handleRegisterInputChange}
                        className="bg-white/50 backdrop-blur-sm py-3 px-4 pl-10 block w-full border border-white/30 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent shadow-sm text-base"
                        placeholder="Create a password"
                      />
                    </div>
                  </motion.div>

                  <motion.div layout>
                    <label
                      htmlFor="register-confirm-password"
                      className="block text-sm font-medium text-slate-700 mb-1"
                    >
                      Confirm Password
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Lock className="h-5 w-5 text-slate-400" />
                      </div>
                      <input
                        id="register-confirm-password"
                        name="confirmPassword"
                        type="password"
                        autoComplete="new-password"
                        required
                        value={registerFormData.confirmPassword}
                        onChange={handleRegisterInputChange}
                        className="bg-white/50 backdrop-blur-sm py-3 px-4 pl-10 block w-full border border-white/30 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent shadow-sm text-base"
                        placeholder="Confirm your password"
                      />
                    </div>
                  </motion.div>

                  <motion.button
                    layout
                    whileHover={{ scale: 1.02, backgroundColor: "#00b046" }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-2 py-4 px-4 bg-green-500 text-white rounded-lg font-medium shadow-sm hover:shadow-md transition-all duration-200 text-lg"
                  >
                    {loading ? (
                      <Loader2 className="w-6 h-6 animate-spin" />
                    ) : (
                      <>
                        <UserCog className="w-6 h-6" />
                        Register as Admin
                      </>
                    )}
                  </motion.button>

                  <motion.div layout className="text-center mt-4">
                    <button
                      type="button"
                      onClick={() => setIsRegistering(false)}
                      className="text-green-600 hover:text-green-700 text-sm font-medium"
                    >
                      Already have an account? Login
                    </button>
                  </motion.div>
                </motion.form>
              )}
            </AnimatePresence>
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-100 flex items-center justify-center p-4">
          <div className="w-full max-w-md">
            <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/30 p-8">
              <div className="text-center">
                <div className="flex justify-center mb-4">
                  <div className="relative">
                    <Leaf className="w-12 h-12 text-green-500 animate-pulse" />
                    <Recycle className="w-8 h-8 text-green-500 absolute -bottom-2 -right-2 animate-spin-slow" />
                  </div>
                </div>
                <h1 className="text-3xl font-bold text-slate-800 mb-2">
                  ECOWASTE
                </h1>
                <p className="text-slate-600">Loading...</p>
              </div>
            </div>
          </div>
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  );
}
