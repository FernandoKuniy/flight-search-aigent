import axios from "axios";
import { AmadeusResponse } from "../types/flights";

const AMADEUS_BASE_URL = process.env.AMADEUS_BASE_URL || "https://api.amadeus.com";

let cachedToken: { token: string; expiresAt: number } | null = null;

async function getToken() {
  if (cachedToken && Date.now() < cachedToken.expiresAt) {
    return cachedToken.token;
  }

  const res = await axios.post(
    `${AMADEUS_BASE_URL}/v1/security/oauth2/token`,
    new URLSearchParams({
      grant_type: "client_credentials",
      client_id: process.env.AMADEUS_API_KEY!,
      client_secret: process.env.AMADEUS_API_SECRET!
    })
  );

  const token = res.data.access_token;
  const expiresAt = Date.now() + res.data.expires_in * 1000;

  cachedToken = { token, expiresAt };
  return token;
}

export type AmadeusSearchParams = {
  originLocationCode: string;
  destinationLocationCode: string;
  departureDate: string;
  returnDate?: string;
  adults?: number;
  travelClass?: string;
  [key: string]: string | number | undefined;
};

export async function searchFlights(params: AmadeusSearchParams): Promise<AmadeusResponse> {
  const token = await getToken();

  const res = await axios.get<AmadeusResponse>(
    `${AMADEUS_BASE_URL}/v2/shopping/flight-offers`,
    {
      headers: { Authorization: `Bearer ${token}` },
      params
    }
  );

  return res.data;
}
