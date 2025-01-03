import config from "@/lib/config";
import { NextApiRequest, NextApiResponse } from "next";
import { GoogleGenerativeAI } from "@google/generative-ai";


const genAI = new GoogleGenerativeAI(config.geminiApiKey);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });


export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "GET") {

    const { content } = req.query;

    if (!content || typeof content !== "string") {
      return res.status(400).json({ error: "Prompt is required and must be a string" });
    }
    try {
      const result = await model.generateContent(`Summarize the content for user: ${content}`);
      return res.status(200).json({ content: result.response.text() });

    } catch (error) {
      return res.status(500).json({ error: `Error generating content: ${error}` });
    }

  } else {
    return res.status(405).json({ error: "Method Not Allowed" }); 
  }
}