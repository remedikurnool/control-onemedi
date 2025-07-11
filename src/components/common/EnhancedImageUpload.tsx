
import React, { useState, useCallback, useRef } from 'react';
import { Upload, X, Image as ImageIcon, File, Camera, Crop } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface EnhancedImageUploadProps {
  onUpload: (urls: string[]) => void;
  bucket: string;
  folder?: string;
  maxFiles?: number;
  maxSize?: number; // in MB
  acceptedTypes?: string[];
  showPreview?: boolean;
  allowCrop?: boolean;
  currentImages?: string[];
  className?: string;
}

interface UploadProgress {
  file: File;
  progress: number;
  url?: string;
  error?: string;
}

export const EnhancedImageUpload: React.FC<EnhancedImageUploadProps> = ({
  onUpload,
  bucket,
  folder = '',
  maxFiles = 5,
  maxSize = 5,
  acceptedTypes = ['image/jpeg', 'image/png', 'image/webp'],
  showPreview = true,
  allowCrop = false,
  currentImages = [],
  className = ''
}) => {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<UploadProgress[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = useCallback(async (files: FileList) => {
    const fileArray = Array.from(files);
    const validFiles = fileArray.filter(file => {
      if (!acceptedTypes.includes(file.type)) {
        toast.error(`${file.name} is not a supported file type`);
        return false;
      }
      if (file.size > maxSize * 1024 * 1024) {
        toast.error(`${file.name} is too large (max ${maxSize}MB)`);
        return false;
      }
      return true;
    });

    if (currentImages.length + validFiles.length > maxFiles) {
      toast.error(`Cannot upload more than ${maxFiles} files`);
      return;
    }

    setUploading(true);
    const initialProgress = validFiles.map(file => ({ file, progress: 0 }));
    setUploadProgress(initialProgress);

    const uploadedUrls: string[] = [];

    for (let i = 0; i < validFiles.length; i++) {
      const file = validFiles[i];
      try {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
        const filePath = folder ? `${folder}/${fileName}` : fileName;

        // Simulate progress updates
        const progressInterval = setInterval(() => {
          setUploadProgress(prev => 
            prev.map((item, index) => 
              index === i ? { ...item, progress: Math.min(item.progress + 10, 90) } : item
            )
          );
        }, 100);

        const { data, error } = await supabase.storage
          .from(bucket)
          .upload(filePath, file);

        clearInterval(progressInterval);

        if (error) throw error;

        const { data: { publicUrl } } = supabase.storage
          .from(bucket)
          .getPublicUrl(data.path);

        uploadedUrls.push(publicUrl);

        setUploadProgress(prev => 
          prev.map((item, index) => 
            index === i ? { ...item, progress: 100, url: publicUrl } : item
          )
        );

      } catch (error) {
        console.error('Upload error:', error);
        setUploadProgress(prev => 
          prev.map((item, index) => 
            index === i ? { ...item, error: 'Upload failed' } : item
          )
        );
        toast.error(`Failed to upload ${file.name}`);
      }
    }

    onUpload([...currentImages, ...uploadedUrls]);
    setUploading(false);
    
    // Clear progress after 3 seconds
    setTimeout(() => setUploadProgress([]), 3000);
  }, [acceptedTypes, maxSize, maxFiles, currentImages, bucket, folder, onUpload]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  }, [handleFiles]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
  }, []);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(e.target.files);
    }
  }, [handleFiles]);

  const removeImage = useCallback((urlToRemove: string) => {
    const updatedImages = currentImages.filter(url => url !== urlToRemove);
    onUpload(updatedImages);
  }, [currentImages, onUpload]);

  const triggerFileSelect = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Upload Area */}
      <div
        className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
          dragActive
            ? 'border-blue-500 bg-blue-50'
            : 'border-gray-300 hover:border-gray-400'
        }`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={acceptedTypes.join(',')}
          onChange={handleFileSelect}
          className="hidden"
        />
        
        <div className="flex flex-col items-center space-y-4">
          <div className="flex space-x-2">
            <Upload className="w-8 h-8 text-gray-400" />
            <Camera className="w-8 h-8 text-gray-400" />
          </div>
          
          <div>
            <p className="text-lg font-medium text-gray-900">
              Drop files here or click to upload
            </p>
            <p className="text-sm text-gray-500">
              Supports {acceptedTypes.join(', ')} up to {maxSize}MB
            </p>
            <p className="text-xs text-gray-400">
              Maximum {maxFiles} files ({currentImages.length} uploaded)
            </p>
          </div>
          
          <Button
            type="button"
            onClick={triggerFileSelect}
            disabled={uploading || currentImages.length >= maxFiles}
            variant="outline"
          >
            Select Files
          </Button>
        </div>
      </div>

      {/* Upload Progress */}
      {uploadProgress.length > 0 && (
        <div className="space-y-2">
          {uploadProgress.map((item, index) => (
            <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
              <File className="w-5 h-5 text-gray-400" />
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">{item.file.name}</p>
                {item.error ? (
                  <p className="text-xs text-red-600">{item.error}</p>
                ) : (
                  <Progress value={item.progress} className="h-2" />
                )}
              </div>
              {item.url && (
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <ImageIcon className="w-4 h-4 text-green-600" />
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Image Preview */}
      {showPreview && currentImages.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {currentImages.map((url, index) => (
            <div key={index} className="relative group">
              <img
                src={url}
                alt={`Upload ${index + 1}`}
                className="w-full h-32 object-cover rounded-lg border"
              />
              <button
                onClick={() => removeImage(url)}
                className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="w-4 h-4" />
              </button>
              {allowCrop && (
                <button className="absolute top-2 left-2 bg-blue-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Crop className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
