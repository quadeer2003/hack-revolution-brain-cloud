const ENDPOINT = 'https://cloud.appwrite.io/v1';
const PROJECT_ID = '67793be40021677a1eeb';
const DATABASE_ID = '67793f61003035733e4f';
const COLLECTION_ID = '67793f6c002d444aadeb';
const BUCKET_ID = '677940fa0003eac144ae';

export async function getCurrentSession() {
  try {
    const sessionId = localStorage.getItem('extension_token');
    if (!sessionId) {
      return null;
    }

    const response = await fetch(`${ENDPOINT}/account/sessions/current`, {
      headers: {
        'X-Appwrite-Project': PROJECT_ID,
        'X-Appwrite-Session': sessionId
      }
    });
    
    if (!response.ok) {
      return null;
    }
    
    return response.json();
  } catch (error) {
    return null;
  }
}

export async function createSession(email, password) {
  try {
    // Check for existing session
    const currentSession = await getCurrentSession();
    if (currentSession) {
      // Delete existing session
      await deleteSession(currentSession.$id);
    }

    // Create new session
    const response = await fetch(`${ENDPOINT}/account/sessions/email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Appwrite-Project': PROJECT_ID
      },
      body: JSON.stringify({ email, password })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to login');
    }

    return response.json();
  } catch (error) {
    if (error.message.includes('prohibited when a session is active')) {
      // If we somehow failed to delete the session, try one more time
      await deleteSession('current');
      return createSession(email, password);
    }
    throw error;
  }
}

export async function getAccount(sessionId) {
  const response = await fetch(`${ENDPOINT}/account`, {
    headers: {
      'X-Appwrite-Project': PROJECT_ID,
      'X-Appwrite-Session': sessionId
    }
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to get account');
  }

  return response.json();
}

export async function deleteSession(sessionId) {
  const currentSessionId = localStorage.getItem('extension_token');
  const response = await fetch(`${ENDPOINT}/account/sessions/${sessionId}`, {
    method: 'DELETE',
    headers: {
      'X-Appwrite-Project': PROJECT_ID,
      'X-Appwrite-Session': currentSessionId
    }
  });

  if (!response.ok && response.status !== 404) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to logout');
  }

  return true;
}

function truncateContent(content, maxLength = 500) {
  if (!content) return '';
  if (content.length <= maxLength) return content;
  
  // Find the last complete sentence within the limit
  const truncated = content.substring(0, maxLength);
  const lastPeriod = truncated.lastIndexOf('.');
  const lastQuestion = truncated.lastIndexOf('?');
  const lastExclamation = truncated.lastIndexOf('!');
  
  const lastSentence = Math.max(lastPeriod, lastQuestion, lastExclamation);
  
  if (lastSentence > 0) {
    return truncated.substring(0, lastSentence + 1) + ' [Content truncated...]';
  }
  
  return truncated.substring(0, maxLength - 20) + '... [Truncated]';
}

// Function to split content into chunks of max 700 characters (leaving room for metadata)
function splitContentIntoChunks(content) {
  const CHUNK_SIZE = 700; // Max size per chunk
  const chunks = [];
  
  // Split content by newlines first to preserve formatting
  const lines = content.split('\n');
  let currentChunk = '';
  
  for (const line of lines) {
    // If adding this line would exceed chunk size, save current chunk and start new one
    if ((currentChunk + line + '\n').length > CHUNK_SIZE) {
      if (currentChunk) {
        chunks.push(currentChunk.trim());
        currentChunk = '';
      }
      
      // If single line is longer than chunk size, split it
      if (line.length > CHUNK_SIZE) {
        let remainingLine = line;
        while (remainingLine.length > 0) {
          chunks.push(remainingLine.substring(0, CHUNK_SIZE));
          remainingLine = remainingLine.substring(CHUNK_SIZE);
        }
      } else {
        currentChunk = line + '\n';
      }
    } else {
      currentChunk += line + '\n';
    }
  }
  
  // Add final chunk if any content remains
  if (currentChunk) {
    chunks.push(currentChunk.trim());
  }
  
  return chunks;
}

export async function createNote(sessionId, noteData) {
  const { content, metadata, ...restData } = noteData;

  // First, upload content as a file if it's large
  let contentFileId = null;
  if (content && content.length > 500) {
    const blob = new Blob([content], { type: 'text/plain' });
    const file = new File([blob], 'content.txt', { type: 'text/plain' });
    
    const formData = new FormData();
    formData.append('fileId', 'unique()');
    formData.append('file', file);

    const uploadResponse = await fetch(`${ENDPOINT}/storage/buckets/${BUCKET_ID}/files`, {
      method: 'POST',
      headers: {
        'X-Appwrite-Project': PROJECT_ID,
        'X-Appwrite-Session': sessionId
      },
      body: formData
    });

    if (!uploadResponse.ok) {
      const error = await uploadResponse.json();
      throw new Error(error.message || 'Failed to upload content file');
    }

    const uploadResult = await uploadResponse.json();
    contentFileId = uploadResult.$id;
  }

  // Create the note with either direct content or file reference
  const mainNoteData = {
    ...restData,
    content: content.length <= 500 ? content : 'Content stored in file. Loading...',
    // Store file ID in blocksData array
    blocksData: JSON.stringify([{
      type: 'paragraph',
      content: content.length <= 500 ? content : 'Content stored in file. Loading...',
      props: {
        fileId: contentFileId // Store file ID in props if content is in a file
      }
    }]),
    // Store metadata as a JSON string
    metadataStr: JSON.stringify(metadata || {})
  };

  const response = await fetch(`${ENDPOINT}/databases/${DATABASE_ID}/collections/${COLLECTION_ID}/documents`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Appwrite-Project': PROJECT_ID,
      'X-Appwrite-Session': sessionId
    },
    body: JSON.stringify({
      documentId: crypto.randomUUID(),
      data: {
        ...mainNoteData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to save note');
  }

  return response.json();
} 