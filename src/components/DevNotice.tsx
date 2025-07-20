
import { AlertTriangle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export function DevNotice() {
  return (
    <Alert className="mb-4 border-amber-200 bg-amber-50">
      <AlertTriangle className="h-4 w-4 text-amber-600" />
      <AlertDescription className="text-amber-800">
        <strong>Development Mode:</strong> Authentication is disabled and API calls are mocked. 
        This is temporary for development purposes.
      </AlertDescription>
    </Alert>
  );
}
