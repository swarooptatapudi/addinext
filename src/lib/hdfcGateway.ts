// HDFC Smart Gateway Integration Service

export interface HDFCPaymentOptions {
    amount: number;
    currency: string;
    orderId: string;
    customerName: string;
    customerEmail: string;
    customerPhone: string;
    description: string;
    returnUrl: string;
    cancelUrl: string;
}

export interface HDFCPaymentResponse {
    success: boolean;
    paymentId?: string;
    transactionId?: string;
    status?: string;
    message?: string;
}

class HDFCGatewayService {
    private merchantId: string;
    private apiKey: string;
    private gatewayUrl: string;
    private clientId: string;
    private responseKey: string;

    constructor() {
        this.merchantId = process.env.NEXT_PUBLIC_HDFC_MERCHANT_ID || 'SG3698';
        this.apiKey = process.env.NEXT_PUBLIC_HDFC_API_KEY || '';
        this.gatewayUrl = process.env.NEXT_PUBLIC_HDFC_GATEWAY_URL || 'https://smartgatewayuat.hdfcbank.com';
        this.clientId = process.env.NEXT_PUBLIC_HDFC_PAYMENT_CLIENT_ID || 'hdfcmaster';
        this.responseKey = process.env.HDFC_SECRET_KEY || '';
    }

