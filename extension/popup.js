import { createSession, getAccount, deleteSession, createNote } from './appwrite.js';

// Log extension ID for Appwrite platform configuration
console.log('Extension ID:', chrome.runtime.id);

// Helper function to show status messages
function showStatus(message, isError = false) {
  const status = document.getElementById('status');
  const messageDiv = status.querySelector('div');
  messageDiv.textContent = message;
  status.classList.remove('hidden');
  messageDiv.classList.remove('bg-green-100', 'text-green-700', 'bg-red-100', 'text-red-700');
  
  if (isError) {
    messageDiv.classList.add('bg-red-100', 'text-red-700');
  } else {
    messageDiv.classList.add('bg-green-100', 'text-green-700');
  }
  
  // Hide the message after 3 seconds unless it's an error
  if (!isError) {
    setTimeout(() => {
      status.classList.add('hidden');
    }, 3000);
  }
}

// Get the current tab's information
async function getCurrentTab() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  return tab;
}

// Function to check if current page is a YouTube video
function isYouTubeVideo(url) {
  return url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
}

// Function to get video ID from YouTube URL
function getYouTubeVideoId(url) {
  const match = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
  return match ? match[1] : null;
}

// Extract content from the page
async function getPageContent() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  
  // Check if it's a YouTube video
  const videoId = getYouTubeVideoId(tab.url);
  if (videoId) {
    // First expand the description
    await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: () => {
        const moreButton = document.querySelector('#expand, #description button.yt-formatted-string[aria-label*="Show more"]');
        if (moreButton) {
          moreButton.click();
        }
      }
    });

    // Wait for description to expand
    await new Promise(resolve => setTimeout(resolve, 500));

    // Get basic info
    const content = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: () => {
        const title = document.title.replace('- YouTube', '').trim();
        const duration = document.querySelector('.ytp-time-duration')?.textContent || '';
        const description = document.querySelector('#description-inline-expander, ytd-expander[slot="description"] #content, #description')?.innerText?.trim() || '';
        const channelName = document.querySelector('#owner #channel-name a')?.textContent?.trim() || '';
        
        // Click show transcript if available
        const transcriptButton = Array.from(document.querySelectorAll('button'))
          .find(button => button.textContent.toLowerCase().includes('show transcript'));
        if (transcriptButton) {
          transcriptButton.click();
        }
        
        return { title, duration, description, channelName };
      }
    });

    // Wait for transcript to load
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Get transcript
    const transcriptContent = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: () => {
        const transcriptSegments = document.querySelectorAll('ytd-transcript-segment-renderer');
        if (!transcriptSegments.length) return '';
        
        return Array.from(transcriptSegments)
          .map(segment => {
            const timestamp = segment.querySelector('.segment-timestamp')?.textContent?.trim() || '';
            const text = segment.querySelector('.segment-text')?.textContent?.trim() || '';
            return `[${timestamp}] ${text}`;
          })
          .join('\n');
      }
    });

    const result = content[0].result;
    const transcript = transcriptContent[0].result;

    // Format the content with clear sections
    const formattedContent = [
      `Title: ${result.title}`,
      `Duration: ${result.duration}`,
      '',
      'Description:',
      '----------------------------------------',
      result.description,
      '',
      'Transcript:',
      '----------------------------------------',
      transcript,
      '',
      `Source: ${tab.url}`
    ].join('\n');

    return {
      title: result.title,
      content: formattedContent,
      url: tab.url,
      metadata: {
        url: tab.url,
        siteName: 'YouTube',
        description: result.description,
        image: `https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg`,
        author: result.channelName,
        type: 'video',
        duration: result.duration,
        videoId: videoId
      }
    };
  }
  
  // For non-YouTube pages, use the existing content extraction
  const content = await chrome.scripting.executeScript({
    target: { tabId: tab.id },
    func: () => {
      // Get OpenGraph and meta data
      const metadata = {
        title: document.title,
        description: '',
        image: '',
        url: window.location.href,
        siteName: '',
        author: '',
        publishedTime: '',
        type: '',
        keywords: ''
      };

      // Get meta tags
      const metaTags = document.getElementsByTagName('meta');
      for (const meta of metaTags) {
        const property = meta.getAttribute('property') || meta.getAttribute('name');
        const content = meta.getAttribute('content');
        
        if (!property || !content) continue;
        
        switch (property.toLowerCase()) {
          case 'og:title':
            metadata.title = content;
            break;
          case 'og:description':
          case 'description':
            metadata.description = content;
            break;
          case 'og:image':
            metadata.image = content;
            break;
          case 'og:site_name':
            metadata.siteName = content;
            break;
          case 'og:type':
            metadata.type = content;
            break;
          case 'article:published_time':
            metadata.publishedTime = content;
            break;
          case 'article:author':
          case 'author':
            metadata.author = content;
            break;
          case 'keywords':
            metadata.keywords = content;
            break;
        }
      }

      // Get main content
      const article = document.querySelector('article');
      const main = document.querySelector('main');
      const body = document.body;

      const contentElement = article || main || body;
      
      const elementsToRemove = contentElement.querySelectorAll('script, style, nav, header, footer, iframe, .ad, .advertisement');
      elementsToRemove.forEach(el => el.remove());

      // Format the content with metadata
      const formattedContent = [
        `Title: ${metadata.title}`,
        metadata.description ? `Description: ${metadata.description}` : '',
        metadata.siteName ? `Site: ${metadata.siteName}` : '',
        metadata.author ? `Author: ${metadata.author}` : '',
        metadata.publishedTime ? `Published: ${new Date(metadata.publishedTime).toLocaleString()}` : '',
        metadata.type ? `Type: ${metadata.type}` : '',
        metadata.keywords ? `Keywords: ${metadata.keywords}` : '',
        metadata.image ? `Featured Image: ${metadata.image}` : '',
        '',
        'Content:',
        '----------------------------------------',
        contentElement.innerText.trim(),
        '',
        `Source: ${metadata.url}`
      ].filter(line => line !== '').join('\n');

      return {
        title: metadata.title,
        content: formattedContent,
        url: metadata.url,
        metadata: metadata
      };
    }
  });

  return content[0].result;
}

