import { Client, Account, ID, Models } from "appwrite";
import config from "@/lib/config";

// Define types for the parameters in createAccount
interface CreateAccountParams {
  email: string;
  password: string;
  name: string;
}

export class AuthService {
  client: Client;
  account: Account;

  constructor() {
    this.client = new Client();
    this.client
      .setEndpoint(config.appwriteUrl)
      .setProject(config.appwriteProjectId);
    this.account = new Account(this.client);
  }

  // Typing the return type of createAccount function
  async createAccount({
    email,
    password,
    name,
  }: CreateAccountParams): Promise<Models.Session | null> {
    try {
      const userAccount = await this.account.create(
        ID.unique(),
        email,
        password,
        name
      );
      if (userAccount) {
        return this.login({ email, password });
      } else {
        return null;
      }
    } catch (err) {
      console.log("Appwrite error :: createAccount :: err ", err);
      return null;
    }
  }

  // Typing the return type of login function
  async login({
    email,
    password,
  }: {
    email: string;
    password: string;
  }): Promise<Models.Session | null> {
    try {
      return await this.account.createEmailPasswordSession(email, password);
    } catch (err) {
      console.log("Appwrite error :: login :: err ", err);
      return null;
    }
  }

  // Typing the return type of getCurrentUser function
  async getCurrentUser(): Promise<Models.User<Models.Preferences> | null> {
    try {
      return await this.account.get();
    } catch (err) {
      console.log("Appwrite error :: getCurrentUser :: err ", err);
      return null;
    }
  }

  // No return type expected from logout function
  async logout(): Promise<void> {
    try {
      await this.account.deleteSession("current");
    } catch (err) {
      console.log("Appwrite error :: logout :: err ", err);
    }
  }
}

// Initialize the AuthService instance
const authService = new AuthService();

export default authService;