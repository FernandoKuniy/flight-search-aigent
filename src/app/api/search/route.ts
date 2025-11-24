import { NextResponse } from "next/server";
import { searchFlights, AmadeusSearchParams } from "@/lib/providers/amadeus";
import { normalizeAmadeus } from "@/lib/flight/normalize";
import { rankFlights } from "@/lib/flight/ranking";
import { explainResults } from "@/lib/ai/explainer";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Validate required fields
    if (!body.origin || !body.destination || !body.departDate) {
      return NextResponse.json(
        { error: "Origin, destination, and departure date are required" },
        { status: 400 }
      );
    }

    // Validate IATA codes (3 letters)
    if (!/^[A-Z]{3}$/i.test(body.origin) || !/^[A-Z]{3}$/i.test(body.destination)) {
      return NextResponse.json(
        { error: "Origin and destination must be valid 3-letter IATA codes" },
        { status: 400 }
      );
    }

    // Validate date format and ensure it's in the future
    const departDate = new Date(body.departDate);
    if (isNaN(departDate.getTime())) {
      return NextResponse.json(
        { error: "Invalid departure date format" },
        { status: 400 }
      );
    }

    // Build search parameters
    const searchParams: AmadeusSearchParams = {
      originLocationCode: body.origin.toUpperCase(),
      destinationLocationCode: body.destination.toUpperCase(),
      departureDate: body.departDate,
      adults: Math.max(1, body.passengers || 1)
    };

    // Only add returnDate if provided and not empty
    if (body.returnDate && body.returnDate.trim() !== "") {
      const returnDate = new Date(body.returnDate);
      if (!isNaN(returnDate.getTime())) {
        searchParams.returnDate = body.returnDate;
      }
    }

    // Add travel class if provided
    if (body.cabin) {
      searchParams.travelClass = body.cabin;
    }

    const raw = await searchFlights(searchParams);

    const normalized = normalizeAmadeus(raw);
    const ranked = rankFlights(normalized);
    const explanation = await explainResults(ranked.slice(0, 5));

    return NextResponse.json({
      results: ranked,
      explanation
    });
  } catch (err: unknown) {
    console.error("Search API error:", err);
    const errorMessage = err instanceof Error ? err.message : "An unknown error occurred";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
