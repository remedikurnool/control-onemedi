
import { AlertTriangle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface DevNoticeProps {
  children?: React.ReactNode;
}

export function DevNotice({ children }: DevNoticeProps) {
  return (
    <>
      <Alert className="mb-4 border-amber-200 bg-amber-50">
        <AlertTriangle className="h-4 w-4 text-amber-600" />
        <AlertDescription className="text-amber-800">
          <strong>Development Mode:</strong> This is a frontend-only build. API functionality is mocked for development purposes. The backend API files are excluded from compilation.
        </AlertDescription>
      </Alert>
      {children}
    </>
  );
}
