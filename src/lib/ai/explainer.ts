import OpenAI from "openai";
import { FlightOffer } from "../types/flights";

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function explainResults(offers: FlightOffer[]): Promise<string | null> {
  if (!offers || offers.length === 0) {
    return null;
  }

  // Format flight data for the AI in a structured way
  const flightSummaries = offers.slice(0, 5).map((offer, index) => {
    const airlines = [...new Set(offer.segments.map(s => s.carrierCode))].join(", ");
    const firstSegment = offer.segments[0];
    const lastSegment = offer.segments[offer.segments.length - 1];
    const stopText = offer.stops === 0 ? "Non-stop" : `${offer.stops} stop${offer.stops !== 1 ? 's' : ''}`;
    
    return `${index + 1}. Price: ${offer.price} ${offer.currency} | ${stopText} | Duration: ${offer.totalDuration} | Airlines: ${airlines} | Departs: ${firstSegment.departure} | Arrives: ${lastSegment.arrival}`;
  }).join("\n");

  const prompt = `### Instruction:
You are a professional travel assistant. Analyze the top flight options below and write a concise, friendly explanation (2-3 sentences) that helps a traveler make an informed decision. 

Focus on:
- Cost-effectiveness (best value options)
- Convenience (non-stop vs. stops, flight times)
- Time efficiency (shortest durations)
- Notable advantages of the top options

Use a warm, conversational tone. Do not mention ranking algorithms or technical details.

### Flight Data:
${flightSummaries}

### Output:
Provide a brief, user-friendly explanation that highlights why these flights are good choices.`;

  try {
    const res = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }]
    });

    return res.choices[0].message.content;
  } catch (error) {
    console.error("Failed to generate AI explanation:", error);
    return null;
  }
}
