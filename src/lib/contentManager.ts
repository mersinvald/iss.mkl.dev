// src/lib/content/contentManager.ts
import { promises as fs } from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { objectSchema, observationSchema, Observation } from './types';

export class ContentManager {
  private readonly contentDir: string;
  private readonly publicDir: string;

  constructor(config: {
    contentDir: string;  // Path to content markdown files
    publicDir: string;   // Path to public/images directory
  }) {
    this.contentDir = config.contentDir;
    this.publicDir = config.publicDir;
  }

  /**
   * Get the image paths for an observation
   */
  private getObservationImagePaths(designation: string, date: string) {
    // This should match your public directory structure
    return {
      publicPath: `/images/${designation.toLowerCase()}/${date}`, // URL path
      fsPath: path.join(this.publicDir, designation.toLowerCase(), date) // Filesystem path
    };
  }

  /**
   * Load and validate a deep sky object's metadata
   */
  async loadObject(designation: string) {
    const objectPath = path.join(this.contentDir, 'objects', designation.toLowerCase(), 'index.md');
    const content = await fs.readFile(objectPath, 'utf-8');
    const { data, content: description } = matter(content);

    const shortDescription = description.split('\n\n')[0];

    const objectData = {
      ...data,
      metadata: {
        ...data.metadata,
        discoveryDate: data.metadata?.discoveryDate?.toString(),
      },
      lastModified: data.lastModified instanceof Date ? 
        data.lastModified.toISOString() : 
        data.lastModified,
      description: {
        short: shortDescription,
        full: description
      }
    };

    return objectSchema.parse(objectData);
  }

  /**
   * Load all observations for a specific object
   */
  async loadObservations(designation: string): Promise<Observation[]> {
    const observationsPath = path.join(
      this.contentDir,
      'objects',
      designation.toLowerCase(),
      'observations'
    );
  
    const files = await fs.readdir(observationsPath);
    const observations = await Promise.all(
      files
        .filter(file => file.endsWith('.md'))  // Changed from .yaml to .md
        .map(async file => {
          const content = await fs.readFile(path.join(observationsPath, file), 'utf-8');
          const { data } = matter(content);  // Using gray-matter for md files
          
          // Get the date from filename (YYYY-MM-DD.md)
          const date = path.basename(file, '.md');
          
          // Ensure image paths are correct
          const { publicPath } = this.getObservationImagePaths(designation, date);

          // Convert date if it's a Date object
          const processedData = {
            ...data,
            date: data.date instanceof Date ? data.date.toISOString() : data.date
          };
          
          // Handle single processed image
          const processedImage = {
            ...data.images.processed,
            preview: `${publicPath}/${data.images.processed.preview}`,
            publish: `${publicPath}/${data.images.processed.publish}`
          };
  
          return observationSchema.parse({
            ...processedData,
            images: {
              ...data.images,
              processed: processedImage,
            }
          });
        })
    );
  
    return observations.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  /**
   * Load all deep sky objects for gallery view
   */
  async loadAllObjects() {
    const objectsPath = path.join(this.contentDir, 'objects');
    const directories = await fs.readdir(objectsPath);

    const objects = await Promise.all(
      directories.map(async dir => {
        const object = await this.loadObject(dir);
        const observations = await this.loadObservations(dir);
        
        // Use the first processed image from the latest observation as preview
        const latestObservation = observations[0];
        const previewImage = latestObservation?.images.processed?.preview;

        return {
          ...object,
          previewImage,
          observationCount: observations.length,
          lastObservation: latestObservation?.date,
          lastObservationId: latestObservation?.id
        };
      })
    );

    return objects.sort((a, b) => a.designation.primary.localeCompare(b.designation.primary));
  }

  /**
   * Get unique categories across all objects
   */
  async getCategories(): Promise<string[]> {
    const objects = await this.loadAllObjects();
    const categories = new Set<string>();
    
    objects.forEach(obj => {
      obj.categories.forEach(cat => categories.add(cat));
    });

    return Array.from(categories).sort();
  }
}

// Example of how the files would be structured:
/*
public/
  images/
    m31/
      2024-03-15/
        preview.jpg
        publish.jpg
      2024-02-20/
        preview.jpg
        publish.jpg
content/
  objects/
    m31/
      index.md
      observations/
        2024-03-15.md
        2024-02-20.md
*/

export async function getObjectData(designation: string) {
  const manager = new ContentManager({
    contentDir: path.join(process.cwd(), 'content'),
    publicDir: path.join(process.cwd(), 'public/images')
  });
  
  const object = await manager.loadObject(designation);
  const observations = await manager.loadObservations(designation);
  return { object, observations };
}