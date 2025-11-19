// src/app/[...path]/page.tsx
import { ContentManager } from '@/lib/contentManager';
import { ObjectViewer } from '@/components/ObjectViewer/ObjectViewer';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

// Update to handle observation ID
export async function generateStaticParams() {
  const manager = new ContentManager({
    contentDir: process.cwd() + '/content',
    publicDir: process.cwd() + '/public/images'
  });
  
  const objects = await manager.loadAllObjects();
  const paths = [];

  for (const obj of objects) {
    // Base object path
    paths.push({
      path: [obj.designation.primary.toLowerCase()]
    });

    // Load observations and create paths for each
    const observations = await manager.loadObservations(obj.designation.primary);
    observations.forEach(obs => {
      paths.push({
        path: [obj.designation.primary.toLowerCase(), obs.id]
      });
    });
  }

  return paths;
}

export default async function Page({ params }: { params: Promise<{ path: string[] }> }) {
  const path = (await params).path;
  const designation = path[0];
  const observationId = path[1]; // Will be undefined for base object path
  
  const manager = new ContentManager({
    contentDir: process.cwd() + '/content',
    publicDir: process.cwd() + '/public/images'
  });

  const object = await manager.loadObject(designation);
  const observations = await manager.loadObservations(designation);

  // Find the initial observation index
  let initialObservationIndex = 0;
  if (observationId) {
    const index = observations.findIndex(obs => obs.id === observationId);
    if (index !== -1) {
      initialObservationIndex = index;
    }
  }

  // Extract Russian translation if available
  const translatedDescription = object.translations?.ru?.description;

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
          initialObservationIndex={initialObservationIndex}
          observations={observations.map(obs => ({
            id: obs.id,
            objectName: object.name,
            previewImageUrl: obs.images.processed.preview,
            publishImageUrl: obs.images.processed.publish,
            dateCaptured: obs.date,
            location: obs.location.name,
            equipment: obs.equipment,
            exposure: `${obs.exposure.total} seconds`,
            notes: obs.notes
          }))}
          description={object.description.full}
          translatedDescription={translatedDescription}
        />
      </div>
    </main>
  );
}
