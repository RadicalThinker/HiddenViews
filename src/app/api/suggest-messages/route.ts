import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

// Initialize the API client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string);

export const runtime = "edge";

export async function POST(req: Request) {
    try {
        // Updated to use gemini-2.0-flash-lite model
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-lite" });
        
        const prompt = "Generate a single string of three feedback responses from participants after a MERN stack based web development session, separated by '||'. Each response should be an open-ended comment about the session's content, delivery, or overall effectiveness in teaching web development. Avoid personal or sensitive inquiries. The responses should capture a range of perspectives such as positive feedback, areas for improvement, or neutral observations. For example: 'It was great', 'I was able to grasp things well', 'The speed could have been slower'.";
        
        // You can use this prompt to generate the questions, and then present them to the users for their feedback.
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
