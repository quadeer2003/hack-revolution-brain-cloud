import { NextApiRequest, NextApiResponse } from "next";
import authService from "@/lib/authService";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if(req.method === 'POST') {
        try {
            console.log("first")
            await authService.logout()
            return res.status(200).json({ message: "Logged out successfully" });
        } catch (error) {
            return res.status(500).json({ error: "Failed to logout" });
        }
    }
    return res.status(405).json({ error: "Method not allowed" });
}
    