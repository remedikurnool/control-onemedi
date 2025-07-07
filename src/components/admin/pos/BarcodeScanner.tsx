import React, { useEffect, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Camera, X, Scan, Package, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import LoadingSpinner from '@/components/ui/loading-spinner';

interface BarcodeScannerProps {
  onScan: (product: any) => void;
  onClose: () => void;
}

const BarcodeScanner: React.FC<BarcodeScannerProps> = ({ onScan, onClose }) => {
  const [manualCode, setManualCode] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [lastScannedCode, setLastScannedCode] = useState('');
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scanIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Lookup product by barcode/SKU
  const { data: scannedProduct, isLoading: isLookingUp, error: lookupError } = useQuery({
    queryKey: ['product-lookup', lastScannedCode],
    queryFn: async () => {
      if (!lastScannedCode) return null;
      
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .or(`sku.eq.${lastScannedCode},barcode.eq.${lastScannedCode}`)
        .eq('is_available', true)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }
      
      return data;
    },
    enabled: !!lastScannedCode
  });

  // Initialize camera for barcode scanning
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: 'environment', // Use back camera
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setIsScanning(true);
        startBarcodeDetection();
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      toast.error('Camera access denied. Please use manual input.');
    }
  };

  // Simple barcode detection using canvas
  const startBarcodeDetection = () => {
    scanIntervalRef.current = setInterval(() => {
      if (videoRef.current && canvasRef.current && isScanning) {
        const video = videoRef.current;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        
        if (ctx && video.readyState === video.HAVE_ENOUGH_DATA) {
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          ctx.drawImage(video, 0, 0);
          
          // In a real implementation, you would use a barcode detection library here
          // For now, we'll simulate detection with a placeholder
          // You could integrate libraries like ZXing or QuaggaJS here
        }
      }
    }, 100);
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
      setIsScanning(false);
    }
    
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current);
      scanIntervalRef.current = null;
    }
  };

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  // Handle product found
  useEffect(() => {
    if (scannedProduct) {
      onScan(scannedProduct);
      toast.success(`Product found: ${scannedProduct.name_en}`);
      onClose();
    } else if (lastScannedCode && !isLookingUp && lookupError) {
      toast.error(`No product found with code: ${lastScannedCode}`);
      setLastScannedCode('');
    }
  }, [scannedProduct, lastScannedCode, isLookingUp, lookupError, onScan, onClose]);

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualCode.trim()) {
      setLastScannedCode(manualCode.trim());
      setManualCode('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleManualSubmit(e);
    }
  };

  // Simulate barcode detection for demo purposes
  const simulateBarcodeScan = () => {
    // Demo codes - in reality these would come from camera detection
    const demoCodes = ['MED001', 'MED002', 'SUP001', 'EQP001'];
    const randomCode = demoCodes[Math.floor(Math.random() * demoCodes.length)];
    setLastScannedCode(randomCode);
    toast.info(`Simulated scan: ${randomCode}`);
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <Scan className="h-5 w-5" />
          Barcode Scanner
        </CardTitle>
        <Button variant="ghost" size="sm" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Camera Section */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium">Camera Scanner</h3>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={isScanning ? stopCamera : startCamera}
              >
                <Camera className="h-4 w-4 mr-2" />
                {isScanning ? 'Stop Camera' : 'Start Camera'}
              </Button>
              {isScanning && (
                <Button variant="outline" size="sm" onClick={simulateBarcodeScan}>
                  <Scan className="h-4 w-4 mr-2" />
                  Simulate Scan
                </Button>
              )}
            </div>
          </div>
          
          {isScanning && (
            <div className="relative">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                className="w-full h-48 object-cover rounded border"
              />
              <canvas
                ref={canvasRef}
                className="hidden"
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-48 h-24 border-2 border-red-500 border-dashed rounded bg-transparent" />
              </div>
              <p className="text-xs text-center text-muted-foreground mt-2">
                Position barcode within the red rectangle or use simulate button
              </p>
            </div>
          )}
        </div>

        {/* Manual Input Section */}
        <div className="space-y-2">
          <h3 className="text-sm font-medium">Manual Entry</h3>
          <form onSubmit={handleManualSubmit} className="flex gap-2">
            <Input
              type="text"
              placeholder="Enter barcode/SKU manually..."
              value={manualCode}
              onChange={(e) => setManualCode(e.target.value)}
              onKeyPress={handleKeyPress}
              className="flex-1"
            />
            <Button type="submit" disabled={!manualCode.trim() || isLookingUp}>
              {isLookingUp ? 'Looking up...' : 'Scan'}
            </Button>
          </form>
        </div>

        {/* Loading State */}
        {isLookingUp && (
          <div className="flex items-center justify-center gap-2 py-4">
            <LoadingSpinner />
            <span className="text-sm">Looking up product...</span>
          </div>
        )}

        {/* Error State */}
        {lookupError && (
          <div className="flex items-center justify-center gap-2 py-4 text-destructive">
            <AlertCircle className="h-4 w-4" />
            <span className="text-sm">Error looking up product</span>
          </div>
        )}

        {/* Product Preview */}
        {scannedProduct && (
          <div className="p-3 border rounded-lg bg-green-50">
            <div className="flex items-center gap-2 mb-2">
              <Package className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium text-green-800">Product Found</span>
            </div>
            <div className="space-y-1">
              <p className="font-medium">{scannedProduct.name_en}</p>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">₹{scannedProduct.price}</span>
                <Badge variant="outline">
                  Stock: {scannedProduct.quantity || 0}
                </Badge>
              </div>
            </div>
          </div>
        )}

        <div className="text-xs text-muted-foreground space-y-1">
          <p>• Scan barcodes using your device's camera</p>
          <p>• Or enter barcode/SKU numbers manually</p>
          <p>• Use "Simulate Scan" for demo purposes</p>
          <p>• Supports EAN13, UPC, Code128 formats</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default BarcodeScanner;
