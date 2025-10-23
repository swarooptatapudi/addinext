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

        try {
            // Direct HDFC Payment Link API call
            const paymentData = {
                currency: options.currency,
                mobile_country_code: "+91",
                options: {
                    create_mandate: "REQUIRED"
                },
                payment_page_client_id: this.clientId,
                cardsCheckBox: true,
                otcCheckBox: true,
                walletCheckBox: true,
                consumerFinanceCheckBox: true,
                netbankingCheckBox: true,
                upiCheckBox: true,
                amount: options.amount,
                customer_email: options.customerEmail,
                shouldSendMail: true,
                customer_phone: options.customerPhone,
                shouldSendSMS: true,
                order_id: options.orderId,
                return_url: options.returnUrl,
                offer_details: null,
                payment_filter: {
                    allowDefaultOptions: true,
                    options: [
                        { paymentMethodType: "UPI", enable: true },
                        { paymentMethodType: "WALLET", enable: true },
                        { paymentMethodType: "CARD", enable: true },
                        { paymentMethodType: "NB", enable: true },
                        { paymentMethodType: "OTC", enable: true },
                        { paymentMethodType: "VIRTUAL_ACCOUNT", enable: false },
                        { paymentMethodType: "CONSUMER_FINANCE", enable: true }
                    ],
                    emiOptions: {
                        standardEmi: {
                            enable: false,
                            credit: { enable: false },
                            debit: { enable: false },
                            cardless: { enable: false }
                        },
                        lowCostEmi: {
                            enable: false,
                            credit: { enable: false },
                            debit: { enable: false },
                            cardless: { enable: false }
                        },
                        noCostEmi: {
                            enable: false,
                            credit: { enable: false },
                            debit: { enable: false },
                            cardless: { enable: false }
                        },
                        showOnlyEmi: false
                    }
                },
                merchant_id: this.merchantId
            };

            const response = await fetch('/api/method/addiwise.apis.hdfc_payment.create_payment_link', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    // Add CSRF token if available (for Frappe)
                    ...(typeof window !== 'undefined' && (window as any).frappe?.csrf_token && {
                        'X-Frappe-CSRF-Token': (window as any).frappe.csrf_token
                    })
                },
                body: JSON.stringify(paymentData)
            });

            if (!response.ok) {
                throw new Error(`HDFC API error: ${response.status} ${response.statusText}`);
            }

            const result = await response.json();
            console.log('✅ HDFC Payment Link Response:', result);

            if (result.payment_link || result.paymentUrl || result.url) {
                const paymentUrl = result.payment_link || result.paymentUrl || result.url;
                console.log('✅ HDFC Payment URL received:', paymentUrl);
                return paymentUrl;
            } else {
                throw new Error(result.message || 'Failed to create payment link');
            }
        } catch (error) {
            console.error('❌ HDFC Payment Link API call failed:', error);
            throw error;
        }
    }

    // Verify payment status
    async verifyPayment(paymentId: string, orderId: string): Promise<HDFCPaymentResponse> {
        console.log('🔍 HDFC Payment Verification:', {
            paymentId,
            orderId,
            merchantId: this.merchantId
        });

        try {
            // Real HDFC API call for payment verification
            const response = await fetch(`${this.gatewayUrl}/api/payment/verify`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-tenant-id': 'jt_31cc1291098a41dd887104e7ba1177ed',
                    'x-web-logintoken': 'hdfc:::fe493e82fb545139afba67e85b16a6'
                },
                body: JSON.stringify({
                    merchant_id: this.merchantId,
                    payment_id: paymentId,
                    order_id: orderId,
                    timestamp: Date.now().toString(),
                }),
            });

            if (!response.ok) {
                throw new Error(`Verification API error: ${response.status}`);
            }

            const result = await response.json();
            console.log('✅ Payment verification result:', result);

            return {
                success: result.status === 'SUCCESS' || result.success,
                paymentId: result.payment_id || paymentId,
                transactionId: result.transaction_id || result.txn_id,
                status: result.status,
                message: result.message || 'Payment verification completed'
            };
        } catch (error) {
            console.error('❌ HDFC Verification Error:', error);
            return {
                success: false,
                message: 'Failed to verify payment'
            };
        }
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