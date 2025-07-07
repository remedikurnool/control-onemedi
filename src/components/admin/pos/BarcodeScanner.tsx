
import React, { useEffect, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Camera, X, Scan, Package, AlertCircle, Zap } from 'lucide-react';
import { toast } from 'sonner';
import LoadingSpinner from '@/components/ui/loading-spinner';
import BarcodeDetector from './BarcodeDetector';

interface BarcodeScannerProps {
  onScan: (product: any) => void;
  onClose: () => void;
}

const BarcodeScanner: React.FC<BarcodeScannerProps> = ({ onScan, onClose }) => {
  const [manualCode, setManualCode] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [lastScannedCode, setLastScannedCode] = useState('');
  const [scanHistory, setScanHistory] = useState<string[]>([]);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Lookup product by barcode/SKU with inventory information
  const { data: scannedProduct, isLoading: isLookingUp, error: lookupError } = useQuery({
    queryKey: ['product-lookup', lastScannedCode],
    queryFn: async () => {
      if (!lastScannedCode) return null;
      
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          product_inventory(available_quantity, reserved_quantity)
        `)
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

  const handleBarcodeDetected = (code: string) => {
    if (code && code !== lastScannedCode) {
      console.log('New barcode detected:', code);
      setLastScannedCode(code);
      setScanHistory(prev => [code, ...prev.slice(0, 4)]); // Keep last 5 scans
      toast.info(`Barcode detected: ${code}`);
    }
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: 'environment',
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
      toast.error('Camera access denied. Please use manual input.');
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
      setScanHistory(prev => [manualCode.trim(), ...prev.slice(0, 4)]);
      setManualCode('');
    }
  };

  const simulateBarcodeScan = () => {
    const demoCodes = ['MED001', 'MED002', 'SUP001', 'EQP001'];
    const randomCode = demoCodes[Math.floor(Math.random() * demoCodes.length)];
    handleBarcodeDetected(randomCode);
  };

  const rescanCode = (code: string) => {
    setLastScannedCode(code);
  };

  return (
    <Card className="w-full max-w-lg mx-auto">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <Scan className="h-5 w-5" />
          Enhanced Barcode Scanner
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
                {isScanning ? 'Stop' : 'Start'} Camera
              </Button>
              {isScanning && (
                <Button variant="outline" size="sm" onClick={simulateBarcodeScan}>
                  <Zap className="h-4 w-4 mr-2" />
                  Demo Scan
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
                muted
                className="w-full h-48 object-cover rounded border bg-black"
              />
              <BarcodeDetector
                onDetected={handleBarcodeDetected}
                isActive={isScanning}
                videoRef={videoRef}
              />
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-48 h-24 border-2 border-red-500 border-dashed rounded bg-transparent opacity-70" />
              </div>
              <div className="absolute bottom-2 left-2 right-2">
                <p className="text-xs text-white bg-black bg-opacity-50 p-1 rounded text-center">
                  Position barcode within the red rectangle
                </p>
              </div>
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
              className="flex-1"
            />
            <Button type="submit" disabled={!manualCode.trim() || isLookingUp}>
              {isLookingUp ? 'Looking up...' : 'Scan'}
            </Button>
          </form>
        </div>

        {/* Scan History */}
        {scanHistory.length > 0 && (
          <div className="space-y-2">
            <h3 className="text-sm font-medium">Recent Scans</h3>
            <div className="flex flex-wrap gap-1">
              {scanHistory.map((code, index) => (
                <Button
                  key={`${code}-${index}`}
                  variant="outline"
                  size="sm"
                  onClick={() => rescanCode(code)}
                  className="text-xs h-7"
                >
                  {code}
                </Button>
              ))}
            </div>
          </div>
        )}

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
                  Stock: {scannedProduct.product_inventory?.[0]?.available_quantity || 0}
                </Badge>
              </div>
            </div>
          </div>
        )}

        <div className="text-xs text-muted-foreground space-y-1">
          <p>• Real-time barcode detection with camera</p>
          <p>• Supports EAN13, UPC, Code128, Code39 formats</p>
          <p>• Manual entry for difficult-to-scan codes</p>
          <p>• Recent scan history for quick re-lookup</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default BarcodeScanner;
