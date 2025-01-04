import { Metadata } from 'next';
import NoteDisplay from './NoteDisplay';
import { databases, DATABASE_ID, COLLECTION_ID } from '@/lib/conf';
import Comments from './Comments';

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function Page(props: PageProps) {
  const { id } = await props.params;
  
  try {
    const note = await databases.getDocument(DATABASE_ID, COLLECTION_ID, id);
    return (
      <div className="flex flex-col gap-8 p-4 min-h-screen">
        <div className="flex-none">
          <NoteDisplay id={id} initialNote={note} />
        </div>
        <div className="flex-none mt-8">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
              <Comments noteId={id} />
            </div>
          </div>
        </div>
      </div>
    );
  } catch (error) {
    return (
      <div className="flex flex-col gap-8 p-4 min-h-screen">
        <div className="flex-none">
          <NoteDisplay id={id} />
        </div>
        <div className="flex-none mt-8">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
              <Comments noteId={id} />
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  return {
    title: `Note ${id}`,
  };
} 