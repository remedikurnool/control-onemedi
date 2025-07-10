import React, { useState, useRef, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';
import { 
  Upload, 
  X, 
  Image as ImageIcon, 
  File, 
  Camera, 
  Trash2, 
  Eye, 
  Download, 
  Copy, 
  Check, 
  AlertCircle, 
  FileImage, 
  FileVideo, 
  FileText,
  Loader2
} from 'lucide-react';

// Types
interface ImageUploadProps {
  bucket: 'avatars' | 'products' | 'documents' | 'lab-reports' | 'prescriptions' | 'medical-scans';
  folder?: string;
  maxFiles?: number;
  maxSize?: number; // in MB
  acceptedTypes?: string[];
  onUploadComplete?: (urls: string[]) => void;
  onUploadError?: (error: string) => void;
  existingImages?: string[];
  className?: string;
}

interface UploadedFile {
  file: File;
  preview: string;
  progress: number;
  status: 'uploading' | 'completed' | 'error';
  url?: string;
  error?: string;
}

const ImageUpload: React.FC<ImageUploadProps> = ({
  bucket,
  folder = '',
  maxFiles = 5,
  maxSize = 10, // 10MB default
  acceptedTypes = ['image/*', 'application/pdf'],
  onUploadComplete,
  onUploadError,
  existingImages = [],
  className = ''
}) => {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Get file type icon
  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) {
      return <FileImage className="h-8 w-8 text-blue-600" />;
    } else if (file.type.startsWith('video/')) {
      return <FileVideo className="h-8 w-8 text-purple-600" />;
    } else if (file.type === 'application/pdf') {
      return <FileText className="h-8 w-8 text-red-600" />;
    } else {
      return <File className="h-8 w-8 text-gray-600" />;
    }
  };

  // Format file size
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Validate file
  const validateFile = (file: File): string | null => {
    // Check file size
    if (file.size > maxSize * 1024 * 1024) {
      return `File size must be less than ${maxSize}MB`;
    }

    // Check file type
    const isValidType = acceptedTypes.some(type => {
      if (type.endsWith('/*')) {
        return file.type.startsWith(type.slice(0, -1));
      }
      return file.type === type;
    });

    if (!isValidType) {
      return `File type not supported. Accepted types: ${acceptedTypes.join(', ')}`;
    }

    return null;
  };

  // Upload file to Supabase Storage
  const uploadFile = async (file: File): Promise<string> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = folder ? `${folder}/${fileName}` : fileName;

    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      throw new Error(error.message);
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(data.path);

    return publicUrl;
  };

  // Handle file upload
  const handleFileUpload = async (files: File[]) => {
    if (uploadedFiles.length + files.length > maxFiles) {
      toast.error(`Maximum ${maxFiles} files allowed`);
      return;
    }

    setIsUploading(true);
    const newFiles: UploadedFile[] = [];

    for (const file of files) {
      const validationError = validateFile(file);
      if (validationError) {
        toast.error(validationError);
        continue;
      }

      const uploadedFile: UploadedFile = {
        file,
        preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : '',
        progress: 0,
        status: 'uploading'
      };

      newFiles.push(uploadedFile);
    }

    setUploadedFiles(prev => [...prev, ...newFiles]);

    // Upload files
    const uploadPromises = newFiles.map(async (uploadedFile, index) => {
      try {
        // Simulate progress
        const progressInterval = setInterval(() => {
          setUploadedFiles(prev => prev.map((f, i) => 
            f === uploadedFile ? { ...f, progress: Math.min(f.progress + 10, 90) } : f
          ));
        }, 200);

        const url = await uploadFile(uploadedFile.file);

        clearInterval(progressInterval);

        setUploadedFiles(prev => prev.map(f => 
          f === uploadedFile 
            ? { ...f, progress: 100, status: 'completed', url } 
            : f
        ));

        return url;
      } catch (error) {
        setUploadedFiles(prev => prev.map(f => 
          f === uploadedFile 
            ? { ...f, status: 'error', error: error instanceof Error ? error.message : 'Upload failed' } 
            : f
        ));
        
        if (onUploadError) {
          onUploadError(error instanceof Error ? error.message : 'Upload failed');
        }
        
        return null;
      }
    });

    try {
      const urls = await Promise.all(uploadPromises);
      const successfulUrls = urls.filter(url => url !== null) as string[];
      
      if (successfulUrls.length > 0 && onUploadComplete) {
        onUploadComplete(successfulUrls);
      }
      
      toast.success(`${successfulUrls.length} file(s) uploaded successfully`);
    } catch (error) {
      toast.error('Some files failed to upload');
    } finally {
      setIsUploading(false);
    }
  };

  // Remove file
  const removeFile = (index: number) => {
    setUploadedFiles(prev => {
      const newFiles = [...prev];
      const removedFile = newFiles[index];
      
      // Revoke object URL to prevent memory leaks
      if (removedFile.preview) {
        URL.revokeObjectURL(removedFile.preview);
      }
      
      newFiles.splice(index, 1);
      return newFiles;
    });
  };

  // Copy URL to clipboard
  const copyUrl = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopiedUrl(url);
      toast.success('URL copied to clipboard');
      setTimeout(() => setCopiedUrl(null), 2000);
    } catch (error) {
      toast.error('Failed to copy URL');
    }
  };

  // Dropzone configuration
  const onDrop = useCallback((acceptedFiles: File[]) => {
    handleFileUpload(acceptedFiles);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: acceptedTypes.reduce((acc, type) => {
      acc[type] = [];
      return acc;
    }, {} as Record<string, string[]>),
    maxFiles,
    disabled: isUploading
  });

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Upload Area */}
      <Card>
        <CardContent className="p-6">
          <div
            {...getRootProps()}
            className={`
              border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
              ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}
              ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}
            `}
          >
            <input {...getInputProps()} ref={fileInputRef} />
            
            <div className="space-y-4">
              <div className="flex justify-center">
                {isUploading ? (
                  <Loader2 className="h-12 w-12 text-blue-600 animate-spin" />
                ) : (
                  <Upload className="h-12 w-12 text-gray-400" />
                )}
              </div>
              
              <div>
                <p className="text-lg font-medium">
                  {isDragActive ? 'Drop files here' : 'Drag & drop files here'}
                </p>
                <p className="text-sm text-muted-foreground">
                  or click to browse files
                </p>
              </div>
              
              <div className="text-xs text-muted-foreground">
                <p>Maximum {maxFiles} files, up to {maxSize}MB each</p>
                <p>Supported: {acceptedTypes.join(', ')}</p>
              </div>
              
              <Button 
                type="button" 
                variant="outline" 
                disabled={isUploading}
                onClick={() => fileInputRef.current?.click()}
              >
                <Camera className="h-4 w-4 mr-2" />
                Choose Files
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Uploaded Files */}
      {uploadedFiles.length > 0 && (
        <div className="space-y-3">
          <Label>Uploaded Files</Label>
          <div className="space-y-2">
            {uploadedFiles.map((uploadedFile, index) => (
              <Card key={index} className="overflow-hidden">
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    {/* File Preview/Icon */}
                    <div className="flex-shrink-0">
                      {uploadedFile.preview ? (
                        <img 
                          src={uploadedFile.preview} 
                          alt={uploadedFile.file.name}
                          className="w-16 h-16 object-cover rounded"
                        />
                      ) : (
                        <div className="w-16 h-16 flex items-center justify-center bg-gray-100 rounded">
                          {getFileIcon(uploadedFile.file)}
                        </div>
                      )}
                    </div>
                    
                    {/* File Info */}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{uploadedFile.file.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {formatFileSize(uploadedFile.file.size)}
                      </p>
                      
                      {/* Progress Bar */}
                      {uploadedFile.status === 'uploading' && (
                        <div className="mt-2">
                          <Progress value={uploadedFile.progress} className="h-2" />
                          <p className="text-xs text-muted-foreground mt-1">
                            Uploading... {uploadedFile.progress}%
                          </p>
                        </div>
                      )}
                      
                      {/* Error Message */}
                      {uploadedFile.status === 'error' && (
                        <div className="mt-2 flex items-center gap-1 text-red-600">
                          <AlertCircle className="h-4 w-4" />
                          <p className="text-sm">{uploadedFile.error}</p>
                        </div>
                      )}
                      
                      {/* Success URL */}
                      {uploadedFile.status === 'completed' && uploadedFile.url && (
                        <div className="mt-2">
                          <div className="flex items-center gap-2">
                            <Badge className="bg-green-100 text-green-800">
                              <Check className="h-3 w-3 mr-1" />
                              Uploaded
                            </Badge>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => copyUrl(uploadedFile.url!)}
                              className="h-6 px-2"
                            >
                              {copiedUrl === uploadedFile.url ? (
                                <Check className="h-3 w-3" />
                              ) : (
                                <Copy className="h-3 w-3" />
                              )}
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    {/* Actions */}
                    <div className="flex gap-1">
                      {uploadedFile.url && (
                        <>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => window.open(uploadedFile.url, '_blank')}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              const a = document.createElement('a');
                              a.href = uploadedFile.url!;
                              a.download = uploadedFile.file.name;
                              a.click();
                            }}
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => removeFile(index)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Existing Images */}
      {existingImages.length > 0 && (
        <div className="space-y-3">
          <Label>Existing Files</Label>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {existingImages.map((url, index) => (
              <Card key={index} className="overflow-hidden">
                <CardContent className="p-2">
                  <div className="aspect-square relative">
                    <img 
                      src={url} 
                      alt={`Existing file ${index + 1}`}
                      className="w-full h-full object-cover rounded"
                    />
                    <div className="absolute top-2 right-2 flex gap-1">
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => window.open(url, '_blank')}
                        className="h-6 w-6 p-0"
                      >
                        <Eye className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => copyUrl(url)}
                        className="h-6 w-6 p-0"
                      >
                        {copiedUrl === url ? (
                          <Check className="h-3 w-3" />
                        ) : (
                          <Copy className="h-3 w-3" />
                        )}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageUpload;
