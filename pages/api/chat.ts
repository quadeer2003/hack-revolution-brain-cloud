import { NextApiRequest, NextApiResponse } from "next";
import axios from "axios";
import { GoogleGenerativeAI } from "@google/generative-ai";
import config from "@/lib/config";


// const genAI = new GoogleGenerativeAI(config.geminiApiKey);
// const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

// export default async function handler(req: NextApiRequest, res: NextApiResponse) {
//     if(req.method === 'POST') {
//        const {input} = req.body
//         const response = await modepredictText({
//             prompt: `Content: ${input}\nUser: ${prompt}`,
//           });

//         // Extract and set the bot's response
//         const botResponse =
//           response.data.candidates?.[0]?.content?.parts?.[0]?.text || 'No response from bot.';
        
//     }
// }