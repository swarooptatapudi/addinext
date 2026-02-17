'use client';

import { useState, useEffect, useRef } from 'react';
import { Loader2, AlertCircle, RefreshCw, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ValidationResponse {
  success: boolean;
  message: string;
  customer_id?: string;
}

interface CustomerValidationGuardProps {
  children: React.ReactNode;
}

/* Prevent multiple calls across navigation */
let validatedOnce = false;
let cachedResult: ValidationResponse | null = null;

export default function CustomerValidationGuard({ children }: CustomerValidationGuardProps) {
  const [loading, setLoading] = useState(!validatedOnce);
  const [validation, setValidation] = useState<ValidationResponse | null>(cachedResult);
  const isCalling = useRef(false);

  useEffect(() => {
    if (!validatedOnce) {
      validateCustomerSetup();
    }
  }, []);

  /* ---------------- VALIDATION ---------------- */

  const validateCustomerSetup = async () => {
    if (isCalling.current) return;
    isCalling.current = true;

    try {
      setLoading(true);

      const response = await fetch(
        '/api/method/addiwise.apis.customer.validate_customer_setup',
        {
          method: 'GET',
          credentials: 'include',
        }
      );

      // session expired
      if (response.status === 401) {
        window.location.replace('/auth/login');
        return;
      }

      const data = await response.json();

      const result: ValidationResponse = data?.message || {
        success: false,
        message: 'Invalid server response',
      };

      cachedResult = result;
      validatedOnce = true;
      setValidation(result);

    } catch (error) {
      const result = {
        success: false,
        message: 'Unable to validate customer setup. Please try again.',
      };

      cachedResult = result;
      validatedOnce = true;
      setValidation(result);

    } finally {
      setLoading(false);
      isCalling.current = false;
    }
  };

  /* ---------------- RETRY ---------------- */

  const handleRetry = () => {
    validatedOnce = false;
    cachedResult = null;
    validateCustomerSetup();
  };

  /* ---------------- LOGOUT (NEW) ---------------- */

  const handleLogout = async () => {
    try {
      await fetch('/api/method/logout', {
        method: 'GET',
        credentials: 'include',
      });
    } catch (e) {}

    // reset guard cache
    validatedOnce = false;
    cachedResult = null;

    // clear browser state
    sessionStorage.clear();
    localStorage.clear();

    // replace history → cannot go back
    window.location.replace('/auth');
  };

  /* ---------------- LOADING ---------------- */

  if (loading) {
    return (
      <div className="fixed inset-0 bg-white z-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600 text-lg">Validating your account...</p>
        </div>
      </div>
    );
  }

  /* ---------------- BLOCKED SCREEN ---------------- */

  if (!validation?.success) {
    return (
      <div className="fixed inset-0 bg-gray-50 z-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
          <div className="text-center">

            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-4">
              <AlertCircle className="h-8 w-8 text-red-600" />
            </div>

            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Setup Incomplete
            </h2>

            <p className="text-gray-600 mb-6 whitespace-pre-line">
              {validation?.message ||
                'Your account setup is incomplete. Please contact support.'}
            </p>

            <div className="space-y-3">

              <Button onClick={handleRetry} className="w-full">
                <RefreshCw className="h-4 w-4 mr-2" />
                Retry Validation
              </Button>

              <Button
                onClick={() => (window.location.href = '/support')}
                className="w-full"
                variant="outline"
              >
                Contact Support
              </Button>

              {/* NEW LOGOUT BUTTON */}
              <Button
                onClick={handleLogout}
                className="w-full"
                variant="destructive"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>

            </div>

            <div className="mt-6 pt-6 border-t border-gray-200">
              <p className="text-sm text-gray-500">
                Need help? Contact support for assistance.
              </p>
            </div>

          </div>
        </div>
      </div>
    );
  }

  /* ---------------- SUCCESS ---------------- */

  return <>{children}</>;
}
