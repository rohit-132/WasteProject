"use client";
import React, { useState } from "react";
import axios from "axios";

const OLA_API_KEY = "FQ6ye7xHgSSoGdHdKtOBXhcp5bqLx8xmK3CcTubL"; // Replace with your API Key

const OlaAutocomplete: React.FC = () => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchPlaces = async () => {
    if (!query) return;
    setLoading(true);
    setError("");

    try {
      const response = await axios.get(
        "https://api.olamaps.io/places/v1/autocomplete",
        {
          params: { input: query, api_key: OLA_API_KEY },
        }
      );

      if (response.data.status === "ok") {
        setResults(response.data.predictions);
      } else {
        setError("Failed to fetch places.");
      }
    } catch (err) {
      setError("Error fetching data.");
    }

    setLoading(false);
  };

  return (
    <div className="p-4">
      <h2 className="text-lg font-bold mb-2">Ola Maps Autocomplete</h2>
      <input
        type="text"
        placeholder="Search a location..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="border p-2 rounded w-full"
      />
      <button
        onClick={fetchPlaces}
        className="mt-2 bg-blue-500 text-white px-4 py-2 rounded"
      >
        Search
      </button>

      {loading && <p>Loading...</p>}
      {error && <p className="text-red-500">{error}</p>}

      <ul className="mt-4">
        {results.map((place, index) => (
          <li key={index} className="border-b py-2">
            <strong>{place.description}</strong> <br />
            <span>
              Lat: {place.geometry.location.lat}, Lng:{" "}
              {place.geometry.location.lng}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default OlaAutocomplete;
