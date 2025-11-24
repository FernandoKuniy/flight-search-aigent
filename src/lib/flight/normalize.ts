import { FlightOffer, AmadeusResponse, AmadeusOffer } from "../types/flights";

export function normalizeAmadeus(raw: AmadeusResponse): FlightOffer[] {
  return raw.data.map((offer: AmadeusOffer) => {
    const price = parseFloat(offer.price.total);

    const segments = offer.itineraries[0].segments.map((s) => ({
      carrierCode: s.carrierCode,
      number: s.number,
      departure: s.departure.at,
      arrival: s.arrival.at,
      duration: s.duration
    }));

    const stops = segments.length - 1;
    const totalDuration = offer.itineraries[0].duration;

    return {
      id: offer.id,
      price,
      currency: offer.price.currency,
      segments,
      totalDuration,
      stops,
      raw: offer
    };
  });
}
