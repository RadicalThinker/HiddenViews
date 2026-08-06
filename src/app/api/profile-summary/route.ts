import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

export const runtime = "edge";

export async function POST(req: Request) {
  try {
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: "AI not configured on the server" },
        { status: 503 }
      );
    }
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

    const body = await req.json().catch(() => ({}));
    const { reviews = [], userName, totalReviews, averageRating } = body as {
      reviews: string[];
      userName?: string;
      totalReviews?: number;
      averageRating?: number;
    };

    const trimmed = (reviews || [])
      .map((r) => String(r).trim())
      .filter(Boolean)
      .slice(0, 80); // cap to keep prompt short

    const bullets = trimmed.map((r, i) => `${i + 1}. ${r}`).join("\n");

    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const prompt = `You are an expert reviewer summarizer for an events feedback platform.
Summarize the following user reviews and provide:
- Overall sentiment in a sentence
- Top strengths (3-5 bullet points)
- Areas for improvement (2-4 bullet points)
- Common themes (2-4 bullet points)
- A short actionable closing tip (1 sentence)

Context:
- Instructor/User: ${userName || "(unknown)"}
- Total reviews: ${totalReviews ?? trimmed.length}
- Average rating (across events): ${averageRating ?? "unknown"}

Reviews:\n${bullets}

Constraints:
- Keep it concise, under 180 words total.
- Use plain text with clear headings.
- Do not include any personally identifiable info beyond what is provided.
`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    return new Response(text, {
      headers: { "Content-Type": "text/plain" },
    });
  } catch (error) {
    if (error instanceof Error) {
      console.error("An error occurred:", error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    } else {
      console.error("An unexpected error occurred:", error);
      return NextResponse.json(
        { error: "An unexpected error occurred" },
        { status: 500 }
      );
    }
  }
}
