"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  MapPin,
  Loader2,
  AlertCircle,
  Navigation,
  Clock,
  ArrowRight,
  Plus,
  X,
} from "lucide-react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
  Polyline,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Create icons only on client side
let redPinIcon: L.Icon;
let greenPinIcon: L.Icon;
let bluePinIcon: L.Icon;

if (typeof window !== "undefined") {
  // Red pin icon configuration
  redPinIcon = new L.Icon({
    iconUrl:
      "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png",
    shadowUrl:
      "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
  });

  // Green pin icon for user location
  greenPinIcon = new L.Icon({
    iconUrl:
      "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png",
    shadowUrl:
      "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
  });

  // Blue pin icon for intermediate stops
  bluePinIcon = new L.Icon({
    iconUrl:
      "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png",
    shadowUrl:
      "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
  });
}

interface Location {
  latitude: number;
  longitude: number;
  placeName: string;
}

interface WasteDump {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  status: "full" | "empty";
  capacity: number;
  lastUpdated: string;
}

interface RouteStop {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
}

interface Route {
  summary: string;
  distance: string;
  duration: string;
  coordinates: [number, number][];
}

// Component to handle map view changes
function ChangeView({ center }: { center: [number, number] }) {
  const map = useMap();
  map.setView(center, 12);
  return null;
}

// Component to calculate and display routes
function RouteDisplayer({
  userLocation,
  selectedDump,
  intermediateStops,
  setRoute,
  setLoadingRoute,
  setRouteError,
}: {
  userLocation: Location | null;
  selectedDump: WasteDump | null;
  intermediateStops: RouteStop[];
  setRoute: (route: Route | null) => void;
  setLoadingRoute: (loading: boolean) => void;
  setRouteError: (error: string | null) => void;
}) {
  const map = useMap();
  const [routeCoordinates, setRouteCoordinates] = useState<[number, number][]>(
    []
  );

  useEffect(() => {
    if (!userLocation || !selectedDump || !map) {
      return;
    }

    setLoadingRoute(true);
    setRouteError(null);
    setRouteCoordinates([]);

    // Calculate route using OSRM service
    const calculateRoute = async () => {
      try {
        // Build coordinates string with all waypoints in order
        const coordinatesArray = [
          `${userLocation.longitude},${userLocation.latitude}`, // Start with user location
          // Add all intermediate stops in between
          ...intermediateStops.map(
            (stop) => `${stop.longitude},${stop.latitude}`
          ),
          `${selectedDump.longitude},${selectedDump.latitude}`, // End with selected waste dump
        ];

        // OSRM public API endpoint with all waypoints
        const waypointsString = coordinatesArray.join(";");
        const url = `https://router.project-osrm.org/route/v1/driving/${waypointsString}?overview=full&geometries=geojson`;

        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`OSRM API returned status ${response.status}`);
        }

        const data = await response.json();

        if (data.code !== "Ok" || !data.routes || data.routes.length === 0) {
          throw new Error("No route found");
        }

        const route = data.routes[0];

        // Extract route coordinates - OSRM returns them as [longitude, latitude]
        // We need to swap them for Leaflet which uses [latitude, longitude]
        const coordinates: [number, number][] = route.geometry.coordinates.map(
          (coord: [number, number]) => [coord[1], coord[0]]
        );

        setRouteCoordinates(coordinates);

        // Format distance (meters to km)
        const distance = route.distance;
        const formattedDistance =
          distance > 1000
            ? `${(distance / 1000).toFixed(1)} km`
            : `${Math.round(distance)} m`;

        // Format duration (seconds to minutes/hours)
        const time = route.duration;
        let formattedTime;
        if (time > 3600) {
          formattedTime = `${Math.floor(time / 3600)} hr ${Math.floor(
            (time % 3600) / 60
          )} min`;
        } else if (time > 60) {
          formattedTime = `${Math.floor(time / 60)} min`;
        } else {
          formattedTime = `${Math.round(time)} sec`;
        }

        // Fit map to show the entire route
        if (coordinates.length > 0) {
          const bounds = L.latLngBounds(coordinates);
          map.fitBounds(bounds, { padding: [50, 50] });
        }

        // Create a summary that includes number of stops
        const stopCount = intermediateStops.length;
        const routeSummary =
          stopCount > 0
            ? `Fastest route with ${stopCount} additional stop${
                stopCount > 1 ? "s" : ""
              }`
            : "Fastest route";

        setRoute({
          summary: routeSummary,
          distance: formattedDistance,
          duration: formattedTime,
          coordinates,
        });
        setLoadingRoute(false);
      } catch (error) {
        console.error("Route calculation error:", error);
        setRouteError(
          error instanceof Error ? error.message : "Failed to calculate route"
        );
        setLoadingRoute(false);
      }
    };

    calculateRoute();

    return () => {
      setRouteCoordinates([]);
    };
  }, [
    userLocation,
    selectedDump,
    intermediateStops,
    map,
    setRoute,
    setLoadingRoute,
    setRouteError,
  ]);

  return routeCoordinates.length > 0 ? (
    <Polyline
      positions={routeCoordinates}
      color="#2e7d32"
      weight={5}
      opacity={0.7}
    />
  ) : null;
}

