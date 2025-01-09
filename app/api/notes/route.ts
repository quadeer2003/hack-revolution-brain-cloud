import { NextResponse } from 'next/server';
import { Client, Account } from 'appwrite';
import { config } from "@/lib/config"
import { savePage } from '@/lib/conf';

export async function OPTIONS(request: Request) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Allow-Credentials': 'true',
    },
  });
}

export async function POST(request: Request) {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Credentials': 'true',
  };

  try {
    const authHeader = request.headers.get('Authorization');
    console.log('Auth header:', authHeader);

    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers });
    }

    const sessionId = authHeader.split('Bearer ')[1];
    console.log('Session ID:', sessionId);

    // Initialize Appwrite
    const client = new Client()
      .setEndpoint(config.appwrite.endpoint)
      .setProject(config.appwrite.projectId);

    const account = new Account(client);

    try {
      // Get the current session using the session ID
      console.log('Fetching session for ID:', sessionId);
      const session = await account.getSession(sessionId);
      console.log('Session retrieved:', session);
      
      // Get request body
      const body = await request.json();
      console.log('Request body:', body);

      // Create note using Appwrite
      const note = await savePage(session.userId, {
        title: body.title,
        content: body.content,
        category: body.category,
        isPublic: body.isPublic || false,
      });

      return NextResponse.json(note, { headers });
    } catch (error) {
      console.error('Authentication error details:', error);
      return NextResponse.json({ 
        error: 'Session expired or invalid. Please log in again.',
        code: 'SESSION_EXPIRED'
      }, { status: 401, headers });
    }
  } catch (error) {
    console.error('Server error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500, headers });
  }
} 