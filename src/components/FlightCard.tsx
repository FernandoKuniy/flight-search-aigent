import { FlightOffer } from "@/lib/types/flights";
import { formatDuration, formatDateTime } from "@/lib/utils/format";

type FlightCardProps = {
  offer: FlightOffer;
};

export default function FlightCard({ offer }: FlightCardProps) {
  return (
    <div className="p-4 border rounded space-y-3">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <p className="text-xl font-semibold">
            {offer.price.toLocaleString(undefined, {
              style: "currency",
              currency: offer.currency
            })}
          </p>
          <p className="text-sm text-gray-500">
            {offer.stops === 0 ? "Non-stop" : `${offer.stops} stops`} • {formatDuration(offer.totalDuration)}
          </p>
        </div>

        <a
          href={offer.bookingUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center rounded bg-blue-600 px-4 py-2 text-white text-sm font-medium hover:bg-blue-700 transition"
        >
          Book this flight
        </a>
      </div>

      <div className="space-y-2">
        {offer.segments.map((segment, index) => (
          <div key={`${segment.carrierCode}-${segment.number}-${index}`} className="flex flex-col sm:flex-row sm:items-center sm:justify-between text-sm gap-1">
            <div>
              <p className="font-semibold">{segment.carrierName}</p>
              <p className="text-gray-500">{segment.carrierCode} {segment.number}</p>
            </div>
            <div className="text-gray-700">
              {segment.departureAirport} {formatDateTime(segment.departure)} → {segment.arrivalAirport} {formatDateTime(segment.arrival)}
            </div>
            <div className="text-gray-500 text-right">{formatDuration(segment.duration)}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

