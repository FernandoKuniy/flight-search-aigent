import { FlightOffer, AmadeusResponse, AmadeusOffer, FlightSegment, AmadeusSegment } from "../types/flights";

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
  const carrierMap = raw.dictionaries?.carriers ?? {};

  const mapSegment = (segment: AmadeusSegment): FlightSegment => ({
    carrierCode: segment.carrierCode,
    carrierName: carrierMap[segment.carrierCode] ?? segment.carrierCode,
    number: segment.number,
    departure: segment.departure.at,
    arrival: segment.arrival.at,
    departureAirport: segment.departure.iataCode,
    arrivalAirport: segment.arrival.iataCode,
    duration: segment.duration
  });

  return raw.data.map((offer: AmadeusOffer) => {
    const price = parseFloat(offer.price.total);

    const segments = offer.itineraries[0].segments.map(mapSegment);

    const stops = segments.length - 1;
    const totalDuration = offer.itineraries[0].duration;
    const firstSegment = segments[0];
    const lastItinerary = offer.itineraries[offer.itineraries.length - 1];
    const lastSegmentRaw = lastItinerary.segments[lastItinerary.segments.length - 1];
    const lastSegment: FlightSegment = mapSegment(lastSegmentRaw);

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
