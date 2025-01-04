// Define an interface for the config object
interface Config {
    appwriteUrl: string;
    appwriteProjectId: string;
    appwriteDatabaseId: string;
    appwriteCollectionId: string;
    appwriteBucketId: string;
    geminiApiKey: string;

  }
  
  // Initialize the config object
  const config: Config = {
    appwriteUrl: String(process.env.NEXT_PUBLIC_APPWRITE_URL),
    appwriteProjectId: String(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID),
    appwriteDatabaseId: String(process.env.NEXT_PUBLIC_APPWRITE_DATABASES_ID),
    appwriteCollectionId: String(process.env.NEXT_PUBLIC_APPWRITE_COLLECTIONS_ID),
    appwriteBucketId: String(process.env.NEXT_PUBLIC_APPWRITE_BUCKET_ID),
    geminiApiKey: String(process.env.NEXT_PUBLIC_GEMINI_API_KEY),
  };
  export default config;
  