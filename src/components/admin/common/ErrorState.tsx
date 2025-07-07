import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw, Home, ArrowLeft } from 'lucide-react';

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  onGoBack?: () => void;
  onGoHome?: () => void;
  showRetry?: boolean;
  showGoBack?: boolean;
  showGoHome?: boolean;
  fullHeight?: boolean;
}

const ErrorState: React.FC<ErrorStateProps> = ({
  title = "Something went wrong",
  message = "We encountered an unexpected error. Please try again.",
  onRetry,
  onGoBack,
  onGoHome,
  showRetry = true,
  showGoBack = false,
  showGoHome = false,
  fullHeight = false
}) => {
  const containerClass = fullHeight 
    ? 'flex items-center justify-center min-h-[400px]' 
    : 'flex items-center justify-center py-12';

  return (
    <div className={containerClass}>
      <Card className="w-full max-w-md">
        <CardContent className="p-8 text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-destructive/10 rounded-full">
              <AlertTriangle className="h-8 w-8 text-destructive" />
            </div>
          </div>
          
          <h3 className="text-lg font-semibold mb-2">{title}</h3>
          <p className="text-sm text-muted-foreground mb-6">{message}</p>
          
          <div className="flex flex-col gap-2">
            {showRetry && onRetry && (
              <Button onClick={onRetry} className="w-full">
                <RefreshCw className="h-4 w-4 mr-2" />
                Try Again
              </Button>
            )}
            
            {showGoBack && onGoBack && (
              <Button variant="outline" onClick={onGoBack} className="w-full">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Go Back
              </Button>
            )}
            
            {showGoHome && onGoHome && (
              <Button variant="outline" onClick={onGoHome} className="w-full">
                <Home className="h-4 w-4 mr-2" />
                Go Home
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ErrorState;