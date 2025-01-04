import { NextApiRequest, NextApiResponse } from "next";
import authService from "@/lib/authService";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if(req.method === 'POST') {
        try {
            const {email, password} = req.body
            const session = await authService.login({email, password})
            res.status(200).json({ message: 'User logged in successfully', session})
        } catch (error) {
            res.status(401).json({ error: 'Error in logging', details: error})
        }
    } 
    return res.status(405).json({ message: 'Method not allowed'})
}