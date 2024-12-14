import { z } from "zod";

// Configuration for cloud storage
export const storageConfigSchema = z.object({
  cdnDomain: z.string().url(),
  b2Bucket: z.string(),
  imageSizes: z.object({
    preview: z.object({
      width: z.number(),
      height: z.number(),
      quality: z.number()
    }),
    publish: z.object({
      maxWidth: z.number(),
      quality: z.number()
    })
  })
});

// Modified image schema for cloud storage
export const imageFileSchema = z.object({
  filename: z.string(), // Base filename without path
  metadata: z.object({
    width: z.number(),
    height: z.number(),
    fileSize: z.number(),
    format: z.string(),
    takenAt: z.string().datetime().optional(),
    exposure: z.number().optional(),
    iso: z.number().optional(),
    focalLength: z.number().optional(),
    telescope: z.string().optional()
  }),
  urls: z.object({
    preview: z.string(), // CDN URL for preview
    publish: z.string(),    // CDN URL for web size
    full: z.string().optional(), // CDN URL for full size
    raw: z.string().optional() // Direct B2 URL for raw file
  }),
  storageKeys: z.object({
    preview: z.string(), // B2 key for preview
    publish: z.string(),    // B2 key for web size
    full: z.string().optional(), // CDN URL for full size
    raw: z.string().optional() // B2 key for raw file
  })
});

export const coordinatesSchema = z.object({
  rightAscension: z.string(),
  declination: z.string()
});

export const equipmentSchema = z.object({
  telescope: z.string(),
  camera: z.string(),
  mount: z.string(),
  filters: z.array(z.string()).optional(),
  guiding: z.string().optional(),
  other: z.array(z.string()).optional()
});


// Simplified for local file system
export const observationSchema = z.object({
  id: z.string().uuid(),
  date: z.string().datetime(),
  location: z.object({
    name: z.string(),
    latitude: z.number(),
    longitude: z.number(),
    elevation: z.number().optional()
  }),
  equipment: z.object({
    telescope: z.string(),
    camera: z.string(),
    mount: z.string(),
    filters: z.array(z.string()).optional(),
    guiding: z.string().optional(),
    controller: z.string().optional(),
    other: z.array(z.string()).optional()
  }),
  conditions: z.object({
    seeing: z.number().min(1).max(5),
    transparency: z.number().min(1).max(5),
    moonPhase: z.number().min(0).max(100),
    temperature: z.number().optional(),
    humidity: z.number().optional()
  }),
  images: z.object({
    raw: z.string().optional(), // Path to raw file if stored
    processed: z.object({
      preview: z.string(), // Path relative to public/images/[designation]/[observation-date]/
      publish: z.string(),    // Path relative to public/images/[designation]/[observation-date]/
      full: z.string().optional(), // Path relative to public/images/[designation]/[observation-date]/
      raw: z.string().optional(), // Path relative to public/images/[designation]/[observation-date]/
      abstract: z.string().optional()
    })
  }),
  exposure: z.object({
    total: z.number(), // in seconds
    focal_length: z.number(),
    focal_ratio: z.string(),
    subFrames: z.array(z.object({
      duration: z.number(),
      count: z.number(),
      binning: z.number().optional(),
      gain: z.number().optional(),
      filter: z.string().optional(),
      resolution: z.object({
        width: z.number(),
        height: z.number()
      }).optional(),
      bitdepth: z.number().optional(),
      xpixsz: z.number().optional(),
      ypixsz: z.number().optional(),
      tempavg: z.number().optional(),
      focusavg: z.number().optional(),
      bayerpat: z.string().optional()
    }))
  }),
  notes: z.string().optional(),
  processingDetails: z.string().optional()
});

export const objectSchema = z.object({
  id: z.string().uuid(),
  designation: z.object({
    primary: z.string(), // e.g., "M31"
    alternates: z.array(z.string()) // e.g., ["NGC 224", "UGC 454"]
  }),
  name: z.string(),
  type: z.string(),
  categories: z.array(z.string()),
  coordinates: coordinatesSchema,
  constellation: z.string(),
  description: z.object({
    short: z.string().max(280),
    full: z.string()
  }),
  metadata: z.object({
    magnitude: z.number().optional(),
    size: z.string().optional(),
    distance: z.string().optional(),
    discoveredBy: z.string().optional(),
    discoveryDate: z.string().optional()
  }),
  observations: z.array(z.string().uuid()), // References to observation IDs
  lastModified: z.string().datetime()
});

// Export types for use in components
export type StorageConfig = z.infer<typeof storageConfigSchema>;
export type ImageFile = z.infer<typeof imageFileSchema>;
export type Coordinates = z.infer<typeof coordinatesSchema>;
export type Equipment = z.infer<typeof equipmentSchema>;
export type Observation = z.infer<typeof observationSchema>;
export type DeepSkyObject = z.infer<typeof objectSchema>;
