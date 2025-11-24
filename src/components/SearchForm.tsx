"use client";

import { useState, FormEvent } from "react";
import { FlightOffer } from "@/lib/types/flights";

type SearchResponse = {
  results: FlightOffer[];
  explanation: string | null;
};

export default function SearchForm() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const form = e.currentTarget;
    const origin = (form.elements.namedItem("origin") as HTMLInputElement).value.trim().toUpperCase();
    const destination = (form.elements.namedItem("destination") as HTMLInputElement).value.trim().toUpperCase();
    const departDate = (form.elements.namedItem("departDate") as HTMLInputElement).value;
    const returnDate = (form.elements.namedItem("returnDate") as HTMLInputElement).value || null;
    const passengers = Number((form.elements.namedItem("passengers") as HTMLInputElement).value);
    const cabin = (form.elements.namedItem("cabin") as HTMLSelectElement).value;

    // Client-side validation
    if (!origin || !destination) {
      setError("Please enter both origin and destination airport codes");
      setLoading(false);
      return;
    }

    if (!/^[A-Z]{3}$/.test(origin) || !/^[A-Z]{3}$/.test(destination)) {
      setError("Origin and destination must be valid 3-letter IATA codes (e.g., JFK, LAX)");
      setLoading(false);
      return;
    }

    if (!departDate) {
      setError("Please select a departure date");
      setLoading(false);
      return;
    }

    const body = {
      origin,
      destination,
      departDate,
      returnDate,
      passengers,
      cabin
    };

    try {
      const res = await fetch("/api/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });

      if (!res.ok) {
        const errorData = await res.json();
        setError(errorData.error || "Search failed. Please try again.");
        return;
      }

      const data: SearchResponse = await res.json();
      
      window.dispatchEvent(
        new CustomEvent<SearchResponse>("flight-results", { detail: data })
      );
    } catch (error) {
      setError("Network error. Please try again.");
      console.error("Search failed:", error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4 mb-10">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div>
          <input 
            name="origin" 
            placeholder="Origin (e.g., JFK)" 
            className="border p-2 w-full"
            maxLength={3}
            style={{ textTransform: "uppercase" }}
          />
          <p className="text-xs text-gray-500 mt-1">3-letter IATA code</p>
        </div>
        <div>
          <input 
            name="destination" 
            placeholder="Destination (e.g., LAX)" 
            className="border p-2 w-full"
            maxLength={3}
            style={{ textTransform: "uppercase" }}
          />
          <p className="text-xs text-gray-500 mt-1">3-letter IATA code</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Departure Date</label>
          <input type="date" name="departDate" className="border p-2 w-full" required />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Return Date (optional)</label>
          <input type="date" name="returnDate" className="border p-2 w-full" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Passengers</label>
          <input name="passengers" type="number" defaultValue={1} min={1} className="border p-2 w-full" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Cabin Class</label>
          <select name="cabin" className="border p-2 w-full">
            <option value="ECONOMY">Economy</option>
            <option value="PREMIUM_ECONOMY">Premium Economy</option>
            <option value="BUSINESS">Business</option>
            <option value="FIRST">First</option>
          </select>
        </div>
      </div>

      <button 
        type="submit"
        disabled={loading}
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-blue-300 disabled:cursor-not-allowed w-full"
      >
        {loading ? "Searching..." : "Search Flights"}
      </button>
    </form>
  );
}
