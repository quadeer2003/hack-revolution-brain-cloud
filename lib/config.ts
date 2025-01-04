export const config = {
    appwrite: {
      endpoint: process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1',
      projectId: process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || '',
      databaseId: process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || '',
      collectionId: process.env.NEXT_PUBLIC_APPWRITE_NOTES_COLLECTION_ID || '',
      bucketId: process.env.NEXT_PUBLIC_APPWRITE_BUCKET_ID || '',
    },
  }; 