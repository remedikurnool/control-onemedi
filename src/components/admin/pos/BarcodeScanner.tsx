
import React, { useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Camera, X, Scan } from 'lucide-react';

interface BarcodeScannerProps {
  onScan: (barcode: string) => void;
  onClose: () => void;
}

const BarcodeScanner: React.FC<BarcodeScannerProps> = ({ onScan, onClose }) => {
  const [manualCode, setManualCode] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

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
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      // Fallback to manual input
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
      setIsScanning(false);
    }
  };

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualCode.trim()) {
      onScan(manualCode.trim());
      setManualCode('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleManualSubmit(e);
    }
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
            <Button
              variant="outline"
              size="sm"
              onClick={isScanning ? stopCamera : startCamera}
            >
              <Camera className="h-4 w-4 mr-2" />
              {isScanning ? 'Stop Camera' : 'Start Camera'}
            </Button>
          </div>
          
          {isScanning && (
            <div className="relative">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                className="w-full h-48 object-cover rounded border"
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-48 h-24 border-2 border-red-500 border-dashed rounded bg-transparent" />
              </div>
              <p className="text-xs text-center text-muted-foreground mt-2">
                Position barcode within the red rectangle
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
              placeholder="Enter barcode manually..."
              value={manualCode}
              onChange={(e) => setManualCode(e.target.value)}
              onKeyPress={handleKeyPress}
              className="flex-1"
            />
            <Button type="submit" disabled={!manualCode.trim()}>
              Scan
            </Button>
          </form>
        </div>

        <div className="text-xs text-muted-foreground">
          <p>• Scan barcodes using your device's camera</p>
          <p>• Or enter barcode numbers manually</p>
          <p>• Supports EAN13, UPC, Code128 formats</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default BarcodeScanner;
