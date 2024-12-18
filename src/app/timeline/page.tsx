// src/app/timeline/page.tsx
import { ContentManager } from '@/lib/contentManager';
import Navigation from '@/components/Navigation/Navigation';
import TimelineView from '@/components/Timeline/View';

export default async function Timeline() {
  const manager = new ContentManager({
    contentDir: process.cwd() + '/content',
    publicDir: process.cwd() + '/public/images'
  });

  // Load all objects to get their metadata
  const objects = await manager.loadAllObjects();
  const categories = await manager.getCategories();
  
  // Load all observations and combine with object metadata
  const timelineObservations = await Promise.all(
    objects.map(async obj => {
      const observations = await manager.loadObservations(obj.designation.primary);
      return observations.map(obs => ({
        id: obs.id,
        date: obs.date,
        objectDesignation: obj.designation.primary,
        objectName: obj.name,
        categories: obj.categories,
        location: {
          name: obs.location.name
        },
        equipment: {
          telescope: obs.equipment.telescope,
          camera: obs.equipment.camera
        },
        previewImageUrl: obs.images.processed.preview,
        notes: obs.notes
      }));
    })
  );

  // Flatten and sort by date
  const sortedObservations = timelineObservations
    .flat()
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const sortedCategories = categories.sort((a, b) => a.localeCompare(b));

  return (
    <>
      <Navigation />
      <main className="mx-auto max-w-7xl px-4 py-8">
        <TimelineView observations={sortedObservations} categories={sortedCategories} />
      </main>
    </>
  );
}