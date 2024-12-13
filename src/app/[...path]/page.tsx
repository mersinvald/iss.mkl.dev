import { ContentManager } from '@/lib/contentManager';
import { ObjectViewer } from '@/components/ObjectViewer/ObjectViewer';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

// Generate static paths for all objects
export async function generateStaticParams() {
  const manager = new ContentManager({
    contentDir: process.cwd() + '/content',
    publicDir: process.cwd() + '/public/images'
  });
  
  const objects = await manager.loadAllObjects();
  return objects.map((obj) => ({
    path: [obj.designation.primary.toLowerCase()]
  }));
}

export default async function Page({ params }: { params: Promise<{ path: string[] }> }) {
  const path = (await params).path;

  const designation = path[0];
  
  const manager = new ContentManager({
    contentDir: process.cwd() + '/content',
    publicDir: process.cwd() + '/public/images'
  });

  const object = await manager.loadObject(designation);
  const observations = await manager.loadObservations(designation);

  return (
    <main className="min-h-screen bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <Link 
          href="/" 
          className="inline-flex items-center text-gray-400 hover:text-white mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Gallery
        </Link>

        <ObjectViewer 
          designation={object.designation.primary}
          name={object.name}
          categories={object.categories}
          observations={observations.map(obs => ({
            previewImageUrl: obs.images.processed.preview,
            publishImageUrl: obs.images.processed.publish,
            dateCaptured: obs.date,
            location: obs.location.name,
            equipment: obs.equipment,
            exposure: `${obs.exposure.total} seconds`,
            notes: obs.notes
          }))}
          description={object.description.full}
        />
      </div>
    </main>
  );
}