import { ContentManager } from '@/lib/contentManager';
import { DeepSkyGallery } from '@/components/DeepSkyGallery/DeepSkyGallery';
import Navigation from '@/components/Navigation/Navigation';

export default async function Home() {
  const manager = new ContentManager({
    contentDir: process.cwd() + '/content',
    publicDir: process.cwd() + '/public/images'
  });

  const objects = await manager.loadAllObjects();
  const categories = await manager.getCategories();

  return (
    <>
      <Navigation />
      <main className="mx-auto max-w-7xl px-4 py-8">
        <DeepSkyGallery initialObjects={objects} initialCategories={categories} />
      </main>
    </>
  );
}