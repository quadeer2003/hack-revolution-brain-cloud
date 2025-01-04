// import { q } from "framer-motion/client";
import { Account, Client, Databases, Storage, ID, Query, Models, Permission, Role } from 'appwrite';
import { config } from './config';

export interface PageData extends Models.Document {
    userId: string;
    title: string;
    category: string;
    content: string;
    createdAt: string;
    updatedAt: string;
    blocksData: string;
    isPublic: boolean;
    blocks?: any[];
    summary?: string;
    relatedTopics?: string[];
    connections?: string;
    metadataStr?: string;
    tags?: string;
    metadata?: {
      url?: string;
      siteName?: string;
      description?: string;
      image?: string;
      author?: string;
      publishedTime?: string;
      type?: string;
    };
  }
  
  let client: Client;
  let account: Account;
  let databases: Databases;
  let storage: Storage;
  
  if (typeof window !== 'undefined') {
    console.log('Initializing Appwrite client');
    console.log('Project ID:', config.appwrite.projectId);
  
    client = new Client();
    client
      .setEndpoint(config.appwrite.endpoint)
      .setProject(config.appwrite.projectId);
  
    account = new Account(client);
    databases = new Databases(client);
    storage = new Storage(client);
  }
  
  export { client, account, databases, storage };
  
  export const DATABASE_ID = config.appwrite.databaseId;
  export const COLLECTION_ID = config.appwrite.collectionId;
  export const STORAGE_BUCKET_ID = config.appwrite.bucketId;

  export const uploadFile = async (file: File): Promise<string> => {
    try {
      console.log('Uploading file:', file.name);
      const result = await storage.createFile(
        STORAGE_BUCKET_ID,
        ID.unique(),
        file
      );
      console.log('File uploaded, ID:', result.$id);
      const previewUrl = getFilePreview(result.$id);
      console.log('Preview URL:', previewUrl);
      return previewUrl;
    } catch (error) {
      console.error('Error uploading file:', error);
      throw error;
    }
  };
  
  export const getFilePreview = (fileId: string): string => {
    const cleanFileId = fileId.split('?')[0].split('/').pop() || fileId;
    return `https://cloud.appwrite.io/v1/storage/buckets/${STORAGE_BUCKET_ID}/files/${cleanFileId}/preview?project=${config.appwrite.projectId}`;
  };
  
  export const updatePage = async (noteId: string, data: Partial<PageData>): Promise<PageData> => {
    try {
      const cleanData = Object.fromEntries(
        Object.entries(data).filter(([_, v]) => v !== undefined)
      );
  
      const updatedDoc = await databases.updateDocument(
        DATABASE_ID,
        COLLECTION_ID,
        noteId,
        {
          ...cleanData,
          updatedAt: new Date().toISOString()
        }
      );
      return updatedDoc as PageData;
    } catch (error) {
      console.error('Error updating note:', error);
      throw error;
    }
  };
  
  export const savePage = async (userId: string, noteData: Partial<Omit<PageData, 'userId' | 'createdAt' | 'updatedAt' | 'blocksData'>> & { blocks?: any[] }) => {
    try {
      const now = new Date().toISOString();
      const { blocks, ...cleanData } = noteData;
  
      return await databases.createDocument(
        DATABASE_ID,
        COLLECTION_ID,
        ID.unique(),
        {
          ...cleanData,
          userId,
          createdAt: now,
          updatedAt: now,
          isPublic: noteData.isPublic ?? false,
          blocksData: blocks ? JSON.stringify(blocks) : '[]'
        }
      );
    } catch (error) {
      console.error('Error saving note:', error);
      throw error;
    }
  };
  
  export const processNoteBlocks = async (doc: any): Promise<PageData> => {
    try {
      const blocks = JSON.parse(doc.blocksData || '[]');
      console.log('Processing blocks:', blocks);
  
      const processedBlocks = await Promise.all(blocks.map(async (block: any) => {
        // Handle image blocks
        if (block.type === 'image' && block.props?.url) {
          if (block.props.url.startsWith('http') || block.props.url.startsWith('https')) {
            return block;
          }
          
          if (block.props.url.includes('preview?project=')) {
            return block;
          }
          
          const fileId = block.props.url;
          console.log('Processing uploaded image, fileId:', fileId);
          
          const imageUrl = getFilePreview(fileId);
          console.log('Generated image URL:', imageUrl);
  
          return {
            ...block,
            props: {
              ...block.props,
              url: imageUrl
            }
          };
        }
  
        // Handle content blocks stored in files
        if (block.type === 'paragraph' && block.content === 'Content stored in file. Loading...') {
          const contentFileId = block.props?.fileId;
          if (contentFileId) {
            try {
              const fileUrl = storage.getFileDownload(STORAGE_BUCKET_ID, contentFileId);
              const response = await fetch(fileUrl);
              if (!response.ok) {
                throw new Error('Failed to fetch file content');
              }
              const content = await response.text();
              console.log('Loaded content from file:', contentFileId, content.substring(0, 100) + '...');
              return {
                ...block,
                content,
                props: {
                  ...block.props,
                  loadedFromFile: true
                }
              };
            } catch (error) {
              console.error('Error loading file content:', error);
              return block;
            }
          }
        }
  
        return block;
      }));
  
      return {
        ...doc,
        blocks: processedBlocks
      } as PageData;
    } catch (error) {
      console.error('Error processing note blocks:', error);
      return doc as PageData;
    }
  };
  
  export const searchNotes = async (searchQuery: string): Promise<PageData[]> => {
    try {
      const exactResponse = await databases.listDocuments<PageData>(
        DATABASE_ID,
        COLLECTION_ID,
        [
          Query.equal('isPublic', true),
          Query.equal('title', searchQuery)
        ]
      );
  
      if (exactResponse.documents.length === 0) {
        const response = await databases.listDocuments<PageData>(
          DATABASE_ID,
          COLLECTION_ID,
          [
            Query.equal('isPublic', true),
            Query.startsWith('title', searchQuery)
          ]
        );
  
        return Promise.all(response.documents.map(processNoteBlocks));
      }
  
      return Promise.all(exactResponse.documents.map(processNoteBlocks));
    } catch (error) {
      console.error('Error searching notes:', error);
      return [];
    }
  };
  
  export const getNotes = async (userId: string, searchQuery?: string): Promise<PageData[]> => {
    try {
      if (!searchQuery) {
        const response = await databases.listDocuments<PageData>(
          DATABASE_ID,
          COLLECTION_ID,
          [
            Query.equal('userId', userId),
            Query.orderDesc('$updatedAt')
          ]
        );
        return Promise.all(response.documents.map(processNoteBlocks));
      }
  
      const response = await databases.listDocuments<PageData>(
        DATABASE_ID,
        COLLECTION_ID,
        [
          Query.equal('userId', userId),
          Query.or([
            Query.equal('title', searchQuery),
            Query.startsWith('title', searchQuery)
          ]),
          Query.orderDesc('$updatedAt')
        ]
      );
  
      return Promise.all(response.documents.map(processNoteBlocks));
    } catch (error) {
      console.error('Error fetching notes:', error);
      return [];
    }
  };
  
  export const deleteNote = async (noteId: string): Promise<void> => {
    try {
      await databases.deleteDocument(
        DATABASE_ID,
        COLLECTION_ID,
        noteId
      );
    } catch (error) {
      console.error('Error deleting note:', error);
      throw error;
    }
  };
  
  export async function getFileContent(fileId: string): Promise<string> {
    try {
      const fileUrl = storage.getFileDownload(process.env.NEXT_PUBLIC_BUCKET_ID!, fileId);
      const response = await fetch(fileUrl);
      const text = await response.text();
      return text;
    } catch (error) {
      console.error('Error getting file content:', error);
      throw error;
    }
  }