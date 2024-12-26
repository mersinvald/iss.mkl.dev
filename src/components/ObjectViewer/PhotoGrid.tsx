import React, { useState } from 'react';
import Image from 'next/image';
import ImageModal from './ImageModal';

interface GridCell {
  src: string;
  alt: string;
  rowSpan?: number;
  colSpan?: number;
  caption?: string;
}

interface PhotoGridProps {
  cells: GridCell[][];
  width?: string;
  float?: 'left' | 'right' | 'none';
}

const PhotoGrid: React.FC<PhotoGridProps> = ({ cells, width = '100%', float = 'none' }) => {
  const [selectedImage, setSelectedImage] = useState<GridCell | null>(null);
  const gridTemplateRows = `repeat(${cells.length}, 1fr)`;
  const gridTemplateColumns = `repeat(${Math.max(...cells.map(row => row.length))}, 1fr)`;

  return (
    <>
      <div
        className={`
          grid gap-2 mb-4
          ${float === 'left' ? 'float-left mr-4' : ''}
          ${float === 'right' ? 'float-right ml-4' : ''}
          ${width === '50%' ? 'w-1/2' : width === '33%' ? 'w-1/3' : width === '25%' ? 'w-1/4' : 'w-full'}
        `}
        style={{
          gridTemplateRows,
          gridTemplateColumns,
        }}
      >
        {cells.map((row, i) =>
          row.map((cell, j) => (
            <div
              key={`${i}-${j}`}
              className="relative cursor-pointer group"
              style={{
                gridRow: `span ${cell.rowSpan || 1}`,
                gridColumn: `span ${cell.colSpan || 1}`,
                aspectRatio: '1'
              }}
              onClick={() => setSelectedImage(cell)}
            >
              <Image
                src={cell.src}
                alt={cell.alt}
                fill
                className="rounded-lg object-cover transition-transform group-hover:scale-[1.02]"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors rounded-lg" />
              {cell.caption && (
                <p className="absolute bottom-0 left-0 right-0 p-2 text-sm text-white bg-black/50 rounded-b-lg">
                  {cell.caption}
                </p>
              )}
            </div>
          ))
        )}
      </div>

      {selectedImage && (
        <ImageModal
          src={selectedImage.src}
          alt={selectedImage.alt}
          caption={selectedImage.caption}
          onClose={() => setSelectedImage(null)}
        />
      )}
    </>
  );
};

export default PhotoGrid;