import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { marked } from 'marked';
import ImageModal from './ImageModal';

interface ContentBlock {
  type: 'text' | 'image-block' | 'photo-table';
  content: string;
  image?: {
    src: string;
    alt: string;
    caption?: string;
    size?: string;
    aspect?: string;
  };
  imagePosition?: 'left' | 'right';
  photos?: Array<{
    src: string;
    alt: string;
    caption?: string;
  }>;
}

const Notes: React.FC<{ content: string }> = ({ content }) => {
  const [blocks, setBlocks] = useState<ContentBlock[]>([]);
  const [selectedImage, setSelectedImage] = useState<{ src: string; alt: string; caption?: string } | null>(null);

  useEffect(() => {
    const parseContent = async () => {
      // Configure marked
      marked.setOptions({
        breaks: true,
        gfm: true
      });

      // Split content into blocks
      const imageBlockRegex = /:::\s*image-block\s*(left|right)(?:\s+(\d+%|small|medium|large))?(?:\s+(\d+\/\d+|square|wide|portrait))?\n([\s\S]*?)\n:::/g;
      const photoTableRegex = /:::\s*photo-table\n\|([\s\S]*?)\|\n:::/gm;
      
      const parsedBlocks: ContentBlock[] = [];
      let lastIndex = 0;

      // Find all blocks
      const text = content;

      while (lastIndex < text.length) {
        // Try to match image block
        imageBlockRegex.lastIndex = lastIndex;
        const imageBlockMatch = imageBlockRegex.exec(text);
        
        // Try to match photo table
        photoTableRegex.lastIndex = lastIndex;
        const photoTableMatch = photoTableRegex.exec(text);

        // Find which match is earlier (if any)
        const imageBlockIndex = imageBlockMatch?.index ?? Infinity;
        const photoTableIndex = photoTableMatch?.index ?? Infinity;

        if (imageBlockIndex === Infinity && photoTableIndex === Infinity) {
          // No more matches, add remaining content as text
          const remainingContent = text.slice(lastIndex).trim();
          if (remainingContent) {
            parsedBlocks.push({
              type: 'text',
              content: await marked(remainingContent)
            });
          }
          break;
        }

        // Add any content before the next block
        const nextBlockIndex = Math.min(imageBlockIndex, photoTableIndex);
        if (nextBlockIndex > lastIndex) {
          const previousContent = text.slice(lastIndex, nextBlockIndex).trim();
          if (previousContent) {
            parsedBlocks.push({
              type: 'text',
              content: await marked(previousContent)
            });
          }
        }

        if (imageBlockIndex < photoTableIndex) {
          // Handle image block
          const [, position, size = 'large', aspect = '3/2', blockContent] = imageBlockMatch!;
          const lines = blockContent.trim().split('\n');
          const imageMatch = lines[0].match(/!\[(.*?)\]\((.*?)\)/);
          
          if (imageMatch) {
            const [, alt, src] = imageMatch;
            const blockText = lines.slice(1).join('\n').trim();
            
            parsedBlocks.push({
              type: 'image-block',
              content: await marked(blockText),
              image: {
                src,
                alt,
                caption: alt,
                size,
                aspect
              },
              imagePosition: position as 'left' | 'right'
            });
          }
          lastIndex = imageBlockIndex + imageBlockMatch![0].length;
        } else {
          // Handle photo table
          const tableContent = photoTableMatch![1].trim();
          const photos = tableContent.split('|').map(cell => {
            const match = cell.trim().match(/!\[(.*?)\]\((.*?)\)/);
            if (match) {
              const [, alt, src] = match;
              const [title, caption] = alt.split(':').map(s => s.trim());
              return {
                src,
                alt: title,
                caption: caption || title
              };
            }
            return null;
          }).filter(Boolean);

          parsedBlocks.push({
            type: 'photo-table',
            content: '',
            photos: photos as Array<{ src: string; alt: string; caption?: string; }>
          });
          
          lastIndex = photoTableIndex + photoTableMatch![0].length;
        }
      }

      setBlocks(parsedBlocks);
    };

    parseContent();
  }, [content]);

  const getImageSizeClasses = (size?: string) => {
    switch (size) {
      case 'small':
        return 'lg:w-48';
      case 'medium':
        return 'lg:w-64';
      case '33%':
      case '1/3':
        return 'lg:w-1/3';
      case '25%':
      case '1/4':
        return 'lg:w-1/4';
      case '50%':
      case '1/2':
        return 'lg:w-1/2';
      default:
        if (size?.endsWith('%')) {
          return `lg:w-[${size}]`;
        }
        return 'w-full';
    }
  };

  const getAspectRatioStyle = (aspect?: string) => {
    switch (aspect) {
      case 'square':
        return 'aspect-[1/1]';
      case 'wide':
        return 'aspect-[16/9]';
      case 'portrait':
        return 'aspect-[2/3]';
      default:
        if (aspect?.includes('/')) {
          const [width, height] = aspect.split('/');
          return `aspect-[${width}/${height}]`;
        }
        return 'aspect-[3/2]';
    }
  };

  const renderBlock = (block: ContentBlock, index: number) => {
    switch (block.type) {
      case 'photo-table':
        return (
          <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-4 my-8">
            {block.photos?.map((photo, photoIndex) => (
              <div 
                key={photoIndex}
                className="relative aspect-[3/2] cursor-pointer transition-transform hover:scale-[1.02]"
                onClick={() => setSelectedImage({
                  src: photo.src,
                  alt: photo.alt,
                  caption: photo.caption
                })}
              >
                <Image
                  src={photo.src}
                  alt={photo.alt}
                  fill
                  className="object-cover rounded-lg"
                />
                {photo.caption && (
                  <div className="absolute bottom-0 left-0 right-0 p-2 bg-black/50 text-white text-sm rounded-b-lg">
                    {photo.caption}
                  </div>
                )}
              </div>
            ))}
          </div>
        );
      
      case 'image-block':
        return (
          <div key={index} className="mb-8">
            <div className="lg:flex lg:gap-6">
              <div
                className={`
                  prose prose-invert max-w-none
                  ${block.imagePosition === 'right' ? 'lg:order-1' : 'lg:order-2'}
                  flex-1
                `}
                dangerouslySetInnerHTML={{ __html: block.content }}
              />
              
              {block.image && (
                <div
                  className={`
                    relative mt-4 lg:mt-0
                    ${block.imagePosition === 'right' ? 'lg:order-2' : 'lg:order-1'}
                    ${getImageSizeClasses(block.image.size)}
                    cursor-pointer transition-transform hover:scale-[1.02]
                  `}
                >
                  <div className={`relative rounded-lg overflow-hidden ${getAspectRatioStyle(block.image.aspect)}`}>
                    <Image
                      src={block.image.src}
                      alt={block.image.alt}
                      fill
                      className="object-cover rounded-lg"
                      onClick={() => block.image && setSelectedImage({
                        src: block.image.src,
                        alt: block.image.alt,
                        caption: block.image.caption
                      })}
                    />
                    {block.image.caption && (
                      <div className="absolute bottom-0 left-0 right-0 p-2 bg-black/50 text-white text-sm">
                        {block.image.caption}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        );

      default:
        return (
          <div 
            key={index}
            className="prose prose-invert max-w-none mb-8"
            dangerouslySetInnerHTML={{ __html: block.content }}
          />
        );
    }
  };

  return (
    <div className="space-y-8">
      {blocks.map((block, index) => renderBlock(block, index))}

      {selectedImage && (
        <ImageModal
          src={selectedImage.src}
          alt={selectedImage.alt}
          caption={selectedImage.caption}
          onClose={() => setSelectedImage(null)}
        />
      )}
    </div>
  );
};

export default Notes;