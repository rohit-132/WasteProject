"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import {
  ChevronDown,
  MapPin,
  Recycle,
  Bell,
  Calendar,
  Award,
  BarChart3,
  Globe,
  Languages,
  Menu,
  X,
} from "lucide-react";

// Import our animation utilities
import { setupLocomotive, createTextHighlightAnimation } from "@/lib/animation";

export default function Home() {
  const mainRef = useRef<HTMLDivElement>(null);
  const taglineRef = useRef<HTMLHeadingElement>(null);
  const [locoScroll, setLocoScroll] = useState<any>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("main-modules");

  // Initialize locomotive scroll and animations
  useEffect(() => {
    // Only run on client side
    if (typeof window === "undefined") return;

    // Create a small delay to ensure the DOM is fully rendered
    const timeout = setTimeout(async () => {
      // Initialize Locomotive Scroll
      const locomotiveInstance = await setupLocomotive(mainRef.current);
      setLocoScroll(locomotiveInstance);

      // Set up text highlighting animation for the tagline
      await createTextHighlightAnimation(taglineRef.current, mainRef.current);
    }, 100);

    // Close sidebar on window resize (above md breakpoint)
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setSidebarOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);

    return () => {
      // Clean up
      clearTimeout(timeout);
      window.removeEventListener("resize", handleResize);
      if (locoScroll) {
        locoScroll.destroy();
      }
    };
  }, []);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // Close sidebar when clicking on a link
  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  return (
    <div
      id="main"
      ref={mainRef}
      className="flex flex-col min-h-screen bg-[#EFF4EF] relative overflow-hidden scroll-smooth"
      data-scroll-container
    >
      {/* Mobile Sidebar */}
      <div
        className={`fixed inset-0 bg-black/50 backdrop-blur-sm z-50 transition-opacity duration-300 md:hidden ${
          sidebarOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={closeSidebar}
      >
        <div
          className={`absolute top-0 left-0 h-full w-3/4 max-w-xs bg-white shadow-xl transition-transform duration-300 ${
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
                href="#"
                className="text-slate-700 hover:text-green-500 transition-colors py-2"
                onClick={closeSidebar}
              >
                Our work
              </Link>
              <div className="relative">
                <button className="flex items-center gap-1 text-slate-700 hover:text-green-500 bg-green-100/60 px-4 py-2 rounded-md transition-colors w-full text-left">
                  solutions
                  <ChevronDown className="h-4 w-4 ml-1" />
                </button>
                <div className="bg-white/90 shadow-md rounded-md p-2 w-full mt-1">
                  <Link
                    href="#"
                    className="block px-4 py-2 hover:bg-green-50 rounded-md transition-colors"
                    onClick={closeSidebar}
                  >
                    Waste Tracking
                  </Link>
                  <Link
                    href="#"
                    className="block px-4 py-2 hover:bg-green-50 rounded-md transition-colors"
                    onClick={closeSidebar}
                  >
                    Smart Bins
                  </Link>
                  <Link
                    href="#"
                    className="block px-4 py-2 hover:bg-green-50 rounded-md transition-colors"
                    onClick={closeSidebar}
                  >
                    Recycling Programs
                  </Link>
                </div>
              </div>
              <Link
                href="#"
                className="text-slate-700 hover:text-green-500 transition-colors py-2"
                onClick={closeSidebar}
              >
                About us
              </Link>
              <Link
                href="#"
                className="text-slate-700 hover:text-green-500 transition-colors py-2"
                onClick={closeSidebar}
              >
                Contact
              </Link>
            </nav>
            <div className="mt-auto pt-8">
              <Link
                href="/login"
                className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-md transition-all shadow-md hover:shadow-lg w-full text-center block"
                onClick={closeSidebar}
              >
                SignIn
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Glassmorphic floating navbar */}
      <header
        className="fixed top-4 left-1/2 transform -translate-x-1/2 w-[95%] max-w-7xl z-50 bg-white/70 backdrop-blur-lg rounded-2xl shadow-lg border border-white/20"
        data-scroll
        data-scroll-sticky
        data-scroll-target="#main"
      >
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center">
            <button
              className="mr-4 text-slate-700 hover:text-green-500 md:hidden"
              onClick={toggleSidebar}
              aria-label="Open menu"
            >
              <Menu className="h-6 w-6" />
            </button>
            <Link href="/" className="text-green-500 text-2xl font-bold">
              ECOWASTE
            </Link>
          </div>
          <nav className="hidden md:flex items-center gap-8">
            <Link
              href="#"
              className="text-slate-700 hover:text-green-500 transition-colors"
            >
              Our work
            </Link>
            <div className="relative group">
              <button className="flex items-center gap-1 text-slate-700 hover:text-green-500 bg-green-100/60 px-4 py-2 rounded-md transition-colors">
                solutions
                <ChevronDown className="h-4 w-4" />
              </button>
              <div className="absolute hidden group-hover:block bg-white/90 backdrop-blur-sm shadow-lg rounded-md p-2 w-48">
                <Link
                  href="#"
                  className="block px-4 py-2 hover:bg-green-50 rounded-md transition-colors"
                >
                  Waste Tracking
                </Link>
                <Link
                  href="#"
                  className="block px-4 py-2 hover:bg-green-50 rounded-md transition-colors"
                >
                  Smart Bins
                </Link>
                <Link
                  href="#"
                  className="block px-4 py-2 hover:bg-green-50 rounded-md transition-colors"
                >
                  Recycling Programs
                </Link>
              </div>
            </div>
            <Link
              href="#"
              className="text-slate-700 hover:text-green-500 transition-colors"
            >
              About us
            </Link>
            <Link
              href="#"
              className="text-slate-700 hover:text-green-500 transition-colors"
            >
              Contact
            </Link>
          </nav>
          <Link
            href="/login"
            className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-md transition-all shadow-md hover:shadow-lg"
          >
            SignIn
          </Link>
        </div>
      </header>

      <main className="flex-grow pt-24">
        {/* Hero Section */}
        <section
          className="relative py-12 md:py-24 overflow-hidden"
          data-scroll-section
        >
          {/* Background gradient circles */}
          <div className="absolute top-20 left-10 w-64 h-64 bg-green-300 rounded-full opacity-20 filter blur-3xl animate-pulse"></div>
          <div
            className="absolute bottom-10 right-10 w-80 h-80 bg-green-400 rounded-full opacity-10 filter blur-3xl animate-pulse"
            style={{ animationDelay: "1s" }}
          ></div>

          <div
            className="container mx-auto px-4 relative z-10 md:pl-25"
            data-scroll
            data-scroll-speed="1"
          >
            <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center">
              <div
                className="relative order-first md:order-last mx-auto max-w-sm md:max-w-none"
                data-scroll
                data-scroll-speed="1"
                data-scroll-direction="horizontal"
              >
                {/* Animated gradient background circles */}
                <div className="absolute -top-10 -right-10 w-40 h-40 bg-green-200 rounded-full opacity-50 animate-pulse"></div>
                <div
                  className="absolute top-20 -left-5 w-24 h-24 bg-green-300 rounded-full opacity-30 animate-pulse"
                  style={{ animationDelay: "1.5s" }}
                ></div>
                <div
                  className="absolute bottom-0 right-10 w-32 h-32 bg-teal-200 rounded-full opacity-40 animate-pulse"
                  style={{ animationDelay: "0.8s" }}
                ></div>

                <div className="relative z-10 p-3 rounded-xl md:w-120 md:ml-30">
                  <Image
                    src="/Dustbin1.png"
                    width={500}
                    height={400}
                    alt="Smart waste management system"
                    className="rounded-lg w-full h-auto"
                  />
                </div>
              </div>
              <div
                className="space-y-5 md:space-y-7 text-center md:text-left"
                data-scroll
                data-scroll-speed="2"
                data-scroll-delay="0.1"
              >
                <h1 className="text-4xl md:text-6xl font-bold text-slate-800">
                  <span className="text-green-500 inline-block relative">
                    Smart
                    <span className="absolute -z-10 -inset-1 bg-green-200/30 blur-sm rounded-full"></span>
                  </span>
                  Waste
                </h1>
                <h2 className="text-3xl md:text-5xl font-medium text-slate-700">
                  sustainable waste management system
                </h2>
                <p className="text-lg md:text-xl text-slate-600">
                  A personalized smart waste management experience for urban
                  areas. With our automated waste tracking system, waste
                  management is simpler, more transparent, more efficient and
                  more sustainable!
                </p>
                <div className="mt-8">
                  <Link
                    href="#"
                    className="inline-block bg-green-500 hover:bg-green-600 text-white px-8 py-4 text-lg rounded-md transition-all shadow-md hover:shadow-lg transform hover:-translate-y-1"
                  >
                    Get Started!
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Tagline Section */}
        <section
          id="page2"
          className="py-16 md:py-24 bg-white relative"
          data-scroll-section
        >
          {/* Background gradient circles */}
          <div className="absolute top-1/3 left-10 w-40 h-40 bg-green-200 rounded-full opacity-30 filter blur-xl"></div>
          <div className="absolute bottom-1/4 right-10 w-52 h-52 bg-green-300 rounded-full opacity-20 filter blur-xl"></div>

          <div
            className="container mx-auto px-4 text-center relative z-10"
            data-scroll
            data-scroll-speed="1"
          >
            <div className="max-w-4xl mx-auto">
              <h2
                ref={taglineRef}
                className="text-3xl md:text-4xl font-bold mb-6 split-text-animation"
                data-scroll
                data-scroll-speed="1.5"
              >
                <span className="bg-lime-200 px-2">
                  Simpler, more transparent, more efficient
                </span>{" "}
                we make the urban environment and increase the sustainability.
              </h2>
            </div>
          </div>
        </section>

        {/* Navigation Tabs */}
        <section
          className="border-t border-b bg-white/80 backdrop-blur-sm relative"
          data-scroll-section
        >
          <div className="absolute inset-0 bg-gradient-to-r from-green-50 via-white to-green-50 opacity-50"></div>
          <div className="container mx-auto px-4 relative z-10">
            <div className="flex justify-center flex-wrap">
              <button
                onClick={() => setActiveTab("news")}
                className={`px-6 py-4 hover:bg-green-50 text-slate-700 border-b-2 transition-colors ${
                  activeTab === "news"
                    ? "border-green-400 bg-green-100/50 backdrop-blur-sm"
                    : "border-transparent hover:border-green-300"
                }`}
              >
                News
              </button>
              <button
                onClick={() => setActiveTab("main-modules")}
                className={`px-6 py-4 hover:bg-green-50 text-slate-700 border-b-2 transition-colors ${
                  activeTab === "main-modules"
                    ? "border-green-400 bg-green-100/50 backdrop-blur-sm"
                    : "border-transparent hover:border-green-300"
                }`}
              >
                Main modules
              </button>
              <button
                onClick={() => setActiveTab("extra-features")}
                className={`px-6 py-4 hover:bg-green-50 text-slate-700 border-b-2 transition-colors ${
                  activeTab === "extra-features"
                    ? "border-green-400 bg-green-100/50 backdrop-blur-sm"
                    : "border-transparent hover:border-green-300"
                }`}
              >
                Extra features
              </button>
              <button
                onClick={() => setActiveTab("partners")}
                className={`px-6 py-4 hover:bg-green-50 text-slate-700 border-b-2 transition-colors ${
                  activeTab === "partners"
                    ? "border-green-400 bg-green-100/50 backdrop-blur-sm"
                    : "border-transparent hover:border-green-300"
                }`}
              >
                partners
              </button>
            </div>
          </div>
        </section>

        {/* Tab Content Section */}
        <section
          className="py-16 bg-white/90 relative overflow-hidden"
          data-scroll-section
        >
          {/* Background gradient circles */}
          <div className="absolute top-0 left-1/4 w-60 h-60 bg-green-100 rounded-full opacity-30 filter blur-3xl"></div>
          <div className="absolute bottom-0 right-1/3 w-60 h-60 bg-teal-100 rounded-full opacity-30 filter blur-3xl"></div>

          <div className="container mx-auto px-4 relative z-10">
            {/* Tab content with animation */}
            <div className="relative">
              {/* News Tab Content */}
              <div
                className={`transition-all duration-500 ${
                  activeTab === "news"
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 absolute inset-0 translate-y-8 pointer-events-none"
                }`}
              >
                <h2 className="text-3xl font-bold text-center text-slate-800 mb-12">
                  Latest News & Updates
                </h2>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {/* News Card 1 */}
                  <div
                    className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
                    data-scroll
                    data-scroll-speed="0.5"
                  >
                    <div className="h-56 overflow-hidden relative">
                      <Image
                        src="/news-placeholder1.jpg"
                        alt="Smart bins deployment in Urban areas"
                        width={500}
                        height={300}
                        className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                      />
                      <div className="absolute top-4 right-4 bg-green-500 text-white text-xs px-2 py-1 rounded-md">
                        Announcement
                      </div>
                    </div>
                    <div className="p-6">
                      <div className="text-green-600 text-sm font-medium mb-2">
                        April 15, 2023
                      </div>
                      <h3 className="text-xl font-bold text-slate-800 mb-3">
                        Smart Bins Deployment in Urban Areas
                      </h3>
                      <p className="text-slate-600 mb-4">
                        Our latest smart bin technology is now being deployed
                        across major urban centers, helping cities optimize
                        waste collection and improve sustainability.
                      </p>
                      <Link
                        href="#"
                        className="text-green-500 font-medium hover:text-green-600 transition-colors inline-flex items-center"
                      >
                        Read more
                        <svg
                          className="w-4 h-4 ml-1"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M14 5l7 7m0 0l-7 7m7-7H3"
                          ></path>
                        </svg>
                      </Link>
                    </div>
                  </div>

                  {/* News Card 2 */}
                  <div
                    className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
                    data-scroll
                    data-scroll-speed="0.7"
                  >
                    <div className="h-56 overflow-hidden relative">
                      <Image
                        src="/news-placeholder2.jpg"
                        alt="EcoWaste mobile app launch"
                        width={500}
                        height={300}
                        className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                      />
                      <div className="absolute top-4 right-4 bg-teal-500 text-white text-xs px-2 py-1 rounded-md">
                        Product Update
                      </div>
                    </div>
                    <div className="p-6">
                      <div className="text-green-600 text-sm font-medium mb-2">
                        March 28, 2023
                      </div>
                      <h3 className="text-xl font-bold text-slate-800 mb-3">
                        EcoWaste Mobile App Launch
                      </h3>
                      <p className="text-slate-600 mb-4">
                        We're excited to announce the launch of our new mobile
                        app, making waste management and recycling more
                        accessible for communities everywhere.
                      </p>
                      <Link
                        href="#"
                        className="text-green-500 font-medium hover:text-green-600 transition-colors inline-flex items-center"
                      >
                        Read more
                        <svg
                          className="w-4 h-4 ml-1"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M14 5l7 7m0 0l-7 7m7-7H3"
                          ></path>
                        </svg>
                      </Link>
                    </div>
                  </div>

                  {/* News Card 3 */}
                  <div
                    className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
                    data-scroll
                    data-scroll-speed="0.6"
                  >
                    <div className="h-56 overflow-hidden relative">
                      <Image
                        src="/news-placeholder3.jpg"
                        alt="Partnership with GreenCity Initiative"
                        width={500}
                        height={300}
                        className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                      />
                      <div className="absolute top-4 right-4 bg-blue-500 text-white text-xs px-2 py-1 rounded-md">
                        Partnership
                      </div>
                    </div>
                    <div className="p-6">
                      <div className="text-green-600 text-sm font-medium mb-2">
                        February 12, 2023
                      </div>
                      <h3 className="text-xl font-bold text-slate-800 mb-3">
                        Partnership with GreenCity Initiative
                      </h3>
                      <p className="text-slate-600 mb-4">
                        EcoWaste has partnered with the GreenCity Initiative to
                        implement sustainable waste management solutions in five
                        major metropolitan areas.
                      </p>
                      <Link
                        href="#"
                        className="text-green-500 font-medium hover:text-green-600 transition-colors inline-flex items-center"
                      >
                        Read more
                        <svg
                          className="w-4 h-4 ml-1"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M14 5l7 7m0 0l-7 7m7-7H3"
                          ></path>
                        </svg>
                      </Link>
                    </div>
                  </div>

                  {/* News Card 4 */}
                  <div
                    className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
                    data-scroll
                    data-scroll-speed="0.5"
                  >
                    <div className="h-56 overflow-hidden relative">
                      <Image
                        src="/news-placeholder4.jpg"
                        alt="Award for Environmental Innovation"
                        width={500}
                        height={300}
                        className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                      />
                      <div className="absolute top-4 right-4 bg-purple-500 text-white text-xs px-2 py-1 rounded-md">
                        Award
                      </div>
                    </div>
                    <div className="p-6">
                      <div className="text-green-600 text-sm font-medium mb-2">
                        January 30, 2023
                      </div>
                      <h3 className="text-xl font-bold text-slate-800 mb-3">
                        Award for Environmental Innovation
                      </h3>
                      <p className="text-slate-600 mb-4">
                        EcoWaste has been recognized with the prestigious
                        Environmental Innovation Award for our contribution to
                        sustainable urban development.
                      </p>
                      <Link
                        href="#"
                        className="text-green-500 font-medium hover:text-green-600 transition-colors inline-flex items-center"
                      >
                        Read more
                        <svg
                          className="w-4 h-4 ml-1"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M14 5l7 7m0 0l-7 7m7-7H3"
                          ></path>
                        </svg>
                      </Link>
                    </div>
                  </div>

                  {/* News Card 5 */}
                  <div
                    className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
                    data-scroll
                    data-scroll-speed="0.8"
                  >
                    <div className="h-56 overflow-hidden relative">
                      <Image
                        src="/news-placeholder5.jpg"
                        alt="Recycling Rate Improvements"
                        width={500}
                        height={300}
                        className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                      />
                      <div className="absolute top-4 right-4 bg-amber-500 text-white text-xs px-2 py-1 rounded-md">
                        Case Study
                      </div>
                    </div>
                    <div className="p-6">
                      <div className="text-green-600 text-sm font-medium mb-2">
                        January 15, 2023
                      </div>
                      <h3 className="text-xl font-bold text-slate-800 mb-3">
                        Recycling Rate Improvements
                      </h3>
                      <p className="text-slate-600 mb-4">
                        Our latest case study reveals how cities using EcoWaste
                        solutions have seen a 40% improvement in recycling rates
                        within just six months.
                      </p>
                      <Link
                        href="#"
                        className="text-green-500 font-medium hover:text-green-600 transition-colors inline-flex items-center"
                      >
                        Read more
                        <svg
                          className="w-4 h-4 ml-1"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M14 5l7 7m0 0l-7 7m7-7H3"
                          ></path>
                        </svg>
                      </Link>
                    </div>
                  </div>

                  {/* News Card 6 */}
                  <div
                    className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
                    data-scroll
                    data-scroll-speed="0.7"
                  >
                    <div className="h-56 overflow-hidden relative">
                      <Image
                        src="/news-placeholder6.jpg"
                        alt="New AI Waste Identification Technology"
                        width={500}
                        height={300}
                        className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                      />
                      <div className="absolute top-4 right-4 bg-red-500 text-white text-xs px-2 py-1 rounded-md">
                        Technology
                      </div>
                    </div>
                    <div className="p-6">
                      <div className="text-green-600 text-sm font-medium mb-2">
                        December 10, 2022
                      </div>
                      <h3 className="text-xl font-bold text-slate-800 mb-3">
                        New AI Waste Identification Technology
                      </h3>
                      <p className="text-slate-600 mb-4">
                        Our R&D team has developed a breakthrough AI system that
                        can identify and sort waste with over 95% accuracy,
                        revolutionizing recycling processes.
                      </p>
                      <Link
                        href="#"
                        className="text-green-500 font-medium hover:text-green-600 transition-colors inline-flex items-center"
                      >
                        Read more
                        <svg
                          className="w-4 h-4 ml-1"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M14 5l7 7m0 0l-7 7m7-7H3"
                          ></path>
                        </svg>
                      </Link>
                    </div>
                  </div>
                </div>

                {/* View All News Button */}
                <div className="text-center mt-12">
                  <Link
                    href="#"
                    className="bg-white hover:bg-green-50 text-green-500 border border-green-300 px-8 py-3 rounded-md transition-all shadow-sm hover:shadow-md inline-flex items-center"
                  >
                    View All News
                    <svg
                      className="w-4 h-4 ml-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M9 5l7 7-7 7"
                      ></path>
                    </svg>
                  </Link>
                </div>
              </div>

              {/* Main Modules Tab Content */}
              <div
                className={`transition-all duration-500 ${
                  activeTab === "main-modules"
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 absolute inset-0 translate-y-8 pointer-events-none"
                }`}
              >
                <h2 className="text-3xl font-bold text-center text-slate-800 mb-12">
                  Main Modules
                </h2>

                <div className="grid md:grid-cols-3 gap-8">
                  {/* Module 1 */}
                  <div
                    className="p-6 bg-white/80 backdrop-blur-sm rounded-xl shadow-sm hover:shadow-md transition-shadow group"
                    data-scroll
                    data-scroll-speed="1"
                    data-scroll-delay="0.1"
                  >
                    <div className="bg-teal-500 text-white p-4 rounded-lg inline-block mb-4 relative group-hover:shadow-lg transition-all">
                      <div className="absolute -inset-1 bg-teal-300 rounded-full opacity-30 blur-md -z-10 group-hover:opacity-50 transition-opacity"></div>
                      <MapPin className="h-6 w-6" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-800 mb-3">
                      Smart Bin Locator
                    </h3>
                    <p className="text-slate-600">
                      A real-time, dynamic and flexible waste bin locator that
                      helps users find the nearest waste dump location and its
                      status (full or empty) with an interactive map view.
                    </p>
                  </div>

                  {/* Module 2 */}
                  <div
                    className="p-6 bg-white/80 backdrop-blur-sm rounded-xl shadow-sm hover:shadow-md transition-shadow group"
                    data-scroll
                    data-scroll-speed="1"
                    data-scroll-delay="0.2"
                  >
                    <div className="bg-teal-500 text-white p-4 rounded-lg inline-block mb-4 relative group-hover:shadow-lg transition-all">
                      <div className="absolute -inset-1 bg-teal-300 rounded-full opacity-30 blur-md -z-10 group-hover:opacity-50 transition-opacity"></div>
                      <Bell className="h-6 w-6" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-800 mb-3">
                      Smart Notifications
                    </h3>
                    <p className="text-slate-600">
                      Improved - automated solutions to notify municipal
                      departments about bin status, increasing efficiency and
                      maximizing cleanliness in urban areas.
                    </p>
                  </div>

                  {/* Module 3 */}
                  <div
                    className="p-6 bg-white/80 backdrop-blur-sm rounded-xl shadow-sm hover:shadow-md transition-shadow group"
                    data-scroll
                    data-scroll-speed="1"
                    data-scroll-delay="0.3"
                  >
                    <div className="bg-teal-500 text-white p-4 rounded-lg inline-block mb-4 relative group-hover:shadow-lg transition-all">
                      <div className="absolute -inset-1 bg-teal-300 rounded-full opacity-30 blur-md -z-10 group-hover:opacity-50 transition-opacity"></div>
                      <BarChart3 className="h-6 w-6" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-800 mb-3">
                      Waste Analytics
                    </h3>
                    <p className="text-slate-600">
                      Real-time data analysis, which supports municipalities in
                      planning, helps optimize waste collection routes, and
                      achieves sustainability goals through data-driven
                      decisions.
                    </p>
                  </div>

                  {/* Module 4 */}
                  <div
                    className="p-6 bg-white/80 backdrop-blur-sm rounded-xl shadow-sm hover:shadow-md transition-shadow group"
                    data-scroll
                    data-scroll-speed="1"
                    data-scroll-delay="0.4"
                  >
                    <div className="bg-teal-500 text-white p-4 rounded-lg inline-block mb-4 relative group-hover:shadow-lg transition-all">
                      <div className="absolute -inset-1 bg-teal-300 rounded-full opacity-30 blur-md -z-10 group-hover:opacity-50 transition-opacity"></div>
                      <Award className="h-6 w-6" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-800 mb-3">
                      Reward System
                    </h3>
                    <p className="text-slate-600">
                      Incentivize proper waste disposal with customizable
                      rewards, early participation bonuses, and special
                      promotions to encourage recycling and sustainable
                      practices.
                    </p>
                  </div>

                  {/* Module 5 */}
                  <div
                    className="p-6 bg-white/80 backdrop-blur-sm rounded-xl shadow-sm hover:shadow-md transition-shadow group"
                    data-scroll
                    data-scroll-speed="1"
                    data-scroll-delay="0.5"
                  >
                    <div className="bg-teal-500 text-white p-4 rounded-lg inline-block mb-4 relative group-hover:shadow-lg transition-all">
                      <div className="absolute -inset-1 bg-teal-300 rounded-full opacity-30 blur-md -z-10 group-hover:opacity-50 transition-opacity"></div>
                      <Recycle className="h-6 w-6" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-800 mb-3">
                      Waste Categorization
                    </h3>
                    <p className="text-slate-600">
                      Comprehensive database where users can categorize waste
                      like wet, dry or e-waste, centralizing waste management in
                      one place, saving time and energy.
                    </p>
                  </div>

                  {/* Module 6 */}
                  <div
                    className="p-6 bg-white/80 backdrop-blur-sm rounded-xl shadow-sm hover:shadow-md transition-shadow group"
                    data-scroll
                    data-scroll-speed="1"
                    data-scroll-delay="0.6"
                  >
                    <div className="bg-teal-500 text-white p-4 rounded-lg inline-block mb-4 relative group-hover:shadow-lg transition-all">
                      <div className="absolute -inset-1 bg-teal-300 rounded-full opacity-30 blur-md -z-10 group-hover:opacity-50 transition-opacity"></div>
                      <Calendar className="h-6 w-6" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-800 mb-3">
                      Pickup Scheduling
                    </h3>
                    <p className="text-slate-600">
                      Immediate and secure scheduling of waste pickups 24 hours
                      a day, allowing residents to conveniently arrange for
                      waste collection.
                    </p>
                  </div>
                </div>
              </div>

              {/* Extra Features Tab Content */}
              <div
                className={`transition-all duration-500 ${
                  activeTab === "extra-features"
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 absolute inset-0 translate-y-8 pointer-events-none"
                }`}
              >
                <h2 className="text-3xl font-bold text-center text-slate-800 mb-12">
                  Extra Features
                </h2>

                <div className="text-center text-slate-600">
                  <p>Extra features content will be displayed here.</p>
                </div>
              </div>

              {/* Partners Tab Content */}
              <div
                className={`transition-all duration-500 ${
                  activeTab === "partners"
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 absolute inset-0 translate-y-8 pointer-events-none"
                }`}
              >
                <h2 className="text-3xl font-bold text-center text-slate-800 mb-12">
                  Our Partners
                </h2>

                {/* Add your partners content here */}
                <div className="text-center text-slate-600">
                  <p>Partners content will be displayed here.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        {/* <section
          className="py-16 bg-white relative overflow-hidden"
          data-scroll-section
        >
          <div className="absolute top-10 left-1/4 w-60 h-60 bg-green-100 rounded-full opacity-40 filter blur-3xl"></div>
          <div className="absolute bottom-20 right-1/3 w-40 h-40 bg-teal-100 rounded-full opacity-50 filter blur-2xl"></div>

          <div className="container mx-auto px-4 relative z-10">
            <div className="grid md:grid-cols-3 gap-8">
              <div
                className="p-6 bg-white/80 backdrop-blur-sm rounded-xl shadow-sm hover:shadow-md transition-shadow group"
                data-scroll
                data-scroll-speed="1"
                data-scroll-delay="0.1"
              >
                <div className="bg-teal-500 text-white p-4 rounded-lg inline-block mb-4 relative group-hover:shadow-lg transition-all">
                  <div className="absolute -inset-1 bg-teal-300 rounded-full opacity-30 blur-md -z-10 group-hover:opacity-50 transition-opacity"></div>
                  <MapPin className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-3">
                  Smart Bin Locator
                </h3>
                <p className="text-slate-600">
                  A real-time, dynamic and flexible waste bin locator that helps
                  users find the nearest waste dump location and its status
                  (full or empty) with an interactive map view.
                </p>
              </div>

              <div
                className="p-6 bg-white/80 backdrop-blur-sm rounded-xl shadow-sm hover:shadow-md transition-shadow group"
                data-scroll
                data-scroll-speed="1"
                data-scroll-delay="0.2"
              >
                <div className="bg-teal-500 text-white p-4 rounded-lg inline-block mb-4 relative group-hover:shadow-lg transition-all">
                  <div className="absolute -inset-1 bg-teal-300 rounded-full opacity-30 blur-md -z-10 group-hover:opacity-50 transition-opacity"></div>
                  <Bell className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-3">
                  Smart Notifications
                </h3>
                <p className="text-slate-600">
                  Improved - automated solutions to notify municipal departments
                  about bin status, increasing efficiency and maximizing
                  cleanliness in urban areas.
                </p>
              </div>

              <div
                className="p-6 bg-white/80 backdrop-blur-sm rounded-xl shadow-sm hover:shadow-md transition-shadow group"
                data-scroll
                data-scroll-speed="1"
                data-scroll-delay="0.3"
              >
                <div className="bg-teal-500 text-white p-4 rounded-lg inline-block mb-4 relative group-hover:shadow-lg transition-all">
                  <div className="absolute -inset-1 bg-teal-300 rounded-full opacity-30 blur-md -z-10 group-hover:opacity-50 transition-opacity"></div>
                  <BarChart3 className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-3">
                  Waste Analytics
                </h3>
                <p className="text-slate-600">
                  Real-time data analysis, which supports municipalities in
                  planning, helps optimize waste collection routes, and achieves
                  sustainability goals through data-driven decisions.
                </p>
              </div>

              <div
                className="p-6 bg-white/80 backdrop-blur-sm rounded-xl shadow-sm hover:shadow-md transition-shadow group"
                data-scroll
                data-scroll-speed="1"
                data-scroll-delay="0.4"
              >
                <div className="bg-teal-500 text-white p-4 rounded-lg inline-block mb-4 relative group-hover:shadow-lg transition-all">
                  <div className="absolute -inset-1 bg-teal-300 rounded-full opacity-30 blur-md -z-10 group-hover:opacity-50 transition-opacity"></div>
                  <Award className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-3">
                  Reward System
                </h3>
                <p className="text-slate-600">
                  Incentivize proper waste disposal with customizable rewards,
                  early participation bonuses, and special promotions to
                  encourage recycling and sustainable practices.
                </p>
              </div>

              <div
                className="p-6 bg-white/80 backdrop-blur-sm rounded-xl shadow-sm hover:shadow-md transition-shadow group"
                data-scroll
                data-scroll-speed="1"
                data-scroll-delay="0.5"
              >
                <div className="bg-teal-500 text-white p-4 rounded-lg inline-block mb-4 relative group-hover:shadow-lg transition-all">
                  <div className="absolute -inset-1 bg-teal-300 rounded-full opacity-30 blur-md -z-10 group-hover:opacity-50 transition-opacity"></div>
                  <Recycle className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-3">
                  Waste Categorization
                </h3>
                <p className="text-slate-600">
                  Comprehensive database where users can categorize waste like
                  wet, dry or e-waste, centralizing waste management in one
                  place, saving time and energy.
                </p>
              </div>

              <div
                className="p-6 bg-white/80 backdrop-blur-sm rounded-xl shadow-sm hover:shadow-md transition-shadow group"
                data-scroll
                data-scroll-speed="1"
                data-scroll-delay="0.6"
              >
                <div className="bg-teal-500  text-white p-4 rounded-lg inline-block mb-4 relative group-hover:shadow-lg transition-all">
                  <div className="absolute -inset-1 bg-teal-300 rounded-full opacity-30 blur-md -z-10 group-hover:opacity-50 transition-opacity"></div>
                  <Calendar className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-3">
                  Pickup Scheduling
                </h3>
                <p className="text-slate-600">
                  Immediate and secure scheduling of waste pickups 24 hours a
                  day, allowing residents to conveniently arrange for waste
                  collection.
                </p>
              </div>
            </div>
          </div>
        </section> */}

        {/* Booking Process Section */}
        <section
          className="py-16 bg-[#EFF4EF] relative overflow-hidden"
          data-scroll-section
        >
          {/* Background gradient circles */}
          <div className="absolute top-1/4 left-10 w-72 h-72 bg-green-200 rounded-full opacity-30 filter blur-3xl"></div>
          <div className="absolute -bottom-20 right-1/4 w-80 h-80 bg-teal-200 rounded-full opacity-20 filter blur-3xl"></div>

          <div className="container mx-auto px-4 relative z-10">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div
                className="bg-white/80 backdrop-blur-sm p-6 rounded-xl shadow-lg relative"
                data-scroll
                data-scroll-speed="1"
                data-scroll-delay="0.1"
              >
                <div className="absolute -top-5 -left-5 w-20 h-20 bg-green-300 rounded-full opacity-40 filter blur-xl"></div>
                <div className="absolute -bottom-3 -right-3 w-16 h-16 bg-teal-300 rounded-full opacity-40 filter blur-xl"></div>
                <div className="relative z-10">
                  <Image
                    src="/Screenshot 2025-04-05 023157.png"
                    width={700}
                    height={500}
                    alt="Waste management app interface"
                    className="rounded-lg"
                  />
                </div>
              </div>
              <div
                className="space-y-8"
                data-scroll
                data-scroll-speed="1"
                data-scroll-delay="0.2"
              >
                <h2 className="text-3xl font-bold text-slate-800">
                  Waste Management in 5 steps
                </h2>

                <div className="space-y-4">
                  <p className="text-slate-600">
                    Request a pickup - Select waste type / Category selection
                    (real time available bins and location calculation based on
                    the given data) - Extra services / Upsell - Data entry
                    (selection of payment methods / online payment, newsletter
                    subscription option) - Confirmation
                  </p>
                </div>

                <div className="space-y-2">
                  <h3 className="text-2xl font-bold text-slate-800">
                    Issue Reporting
                  </h3>
                  <p className="text-slate-600">
                    Enhance community cleanliness by sending personalized,
                    automated reporting for waste accumulation at unspecified
                    locations. Reports can be customized, and tracking forms can
                    be linked to them.
                  </p>
                </div>

                <div className="space-y-2">
                  <h3 className="text-2xl font-bold text-slate-800">
                    Recycling Tracking
                  </h3>
                  <p className="text-slate-600">
                    Online tracking and redemption of recycling efforts based on
                    an unlimited number of CATEGORIES and/or MATERIALS can be
                    uploaded to the system in the online process!
                  </p>
                </div>

                <div className="space-y-2">
                  <h3 className="text-2xl font-bold text-slate-800">
                    IoT Integration
                  </h3>
                  <p className="text-slate-600">
                    • Smart sensors that monitor bin fill levels
                    <br />• Real-time notifications to waste management teams
                    <br />• Predictive analytics for optimized collection routes
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section
          className="py-16 bg-white/90 backdrop-blur-sm border-t relative"
          data-scroll-section
        >
          <div className="absolute inset-0 bg-gradient-to-b from-white via-green-50/30 to-white"></div>
          <div className="container mx-auto px-4 text-center relative z-10">
            <div className="max-w-2xl mx-auto">
              <h2 className="text-3xl font-bold text-slate-800 mb-6">
                Experience the workflow the best waste management teams love
              </h2>
              <p className="text-slate-600 mb-8">
                Let your community focus on sustainability instead of managing
                waste with our automated smart waste management system.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/login"
                  className="bg-green-500 hover:bg-green-600 text-white px-8 py-3 rounded-md transition-all shadow-md hover:shadow-lg transform hover:-translate-y-1"
                >
                  Sign Up Now
                </Link>
                <Link
                  href="#"
                  className="bg-white hover:bg-green-50 text-slate-800 border border-slate-300 px-8 py-3 rounded-md transition-all shadow-sm hover:shadow-md transform hover:-translate-y-1"
                >
                  Learn More
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Additional Features Section */}
        <section
          className="py-16 bg-[#EFF4EF] relative overflow-hidden"
          data-scroll-section
        >
          {/* Background gradient circles */}
          <div className="absolute top-20 left-1/3 w-64 h-64 bg-green-200 rounded-full opacity-30 filter blur-3xl"></div>
          <div className="absolute bottom-10 right-20 w-48 h-48 bg-teal-300 rounded-full opacity-20 filter blur-2xl"></div>

          <div className="container mx-auto px-4 relative z-10">
            <h2 className="text-3xl font-bold text-center text-slate-800 mb-12">
              Additional Features
            </h2>
            <div className="grid md:grid-cols-2 gap-8">
              <div
                className="bg-white/80 backdrop-blur-sm p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow"
                data-scroll
                data-scroll-speed="1"
                data-scroll-delay="0.1"
              >
                <div className="flex items-start gap-4">
                  <div className="bg-teal-500 text-white p-3 rounded-lg relative group-hover:shadow-lg transition-all">
                    <div className="absolute -inset-1 bg-teal-300 rounded-full opacity-30 blur-md -z-10"></div>
                    <BarChart3 className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-800 mb-2">
                      Data Analytics
                    </h3>
                    <p className="text-slate-600">
                      Use data analytics to optimize waste collection routes and
                      reduce operational costs
                    </p>
                  </div>
                </div>
              </div>

              <div
                className="bg-white/80 backdrop-blur-sm p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow"
                data-scroll
                data-scroll-speed="1"
                data-scroll-delay="0.2"
              >
                <div className="flex items-start gap-4">
                  <div className="bg-teal-500 text-white p-3 rounded-lg relative group-hover:shadow-lg transition-all">
                    <div className="absolute -inset-1 bg-teal-300 rounded-full opacity-30 blur-md -z-10"></div>
                    <Recycle className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-800 mb-2">
                      Smart Sensors
                    </h3>
                    <p className="text-slate-600">
                      IoT Sensors that will detect if incorrect waste is put in
                      specified containers
                    </p>
                  </div>
                </div>
              </div>

              <div
                className="bg-white/80 backdrop-blur-sm p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow"
                data-scroll
                data-scroll-speed="1"
                data-scroll-delay="0.3"
              >
                <div className="flex items-start gap-4">
                  <div className="bg-teal-500 text-white p-3 rounded-lg relative group-hover:shadow-lg transition-all">
                    <div className="absolute -inset-1 bg-teal-300 rounded-full opacity-30 blur-md -z-10"></div>
                    <Globe className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-800 mb-2">
                      Cross-platform Support
                    </h3>
                    <p className="text-slate-600">
                      Access the system from web, mobile, and wearable devices
                      for maximum convenience
                    </p>
                  </div>
                </div>
              </div>

              <div
                className="bg-white/80 backdrop-blur-sm p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow"
                data-scroll
                data-scroll-speed="1"
                data-scroll-delay="0.4"
              >
                <div className="flex items-start gap-4">
                  <div className="bg-teal-500 text-white p-3 rounded-lg relative group-hover:shadow-lg transition-all">
                    <div className="absolute -inset-1 bg-teal-300 rounded-full opacity-30 blur-md -z-10"></div>
                    <Languages className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-800 mb-2">
                      Multi-language Support
                    </h3>
                    <p className="text-slate-600">
                      Accessible to diverse communities with support for
                      multiple languages
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Birth of System Section */}
        <section
          className="py-16 bg-white/90 backdrop-blur-sm relative"
          data-scroll-section
        >
          <div className="absolute inset-0 bg-gradient-to-r from-green-50/30 via-white to-green-50/30"></div>
          <div className="absolute top-10 left-1/2 transform -translate-x-1/2 w-1/2 h-40 bg-green-200 rounded-full opacity-20 filter blur-3xl"></div>

          <div className="container mx-auto px-4 text-center relative z-10">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-800 mb-8">
              (Re) birth of a brilliant waste management system
            </h2>
            <div className="max-w-3xl mx-auto">
              <p className="text-slate-600 text-lg">
                Our sustainable waste management system transforms urban areas
                by providing smart solutions to track, monitor, and optimize
                waste collection. Join us in creating cleaner, more sustainable
                cities.
              </p>
            </div>
          </div>
        </section>
      </main>

      <footer
        className="bg-slate-800 text-white py-12 relative"
        data-scroll-section
      >
        <div className="absolute inset-0 bg-gradient-to-b from-slate-800 to-slate-900"></div>
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-green-400/30 to-transparent"></div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4">ECOWASTE</h3>
              <p className="text-slate-300">
                Smart waste management solutions for sustainable urban
                environments.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-bold mb-4">Quick Links</h3>
              <ul className="space-y-2">
                <li>
                  <Link
                    href="#"
                    className="text-slate-300 hover:text-green-400 transition-colors"
                  >
                    Home
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="text-slate-300 hover:text-green-400 transition-colors"
                  >
                    About Us
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="text-slate-300 hover:text-green-400 transition-colors"
                  >
                    Solutions
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="text-slate-300 hover:text-green-400 transition-colors"
                  >
                    Contact
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-bold mb-4">Features</h3>
              <ul className="space-y-2">
                <li>
                  <Link
                    href="#"
                    className="text-slate-300 hover:text-green-400 transition-colors"
                  >
                    Smart Bin Locator
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="text-slate-300 hover:text-green-400 transition-colors"
                  >
                    Waste Analytics
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="text-slate-300 hover:text-green-400 transition-colors"
                  >
                    Reward System
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="text-slate-300 hover:text-green-400 transition-colors"
                  >
                    IoT Integration
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-bold mb-4">Contact Us</h3>
              <address className="not-italic text-slate-300">
                <p>123 Green Street</p>
                <p>Eco City, EC 12345</p>
                <p className="mt-2">info@ecowaste.com</p>
                <p>+1 (555) 123-4567</p>
              </address>
            </div>
          </div>
          <div className="border-t border-slate-700 mt-8 pt-8 text-center text-slate-400">
            <p>
              &copy; {new Date().getFullYear()} ECOWASTE. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
