import { Metadata } from 'next';
import NoteDisplay from './NoteDisplay';
import { databases, DATABASE_ID, COLLECTION_ID } from '@/lib/conf';

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function Page(props: PageProps) {
  const { id } = await props.params;
  
  try {
    const note = await databases.getDocument(DATABASE_ID, COLLECTION_ID, id);
    return <NoteDisplay id={id} initialNote={note} />;
  } catch (error) {
    return <NoteDisplay id={id} />;
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  return {
    title: `Note ${id}`,
  };
} 