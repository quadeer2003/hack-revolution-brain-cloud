import { account } from './conf';

export async function getSession() {
  try {
    const session = await account.get();
    return {
      userId: session.$id
    };
  } catch (error) {
    return null;
  }
} 