import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY!);
const model = genAI.getGenerativeModel({ model: "gemini-pro" });

export async function enhanceSearch(query: string): Promise<string> {
  try {
    const prompt = `Given the search query "${query}", generate a search string that includes:
1. The original query
2. Common synonyms
3. Related categories or concepts
4. Broader terms that encompass this query

Format the response as a space-separated list of words. For example, if searching for "apple", return something like: "apple fruit food produce technology computer iphone mac digital"`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    return text.trim();
  } catch (error) {
    console.error('Error enhancing search:', error);
    return query;
  }
}

export async function summarizeContent(content: string): Promise<string> {
  try {
    const prompt = `Please provide a comprehensive summary of the following content in 10-15 detailed sentences in paragraph. Include the main points and key insights:\n\n${content}`;
    const result = await model.generateContent(prompt);
    return result.response.text().trim();
  } catch (error) {
    console.error('Error summarizing content:', error);
    return '';
  }
}

export async function suggestRelatedTopics(content: string): Promise<string[]> {
  try {
    const prompt = `Given this content:\n\n${content}\n\nSuggest 5 related topics or concepts that might interest the reader. Return them as a simple comma-separated list without numbering or explanation.`;
    const result = await model.generateContent(prompt);
    return result.response.text().split(',').map(topic => topic.trim());
  } catch (error) {
    console.error('Error suggesting topics:', error);
    return [];
  }
}

export async function generateTags(content: string): Promise<string[]> {
  try {
    const prompt = `Generate 5-7 relevant tags for this content. Tags should be single words or short phrases that capture key topics, concepts, and themes. Return only the tags as a comma-separated list, no other text or explanation:

${content}`;

    const result = await model.generateContent(prompt);
    const tags = result.response.text()
      .split(',')
      .map(tag => tag.trim())
      .filter(tag => tag.length > 0);
    
    return tags;
  } catch (error) {
    console.error('Error generating tags:', error);
    return [];
  }
}

export async function chatWithGemini(context: string, question: string): Promise<string> {
  try {
    const prompt = `Context: ${context}

Question: ${question}


Please provide a helpful response based on the context above.`;

    const result = await model.generateContent(prompt);
    return result.response.text().trim();
  } catch (error) {
    console.error('Error in chat:', error);
    return 'Sorry, I encountered an error processing your request.';
  }
} 