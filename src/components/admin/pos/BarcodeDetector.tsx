
import { useEffect, useRef } from 'react';
import Quagga from 'quagga';

interface BarcodeDetectorProps {
  onDetected: (code: string) => void;
  isActive: boolean;
  videoRef: React.RefObject<HTMLVideoElement>;
}

const BarcodeDetector: React.FC<BarcodeDetectorProps> = ({ 
  onDetected, 
  isActive, 
  videoRef 
}) => {
  const scannerInitialized = useRef(false);

  useEffect(() => {
    if (!isActive || !videoRef.current || scannerInitialized.current) {
      return;
    }

    const config = {
      inputStream: {
        name: "Live",
        type: "LiveStream",
        target: videoRef.current,
        constraints: {
          width: 640,
          height: 480,
          facingMode: "environment"
        }
      },
      locator: {
        patchSize: "medium",
        halfSample: true
      },
      numOfWorkers: 2,
      frequency: 10,
      decoder: {
        readers: [
          "code_128_reader",
          "ean_reader",
          "ean_8_reader",
          "code_39_reader",
          "code_39_vin_reader",
          "codabar_reader",
          "upc_reader",
          "upc_e_reader",
          "i2of5_reader"
        ]
      },
      locate: true
    };

    Quagga.init(config, (err: any) => {
      if (err) {
        console.error('Error initializing Quagga:', err);
        return;
      }
      console.log('Quagga initialization successful');
      Quagga.start();
      scannerInitialized.current = true;
    });

    Quagga.onDetected((result: any) => {
      const code = result.codeResult.code;
      if (code) {
        console.log('Barcode detected:', code);
        onDetected(code);
      }
    });

    return () => {
      if (scannerInitialized.current) {
        Quagga.stop();
        scannerInitialized.current = false;
      }
    };
  }, [isActive, onDetected, videoRef]);

  useEffect(() => {
    return () => {
      if (scannerInitialized.current) {
        Quagga.stop();
        scannerInitialized.current = false;
      }
    };
  }, []);

  return null;
};

export default BarcodeDetector;
