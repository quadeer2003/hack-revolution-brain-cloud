// import { q } from "framer-motion/client";
import config from "./config"
import { Client, Databases, Storage, Models, Query } from "appwrite";

interface PageData {
    userId: string;
    title: string; //unique
    category: string;
    content: string;
    isPublic: boolean;
    createdAt: string;
    updatedAt: string;
    blocksData: string;
    connections: string;
    metadataStr: string;
    position: string;
}

export class Service {
    client: Client;
    databases: Databases;
    bucket: Storage;

    constructor() {
        this.client = new Client()
            .setEndpoint(config.appwriteUrl)
            .setProject(config.appwriteProjectId);
        this.databases = new Databases(this.client);
        this.bucket = new Storage(this.client);
    }

    // async createPage({userId, title, slug, category, content, isPublic, createdAt, updatedAt, blocksData, connections, metadataStr, position}: PageData) {
    //     try {
    //         return await this.databases.createDocument(
    //             config.appwriteDatabaseId,
    //             config.appwriteCollections,
    //             slug,
    //             {
    //                 userId,
    //                 title, 
    //                 category,
    //                 content,
    //                 isPublic,
    //                 createdAt,
    //                 updatedAt,
    //                 blocksData,
    //                 connections,
    //                 metadataStr,
    //                 position
    //             }
    //         );
    //     } catch (error) {
    //         console.error("Appwrite service :: createPage :: err", error);
    //         throw error;
    //     }
    // }

    // async updatePage(slug: string, {userId, title, category, content, isPublic, createdAt, updatedAt, blocksData, connections, metadataStr, position}: PageData) {
    //     try {
    //         return await this.databases.updateDocument(
    //             config.appwriteDatabaseId,
    //             config.appwriteCollections,
    //             slug,
    //             {
    //                 userId,
    //                 title, 
    //                 category,
    //                 content,
    //                 isPublic,
    //                 createdAt,
    //                 updatedAt,
    //                 blocksData,
    //                 connections,
    //                 metadataStr,
    //                 position
    //             }
    //         );
    //     } catch (error) {
    //         console.error("Appwrite service :: updatePage :: err", error);
    //         throw error;
    //     }
    // }

    // async deletePost(slug: string) {
    //     try {
    //         await this.databases.deleteDocument(
    //             config.appwriteDatabaseId,
    //             config.appwriteCollections,
    //             slug
    //         );
    //     } catch (error) {
    //         console.error("Appwrite service :: deletePost :: err", error);
    //         throw error;
    //     }
    // }

    async getPage(title: string): Promise<Models.DocumentList<Models.Document> | false> {
        try {
            const query = [Query.equal('title', title)]
            const document = await this.databases.listDocuments(
                config.appwriteDatabaseId,
                config.appwriteCollectionId,
                query
            );
            return document;
        } catch (err) {
            console.error("Appwrite error :: getPage :: err", err);
            return false;
        }
    }

    async getPages(userID: string): Promise<Models.Document[] | false> {
        try {
            const queries = [Query.equal('userID', userID)];
            const response = await this.databases.listDocuments(
                config.appwriteDatabaseId,
                config.appwriteCollectionId,
                queries,
            )
            return response.documents
        } catch (error) {
            console.log("Appwrite serive :: getPosts :: error", error);
            return false
        }
    }

    async getFilePreview(fileId: string) {
        try {
            return this.bucket.getFilePreview(
                config.appwriteBucketId,
                fileId
            );
        } catch (error) {
            console.error("Appwrite service :: getFilePreview :: err", error);
            throw error;
        }
    }

    async getTitles(query: string): Promise<Models.Document[]> {
        try {
            const response = await this.databases.listDocuments(
                config.appwriteDatabaseId,
                config.appwriteCollectionId,
                [Query.search('title', query)]
            )
            return response.documents || []
        } catch (error) {
            throw error;
        }
    }
}

const service = new Service();

export default service;