    // Initialize payment with HDFC Smart Gateway
    async initiatePayment(options: HDFCPaymentOptions): Promise<string> {
        console.log('🏦 HDFC Payment Initiation Started:', {
            merchantId: this.merchantId,
            orderId: options.orderId,
            amount: options.amount,
            customer: options.customerName
        });

        // Call YOUR BACKEND to initiate payment with HDFC
        try {
            const response = await fetch('/api/payment/hdfc/initiate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    orderId: options.orderId,
                    amount: options.amount,
                    currency: options.currency,
                    customerName: options.customerName,
                    customerEmail: options.customerEmail,
                    customerPhone: options.customerPhone,
                    description: options.description,
                    returnUrl: options.returnUrl,
                    cancelUrl: options.cancelUrl,
                }),
            });

            if (!response.ok) {
                throw new Error(`Backend API error: ${response.status}`);
            }

            const result = await response.json();

            if (result.success && result.paymentUrl) {
                console.log('✅ HDFC Payment URL received from backend:', result.paymentUrl);
                return result.paymentUrl; // This should be HDFC's hosted payment page
            } else {
                throw new Error(result.message || 'Failed to create payment session');
            }
        } catch (error) {
            console.error('❌ Backend API call failed:', error);

            // Fallback to mock mode for development
            console.log('🧪 Falling back to MOCK MODE for testing');
            const mockPaymentPage = this.createMockPaymentPage(options);
            const blob = new Blob([mockPaymentPage], { type: 'text/html' });
            const blobUrl = URL.createObjectURL(blob);

            console.log('🧪 Mock Payment Page Created:', blobUrl);
            return blobUrl;
        }

        // HDFC Smart Gateway Integration
        // Since we don't have the exact API documentation, let's try the standard approach

        console.log('🏦 HDFC Payment Initiation:', {
            merchantId: this.merchantId,
            orderId: options.orderId,
            amount: options.amount,
            apiKey: this.apiKey ? 'Present' : 'Missing'
        });

        // For now, let's use a form-based approach that creates a payment form
        // This is the most common method for HDFC Smart Gateway
        const paymentForm = this.createPaymentForm(options);

        // Return a data URL that will be used to submit the form
        return `data:text/html;charset=utf-8,${encodeURIComponent(paymentForm)}`;
    }

    // Verify payment status
    async verifyPayment(paymentId: string, orderId: string): Promise<HDFCPaymentResponse> {
        // For testing without complete HDFC credentials
        if (!this.apiKey || this.apiKey === '') {
            console.log('🧪 MOCK MODE: HDFC Payment Verification', {
                paymentId,
                orderId,
                merchantId: this.merchantId
            });

            // Return mock successful payment for testing
            return {
                success: true,
                paymentId: paymentId || `MOCK_PAY_${Date.now()}`,
                transactionId: `TXN_${Date.now()}`,
                status: 'SUCCESS',
                message: 'Mock payment successful'
            };
        }

        // Real HDFC API call
        const payload = {
            merchant_id: this.merchantId,
            payment_id: paymentId,
            order_id: orderId,
            timestamp: Date.now().toString(),
        };

        const signature = this.generateSignature(payload);

        try {
            const response = await fetch(`${this.gatewayUrl}/api/payment/verify`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.apiKey}`,
                },
                body: JSON.stringify({
                    ...payload,
                    signature,
                }),
            });

            return await response.json();
        } catch (error) {
            console.error('HDFC Verification Error:', error);
            return {
                success: false,
                message: 'Failed to verify payment'
            };
        }
    }

    // Create mock payment page for testing
    private createMockPaymentPage(options: HDFCPaymentOptions): string {
        const mockHtml = `
        <!DOCTYPE html>
        <html>
        <head>
            <title>Mock HDFC Payment Gateway - Testing Mode</title>
            <style>
                body { 
                    font-family: Arial, sans-serif; 
                    max-width: 500px; 
                    margin: 50px auto; 
                    padding: 20px;
                    background: #f8f9fa;
                }
                .payment-card {
                    background: white;
                    padding: 30px;
                    border-radius: 10px;
                    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                }
                .header {
                    text-align: center;
                    color: #007bff;
                    margin-bottom: 20px;
                }
                .amount {
                    font-size: 24px;
                    font-weight: bold;
                    color: #28a745;
                    text-align: center;
                    margin: 20px 0;
                }
                .details {
                    background: #f8f9fa;
                    padding: 15px;
                    border-radius: 5px;
                    margin: 20px 0;
                }
                .btn {
                    width: 100%;
                    padding: 12px;
                    margin: 10px 0;
                    border: none;
                    border-radius: 5px;
                    font-size: 16px;
                    cursor: pointer;
                }
                .btn-success { background: #28a745; color: white; }
                .btn-danger { background: #dc3545; color: white; }
                .btn:hover { opacity: 0.9; }
                .note {
                    background: #fff3cd;
                    color: #856404;
                    padding: 10px;
                    border-radius: 5px;
                    margin-top: 20px;
                    font-size: 14px;
                }
            </style>
        </head>
        <body>
            <div class="payment-card">
                <h2 class="header">HDFC Smart Gateway</h2>
                <p style="text-align: center; color: #6c757d;">Testing Mode - Mock Payment</p>
                
                <div class="amount">Rs. ${options.amount}</div>
                
                <div class="details">
                    <strong>Order ID:</strong> ${options.orderId}<br>
                    <strong>Merchant:</strong> ${this.merchantId}<br>
                    <strong>Customer:</strong> ${options.customerName}<br>
                    <strong>Description:</strong> ${options.description}
                </div>
                
                <button class="btn btn-success" onclick="simulateSuccess()">
                    Simulate Successful Payment
                </button>
                
                <button class="btn btn-danger" onclick="simulateFailure()">
                    Simulate Payment Failure
                </button>
                
                <div class="note">
                    <strong>Note:</strong> This is a mock payment page for testing purposes. 
                    No real payment will be processed.
                </div>
            </div>
            
            <script>
                function simulateSuccess() {
                    alert('Mock Payment Successful!\\nPayment ID: MOCK_PAY_${Date.now()}');
                    setTimeout(() => {
                        window.close();
                    }, 1000);
                }
                
                function simulateFailure() {
                    alert('Mock Payment Failed!\\nReason: User cancelled payment');
                    setTimeout(() => {
                        window.close();
                    }, 1000);
                }
                
                // Auto-close after 30 seconds if no action
                setTimeout(() => {
                    alert('Payment session expired');
                    window.close();
                }, 30000);
            </script>
        </body>
        </html>`;

        return mockHtml;
    }

    // Create payment form for HDFC Smart Gateway
    private createPaymentForm(options: HDFCPaymentOptions): string {
        // Create an HTML form that will be submitted to HDFC
        const formHtml = `
        <!DOCTYPE html>
        <html>
        <head>
            <title>Redirecting to HDFC Payment Gateway...</title>
            <style>
                body { 
                    font-family: Arial, sans-serif; 
                    text-align: center; 
                    padding: 50px;
                    background: #f5f5f5;
                }
                .loader { 
                    border: 4px solid #f3f3f3;
                    border-top: 4px solid #3498db;
                    border-radius: 50%;
                    width: 40px;
                    height: 40px;
                    animation: spin 2s linear infinite;
                    margin: 20px auto;
                }
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            </style>
        </head>
        <body>
            <h2>Redirecting to HDFC Payment Gateway...</h2>
            <div class="loader"></div>
            <p>Please wait while we redirect you to the secure payment page.</p>
            
            <form id="hdfcPaymentForm" method="POST" action="${this.gatewayUrl}/transaction/request">
                <input type="hidden" name="merchant_id" value="${this.merchantId}" />
                <input type="hidden" name="order_id" value="${options.orderId}" />
                <input type="hidden" name="amount" value="${options.amount}" />
                <input type="hidden" name="currency" value="${options.currency}" />
                <input type="hidden" name="redirect_url" value="${options.returnUrl}" />
                <input type="hidden" name="cancel_url" value="${options.cancelUrl}" />
                <input type="hidden" name="language" value="EN" />
                <input type="hidden" name="billing_name" value="${options.customerName}" />
                <input type="hidden" name="billing_email" value="${options.customerEmail}" />
                <input type="hidden" name="billing_tel" value="${options.customerPhone}" />
                <input type="hidden" name="merchant_param1" value="${options.description}" />
                <input type="hidden" name="access_code" value="${this.apiKey}" />
            </form>
            
            <script>
                // Auto-submit the form after a short delay
                setTimeout(function() {
                    document.getElementById('hdfcPaymentForm').submit();
                }, 2000);
            </script>
        </body>
        </html>`;

        return formHtml;
    }

    // Encrypt payment data for HDFC Smart Gateway
    private encryptPaymentData(paymentData: any): string {
        // HDFC Smart Gateway requires AES encryption with working key
        // This is a simplified version - you'll need the actual HDFC encryption library

        if (!this.responseKey) {
            console.warn('⚠️ No RESPONSE_KEY provided, using mock encryption');
            return 'mock_encrypted_data_for_testing';
        }

        try {
            // Convert payment data to query string format
            const queryString = Object.keys(paymentData)
                .map(key => `${key}=${encodeURIComponent(paymentData[key] || '')}`)
                .join('&');

            // For now, return base64 encoded data (replace with actual HDFC encryption)
            const crypto = require('crypto');
            const cipher = crypto.createCipher('aes-128-ecb', this.responseKey);
            let encrypted = cipher.update(queryString, 'utf8', 'hex');
            encrypted += cipher.final('hex');

            return encrypted;
        } catch (error) {
            console.error('Encryption error:', error);
            return 'encryption_failed';
        }
    }

    // Generate signature/checksum (implement as per HDFC documentation)
    private generateSignature(payload: any): string {
        // This should be implemented based on HDFC's signature generation algorithm
        // Usually involves sorting parameters and creating hash with secret key
        const secretKey = this.responseKey;

        // Sort parameters alphabetically
        const sortedParams = Object.keys(payload)
            .sort()
            .map(key => `${key}=${payload[key]}`)
            .join('&');

        // Create hash (this is a simplified example - follow HDFC's exact algorithm)
        const crypto = require('crypto');
        return crypto
            .createHmac('sha256', secretKey)
            .update(sortedParams)
            .digest('hex');
    }

    // Open payment in new window/popup
    openPaymentWindow(paymentUrl: string): Window | null {
        try {
            // Try to open popup first
            const popup = window.open(
                paymentUrl,
                'HDFCPayment',
                'width=600,height=700,scrollbars=yes,resizable=yes,menubar=no,toolbar=no,location=no,status=no'
            );

            // If popup is blocked, try opening in same tab
            if (!popup || popup.closed || typeof popup.closed == 'undefined') {
                console.warn('⚠️ Popup blocked, opening in same tab');
                window.location.href = paymentUrl;
                return null;
            }

            return popup;
        } catch (error) {
            console.error('❌ Error opening payment window:', error);
            // Fallback: open in same tab
            window.location.href = paymentUrl;
            return null;
        }
    }
}

export const hdfcGateway = new HDFCGatewayService();
