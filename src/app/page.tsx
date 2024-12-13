import { ContentManager } from '@/lib/contentManager';
import { DeepSkyGallery } from '@/components/DeepSkyGallery/DeepSkyGallery'

export default async function Home() {
  const manager = new ContentManager({
    contentDir: process.cwd() + '/content',
    publicDir: process.cwd() + '/public/images'
  });

  const objects = await manager.loadAllObjects();
  const categories = await manager.getCategories();

  return (
    <main className="mx-auto max-w-7xl px-4 py-8">
      <div className="flex items-baseline mb-4">
        <h1 className="text-3xl font-bold mr-4">I See Stars</h1>
        <h2 className="text-sm text-gray-500">My amateur astrophotography journey documented</h2>
      </div>
      <DeepSkyGallery initialObjects={objects} initialCategories={categories} />
    </main>
  );
}