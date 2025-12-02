import { useState, useEffect, useRef } from "react";
import { Camera, CheckCircle, XCircle } from "lucide-react";
import { Html5Qrcode } from "html5-qrcode";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { apiFetch } from "@/lib/api";
import { toast } from "sonner";

interface QRScannerProps {
  teamId: string;
  onSuccess: () => void;
}

const QRScanner = ({ teamId, onSuccess }: QRScannerProps) => {
  const [manualCode, setManualCode] = useState("");
  const [scanStatus, setScanStatus] = useState<"idle" | "success" | "error">("idle");
  const [loading, setLoading] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const scanAreaRef = useRef<HTMLDivElement>(null);

  const verifyQr = async (qrId: string) => {
    // Stop camera if scanning
    if (scannerRef.current) {
      try {
        await scannerRef.current.stop();
        scannerRef.current.clear();
        scannerRef.current = null;
        setIsScanning(false);
      } catch (err) {
        console.error("Error stopping scanner:", err);
      }
    }
    
    setLoading(true);
    try {
      await apiFetch("/game/qr-scan", {
        method: "POST",
        body: JSON.stringify({ teamId, qrId }),
      });
      setScanStatus("success");
      toast.success("Correct location found!");
      setTimeout(() => {
        onSuccess();
      }, 800);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Wrong location";
      toast.error(message);
      setScanStatus("error");
      setTimeout(() => {
        setScanStatus("idle");
      }, 1500);
    } finally {
      setLoading(false);
    }
  };

  const handleManualSubmit = () => {
    if (!manualCode) return;
    verifyQr(manualCode);
  };

  const startCameraScan = async () => {
    if (isScanning) return;

    try {
      const scannerId = "qr-scanner";
      if (!scanAreaRef.current) {
        toast.error("Scanner area not found");
        return;
      }

      const html5QrCode = new Html5Qrcode(scannerId);
      scannerRef.current = html5QrCode;

      await html5QrCode.start(
        { facingMode: "environment" }, // Use back camera on mobile
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
        },
        (decodedText) => {
          // QR code scanned successfully
          html5QrCode.stop().catch(() => {});
          setIsScanning(false);
          verifyQr(decodedText);
        },
        (errorMessage) => {
          // Ignore scanning errors (they're frequent while scanning)
        }
      );

      setIsScanning(true);
      setCameraError(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to start camera";
      setCameraError(message);
      toast.error(message);
      setIsScanning(false);
      if (scannerRef.current) {
        scannerRef.current.stop().catch(() => {});
        scannerRef.current = null;
      }
    }
  };

  const stopCameraScan = async () => {
    if (scannerRef.current) {
      try {
        await scannerRef.current.stop();
        scannerRef.current.clear();
        scannerRef.current = null;
      } catch (err) {
        console.error("Error stopping scanner:", err);
      }
    }
    setIsScanning(false);
    setCameraError(null);
  };

  useEffect(() => {
    // Cleanup on unmount
    return () => {
      if (scannerRef.current) {
        scannerRef.current.stop().catch(() => {});
        scannerRef.current.clear();
      }
    };
  }, []);

  const handleScanClick = () => {
    if (isScanning) {
      stopCameraScan();
    } else {
      startCameraScan();
    }
  };

  return (
    <Card className="p-6 shadow-elevated">
      <h3 className="text-xl font-bold mb-4">Scan QR Code</h3>
      
      <div className="space-y-6">
        {/* Camera Scanner */}
        <div>
          <div className="relative bg-muted rounded-lg overflow-hidden mb-4">
            <div 
              id="qr-scanner"
              ref={scanAreaRef}
              className="aspect-video flex items-center justify-center bg-gradient-to-br from-muted to-muted/50"
            >
              {!isScanning && scanStatus === "idle" && (
                <div className="text-center">
                  <Camera className="w-24 h-24 text-muted-foreground/40 mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">Click "Start Camera" to scan QR code</p>
                </div>
              )}
              {!isScanning && scanStatus === "success" && (
                <div className="text-center animate-scale-in">
                  <CheckCircle className="w-24 h-24 text-success mx-auto mb-2" />
                  <p className="text-success font-semibold">Correct Location!</p>
                </div>
              )}
              {!isScanning && scanStatus === "error" && (
                <div className="text-center animate-scale-in">
                  <XCircle className="w-24 h-24 text-destructive mx-auto mb-2" />
                  <p className="text-destructive font-semibold">Wrong Location!</p>
                </div>
              )}
              {cameraError && (
                <div className="text-center p-4">
                  <p className="text-sm text-destructive mb-2">{cameraError}</p>
                  <p className="text-xs text-muted-foreground">You can still enter the QR ID manually below</p>
                </div>
              )}
            </div>
          </div>
          
          <Button
            onClick={handleScanClick}
            disabled={loading || scanStatus === "success"}
            className="w-full gradient-primary hover:opacity-90 shadow-glow"
          >
            <Camera className="w-4 h-4 mr-2" />
            {loading 
              ? "Verifying..." 
              : isScanning 
                ? "Stop Camera" 
                : scanStatus === "success"
                  ? "Location Verified"
                  : "Start Camera Scan"}
          </Button>
          {isScanning && (
            <p className="text-xs text-muted-foreground text-center mt-2">
              Point your camera at the QR code
            </p>
          )}
        </div>

        {/* Manual Entry */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-card px-2 text-muted-foreground">Or enter manually</span>
          </div>
        </div>

        <div>
          <Label htmlFor="manualCode">QR Code ID</Label>
          <div className="flex gap-2 mt-2">
              <Input
                id="manualCode"
                placeholder="e.g., QR-1-ABCD1234"
                value={manualCode}
                onChange={(e) => setManualCode(e.target.value)}
                disabled={scanStatus !== "idle" || loading}
              />
              <Button
                onClick={handleManualSubmit}
                disabled={!manualCode || scanStatus !== "idle" || loading}
                variant="outline"
                className="border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground"
              >
                Submit
              </Button>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default QRScanner;