import React, { useState, useEffect } from 'react';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import RootLayout from './app/_layout';
import ErrorHandler from './components/ErrorHandler';

export default function App() {
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const originalErrorHandler = ErrorUtils.getGlobalHandler();

    ErrorUtils.setGlobalHandler((err, isFatal) => {
      setError(err);
      // You can also report the error to a service like Sentry or Crashlytics here
      originalErrorHandler(err, isFatal);
    });

    return () => {
      ErrorUtils.setGlobalHandler(originalErrorHandler);
    };
  }, []);

  const resetError = () => {
    setError(null);
  };

  if (error) {
    return <ErrorHandler error={error} resetError={resetError} />;
  }

  return (
    <ThemeProvider>
      <AuthProvider>
        <RootLayout />
      </AuthProvider>
    </ThemeProvider>
  );
}
