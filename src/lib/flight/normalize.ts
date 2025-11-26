import { FlightOffer, AmadeusResponse, AmadeusOffer, FlightSegment } from "../types/flights";

function buildBookingUrl(firstSegment: FlightSegment, lastSegment: FlightSegment, offer: AmadeusOffer) {
  const departDate = firstSegment.departure.split("T")[0];
  const queryParts = [
    `Flights from ${firstSegment.departureAirport}`,
    `to ${lastSegment.arrivalAirport}`,
    `on ${departDate}`
  ];

  if (offer.itineraries.length > 1) {
    const returnSegments = offer.itineraries[offer.itineraries.length - 1].segments;
    const returnDate = returnSegments[0]?.departure.at.split("T")[0];
    if (returnDate) {
      queryParts.push(`return ${returnDate}`);
    }
  }

  const query = encodeURIComponent(queryParts.join(" "));
  return `https://www.google.com/travel/flights?q=${query}`;
}

export function normalizeAmadeus(raw: AmadeusResponse): FlightOffer[] {
  return raw.data.map((offer: AmadeusOffer) => {
    const price = parseFloat(offer.price.total);

    const segments = offer.itineraries[0].segments.map((s) => ({
      carrierCode: s.carrierCode,
      number: s.number,
      departure: s.departure.at,
      arrival: s.arrival.at,
      departureAirport: s.departure.iataCode,
      arrivalAirport: s.arrival.iataCode,
      duration: s.duration
    }));

    const stops = segments.length - 1;
    const totalDuration = offer.itineraries[0].duration;
    const firstSegment = segments[0];
    const lastItinerary = offer.itineraries[offer.itineraries.length - 1];
    const lastSegmentRaw = lastItinerary.segments[lastItinerary.segments.length - 1];
    const lastSegment: FlightSegment = {
      carrierCode: lastSegmentRaw.carrierCode,
      number: lastSegmentRaw.number,
      departure: lastSegmentRaw.departure.at,
      arrival: lastSegmentRaw.arrival.at,
      departureAirport: lastSegmentRaw.departure.iataCode,
      arrivalAirport: lastSegmentRaw.arrival.iataCode,
      duration: lastSegmentRaw.duration
    };

    const bookingUrl = buildBookingUrl(firstSegment, lastSegment, offer);

    return {
      id: offer.id,
      price,
      currency: offer.price.currency,
      segments,
      totalDuration,
      stops,
      bookingUrl,
      raw: offer
    };
  });
}
