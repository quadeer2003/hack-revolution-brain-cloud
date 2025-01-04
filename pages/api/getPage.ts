import { NextApiRequest, NextApiResponse } from "next";
import service from "@/lib/conf";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if(req.method === 'GET') {
        const {query} = req.query
        if(!query || typeof query !== 'string') {
            return res.status(400).json({error: 'Query Parameter required'})
        }
        try {
            const page = await service.getPage(query)
            if(!page) {
                return res.status(404).json({ error: 'Page not found' });
            }
            return res.status(200).json(page)
        } catch (error) {
            console.log("Appwrite api error :: getPage ::", error)
            return res.status(500).json({error: "Internal Server error"})
        }
    }
    return res.status(405).json({error: 'Method not allowed'})
}