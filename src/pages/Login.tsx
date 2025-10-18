import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Navigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Wind } from 'lucide-react';

const Login = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Wind className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Redirect authenticated users to the main page
  if (user) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center items-center mb-2">
            <Wind className="h-8 w-8 mr-2 text-primary" />
            <CardTitle className="text-2xl font-bold">
              CPAP Maintenance Tracker
            </CardTitle>
          </div>
          <p className="text-sm text-muted-foreground">Sign in or create an account</p>
        </CardHeader>
        <CardContent>
          <Auth
            supabaseClient={supabase}
            providers={[]}
            appearance={{
              theme: ThemeSupa,
              variables: {
                default: {
                  colors: {
                    brand: 'hsl(var(--primary))',
                    brandAccent: 'hsl(var(--primary-foreground))',
                    inputBackground: 'hsl(var(--input))',
                    inputBorder: 'hsl(var(--border))',
                    defaultButtonBackground: 'hsl(var(--secondary))',
                    defaultButtonText: 'hsl(var(--secondary-foreground))',
                  },
                },
              },
            }}
            theme="dark" // Using dark theme for better contrast with our dark mode
            redirectTo={window.location.origin + '/'}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;