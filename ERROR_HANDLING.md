# Error Handling Guide

This document explains the comprehensive error handling system implemented in the CPAP Maintenance Tracker application.

## Overview

The application includes multiple layers of error handling:

1. **Error Boundary** - Catches unhandled React component errors
2. **HTTP/API Error Handling** - Handles Supabase and network errors
3. **Form Error Handling** - Validates and displays form submission errors
4. **User Notifications** - Toast notifications for errors and feedback

## Components & Utilities

### 1. ErrorBoundary Component

**File:** `src/components/ErrorBoundary.tsx`

Catches unhandled exceptions in React components and displays a user-friendly error page.

```tsx
import { ErrorBoundary } from '@/components/ErrorBoundary';

function App() {
  return (
    <ErrorBoundary>
      <YourApp />
    </ErrorBoundary>
  );
}
```

**Features:**
- Displays error UI with retry and home button
- Shows stack trace in development mode only
- Prevents white screen of death

### 2. Error Handling Utilities

**File:** `src/lib/error-handling.ts`

Provides error classes and utility functions:

```tsx
import {
  ApiError,
  AuthError,
  NetworkError,
  parseSupabaseError,
  formatErrorMessage,
  tryCatch,
} from '@/lib/error-handling';

// Safely execute async code
const [data, error] = await tryCatch(
  () => someAsyncOperation(),
  defaultValue
);

if (error) {
  console.error('Operation failed:', error);
}

// Parse Supabase errors
const { message, code } = parseSupabaseError(supabaseError);

// Format errors for display
const userMessage = formatErrorMessage(error);
```

### 3. useAsync Hook

**File:** `src/hooks/use-async.ts`

Simplifies async operations with built-in error handling:

```tsx
import { useAsync } from '@/hooks/use-async';

function MyComponent() {
  const { execute, loading, error, data } = useAsync(
    async () => {
      const response = await fetchSomething();
      return response;
    },
    {
      onSuccess: (data) => console.log('Success!', data),
      onError: (error) => console.log('Failed:', error),
      showNotification: true,
    }
  );

  return (
    <div>
      {error && <ErrorDisplay error={error} />}
      <button onClick={execute} disabled={loading}>
        {loading ? 'Loading...' : 'Execute'}
      </button>
    </div>
  );
}
```

### 4. useFormSubmit Hook

**File:** `src/hooks/use-form-submit.ts`

Handles form submission with error tracking:

```tsx
import { useFormSubmit } from '@/hooks/use-form-submit';

function MyForm() {
  const { handleSubmit, isSubmitting, error, success } = useFormSubmit(
    async () => {
      await submitForm();
    },
    () => toast('Form submitted successfully!'),
    (error) => console.error('Submit failed:', error)
  );

  return (
    <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
      {error && <ErrorDisplay error={error} onDismiss={() => setError(null)} />}
      <button disabled={isSubmitting}>
        {isSubmitting ? 'Submitting...' : 'Submit'}
      </button>
    </form>
  );
}
```

### 5. ErrorDisplay Component

**File:** `src/components/ErrorDisplay.tsx`

Displays error messages with optional retry and dismiss buttons:

```tsx
import { ErrorDisplay } from '@/components/ErrorDisplay';

function MyComponent() {
  const [error, setError] = useState<string | null>(null);

  return (
    <ErrorDisplay
      error={error}
      title="Failed to load data"
      onDismiss={() => setError(null)}
      onRetry={refetch}
    />
  );
}
```

## Enhanced Hooks

### useAuth Hook

Now includes error tracking:

```tsx
const { user, error, clearError } = useAuth();

if (error) {
  return <div>Auth error: {error}</div>;
}
```

### useUserParts Hook

Now includes error handling and retry logic:

```tsx
const { userParts, loading, error, refetchUserParts } = useUserParts();

if (error) {
  return <ErrorDisplay error={error} onRetry={refetchUserParts} />;
}
```

## Best Practices

### 1. Always Handle Query Errors

```tsx
const { data, isLoading, error } = useQuery({
  queryKey: ['data'],
  queryFn: fetchData,
  retry: 2,
  retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
});

if (error) {
  return <ErrorDisplay error={formatErrorMessage(error)} />;
}
```

### 2. Use Error Boundaries

Wrap components that might throw:

```tsx
<ErrorBoundary>
  <ComplexComponent />
</ErrorBoundary>
```

### 3. Provide User-Friendly Messages

```tsx
const { message } = parseSupabaseError(error);
toast({
  title: 'Error',
  description: message, // User-friendly message
  variant: 'destructive',
});
```

### 4. Log Errors in Development

```tsx
useEffect(() => {
  if (error) {
    console.error('Query error:', error);
  }
}, [error]);
```

### 5. Add Retry Logic

```tsx
const { execute, loading } = useAsync(fetchData);

return (
  <ErrorDisplay
    error={error}
    onRetry={execute}
  />
);
```

## Error Types

### ApiError

Generic API error:

```tsx
throw new ApiError('Operation failed', 'OP_FAILED', 500, originalError);
```

### AuthError

Authentication-related error:

```tsx
throw new AuthError('Invalid credentials', 'INVALID_CREDS');
```

### NetworkError

Network connectivity error:

```tsx
throw new NetworkError('Unable to connect to server');
```

## Error Messages

The system automatically parses common error types:

- **Network Errors:** "Network connection failed. Please check your internet connection and try again."
- **Auth Errors:** "Authentication failed. Please log in again."
- **Duplicate Errors:** "This item already exists. Please use a different value."
- **Permission Errors:** "You do not have permission to perform this action."
- **Rate Limiting:** "Too many requests. Please wait a moment and try again."
- **Not Found:** "The requested item was not found."

## Development

In development mode:

- Stack traces are displayed in ErrorBoundary
- Detailed error logs are printed to console
- Error details expandable sections in UI

In production mode:

- Only user-friendly messages are shown
- Technical details are logged server-side only
- Stack traces are hidden

## Integration with Sentry (Future)

To add error tracking with Sentry:

```tsx
import * as Sentry from "@sentry/react";

componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
  Sentry.captureException(error, {
    contexts: {
      react: {
        componentStack: errorInfo.componentStack,
      },
    },
  });
}
```
