"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Progress } from '@/components/ui/progress';
import { ZoomIn, ZoomOut, Maximize2 } from 'lucide-react';

const ImageViewer = ({
  previewUrl,
  fullImageUrl,
  alt,
  onClick,
  containerAspectRatio = 16/9,
}) => {
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [fullImageLoaded, setFullImageLoaded] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [naturalDimensions, setNaturalDimensions] = useState(null);
  const containerRef = useRef(null);
  const imageRef = useRef(null);

  // Calculate base dimensions that would fit in viewport
  const calculateBaseDimensions = () => {
    if (!naturalDimensions || !containerRef.current) return null;

    const viewportWidth = window.innerWidth * 0.9; // 90% of viewport width as max
    const viewportHeight = window.innerHeight * 0.9; // 90% of viewport height as max
    
    const imageAspect = naturalDimensions.width / naturalDimensions.height;
    
    let baseWidth, baseHeight;
    
    if (naturalDimensions.width > viewportWidth || naturalDimensions.height > viewportHeight) {
      if (imageAspect > viewportWidth / viewportHeight) {
        baseWidth = viewportWidth;
        baseHeight = viewportWidth / imageAspect;
      } else {
        baseHeight = viewportHeight;
        baseWidth = viewportHeight * imageAspect;
      }
    } else {
      baseWidth = naturalDimensions.width;
      baseHeight = naturalDimensions.height;
    }
    
    return { width: baseWidth, height: baseHeight };
  };

  const calculateInitialZoom = () => {
    if (!containerRef.current || !naturalDimensions) return 1;
    
    const baseDimensions = calculateBaseDimensions();
    if (!baseDimensions) return 1;
    
    const container = containerRef.current;
    const containerWidth = container.offsetWidth;
    const containerHeight = containerWidth / containerAspectRatio;
    
    const widthRatio = containerWidth / baseDimensions.width;
    const heightRatio = containerHeight / baseDimensions.height;
    
    // Use the larger ratio to ensure the image fills the container
    return Math.max(widthRatio, heightRatio) * 1.01;
  };

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
          setNaturalDimensions({
            width: img.naturalWidth,
            height: img.naturalHeight
          });
          setFullImageLoaded(true);
          setLoading(false);
          URL.revokeObjectURL(url);
        };
        img.src = url;
      }
    };

    xhr.send();

    return () => xhr.abort();
  }, [fullImageUrl]);

  useEffect(() => {
    if (fullImageLoaded) {
      const initialZoom = calculateInitialZoom();
      setZoom(initialZoom);
    }
  }, [fullImageLoaded, naturalDimensions]);

  const handleZoom = (factor) => {
    setZoom(prev => {
      const newZoom = Math.max(0.1, Math.min(5, prev + factor));
      if (newZoom === calculateInitialZoom()) {
        setPosition({ x: 0, y: 0 });
      }
      return newZoom;
    });
  };

  const handleMouseDown = (e) => {
    if (zoom !== calculateInitialZoom()) {
      setIsDragging(true);
      setDragStart({
        x: e.clientX - position.x,
        y: e.clientY - position.y
      });
    }
  };

  const handleMouseMove = (e) => {
    if (isDragging) {
      const newX = e.clientX - dragStart.x;
      const newY = e.clientY - dragStart.y;
      
      const container = containerRef.current;
      if (container && naturalDimensions) {
        const containerWidth = container.offsetWidth;
        const containerHeight = containerWidth / containerAspectRatio;
        const baseDimensions = calculateBaseDimensions();
        if (!baseDimensions) return;
        
        const scaledWidth = baseDimensions.width * zoom;
        const scaledHeight = baseDimensions.height * zoom;
        
        const bounds = {
          x: containerWidth - scaledWidth,
          y: containerHeight - scaledHeight
        };
        
        setPosition({
          x: Math.max(bounds.x, Math.min(0, newX)),
          y: Math.max(bounds.y, Math.min(0, newY))
        });
      }
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const resetZoom = () => {
    const initialZoom = calculateInitialZoom();
    setZoom(initialZoom);
    setPosition({ x: 0, y: 0 });
  };

  const baseDimensions = calculateBaseDimensions();
  const imageStyle = baseDimensions ? {
    width: `${baseDimensions.width}px`,
    height: `${baseDimensions.height}px`,
    transform: `translate(-50%, -50%) translate(${position.x}px, ${position.y}px) scale(${zoom})`
  } : {};

  return (
    <div className="relative bg-black rounded-lg w-full">
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
        >
          {/* Preview Image */}
          <img
            src={previewUrl}
            alt={`${alt} - Preview`}
            className={`
              absolute left-1/2 top-1/2
              transition-opacity duration-500
              ${fullImageLoaded ? 'opacity-0' : 'opacity-100 blur-sm'}
            `}
            style={imageStyle}
          />

          {/* Full Image */}
          <img
            ref={imageRef}
            src={fullImageUrl}
            alt={alt}
            className={`
              absolute left-1/2 top-1/2
              transition-all duration-300 select-none
              ${fullImageLoaded ? 'opacity-100' : 'opacity-0'}
              ${isDragging ? 'cursor-grabbing' : zoom !== calculateInitialZoom() ? 'cursor-grab' : 'cursor-zoom-in'}
            `}
            style={imageStyle}
            onClick={zoom === calculateInitialZoom() ? onClick : undefined}
          />

          {/* Loading Overlay */}
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

      {/* Controls */}
      {fullImageLoaded && (
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
            disabled={zoom === calculateInitialZoom()}
            className="p-2 bg-black/50 rounded-full text-white hover:bg-black/70 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Maximize2 size={20} />
          </button>
        </div>
      )}
    </div>
  );
};

export default ImageViewer;