// Client-side only map component
function MapComponent({
  userLocation,
  wasteDumps,
  intermediateStops,
  selectedDump,
  loading,
  handleRouteSelection,
  addIntermediateStop,
  setRoute,
  setLoadingRoute,
  setRouteError,
}: {
  userLocation: Location | null;
  wasteDumps: WasteDump[];
  intermediateStops: RouteStop[];
  selectedDump: WasteDump | null;
  loading: boolean;
  handleRouteSelection: (dumpId: string) => void;
  addIntermediateStop: (dumpId: string) => void;
  setRoute: (route: Route | null) => void;
  setLoadingRoute: (loading: boolean) => void;
  setRouteError: (error: string | null) => void;
}) {
  if (typeof window === "undefined") {
    return (
      <div className="relative h-[500px] w-full flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-[#2e7d32] animate-spin mx-auto mb-2" />
          <p className="text-gray-600">Loading map...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-[500px] w-full">
      {loading ? (
        <div className="absolute inset-0 flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-[#2e7d32] animate-spin" />
        </div>
      ) : (
        <MapContainer
          center={[20.5937, 78.9629]}
          zoom={5}
          style={{ height: "100%", width: "100%" }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {userLocation && (
            <>
              <ChangeView
                center={[userLocation.latitude, userLocation.longitude]}
              />
              <Marker
                position={[userLocation.latitude, userLocation.longitude]}
                icon={greenPinIcon}
              >
                <Popup>Your Location</Popup>
              </Marker>
            </>
          )}

          {/* Show intermediate stops with blue markers */}
          {intermediateStops.map((stop) => (
            <Marker
              key={`stop-${stop.id}`}
              position={[stop.latitude, stop.longitude]}
              icon={bluePinIcon}
            >
              <Popup>
                <div className="p-2">
                  <h3 className="font-bold">{stop.name}</h3>
                  <p className="text-sm text-blue-600">Intermediate Stop</p>
                </div>
              </Popup>
            </Marker>
          ))}

          {wasteDumps.map((dump) => (
            <Marker
              key={dump.id}
              position={[dump.latitude, dump.longitude]}
              icon={redPinIcon}
            >
              <Popup>
                <div className="p-2">
                  <h3 className="font-bold">{dump.name}</h3>
                  <p>Status: {dump.status === "empty" ? "Empty" : "Full"}</p>
                  <p>Capacity: {dump.capacity}%</p>
                  <p>
                    Last Updated: {new Date(dump.lastUpdated).toLocaleString()}
                  </p>
                  <div className="flex flex-col space-y-2 mt-2">
                    <button
                      className="px-3 py-1 bg-[#2e7d32] text-white rounded-md text-sm"
                      onClick={() => handleRouteSelection(dump.id)}
                    >
                      Set as Destination
                    </button>
                    <button
                      className="px-3 py-1 bg-blue-500 text-white rounded-md text-sm flex items-center justify-center"
                      onClick={() => addIntermediateStop(dump.id)}
                    >
                      <Plus className="w-3 h-3 mr-1" /> Add as Stop
                    </button>
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}

          {/* Route displayer component */}
          {userLocation && selectedDump && (
            <RouteDisplayer
              userLocation={userLocation}
              selectedDump={selectedDump}
              intermediateStops={intermediateStops}
              setRoute={setRoute}
              setLoadingRoute={setLoadingRoute}
              setRouteError={setRouteError}
            />
          )}
        </MapContainer>
      )}
    </div>
  );
}

export default function WasteDepositsPage() {
  const [userLocation, setUserLocation] = useState<Location | null>(null);
  const [wasteDumps, setWasteDumps] = useState<WasteDump[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDump, setSelectedDump] = useState<WasteDump | null>(null);
  const [route, setRoute] = useState<Route | null>(null);
  const [loadingRoute, setLoadingRoute] = useState(false);
  const [routeError, setRouteError] = useState<string | null>(null);
  const [intermediateStops, setIntermediateStops] = useState<RouteStop[]>([]);
  const [showStopSelector, setShowStopSelector] = useState(false);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          try {
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
            );
            const data = await response.json();
            setUserLocation({
              latitude,
              longitude,
              placeName: data.display_name || "Unknown Location",
            });
          } catch (err) {
            setError("Could not fetch location details");
          }
        },
        (err) => {
          setError("Location access denied");
        }
      );
    } else {
      setError("Geolocation is not supported by your browser");
    }
  }, []);

  useEffect(() => {
    const fetchWasteDumps = async () => {
      try {
        // for API Call
        const mockDumps: WasteDump[] = [
          {
            id: "1",
            name: "Shivaji Nagar Waste Facility",
            latitude: 18.53,
            longitude: 73.855,
            status: "empty",
            capacity: 80,
            lastUpdated: "2024-03-20T10:00:00Z",
          },
          {
            id: "2",
            name: "Camp Area Recycling Center",
            latitude: 18.5186,
            longitude: 73.8441,
            status: "full",
            capacity: 60,
            lastUpdated: "2024-03-21T11:00:00Z",
          },
          {
            id: "3",
            name: "Sadashiv Peth Waste Management",
            latitude: 18.5234,
            longitude: 73.86,
            status: "empty",
            capacity: 75,
            lastUpdated: "2024-03-20T09:30:00Z",
          },
          {
            id: "4",
            name: "Kothrud Waste Facility",
            latitude: 18.5361,
            longitude: 73.8037,
            status: "full",
            capacity: 90,
            lastUpdated: "2024-03-22T08:45:00Z",
          },
          {
            id: "5",
            name: "Baner Recycling Center",
            latitude: 18.5816,
            longitude: 73.7418,
            status: "empty",
            capacity: 70,
            lastUpdated: "2024-03-19T14:20:00Z",
          },
          {
            id: "6",
            name: "Wakad Waste Management",
            latitude: 18.6285,
            longitude: 73.7773,
            status: "full",
            capacity: 85,
            lastUpdated: "2024-03-22T12:15:00Z",
          },
          {
            id: "7",
            name: "Hadapsar Waste Facility",
            latitude: 18.5196,
            longitude: 73.9451,
            status: "empty",
            capacity: 65,
            lastUpdated: "2024-03-20T16:00:00Z",
          },
          {
            id: "8",
            name: "Katraj Recycling Center",
            latitude: 18.4983,
            longitude: 73.8729,
            status: "full",
            capacity: 95,
            lastUpdated: "2024-03-21T10:30:00Z",
          },
          {
            id: "9",
            name: "Aundh Waste Management",
            latitude: 18.5724,
            longitude: 73.7893,
            status: "empty",
            capacity: 80,
            lastUpdated: "2024-03-22T09:00:00Z",
          },
          {
            id: "10",
            name: "Magarpatta Recycling Facility",
            latitude: 18.5503,
            longitude: 73.8901,
            status: "full",
            capacity: 100,
            lastUpdated: "2024-03-21T13:45:00Z",
          },
          {
            id: "11",
            name: "Mundhwa Waste Facility",
            latitude: 18.5313,
            longitude: 73.9063,
            status: "empty",
            capacity: 55,
            lastUpdated: "2024-03-19T11:00:00Z",
          },
          {
            id: "12",
            name: "Sinhagad Road Recycling Center",
            latitude: 18.4475,
            longitude: 73.8073,
            status: "full",
            capacity: 90,
            lastUpdated: "2024-03-22T07:30:00Z",
          },
          {
            id: "13",
            name: "Undri Waste Management",
            latitude: 18.6091,
            longitude: 73.7943,
            status: "empty",
            capacity: 60,
            lastUpdated: "2024-03-20T12:00:00Z",
          },
          {
            id: "14",
            name: "Shukrawar Peth Waste Facility",
            latitude: 18.5254,
            longitude: 73.8587,
            status: "full",
            capacity: 85,
            lastUpdated: "2024-03-21T15:15:00Z",
          },
          {
            id: "15",
            name: "Pimpri-Chinchwad Recycling Center",
            latitude: 18.6295,
            longitude: 73.7997,
            status: "empty",
            capacity: 75,
            lastUpdated: "2024-03-22T14:00:00Z",
          },
        ];

        setWasteDumps(mockDumps);
        setLoading(false);
      } catch (err) {
        setError("Failed to fetch waste dump locations");
        setLoading(false);
      }
    };

    fetchWasteDumps();
  }, []);

  const handleRouteSelection = (dumpId: string) => {
    if (!userLocation) {
      setRouteError("User location not available");
      return;
    }

    const selectedDump = wasteDumps.find((dump) => dump.id === dumpId);
    if (!selectedDump) {
      setRouteError("Selected waste dump not found");
      return;
    }

    setSelectedDump(selectedDump);
    setLoadingRoute(true);
    setRouteError(null);
    setRoute(null);
  };

  const addIntermediateStop = (dumpId: string) => {
    // If the dump is already selected as destination, show error
    if (selectedDump?.id === dumpId) {
      setRouteError("Cannot add final destination as intermediate stop");
      return;
    }

    // If dump is already in intermediate stops, show error
    if (intermediateStops.some((stop) => stop.id === dumpId)) {
      setRouteError("This location is already added as a stop");
      return;
    }

    const dump = wasteDumps.find((dump) => dump.id === dumpId);
    if (!dump) {
      setRouteError("Waste dump not found");
      return;
    }

    const newStop: RouteStop = {
      id: dump.id,
      name: dump.name,
      latitude: dump.latitude,
      longitude: dump.longitude,
    };

    setIntermediateStops([...intermediateStops, newStop]);
    setRouteError(null);

    // If route is already calculated, recalculate it with the new stop
    if (selectedDump) {
      setLoadingRoute(true);
      setRoute(null);
    }

    setShowStopSelector(false);
  };

  const removeIntermediateStop = (stopId: string) => {
    setIntermediateStops(
      intermediateStops.filter((stop) => stop.id !== stopId)
    );

    // If route is already calculated, recalculate it without the removed stop
    if (selectedDump) {
      setLoadingRoute(true);
      setRoute(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f8f8]">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-2xl shadow-lg overflow-hidden"
        >
          <div className="p-6">
            <h1 className="text-3xl font-bold text-[#2e7d32] mb-4">
              Find Waste Dump Locations
            </h1>
            {userLocation && (
              <div className="flex items-center space-x-2 text-[#4a4a4a] mb-4">
                <MapPin className="w-5 h-5 text-[#2e7d32]" />
                <span>{userLocation.placeName}</span>
              </div>
            )}
          </div>

          {/* Map Container */}
          <MapComponent
            userLocation={userLocation}
            wasteDumps={wasteDumps}
            intermediateStops={intermediateStops}
            selectedDump={selectedDump}
            loading={loading}
            handleRouteSelection={handleRouteSelection}
            addIntermediateStop={addIntermediateStop}
            setRoute={setRoute}
            setLoadingRoute={setLoadingRoute}
            setRouteError={setRouteError}
          />

          {/* Intermediate Stops Section */}
          {intermediateStops.length > 0 && (
            <div className="p-4 bg-blue-50 border-t border-blue-100">
              <h3 className="text-lg font-medium text-blue-700 mb-2">
                Intermediate Stops
              </h3>
              <div className="flex flex-wrap gap-2">
                {intermediateStops.map((stop) => (
                  <div
                    key={stop.id}
                    className="flex items-center bg-white rounded-lg px-3 py-2 shadow-sm border border-blue-100"
                  >
                    <MapPin className="w-4 h-4 text-blue-500 mr-2" />
                    <span className="text-sm font-medium">{stop.name}</span>
                    <button
                      onClick={() => removeIntermediateStop(stop.id)}
                      className="ml-2 text-gray-400 hover:text-red-500"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Route Details Section */}
          {selectedDump && (
            <div className="p-6 bg-[#f1f8e9] border-t border-[#e0e0e0]">
              <h2 className="text-xl font-bold text-[#2e7d32] mb-4">
                Route to {selectedDump.name}
              </h2>

              {loadingRoute ? (
                <div className="flex items-center space-x-2 text-[#4a4a4a]">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Calculating optimal route...</span>
                </div>
              ) : routeError ? (
                <div className="p-4 bg-red-100 text-red-600 rounded-lg flex items-center space-x-2">
                  <AlertCircle className="w-5 h-5" />
                  <span>{routeError}</span>
                </div>
              ) : route ? (
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-4 bg-white rounded-lg shadow-sm">
                    <div className="flex items-center space-x-4">
                      <div className="bg-[#e8f5e9] p-3 rounded-full">
                        <Navigation className="w-6 h-6 text-[#2e7d32]" />
                      </div>
                      <div>
                        <h3 className="font-medium text-[#4a4a4a]">
                          {route.summary}
                        </h3>
                        <p className="text-sm text-gray-500">
                          Optimized route using OpenStreetMap
                        </p>
                      </div>
                    </div>
                    <div className="flex space-x-6">
                      <div className="text-center">
                        <div className="flex items-center text-[#2e7d32] font-medium">
                          <Clock className="w-4 h-4 mr-1" />
                          {route.duration}
                        </div>
                        <p className="text-xs text-gray-500">Duration</p>
                      </div>
                      <div className="text-center">
                        <div className="text-[#2e7d32] font-medium">
                          {route.distance}
                        </div>
                        <p className="text-xs text-gray-500">Distance</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 rounded-full bg-green-500"></div>
                        <p className="text-[#4a4a4a]">Your Location</p>
                      </div>
                    </div>

                    {intermediateStops.length > 0 &&
                      intermediateStops.map((stop, index) => (
                        <div key={stop.id} className="flex items-center">
                          <ArrowRight className="w-5 h-5 text-gray-400 mx-4" />
                          <div className="flex-1">
                            <div className="flex items-center space-x-2">
                              <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                              <p className="text-[#4a4a4a]">{stop.name}</p>
                            </div>
                          </div>
                        </div>
                      ))}

                    <ArrowRight className="w-5 h-5 text-gray-400 mx-4" />
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 rounded-full bg-red-500"></div>
                        <p className="text-[#4a4a4a]">{selectedDump.name}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : null}

              {/* Add additional stop button */}
              <div className="mt-4">
                <button
                  onClick={() => setShowStopSelector(!showStopSelector)}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg flex items-center"
                >
                  {showStopSelector ? (
                    <>
                      <X className="w-4 h-4 mr-2" /> Cancel
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4 mr-2" /> Add Intermediate Stop
                    </>
                  )}
                </button>
              </div>

              {/* Stop selector */}
              {showStopSelector && (
                <div className="mt-4 p-4 bg-white rounded-lg border border-gray-200">
                  <h3 className="text-lg font-medium text-gray-800 mb-2">
                    Select a Stop
                  </h3>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {wasteDumps
                      .filter(
                        (dump) =>
                          dump.id !== selectedDump?.id &&
                          !intermediateStops.some((stop) => stop.id === dump.id)
                      )
                      .map((dump) => (
                        <button
                          key={`selector-${dump.id}`}
                          onClick={() => addIntermediateStop(dump.id)}
                          className="w-full py-2 px-3 text-left bg-gray-50 hover:bg-gray-100 rounded-md flex items-center"
                        >
                          <MapPin className="w-4 h-4 text-blue-500 mr-2" />
                          {dump.name}
                        </button>
                      ))}
                    {wasteDumps.filter(
                      (dump) =>
                        dump.id !== selectedDump?.id &&
                        !intermediateStops.some((stop) => stop.id === dump.id)
                    ).length === 0 && (
                      <p className="text-gray-500 italic">
                        No more locations available to add
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Waste nearby*/}
          <div className="p-6">
            <h2 className="text-xl font-bold text-[#2e7d32] mb-4">
              Nearby Waste Dumps
            </h2>
            <div className="space-y-4">
              {wasteDumps.map((dump) => (
                <motion.div
                  key={dump.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3 }}
                  className={`flex items-center justify-between p-4 rounded-lg ${
                    selectedDump?.id === dump.id
                      ? "bg-[#e8f5e9] border border-[#2e7d32]"
                      : intermediateStops.some((stop) => stop.id === dump.id)
                      ? "bg-blue-50 border border-blue-200"
                      : "bg-[#f8f8f8]"
                  }`}
                >
                  <div>
                    <h3 className="font-medium text-[#4a4a4a]">{dump.name}</h3>
                    <p className="text-sm text-gray-500">
                      Capacity: {dump.capacity}%
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div
                      className={`px-3 py-1 rounded-full text-sm font-medium ${
                        dump.status === "empty"
                          ? "bg-[#e8f5e9] text-[#2e7d32]"
                          : "bg-red-100 text-red-600"
                      }`}
                    >
                      {dump.status === "empty" ? "Empty" : "Full"}
                    </div>
                    <div className="flex space-x-1">
                      <button
                        onClick={() => handleRouteSelection(dump.id)}
                        className="px-3 py-1 bg-[#2e7d32] text-white rounded-md text-sm flex items-center"
                      >
                        <Navigation className="w-4 h-4 mr-1" /> Route
                      </button>
                      {selectedDump &&
                        selectedDump.id !== dump.id &&
                        !intermediateStops.some(
                          (stop) => stop.id === dump.id
                        ) && (
                          <button
                            onClick={() => addIntermediateStop(dump.id)}
                            className="px-3 py-1 bg-blue-500 text-white rounded-md text-sm flex items-center"
                          >
                            <Plus className="w-3 h-3 mr-1" /> Add Stop
                          </button>
                        )}
                      {intermediateStops.some(
                        (stop) => stop.id === dump.id
                      ) && (
                        <button
                          onClick={() => removeIntermediateStop(dump.id)}
                          className="px-3 py-1 bg-red-500 text-white rounded-md text-sm flex items-center"
                        >
                          <X className="w-3 h-3 mr-1" /> Remove
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {error && (
            <div className="p-4 bg-red-100 text-red-600 rounded-lg m-6 flex items-center space-x-2">
              <AlertCircle className="w-5 h-5" />
              <span>{error}</span>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
