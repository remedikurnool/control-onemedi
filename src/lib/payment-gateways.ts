
// Payment Gateway Configuration for OneMedi Healthcare Platform

export interface PaymentGatewayConfig {
  name: string;
  isEnabled: boolean;
  mode: 'test' | 'production';
  config: Record<string, any>;
  supportedMethods: string[];
  fees: {
    percentage: number;
    fixed: number;
  };
  processingTime: string;
  currencies: string[];
}

// Payment gateway configurations
export const PAYMENT_GATEWAYS: Record<string, PaymentGatewayConfig> = {
  razorpay: {
    name: 'Razorpay',
    isEnabled: true,
    mode: import.meta.env.MODE === 'production' ? 'production' : 'test',
    config: {
      keyId: import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_key',
      keySecret: import.meta.env.VITE_RAZORPAY_KEY_SECRET || 'rzp_test_secret',
      webhookSecret: import.meta.env.VITE_RAZORPAY_WEBHOOK_SECRET || 'webhook_secret',
      currency: 'INR',
      theme: {
        color: '#3B82F6',
        backdrop_color: '#F1F5F9'
      }
    },
    supportedMethods: ['card', 'netbanking', 'wallet', 'upi'],
    fees: {
      percentage: 2.0,
      fixed: 0
    },
    processingTime: 'Instant',
    currencies: ['INR']
  },
  
  paytm: {
    name: 'Paytm',
    isEnabled: true,
    mode: import.meta.env.MODE === 'production' ? 'production' : 'test',
    config: {
      merchantId: import.meta.env.VITE_PAYTM_MERCHANT_ID || 'test_merchant',
      merchantKey: import.meta.env.VITE_PAYTM_MERCHANT_KEY || 'test_key',
      website: import.meta.env.VITE_PAYTM_WEBSITE || 'WEBSTAGING',
      industryTypeId: import.meta.env.VITE_PAYTM_INDUSTRY_TYPE || 'Retail',
      channelId: import.meta.env.VITE_PAYTM_CHANNEL_ID || 'WEB',
      callbackUrl: `${window.location.origin}/payment/callback/paytm`
    },
    supportedMethods: ['paytm_wallet', 'card', 'netbanking', 'upi'],
    fees: {
      percentage: 1.99,
      fixed: 0
    },
    processingTime: 'Instant',
    currencies: ['INR']
  },

  phonepe: {
    name: 'PhonePe',
    isEnabled: true,
    mode: import.meta.env.MODE === 'production' ? 'production' : 'test',
    config: {
      merchantId: import.meta.env.VITE_PHONEPE_MERCHANT_ID || 'test_merchant',
      saltKey: import.meta.env.VITE_PHONEPE_SALT_KEY || 'test_salt',
      saltIndex: import.meta.env.VITE_PHONEPE_SALT_INDEX || '1',
      callbackUrl: `${window.location.origin}/payment/callback/phonepe`,
      redirectUrl: `${window.location.origin}/payment/redirect/phonepe`
    },
    supportedMethods: ['phonepe_wallet', 'card', 'netbanking', 'upi'],
    fees: {
      percentage: 1.99,
      fixed: 0
    },
    processingTime: 'Instant',
    currencies: ['INR']
  },

  googlepay: {
    name: 'Google Pay',
    isEnabled: true,
    mode: import.meta.env.MODE === 'production' ? 'production' : 'test',
    config: {
      merchantId: import.meta.env.VITE_GOOGLEPAY_MERCHANT_ID || 'test_merchant',
      merchantName: 'OneMedi Healthcare',
      environment: import.meta.env.MODE === 'production' ? 'PRODUCTION' : 'TEST',
      gatewayMerchantId: import.meta.env.VITE_GOOGLEPAY_GATEWAY_MERCHANT_ID || 'test_gateway',
      allowedCardNetworks: ['VISA', 'MASTERCARD', 'AMEX'],
      allowedCardAuthMethods: ['PAN_ONLY', 'CRYPTOGRAM_3DS']
    },
    supportedMethods: ['googlepay'],
    fees: {
      percentage: 1.5,
      fixed: 0
    },
    processingTime: 'Instant',
    currencies: ['INR']
  },

  upi: {
    name: 'UPI Direct',
    isEnabled: true,
    mode: import.meta.env.MODE === 'production' ? 'production' : 'test',
    config: {
      vpa: import.meta.env.VITE_UPI_VPA || 'onemedi@upi',
      merchantCode: import.meta.env.VITE_UPI_MERCHANT_CODE || 'test_merchant',
      supportedApps: ['phonepe', 'googlepay', 'paytm', 'bhim', 'amazonpay']
    },
    supportedMethods: ['upi'],
    fees: {
      percentage: 0.5,
      fixed: 0
    },
    processingTime: 'Instant',
    currencies: ['INR']
  },

  cod: {
    name: 'Cash on Delivery',
    isEnabled: true,
    mode: 'production',
    config: {
      maxAmount: 5000,
      serviceFee: 50,
      availableLocations: ['hyderabad', 'secunderabad', 'cyberabad'],
      verificationRequired: true
    },
    supportedMethods: ['cod'],
    fees: {
      percentage: 0,
      fixed: 50
    },
    processingTime: 'On Delivery',
    currencies: ['INR']
  }
};

// Payment method configurations
export const PAYMENT_METHODS = {
  card: {
    name: 'Credit/Debit Card',
    icon: 'credit-card',
    description: 'Secure payment with your card',
    processingTime: 'Instant'
  },
  netbanking: {
    name: 'Net Banking',
    icon: 'building-bank',
    description: 'Pay directly from your bank account',
    processingTime: 'Instant'
  },
  wallet: {
    name: 'Digital Wallet',
    icon: 'wallet',
    description: 'Pay with your digital wallet',
    processingTime: 'Instant'
  },
  upi: {
    name: 'UPI',
    icon: 'smartphone',
    description: 'Pay with UPI apps',
    processingTime: 'Instant'
  },
  cod: {
    name: 'Cash on Delivery',
    icon: 'banknote',
    description: 'Pay when you receive',
    processingTime: 'On Delivery'
  }
};

// Get enabled payment gateways
export const getEnabledPaymentGateways = (): PaymentGatewayConfig[] => {
  return Object.values(PAYMENT_GATEWAYS).filter(gateway => gateway.isEnabled);
};

// Get payment gateway by name
export const getPaymentGateway = (name: string): PaymentGatewayConfig | null => {
  return PAYMENT_GATEWAYS[name] || null;
};

// Calculate payment fees
export const calculatePaymentFees = (amount: number, gatewayName: string): number => {
  const gateway = getPaymentGateway(gatewayName);
  if (!gateway) return 0;
  
  const { percentage, fixed } = gateway.fees;
  return (amount * percentage / 100) + fixed;
};

// Get supported payment methods for a gateway
export const getSupportedPaymentMethods = (gatewayName: string): string[] => {
  const gateway = getPaymentGateway(gatewayName);
  return gateway?.supportedMethods || [];
};

// Development mode configuration
export const DEV_MODE_CONFIG = {
  enableAllGateways: true,
  skipVerification: true,
  testCredentials: true,
  mockResponses: true
};

// Get gateway configuration for development
export const getGatewayConfig = (gatewayName: string): PaymentGatewayConfig | null => {
  const gateway = getPaymentGateway(gatewayName);
  if (!gateway) return null;

  // In development mode, ensure all gateways are enabled with test credentials
  if (import.meta.env.MODE === 'development') {
    return {
      ...gateway,
      isEnabled: true,
      mode: 'test'
    };
  }

  return gateway;
};
