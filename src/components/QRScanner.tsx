import { useState, useEffect, useRef } from "react";
import { Camera, CheckCircle, XCircle } from "lucide-react";
import { Html5QrcodeScanner } from "html5-qrcode";
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
  const [cameraError, setCameraError] = useState<string | null>(null);
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);
  const hasRenderedScannerRef = useRef(false);

  const verifyQr = async (qrId: string) => {
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

  useEffect(() => {
    if (hasRenderedScannerRef.current) return;
    hasRenderedScannerRef.current = true;

    // Only run in browser
    if (typeof window === "undefined") return;

    const config = {
      fps: 10,
      qrbox: { width: 250, height: 250 },
    };

    const scanner = new Html5QrcodeScanner("qr-scanner", config, false);
    scannerRef.current = scanner;

    scanner.render(
      async (decodedText) => {
        // On successful scan, stop scanner UI then verify QR
        try {
          await scanner.clear();
        } catch (err) {
          console.warn("Error clearing scanner after success:", err);
        }

        setCameraError(null);
        setScanStatus("success");
        verifyQr(decodedText);
      },
      (errorMessage) => {
        // Ignore normal scanning errors; log only unexpected ones
        if (errorMessage && !String(errorMessage).includes("QR code parse error")) {
          console.warn("QR scan error:", errorMessage);
        }
      }
    );

    return () => {
      // Cleanup scanner on unmount
      if (scannerRef.current) {
        scannerRef.current
          .clear()
          .catch((err) => console.warn("Error clearing scanner on unmount:", err));
      }
    }
  }, []);

  return (
    <Card className="p-6 shadow-elevated">
      <h3 className="text-xl font-bold mb-4">Scan QR Code</h3>
      
      <div className="space-y-6">
        {/* Camera Scanner */}
        <div>
          <div className="relative bg-muted rounded-lg overflow-hidden mb-4">
            {/* Html5QrcodeScanner renders its own UI and video inside this div */}
            <div id="qr-scanner" className="aspect-video" />
          </div>

          {scanStatus === "success" && (
            <div className="text-center animate-scale-in mb-2">
              <CheckCircle className="w-10 h-10 text-success mx-auto mb-1" />
              <p className="text-success text-sm font-semibold">QR code scanned! Verifying...</p>
            </div>
          )}

          {cameraError && (
            <div className="text-center p-2">
              <p className="text-sm text-destructive mb-1">{cameraError}</p>
              <p className="text-xs text-muted-foreground">
                If camera keeps failing, you can still enter the QR ID manually below.
              </p>
            </div>
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