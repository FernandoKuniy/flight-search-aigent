import { FlightOffer } from "../types/flights";

export function rankFlights(offers: FlightOffer[]): FlightOffer[] {
  return offers.sort((a, b) => {
    if (a.price !== b.price) return a.price - b.price;
    if (a.stops !== b.stops) return a.stops - b.stops;
    return a.totalDuration.localeCompare(b.totalDuration);
  });
}
