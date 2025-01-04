import { NextApiRequest, NextApiResponse } from "next";
import authService from "@/lib/authService";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if(req.method === 'POST') {
        try {
            const {email, password, name} = req.body
            const user = await authService.createAccount({email, password, name})
            res.status(201).json({ message: 'User created successfully', user})
        } catch (error) {
            res.status(500).json({ error: 'Error creating user', details: error})
        }
    } 
    return res.status(405).json({ message: 'Method not allowed'})
}