import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';

interface ErrorDisplayProps {
  error: string | null;
  title?: string;
  onDismiss?: () => void;
  onRetry?: () => void;
  variant?: 'default' | 'destructive';
}

/**
 * Component for displaying error messages to users
 */
export function ErrorDisplay({
  error,
  title = 'Error',
  onDismiss,
  onRetry,
  variant = 'destructive',
}: ErrorDisplayProps) {
  if (!error) return null;

  return (
    <Alert variant={variant} className="mb-4">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>{title}</AlertTitle>
      <AlertDescription className="space-y-2">
        <p>{error}</p>
        <div className="flex gap-2">
          {onRetry && (
            <Button
              onClick={onRetry}
              size="sm"
              variant="outline"
              className="h-8"
            >
              Try Again
            </Button>
          )}
          {onDismiss && (
            <Button
              onClick={onDismiss}
              size="sm"
              variant="ghost"
              className="h-8"
            >
              Dismiss
            </Button>
          )}
        </div>
      </AlertDescription>
    </Alert>
  );
}
