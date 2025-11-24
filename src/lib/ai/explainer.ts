import OpenAI from "openai";
import { FlightOffer } from "../types/flights";

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function explainResults(offers: FlightOffer[]): Promise<string | null> {
  const prompt = `
You are assisting a user with choosing flights. Write a short, clear explanation in 2 to 3 sentences about why the top ranked flights are strong choices. 
Do not mention the ranking algorithm.`;

  const res = await client.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: prompt }]
  });

  return res.choices[0].message.content;
}
