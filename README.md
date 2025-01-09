## Cloning the Repository

To get started with this project, clone the repository using the following command:

```bash
git clone <repository-url>
```

## Install Dependencies

Make sure you have [pnpm](https://pnpm.io/) installed. Then, install the dependencies:

```bash
pnpm i
```

## Setting Up Environment Variables

Create a `.env.local` file in the root directory of your project and add the following environment variables:

```env
NEXT_PUBLIC_APPWRITE_ENDPOINT=
NEXT_PUBLIC_APPWRITE_PROJECT_ID=
NEXT_PUBLIC_APPWRITE_DATABASE_ID=
NEXT_PUBLIC_APPWRITE_NOTES_COLLECTION_ID=
NEXT_PUBLIC_APPWRITE_BUCKET_ID=
NEXT_PUBLIC_GEMINI_API_KEY=
```

## Appwrite Collection Configuration

Ensure the Appwrite collection has the following attributes configured:

|Collection Key|Type|Default Value|
|---|---|---|
|userId|string|-|
|title|string|-|
|category|string|-|
|content|string|-|
|createdAt|string|-|
|isPublic|boolean|false|
|updatedAt|string|-|
|blocksData|string|-|
|connections|string|-|
|metadataStr|string|-|
|position|string|-|

## Chrome Extension Setup

### Loading the Extension in Chrome

1. Open Chrome and navigate to `chrome://extensions/`.
    
2. Enable **Developer mode** using the toggle in the top-right corner.
    
3. Click on **Load unpacked** and select the directory where your extension's files are located.
    
4. Verify that the extension loads successfully and note the Extension ID.
    

### Appwrite Configuration for the Extension

In the `appwrite.js` file within the Chrome extension, configure the following variables:

```js
const ENDPOINT = '';
const PROJECT_ID = '';
const DATABASE_ID = '';
const COLLECTION_ID = '';
const BUCKET_ID = '';
```

### Adding Extension ID to Appwrite

Make sure the Chrome Extension ID is added to the Appwrite platform under authorized platforms. You can find the Extension ID in the Chrome extension developer tools after loading the unpacked extension.

## Running the Application

After completing the setup, you can run the application locally with:

```bash
pnpm run dev
```

## Additional Notes

1. Ensure your Appwrite instance is running and properly configured.
    
2. Double-check that all environment variables are correctly set to avoid runtime issues.
