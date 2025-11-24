import axios from "axios";
import { AmadeusResponse } from "../types/flights";

// Normalize base URL: remove trailing slashes and ensure it's a valid URL
const getBaseUrl = () => {
  const url = process.env.AMADEUS_BASE_URL || "https://test.api.amadeus.com";
  return url.replace(/\/+$/, ""); // Remove trailing slashes
};

const AMADEUS_BASE_URL = getBaseUrl();

let cachedToken: { token: string; expiresAt: number } | null = null;

async function getToken() {
  if (cachedToken && Date.now() < cachedToken.expiresAt) {
    return cachedToken.token;
  }

  const apiKey = process.env.AMADEUS_API_KEY;
  const apiSecret = process.env.AMADEUS_API_SECRET;

  if (!apiKey || !apiSecret) {
    throw new Error("AMADEUS_API_KEY and AMADEUS_API_SECRET must be set in environment variables");
  }

  const tokenUrl = `${AMADEUS_BASE_URL}/v1/security/oauth2/token`;
  
  try {
    const res = await axios.post(
      tokenUrl,
      new URLSearchParams({
        grant_type: "client_credentials",
        client_id: apiKey,
        client_secret: apiSecret
      }),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded"
        }
      }
    );

    const token = res.data.access_token;
    const expiresAt = Date.now() + res.data.expires_in * 1000;

    cachedToken = { token, expiresAt };
    return token;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(`Failed to get Amadeus token: ${error.message} - URL: ${tokenUrl}`);
    }
    throw error;
  }
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

  const searchUrl = `${AMADEUS_BASE_URL}/v2/shopping/flight-offers`;
  
  // Filter out undefined values from params
  const cleanParams: Record<string, string | number> = {};
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      cleanParams[key] = value;
    }
  });

  try {
    const res = await axios.get<AmadeusResponse>(
      searchUrl,
      {
        headers: { Authorization: `Bearer ${token}` },
        params: cleanParams
      }
    );

    return res.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const errorDetails = error.response?.data 
        ? JSON.stringify(error.response.data, null, 2)
        : error.message;
      const errorMessage = `Failed to search flights: ${error.message} - URL: ${searchUrl}`;
      console.error("Amadeus API Error:", {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        params: cleanParams
      });
      throw new Error(`${errorMessage}\nDetails: ${errorDetails}`);
    }
    throw error;
  }
}
