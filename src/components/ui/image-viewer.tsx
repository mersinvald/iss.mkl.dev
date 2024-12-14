import React, { useState, useEffect, useRef } from 'react';
import { Progress } from '@/components/ui/progress';
import { ZoomIn, ZoomOut, Maximize2 } from 'lucide-react';

interface CustomImageViewerProps {
  fullImageUrl: string;
  alt: string;
  onClick?: () => void;
  containerAspectRatio?: number;
}

interface Dimensions {
  width: number;
  height: number;
}

interface Position {
  x: number;
  y: number;
}

const CustomImageViewer: React.FC<CustomImageViewerProps> = ({
  fullImageUrl,
  alt,
  onClick,
  containerAspectRatio = 3/2,
}) => {
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [zoom, setZoom] = useState<number>(0);
  const [position, setPosition] = useState<Position>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<Position>({ x: 0, y: 0 });
  const [dimensions, setDimensions] = useState<Dimensions | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [touches, setTouches] = useState<React.Touch[]>([]);
  const lastDistance = useRef<number | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const imageRef = useRef(null);
  const initialZoomRef = useRef<number | null>(null);

  const calculateBaseDimensions = (naturalWidth: number, naturalHeight: number): Dimensions | null => {
    if (!containerRef.current) return null;

    const viewportWidth = window.innerWidth * 0.9;
    const viewportHeight = window.innerHeight * 0.9;
    const imageAspect = naturalWidth / naturalHeight;
    
    let baseWidth, baseHeight;
    
    if (naturalWidth > viewportWidth || naturalHeight > viewportHeight) {
      if (imageAspect > viewportWidth / viewportHeight) {
        baseWidth = viewportWidth;
        baseHeight = viewportWidth / imageAspect;
      } else {
        baseHeight = viewportHeight;
        baseWidth = viewportHeight * imageAspect;
      }
    } else {
      baseWidth = naturalWidth;
      baseHeight = naturalHeight;
    }
    
    return { width: baseWidth, height: baseHeight };
  };

  const calculateInitialZoom = (baseDimensions: Dimensions): number => {
    const container = containerRef.current;
    if (!container || !baseDimensions) return 0;

    const containerWidth = container.offsetWidth;
    const containerHeight = containerWidth / containerAspectRatio;
    
    const widthRatio = containerWidth / baseDimensions.width;
    const heightRatio = containerHeight / baseDimensions.height;
    
    return Math.max(widthRatio, heightRatio) * 1.01;
  };

  useEffect(() => {
    const initializeViewer = () => {
      if (!containerRef.current) return;

      const img = new Image();
      img.onload = () => {
        const newDimensions = calculateBaseDimensions(img.naturalWidth, img.naturalHeight);
        if (newDimensions) {
          setDimensions(newDimensions);
          const newZoom = calculateInitialZoom(newDimensions);
          initialZoomRef.current = newZoom;
          setZoom(newZoom);
        }
      };
      img.src = fullImageUrl;
    };

    const observer = new ResizeObserver(() => {
      if (containerRef.current) {
        initializeViewer();
      }
    });

    if (containerRef.current) {
      observer.observe(containerRef.current);
      initializeViewer();
    }

    return () => observer.disconnect();
  }, [containerRef.current, fullImageUrl]);

  useEffect(() => {
    const xhr = new XMLHttpRequest();
    xhr.open('GET', fullImageUrl, true);
    xhr.responseType = 'blob';

    xhr.onprogress = (event) => {
      if (event.lengthComputable) {
        const percentComplete = (event.loaded / event.total) * 100;
        setProgress(percentComplete);
      }
    };

    xhr.onload = () => {
      if (xhr.status === 200) {
        const url = URL.createObjectURL(xhr.response);
        const img = new Image();
        
        img.onload = () => {
          setLoading(false);
          
          if (zoom !== null && dimensions !== null) {
            requestAnimationFrame(() => {
              setIsReady(true);
            });
          }
          
          URL.revokeObjectURL(url);
        };
        
        img.src = url;
      }
    };

    xhr.send();

    return () => xhr.abort();
  }, [fullImageUrl]);

  useEffect(() => {
    if (zoom !== null && dimensions !== null && !loading) {
      requestAnimationFrame(() => {
        setIsReady(true);
      });
    }
  }, [zoom, dimensions, loading]);

  const handleZoom = (factor: number, clientX: number|null = null, clientY: number|null = null) => {
    if (zoom === null || !initialZoomRef.current || !containerRef.current) return;
    
    const container = containerRef.current;
    const rect = container.getBoundingClientRect();
    
    // Use the center of the container if no specific point provided
    const pointX = clientX ?? (rect.left + rect.width / 2);
    const pointY = clientY ?? (rect.top + rect.height / 2);
    
    setZoom(prev => {
      const newZoom = Math.max(0.1, Math.min(5, prev + (factor * prev)));
      
      if (newZoom === initialZoomRef.current) {
        setPosition({ x: 0, y: 0 });
      } else {
        // Calculate how far the click/touch point is from the viewport center
        const containerCenterX = rect.left + rect.width / 2;
        const containerCenterY = rect.top + rect.height / 2;
        
        // Calculate the point's position relative to the image
        const relativeX = (pointX - containerCenterX - position.x) / prev;
        const relativeY = (pointY - containerCenterY - position.y) / prev;
        
        // Calculate the new position that keeps the point under the cursor/touch
        const newX = pointX - containerCenterX - (relativeX * newZoom);
        const newY = pointY - containerCenterY - (relativeY * newZoom);
        
        setPosition({ x: newX, y: newY });
      }
      
      return newZoom;
    });
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (zoom !== initialZoomRef.current) {
      setIsDragging(true);
      setDragStart({
        x: e.clientX - position.x,
        y: e.clientY - position.y
      });
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isDragging && dimensions && zoom !== null) {
      const newX = e.clientX - dragStart.x;
      const newY = e.clientY - dragStart.y;
      
      const container = containerRef.current;
      if (container) {
        const containerWidth = container.offsetWidth;
        const containerHeight = containerWidth / containerAspectRatio;
        
        const scaledWidth = dimensions.width * zoom;
        const scaledHeight = dimensions.height * zoom;
        
        // Calculate how much the image can move in each direction
        const maxX = (scaledWidth - containerWidth) / 2;
        const maxY = (scaledHeight - containerHeight) / 2;
        
        setPosition({
          x: Math.max(-maxX, Math.min(maxX, newX)),
          y: Math.max(-maxY, Math.min(maxY, newY))
        });
      }
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const resetZoom = () => {
    if (dimensions && initialZoomRef.current !== null) {
      setZoom(initialZoomRef.current);
      setPosition({ x: 0, y: 0 });
    }
  };

  const imageStyle = dimensions && zoom !== null ? {
    width: `${dimensions.width}px`,
    height: `${dimensions.height}px`,
    transform: `translate(-50%, -50%) translate(${position.x}px, ${position.y}px) scale(${zoom})`,
    opacity: isReady ? 1 : 0,
    visibility: isReady ? 'visible' as const : 'hidden' as const
  } : { opacity: 0, visibility: 'hidden' as const } as React.CSSProperties;

  const getDistance = (touches: React.Touch[]): number => {
    if (touches.length < 2) return 0;
    return Math.hypot(
      touches[1].clientX - touches[0].clientX,
      touches[1].clientY - touches[0].clientY
    );
  };
  
  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>): void => {
    const currentTouches = Array.from(e.touches);
    setTouches(currentTouches);
    
    if (currentTouches.length === 1) {
      setIsDragging(true);
      setDragStart({
        x: currentTouches[0].clientX - position.x,
        y: currentTouches[0].clientY - position.y
      });
    } else if (currentTouches.length === 2) {
      lastDistance.current = getDistance(currentTouches);
    }
  };
  
  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    e.preventDefault(); // Prevent browser gestures
    const currentTouches = Array.from(e.touches);
  
    if (currentTouches.length === 1 && isDragging) {
      // Handle panning
      const newX = currentTouches[0].clientX - dragStart.x;
      const newY = currentTouches[0].clientY - dragStart.y;
      
      const container = containerRef.current;
      if (container && dimensions && zoom !== null) {
        const containerWidth = container.offsetWidth;
        const containerHeight = containerWidth / containerAspectRatio;
        
        const scaledWidth = dimensions.width * zoom;
        const scaledHeight = dimensions.height * zoom;
        
        const maxX = (scaledWidth - containerWidth) / 2;
        const maxY = (scaledHeight - containerHeight) / 2;
        
        setPosition({
          x: Math.max(-maxX, Math.min(maxX, newX)),
          y: Math.max(-maxY, Math.min(maxY, newY))
        });
      }
    } else if (currentTouches.length === 2) {
      // Calculate the center point between the two touches
      const centerX = (currentTouches[0].clientX + currentTouches[1].clientX) / 2;
      const centerY = (currentTouches[0].clientY + currentTouches[1].clientY) / 2;
      
      const newDistance = getDistance(currentTouches);
      if (lastDistance.current) {
        const delta = newDistance - lastDistance.current;
        const zoomFactor = delta * 0.01;
        handleZoom(zoomFactor, centerX, centerY);
      }
      lastDistance.current = newDistance;
    }
    
    setTouches(currentTouches);
  };
  
  const handleTouchEnd = () => {
    setIsDragging(false);
    lastDistance.current = null;
    if (touches.length === 0) {
      setTouches([]);
    }
  };

  return (
    <div className="relative bg-black rounded-lg w-full touch-none">
      <div 
        ref={containerRef}
        className="relative overflow-hidden rounded-lg w-full"
        style={{ 
          paddingTop: `${(1 / containerAspectRatio) * 100}%`,
        }}
      >
        <div 
          className="absolute inset-0"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onTouchCancel={handleTouchEnd}
          style={{ touchAction: 'none' }}  // Add this
          onTouchStart={(e) => {
            e.preventDefault();  // Add this
            handleTouchStart(e);
          }}
          onClick={zoom === initialZoomRef.current ? onClick : undefined}
        >
          <img
            ref={imageRef}
            src={fullImageUrl}
            alt={alt}
            draggable="false"
            onDragStart={(e) => e.preventDefault()}
            className={`
              absolute left-1/2 top-1/2
              transition-opacity duration-300 select-none
              ${isDragging ? 'cursor-grabbing' : zoom !== initialZoomRef.current ? 'cursor-grab' : 'cursor-zoom-in'}
              pointer-events-none
            `}
            style={imageStyle}
          />

          {loading && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/50">
              <div className="w-3/4 max-w-md">
                <Progress value={progress} className="h-2" />
              </div>
              <span className="mt-2 text-sm text-white">
                {Math.round(progress)}%
              </span>
            </div>
          )}
        </div>
      </div>

      {isReady && (
        <div className="absolute bottom-4 right-4 flex gap-2">
          <button
            onClick={() => handleZoom(-0.5)}
            disabled={zoom <= 0.1}
            className="p-2 bg-black/50 rounded-full text-white hover:bg-black/70 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ZoomOut size={20} />
          </button>
          <button
            onClick={() => handleZoom(0.5)}
            disabled={zoom >= 5}
            className="p-2 bg-black/50 rounded-full text-white hover:bg-black/70 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ZoomIn size={20} />
          </button>
          <button
            onClick={resetZoom}
            disabled={zoom === initialZoomRef.current}
            className="p-2 bg-black/50 rounded-full text-white hover:bg-black/70 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Maximize2 size={20} />
          </button>
        </div>
      )}
    </div>
  );
};

export default CustomImageViewer;