import React, { useState, useEffect, useRef } from 'react';
import { Progress } from '@/components/ui/progress';
import { Maximize2, Download, ZoomIn, ZoomOut, Search, Minimize2 } from 'lucide-react';

interface CustomImageViewerProps {
  fullImageUrl: string;
  alt: string;
  objectName: string; 
  observationDate: string; 
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
  objectName,
  observationDate,
  onClick,
  containerAspectRatio = 3/2,
}) => {
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [dimensions, setDimensions] = useState<Dimensions | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [magnifierPosition, setMagnifierPosition] = useState<Position | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [magnification, setMagnification] = useState(2);
  const [magnifierEnabled, setMagnifierEnabled] = useState(false);
  const [magnifierSize, setMagnifierSize] = useState(300);
  const [isMobile, setIsMobile] = useState(false);
  const [imageOffset, setImageOffset] = useState<Position>({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement | null>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);
  const fullscreenContainerRef = useRef<HTMLDivElement | null>(null);
  const magnificationLevels = [1.5, 2, 3, 4, 5];

  useEffect(() => {
    // Detect if device is mobile/touch-only
    const checkMobile = () => {
      const hasTouchScreen = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
      const isSmallScreen = window.innerWidth < 1024;
      setIsMobile(hasTouchScreen && isSmallScreen);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const calculateBaseDimensions = (naturalWidth: number, naturalHeight: number): Dimensions | null => {
    if (!containerRef.current) return null;

    const container = containerRef.current;
    const containerRect = container.getBoundingClientRect();
    const containerWidth = containerRect.width;

    const imageAspect = naturalWidth / naturalHeight;
        
    const baseWidth = containerWidth;
    const baseHeight = containerWidth / imageAspect;
    
    return { width: baseWidth, height: baseHeight };
  };

  const updateMagnifierSize = () => {
    if (!containerRef.current) return;
    
    const containerRect = containerRef.current.getBoundingClientRect();
    const newMagnifierSize = containerRect.height / 1.5;
    setMagnifierSize(newMagnifierSize);
  };

  const updateImageOffset = () => {
    if (!imageRef.current || !containerRef.current) return;
    
    const imageRect = imageRef.current.getBoundingClientRect();
    const containerRect = containerRef.current.getBoundingClientRect();
    
    setImageOffset({
      x: imageRect.left - containerRect.left,
      y: imageRect.top - containerRect.top,
    });
  };

  useEffect(() => {
    const initializeViewer = () => {
      if (!containerRef.current) return;

      const img = new Image();
      img.onload = () => {
        requestAnimationFrame(() => {
          const newDimensions = calculateBaseDimensions(img.naturalWidth, img.naturalHeight);
          if (newDimensions) {
            setDimensions(newDimensions);
            updateMagnifierSize();
            // Update image offset after dimensions are set
            setTimeout(updateImageOffset, 0);
          }
        });
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
    if (isReady) {
      updateImageOffset();
    }
  }, [isReady, dimensions]);

  const getDownloadFilename = () => {
    const sanitizedName = objectName.replace(/\s+/g, '_').toLowerCase();
    const sanitizedDate = observationDate.replace(/\s+/g, '_').toLowerCase();
    return `iss.mkl.dev_${sanitizedName}_${sanitizedDate}${fullImageUrl.match(/\.[^.]+$/)?.[0] || ''}`;
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
          setLoading(false);
          
          if (dimensions !== null) {
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
    if (dimensions !== null && !loading) {
      requestAnimationFrame(() => {
        setIsReady(true);
      });
    }
  }, [dimensions, loading]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current || !imageRef.current || !magnifierEnabled || isMobile) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    setMagnifierPosition({ x, y });
  };

  const handleMouseLeave = () => {
    if (isMobile) return;
    setMagnifierPosition(null);
  };

  const handleImageClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // Don't trigger onClick on mobile to prevent keyboard from appearing
    if (isMobile) {
      e.preventDefault();
      e.stopPropagation();
      return;
    }
    
    if (onClick) {
      onClick();
    }
  };

  const openFullscreen = async () => {
    if (fullscreenContainerRef.current) {
      try {
        const elem = fullscreenContainerRef.current as HTMLElement & {
          webkitRequestFullscreen?: () => Promise<void>;
        };
        
        if (elem.requestFullscreen) {
          await elem.requestFullscreen();
        } else if (elem.webkitRequestFullscreen) {
          await elem.webkitRequestFullscreen();
        }
      } catch (err) {
        console.error('Error attempting to enable fullscreen:', err);
      }
    }
  };

  const closeFullscreen = async () => {
    try {
      const doc = document as Document & {
        webkitExitFullscreen?: () => Promise<void>;
        webkitFullscreenElement?: Element;
      };
      
      if (document.fullscreenElement || doc.webkitFullscreenElement) {
        if (document.exitFullscreen) {
          await document.exitFullscreen();
        } else if (doc.webkitExitFullscreen) {
          await doc.webkitExitFullscreen();
        }
      }
    } catch (err) {
      console.error('Error attempting to exit fullscreen:', err);
    }
  };

  const zoomIn = () => {
    const currentIndex = magnificationLevels.indexOf(magnification);
    if (currentIndex < magnificationLevels.length - 1) {
      setMagnification(magnificationLevels[currentIndex + 1]);
    }
  };

  const zoomOut = () => {
    const currentIndex = magnificationLevels.indexOf(magnification);
    if (currentIndex > 0) {
      setMagnification(magnificationLevels[currentIndex - 1]);
    }
  };

  const toggleMagnifier = () => {
    setMagnifierEnabled(!magnifierEnabled);
    if (magnifierEnabled) {
      setMagnifierPosition(null);
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      const doc = document as Document & {
        webkitFullscreenElement?: Element;
      };
      
      if (!document.fullscreenElement && !doc.webkitFullscreenElement) {
        setIsFullscreen(false);
      } else {
        setIsFullscreen(true);
        updateMagnifierSize();
        setTimeout(updateImageOffset, 0);
      }
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
    };
  }, []);

  const getMagnifierStyle = (): React.CSSProperties => {
    if (!magnifierPosition || !imageRef.current || !containerRef.current || !dimensions || isMobile) {
      return { display: 'none' };
    }

    const { x, y } = magnifierPosition;
    
    // Adjust coordinates to account for image offset within container
    const adjustedX = x - imageOffset.x;
    const adjustedY = y - imageOffset.y;
    
    // Calculate background position for the magnifier
    const bgX = -adjustedX * magnification + magnifierSize / 2;
    const bgY = -adjustedY * magnification + magnifierSize / 2;
    
    return {
      position: 'absolute',
      left: `${x}px`,
      top: `${y}px`,
      width: `${magnifierSize}px`,
      height: `${magnifierSize}px`,
      border: '3px solid white',
      borderRadius: '50%',
      pointerEvents: 'none',
      transform: 'translate(-50%, -50%)',
      boxShadow: '0 0 20px rgba(0,0,0,0.5)',
      zIndex: 10,
      backgroundImage: `url(${fullImageUrl})`,
      backgroundRepeat: 'no-repeat',
      backgroundSize: `${dimensions.width * magnification}px ${dimensions.height * magnification}px`,
      backgroundPosition: `${bgX}px ${bgY}px`,
    };
  };

  const imageStyle = dimensions ? {
    width: `${dimensions.width}px`,
    height: `${dimensions.height}px`,
    opacity: isReady ? 1 : 0,
    visibility: isReady ? 'visible' as const : 'hidden' as const
  } : { opacity: 0, visibility: 'hidden' as const } as React.CSSProperties;

  const showMagnifier = magnifierPosition && isReady && magnifierEnabled && !isMobile;

  return (
    <div 
      ref={fullscreenContainerRef}
      className={`relative bg-black rounded-lg w-full ${isMobile ? '' : 'touch-none'} ${isFullscreen ? 'flex items-center justify-center' : ''}`}
    >
      <div 
        ref={containerRef}
        className="relative overflow-hidden rounded-lg w-full"
        style={{ 
          paddingTop: isFullscreen ? '0' : `${(1 / containerAspectRatio) * 100}%`,
          height: isFullscreen ? '100vh' : 'auto',
        }}
      >
        <div 
          className="absolute inset-0 flex items-center justify-center"
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          style={{ 
            touchAction: isMobile ? 'auto' : 'none',
            cursor: showMagnifier ? 'none' : 'default',
            overflow: isMobile ? 'auto' : 'hidden',
          }}
          onClick={handleImageClick}
        >
          <img
            ref={imageRef}
            src={fullImageUrl}
            alt={alt}
            draggable="false"
            onDragStart={(e) => e.preventDefault()}
            className="transition-opacity duration-300 select-none pointer-events-none"
            style={{
              ...imageStyle,
              ...(isMobile ? {
                maxWidth: 'none',
                maxHeight: 'none',
                objectFit: 'contain',
                pointerEvents: 'auto',
              } : {})
            }}
          />

          {/* Magnifying glass */}
          {showMagnifier && (
            <div style={getMagnifierStyle()} />
          )}

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
          {!isMobile && (
            <>
              {magnifierEnabled && (
                <>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      zoomOut();
                    }}
                    disabled={magnification === magnificationLevels[0]}
                    className="p-2 bg-black/50 rounded-full text-white hover:bg-black/70 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ZoomOut size={20} />
                  </button>
                  <div className="flex items-center px-3 bg-black/50 rounded-full text-white text-sm font-medium">
                    {magnification}×
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      zoomIn();
                    }}
                    disabled={magnification === magnificationLevels[magnificationLevels.length - 1]}
                    className="p-2 bg-black/50 rounded-full text-white hover:bg-black/70 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ZoomIn size={20} />
                  </button>
                </>
              )}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleMagnifier();
                }}
                className={`p-2 rounded-full text-white hover:bg-black/70 ${
                  magnifierEnabled ? 'bg-blue-600'  : 'bg-black/50'
                }`}
                title={magnifierEnabled ? 'Disable magnifier' : 'Enable magnifier'}
              >
                <Search size={20} />
              </button>
            </>
          )}
          <a
            href={fullImageUrl}
            download={getDownloadFilename()}
            className="p-2 bg-black/50 rounded-full text-white hover:bg-black/70"
            onClick={(e) => e.stopPropagation()}
          > 
            <Download size={20} />
          </a>
          {!isMobile && (
            <>
              {isFullscreen ? (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    closeFullscreen();
                  }}
                  className="p-2 bg-black/50 rounded-full text-white hover:bg-black/70"
                >
                  <Minimize2 size={20} />
                </button>
              ) : (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    openFullscreen();
                  }}
                  className="p-2 bg-black/50 rounded-full text-white hover:bg-black/70"
                >
                  <Maximize2 size={20} />
                </button>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default CustomImageViewer;
