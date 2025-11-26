export type SearchParams = {
    origin: string;
    destination: string;
    departDate: string;
    returnDate?: string;
    passengers: number;
    cabin: string;
  };
  
export type FlightSegment = {
    carrierCode: string;
    number: string;
    departure: string;
    arrival: string;
    departureAirport: string;
    arrivalAirport: string;
    duration: string;
  };
  
  // Amadeus API types
  export type AmadeusSegment = {
    carrierCode: string;
    number: string;
    departure: {
      iataCode: string;
      at: string;
    };
    arrival: {
      iataCode: string;
      at: string;
    };
    duration: string;
  };
  
  export type AmadeusItinerary = {
    duration: string;
    segments: AmadeusSegment[];
  };
  
  export type AmadeusPrice = {
    total: string;
    currency: string;
  };
  
  export type AmadeusOffer = {
    id: string;
    price: AmadeusPrice;
    itineraries: AmadeusItinerary[];
  };
  
  export type AmadeusResponse = {
    data: AmadeusOffer[];
  };
  
export type FlightOffer = {
    id: string;
    price: number;
    currency: string;
    segments: FlightSegment[];
    totalDuration: string;
    stops: number;
    bookingUrl: string;
    raw: AmadeusOffer;
  };
  