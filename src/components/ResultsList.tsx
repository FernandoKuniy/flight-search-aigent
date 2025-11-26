"use client";

import { useState, useEffect } from "react";
import { FlightOffer } from "@/lib/types/flights";
import FlightCard from "./FlightCard";

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
        <FlightCard key={offer.id} offer={offer} />
      ))}
    </div>
  );
}
