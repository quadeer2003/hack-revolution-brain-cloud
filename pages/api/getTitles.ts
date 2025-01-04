import { NextApiRequest, NextApiResponse } from "next";
import service from "@/lib/conf";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    console.log("I'm")
    if(req.method === 'GET') {
        const {query} = req.query

        if(!query || typeof query !== 'string') {
            return res.status(400).json({error: 'Query parameter is required'})
        }
        console.log("hey")
        try {
            console.log("yes")
            const titles = await service.getTitles(query)
            return res.status(200).json({titles})
        } catch (error) {
            console.log("API error :: getTitless ::", error)
            return res.status(500).json({ error: 'Failed to fetch titles' })
        }
    }
    return res.status(405).json({error: 'Method not allowed'})
}