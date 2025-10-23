import { useState, useCallback } from 'react';
import { hdfcGateway, HDFCPaymentOptions } from '@/lib/hdfcGateway';
import { toast } from 'react-toastify';

export const useHDFCPayment = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [paymentWindow, setPaymentWindow] = useState<Window | null>(null);

    const initiatePayment = useCallback(async (
        options: HDFCPaymentOptions,
        onSuccess: (paymentData: any) => void,
        onFailure?: (error: string) => void
    ) => {
        setIsLoading(true);

        try {
            // Get payment URL from HDFC
            const paymentUrl = await hdfcGateway.initiatePayment(options);
            console.log('💳 Payment URL Generated:', paymentUrl);

            // Open payment window
            const popup = hdfcGateway.openPaymentWindow(paymentUrl);
            setPaymentWindow(popup);

            if (!popup) {
                throw new Error('Failed to open payment window. Please allow popups for this site.');
            }

            console.log('🪟 Payment window opened:', popup);

            // Listen for payment completion
            const checkPaymentStatus = setInterval(async () => {
                if (popup?.closed) {
                    clearInterval(checkPaymentStatus);
                    setIsLoading(false);

                    // Check payment status
                    try {
                        // Real payment verification
                        const result = await hdfcGateway.verifyPayment('', options.orderId);
                        if (result.success) {
                            onSuccess(result);
                            toast.success('Payment completed successfully!');
                        } else {
                            onFailure?.(result.message || 'Payment failed');
                            toast.error('Payment failed');
                        }
                    } catch (error) {
                        onFailure?.('Payment verification failed');
                        toast.error('Payment verification failed');
                    }
                }
            }, 1000);

        } catch (error) {
            setIsLoading(false);
            const errorMessage = error instanceof Error ? error.message : 'Payment initiation failed';
            onFailure?.(errorMessage);
            toast.error(errorMessage);
        }
    }, []);

    return {
        initiatePayment,
        isLoading,
        paymentWindow,
    };
};
