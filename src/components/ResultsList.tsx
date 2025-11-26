"use client";

import { useState, useEffect } from "react";
import { FlightOffer } from "@/lib/types/flights";

type SearchResponse = {
  results: FlightOffer[];
  explanation: string | null;
};

type FlightResultsEvent = CustomEvent<SearchResponse>;

export default function ResultsList() {
  const [results, setResults] = useState<SearchResponse | null>(null);

  useEffect(() => {
    const handler = (e: Event) => {
      const customEvent = e as FlightResultsEvent;
      setResults(customEvent.detail);
    };
    window.addEventListener("flight-results", handler);
    return () => window.removeEventListener("flight-results", handler);
  }, []);

  if (!results || !results.results) return null;

  return (
    <div className="space-y-4">
      {results.explanation && (
        <p className="text-lg font-medium">{results.explanation}</p>
      )}

      {results.results.map((offer: FlightOffer) => (
        <div key={offer.id} className="p-4 border rounded">
          <p>
            <strong>{offer.price} {offer.currency}</strong> • {offer.stops} stops • {offer.totalDuration}
          </p>
          <a
            href={offer.bookingUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block mt-2 text-blue-600 hover:underline"
          >
            Book this flight
          </a>
        </div>
      ))}
    </div>
  );
}
