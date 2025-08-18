import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { MATERIAL_ICONS } from "@/lib/constants";
import { useState } from "react";

export default function Login() {
  const [error, setError] = useState<string | null>(null);

  const handleGoogleLogin = () => {
    setError(null);
    fetch('/auth/google')
      .then(response => {
        if (response.status === 503) {
          setError('Google OAuth is not configured yet. Please provide your Google OAuth credentials.');
        } else {
          window.location.href = '/auth/google';
        }
      })
      .catch(() => {
        window.location.href = '/auth/google';
      });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-material-blue-50 to-material-indigo-50 flex items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-material-blue-500 p-3 rounded-full">
              <span className="material-icons text-3xl text-white">
                {MATERIAL_ICONS.school}
              </span>
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">Welcome to Zoo</CardTitle>
          <CardDescription className="text-gray-600">
            Your personal assignment management system
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <Alert>
              <AlertDescription className="text-sm">
                {error}
              </AlertDescription>
            </Alert>
          )}
          
          <Button 
            onClick={handleGoogleLogin}
            className="w-full bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 flex items-center justify-center space-x-2"
            data-testid="button-google-login"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            <span>Continue with Google</span>
          </Button>
          
          <div className="text-center text-sm text-gray-500">
            Sign in to access your assignments and track your academic progress
          </div>
          
          <div className="text-center text-xs text-gray-400 mt-4">
            <p>Need OAuth setup? Use redirect URI:</p>
            <code className="text-xs bg-gray-100 px-2 py-1 rounded">
              https://087fea98-ad7a-4f35-a254-12ecf6c17ade-00-d45blih3a0ae.janeway.replit.dev/auth/google/callback
            </code>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}