// Check if user is logged in
function isLoggedIn() {
  const token = localStorage.getItem('extension_token');
  return !!token;
}

// Show appropriate form
function updateUI() {
  const loginForm = document.getElementById('loginForm');
  const saveForm = document.getElementById('saveForm');
  
  if (isLoggedIn()) {
    loginForm.classList.add('hidden');
    saveForm.classList.remove('hidden');
  } else {
    loginForm.classList.remove('hidden');
    saveForm.classList.add('hidden');
  }
}

// Handle login
document.getElementById('authForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  
  try {
    showStatus('Logging in...');
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    // Clear any existing session data
    localStorage.removeItem('extension_token');
    localStorage.removeItem('extension_user_id');

    // Create session using REST API
    const session = await createSession(email, password);
    const user = await getAccount(session.$id);

    localStorage.setItem('extension_token', session.$id);
    localStorage.setItem('extension_user_id', user.$id);

    showStatus('Login successful!');
    updateUI();
    
    // Pre-fill the save form
    initializeSaveForm();

  } catch (error) {
    console.error('Login error:', error);
    showStatus(`Login failed: ${error.message}`, true);
    
    // Clear any invalid session data
    localStorage.removeItem('extension_token');
    localStorage.removeItem('extension_user_id');
    updateUI();
  }
});

// Handle logout
document.getElementById('logoutBtn').addEventListener('click', async () => {
  try {
    const sessionId = localStorage.getItem('extension_token');
    if (sessionId) {
      await deleteSession(sessionId);
    }
  } catch (error) {
    console.error('Logout error:', error);
  } finally {
    localStorage.removeItem('extension_token');
    localStorage.removeItem('extension_user_id');
    updateUI();
  }
});

// Initialize save form with page data
async function initializeSaveForm() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  const titleInput = document.getElementById('title');
  titleInput.value = tab.title?.replace('- YouTube', '').trim() || '';

  // Show YouTube-specific UI if it's a YouTube video
  const youtubeInfo = document.getElementById('youtubeInfo');
  if (isYouTubeVideo(tab.url)) {
    youtubeInfo.classList.remove('hidden');
    
    // Get video duration
    const content = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: () => {
        const durationElement = document.querySelector('.ytp-time-duration');
        return durationElement ? durationElement.textContent : '';
      }
    });
    
    const videoDuration = document.getElementById('videoDuration');
    if (content[0].result) {
      videoDuration.textContent = `(${content[0].result})`;
    }
  } else {
    youtubeInfo.classList.add('hidden');
  }
}

// Handle save form submission
document.getElementById('clipperForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  try {
    const token = localStorage.getItem('extension_token');
    const userId = localStorage.getItem('extension_user_id');
    
    if (!token || !userId) {
      throw new Error('Please log in first');
    }

    showStatus('Getting page content...');
    const title = document.getElementById('title').value;
    const category = document.getElementById('category').value;
    const includeContent = document.getElementById('includeContent').checked;

    if (!category) {
      throw new Error('Please select a category');
    }

    const pageInfo = await getPageContent();
    const content = includeContent ? pageInfo.content : '';

    const noteData = {
      title,
      category,
      content: `${content}\n\nSource: ${pageInfo.url}`,
      isPublic: false,
      userId: userId,
      metadata: {
        url: pageInfo.url,
        siteName: pageInfo.metadata?.siteName || '',
        description: pageInfo.metadata?.description || '',
        image: pageInfo.metadata?.image || '',
        author: pageInfo.metadata?.author || '',
        publishedTime: pageInfo.metadata?.publishedTime || '',
        type: pageInfo.metadata?.type || ''
      }
    };

    showStatus('Saving to Second Brain...');

    // Use Appwrite API directly
    await createNote(token, noteData);

    showStatus('Saved successfully!');
    setTimeout(() => window.close(), 1500);

  } catch (error) {
    console.error('Error saving note:', error);
    showStatus(error.message || 'Error saving note. Please try again.', true);
    
    if (error.message.includes('Session expired')) {
      localStorage.removeItem('extension_token');
      localStorage.removeItem('extension_user_id');
      updateUI();
    }
  }
});

// Initialize UI when popup opens
document.addEventListener('DOMContentLoaded', () => {
  updateUI();
  if (isLoggedIn()) {
    initializeSaveForm();
  }
}); 