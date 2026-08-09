'use client';
import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Slider } from '@/components/ui/slider';
import { ZoomIn, ZoomOut, RotateCw, X, Check, Loader2, Move } from 'lucide-react';

interface ImageCropperProps {
  open: boolean;
  onClose: () => void;
  imageSrc: string;
  onCropComplete: (croppedImage: File) => void;
  aspectRatio?: number;
  circularCrop?: boolean;
  minDimension?: number;
  cropShape?: 'rect' | 'round';
}

export function ImageCropper({
  open,
  onClose,
  imageSrc,
  onCropComplete,
  circularCrop = true,
  minDimension = 400,
  cropShape = 'round'
}: ImageCropperProps) {
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number } | null>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [img, setImg] = useState<HTMLImageElement | null>(null);
  const [imageLoaded, setImageLoaded] = useState(false);

  const CANVAS_SIZE = Math.min(400, window.innerWidth - 80);

  useEffect(() => {
    if (imageSrc) {
      const image = new Image();
      image.onload = () => {
        const scaleX = CANVAS_SIZE / image.width;
        const scaleY = CANVAS_SIZE / image.height;
        const initialZoom = Math.min(scaleX, scaleY) * 0.8;
        setZoom(initialZoom);
        setImg(image);
        setImageLoaded(true);
      };
      image.src = imageSrc;
    }
  }, [imageSrc]);

  useEffect(() => {
    if (!img || !canvasRef.current || !imageLoaded) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = CANVAS_SIZE;
    canvas.height = CANVAS_SIZE;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Save context
    ctx.save();

    // Create clip based on cropShape
    ctx.beginPath();
    if (cropShape === 'round' || circularCrop) {
      ctx.arc(CANVAS_SIZE / 2, CANVAS_SIZE / 2, CANVAS_SIZE / 2, 0, Math.PI * 2);
    } else {
      const padding = 20;
      ctx.rect(padding, padding, CANVAS_SIZE - padding * 2, CANVAS_SIZE - padding * 2);
    }
    ctx.closePath();
    ctx.clip();

    // Calculate image dimensions to fit in canvas
    const centerX = CANVAS_SIZE / 2;
    const centerY = CANVAS_SIZE / 2;

    // Apply transformations
    ctx.translate(centerX, centerY);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.scale(zoom, zoom);
    ctx.translate(-centerX, -centerY);

    // Draw image with position offset
    const drawX = centerX - (img.width / 2) + position.x;
    const drawY = centerY - (img.height / 2) + position.y;
    
    ctx.drawImage(img, drawX, drawY, img.width, img.height);

    // Restore context
    ctx.restore();

    // Draw border
    ctx.beginPath();
    if (cropShape === 'round' || circularCrop) {
      ctx.arc(CANVAS_SIZE / 2, CANVAS_SIZE / 2, CANVAS_SIZE / 2 - 1, 0, Math.PI * 2);
    } else {
      const padding = 20;
      ctx.rect(padding, padding, CANVAS_SIZE - padding * 2, CANVAS_SIZE - padding * 2);
    }
    ctx.strokeStyle = '#3b82f6';
    ctx.lineWidth = 3;
    ctx.stroke();

    // Draw grid lines for better positioning
    ctx.strokeStyle = 'rgba(59, 130, 246, 0.2)';
    ctx.lineWidth = 1;
    ctx.setLineDash([5, 5]);
    
    // Horizontal line
    ctx.beginPath();
    ctx.moveTo(0, CANVAS_SIZE / 2);
    ctx.lineTo(CANVAS_SIZE, CANVAS_SIZE / 2);
    ctx.stroke();
    
    // Vertical line
    ctx.beginPath();
    ctx.moveTo(CANVAS_SIZE / 2, 0);
    ctx.lineTo(CANVAS_SIZE / 2, CANVAS_SIZE);
    ctx.stroke();
    
    ctx.setLineDash([]);

    // Draw corner markers
    const offset = cropShape === 'round' || circularCrop ? 10 : 20;
    ctx.strokeStyle = '#3b82f6';
    ctx.lineWidth = 3;
    ctx.strokeRect(
      offset,
      offset,
      CANVAS_SIZE - offset * 2,
      CANVAS_SIZE - offset * 2
    );

  }, [img, zoom, rotation, position, imageLoaded, CANVAS_SIZE, cropShape, circularCrop]);

  const getCroppedImage = (): Promise<File> => {
    return new Promise((resolve, reject) => {
      if (!img || !canvasRef.current) {
        reject(new Error('No image loaded'));
        return;
      }

      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('No 2D context'));
        return;
      }

      const size = minDimension || 400;
      canvas.width = size;
      canvas.height = size;

      // Create clip based on cropShape
      ctx.beginPath();
      if (cropShape === 'round' || circularCrop) {
        ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
      } else {
        const padding = 20;
        ctx.rect(padding, padding, size - padding * 2, size - padding * 2);
      }
      ctx.closePath();
      ctx.clip();

      // Draw the image with transformations
      const centerX = size / 2;
      const centerY = size / 2;

      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate((rotation * Math.PI) / 180);
      ctx.scale(zoom, zoom);
      ctx.translate(-centerX, -centerY);

      const drawX = centerX - (img.width / 2) + position.x;
      const drawY = centerY - (img.height / 2) + position.y;
      
      ctx.drawImage(img, drawX, drawY, img.width, img.height);
      ctx.restore();

      canvas.toBlob(
        (blob) => {
          if (blob) {
            const file = new File([blob], 'cropped-image.jpg', { type: 'image/jpeg' });
            resolve(file);
          } else {
            reject(new Error('Failed to create image'));
          }
        },
        'image/jpeg',
        0.95
      );
    });
  };

  const handleCropComplete = async () => {
    setIsLoading(true);
    try {
      const croppedFile = await getCroppedImage();
      onCropComplete(croppedFile);
      onClose();
    } catch (error) {
      console.error('Error cropping image:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (rect) {
      setDragStart({ 
        x: e.clientX - rect.left, 
        y: e.clientY - rect.top 
      });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (dragStart && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const currentX = e.clientX - rect.left;
      const currentY = e.clientY - rect.top;
      
      const dx = (currentX - dragStart.x) / zoom;
      const dy = (currentY - dragStart.y) / zoom;
      
      setPosition(prev => ({ 
        x: prev.x + dx, 
        y: prev.y + dy 
      }));
      
      setDragStart({ 
        x: currentX, 
        y: currentY 
      });
    }
  };

  const handleMouseUp = () => {
    setDragStart(null);
  };

  const handleReset = () => {
    setZoom(1);
    setRotation(0);
    setPosition({ x: 0, y: 0 });
    if (img) {
      const scaleX = CANVAS_SIZE / img.width;
      const scaleY = CANVAS_SIZE / img.height;
      const initialZoom = Math.min(scaleX, scaleY) * 0.8;
      setZoom(initialZoom);
    }
  };

  if (!imageLoaded) {
    return (
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="max-w-md p-0 bg-white dark:bg-gray-900">
          <div className="p-8 text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-blue-500" />
            <p className="mt-2 text-gray-500">Loading image...</p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md p-0 sm:max-w-lg md:max-w-xl bg-white dark:bg-gray-900 overflow-hidden">
        <DialogHeader className="p-3 sm:p-4 border-b border-gray-200 dark:border-gray-700">
          <DialogTitle className="text-center text-lg sm:text-xl">Adjust Image</DialogTitle>
        </DialogHeader>

        <div className="p-3 sm:p-4">
          <div className="flex justify-center">
            <div
              ref={containerRef}
              className="relative w-[300px] h-[300px] sm:w-[400px] sm:h-[400px] bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden cursor-move select-none mx-auto"
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
            >
              <canvas 
                ref={canvasRef} 
                className="w-full h-full"
                style={{ touchAction: 'none' }}
              />
              
              {/* Drag indicator */}
              <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 bg-black/50 text-white text-[10px] sm:text-xs px-2 py-1 rounded-full whitespace-nowrap">
                <Move className="h-3 w-3 inline mr-1" />
                Drag to reposition
              </div>
            </div>
          </div>

          <div className="mt-3 sm:mt-4 space-y-3 sm:space-y-4">
            <div className="flex items-center justify-between gap-2 sm:gap-4">
              <div className="flex items-center gap-2 flex-1">
                <ZoomOut className="h-3 w-3 sm:h-4 sm:w-4 text-gray-500 flex-shrink-0" />
                <Slider
                  value={[zoom]}
                  min={0.1}
                  max={2}
                  step={0.01}
                  onValueChange={(value) => setZoom(value[0])}
                  className="flex-1"
                />
                <ZoomIn className="h-3 w-3 sm:h-4 sm:w-4 text-gray-500 flex-shrink-0" />
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setRotation((prev) => (prev + 90) % 360)}
                className="flex-shrink-0 h-8 sm:h-9 px-2 sm:px-3"
              >
                <RotateCw className="h-3 w-3 sm:h-4 sm:w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleReset}
                className="flex-shrink-0 h-8 sm:h-9 px-2 sm:px-3"
              >
                Reset
              </Button>
            </div>

            <div className="flex justify-end gap-2">
              <Button 
                variant="outline" 
                onClick={onClose}
                className="h-8 sm:h-10 px-3 sm:px-4"
              >
                <X className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                Cancel
              </Button>
              <Button
                onClick={handleCropComplete}
                disabled={isLoading}
                className="bg-blue-500 hover:bg-blue-600 text-white h-8 sm:h-10 px-3 sm:px-4"
              >
                {isLoading ? (
                  <Loader2 className="h-3 w-3 sm:h-4 sm:w-4 animate-spin" />
                ) : (
                  <>
                    <Check className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                    Apply
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}