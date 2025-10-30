"use client";

import { useState } from "react";

interface DirectionsResponse {
  routes?: Array<{
    summary: string;
    legs: Array<{ distance: string; duration: string }>;
  }>;
  error?: string;
}

export default function Map() {
  const [directions, setDirections] = useState<DirectionsResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [origin, setOrigin] = useState("Mumbai");
  const [destination, setDestination] = useState("Pune");

  const fetchDirections = async () => {
    setLoading(true);
    setError(null);

    try {
      // Add query parameters to the request
      const response = await fetch(
        `/api/getDirections?origin=${encodeURIComponent(
          origin
        )}&destination=${encodeURIComponent(destination)}`
      );

      // Check if the response is OK before parsing JSON
      if (!response.ok) {
        const errorText = await response.text();
        console.error("API error response:", errorText);
        throw new Error(
          `API returned ${response.status}: ${response.statusText}`
        );
      }

      // Safe JSON parsing with error handling
      try {
        const data: DirectionsResponse = await response.json();
        setDirections(data);
      } catch (jsonError) {
        console.error("JSON parsing error:", jsonError);
        throw new Error(
          "Could not parse API response as JSON. The server might be returning HTML instead of JSON."
        );
      }
    } catch (error) {
      console.error("Error fetching directions:", error);
      setError(
        error instanceof Error ? error.message : "Unknown error occurred"
      );
      setDirections(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md p-4 bg-white shadow-md rounded-lg">
      <div className="mb-4 space-y-3">
        <div>
          <label
            htmlFor="origin"
            className="block text-sm font-medium text-gray-700"
          >
            Origin
          </label>
          <input
            id="origin"
            type="text"
            value={origin}
            onChange={(e) => setOrigin(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          />
        </div>

        <div>
          <label
            htmlFor="destination"
            className="block text-sm font-medium text-gray-700"
          >
            Destination
          </label>
          <input
            id="destination"
            type="text"
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          />
        </div>
      </div>

      <button
        onClick={fetchDirections}
        disabled={loading}
        className={`w-full p-2 text-white rounded ${
          loading ? "bg-blue-300" : "bg-blue-500 hover:bg-blue-600"
        }`}
      >
        {loading ? "Loading..." : "Get Directions"}
      </button>

      {error && (
        <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-md">
          <p className="font-medium">Error:</p>
          <p>{error}</p>
        </div>
      )}

      {directions && !error && (
        <div className="mt-4">
          {directions.error ? (
            <div className="p-3 bg-yellow-100 text-yellow-700 rounded-md">
              <p>API Error: {directions.error}</p>
            </div>
          ) : directions.routes && directions.routes.length > 0 ? (
            <div className="p-3 bg-gray-100 rounded-md">
              <h3 className="font-medium text-lg">Route Summary</h3>
              <p className="mt-1">{directions.routes[0].summary}</p>

              {directions.routes[0].legs.map((leg, i) => (
                <div key={i} className="mt-2 border-t border-gray-300 pt-2">
                  <p>
                    <span className="font-medium">Distance:</span>{" "}
                    {leg.distance}
                  </p>
                  <p>
                    <span className="font-medium">Duration:</span>{" "}
                    {leg.duration}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="p-3 bg-gray-100 rounded-md">No routes found.</p>
          )}
        </div>
      )}
    </div>
  );
}
