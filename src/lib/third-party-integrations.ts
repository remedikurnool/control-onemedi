// Third-party Integrations for OneMedi Healthcare Platform
// SMS, Email, WhatsApp, Analytics, and other service integrations

export interface IntegrationConfig {
  service: string;
  apiKey: string;
  apiSecret?: string;
  baseUrl?: string;
  isActive: boolean;
  environment: 'test' | 'production';
  configuration?: Record<string, any>;
}

// SMS Integration (Twilio, MSG91, TextLocal)
export class SMSService {
  private config: IntegrationConfig;

  constructor(provider: 'twilio' | 'msg91' | 'textlocal' = 'msg91') {
    this.config = {
      service: provider,
      apiKey: process.env[`VITE_${provider.toUpperCase()}_API_KEY`] || '',
      apiSecret: process.env[`${provider.toUpperCase()}_API_SECRET`] || '',
      baseUrl: this.getBaseUrl(provider),
      isActive: true,
      environment: process.env.NODE_ENV === 'production' ? 'production' : 'test'
    };
  }

  private getBaseUrl(provider: string): string {
    switch (provider) {
      case 'twilio':
        return 'https://api.twilio.com/2010-04-01';
      case 'msg91':
        return 'https://api.msg91.com/api';
      case 'textlocal':
        return 'https://api.textlocal.in';
      default:
        return '';
    }
  }

  async sendSMS(to: string, message: string, templateId?: string): Promise<boolean> {
    try {
      const response = await fetch('/api/integrations/sms/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          provider: this.config.service,
          to: to.replace(/^\+91/, ''), // Remove country code for Indian numbers
          message,
          templateId,
          environment: this.config.environment
        })
      });

      const result = await response.json();
      return result.success === true;
    } catch (error) {
      console.error('SMS sending failed:', error);
      return false;
    }
  }

  async sendOTP(to: string, otp: string): Promise<boolean> {
    const message = `Your OneMedi verification code is: ${otp}. Valid for 10 minutes. Do not share with anyone.`;
    return this.sendSMS(to, message, 'otp_template');
  }

  async sendOrderConfirmation(to: string, orderNumber: string, amount: number): Promise<boolean> {
    const message = `Order ${orderNumber} confirmed! Amount: ₹${amount}. Track your order on OneMedi app. Thank you!`;
    return this.sendSMS(to, message, 'order_confirmation');
  }

  async sendPaymentConfirmation(to: string, orderNumber: string, amount: number): Promise<boolean> {
    const message = `Payment of ₹${amount} received for order ${orderNumber}. Your medicines will be delivered soon. OneMedi`;
    return this.sendSMS(to, message, 'payment_confirmation');
  }
}

// Email Integration (SendGrid, AWS SES, Mailgun)
export class EmailService {
  private config: IntegrationConfig;

  constructor(provider: 'sendgrid' | 'ses' | 'mailgun' = 'sendgrid') {
    this.config = {
      service: provider,
      apiKey: process.env[`VITE_${provider.toUpperCase()}_API_KEY`] || '',
      baseUrl: this.getBaseUrl(provider),
      isActive: true,
      environment: process.env.NODE_ENV === 'production' ? 'production' : 'test'
    };
  }

  private getBaseUrl(provider: string): string {
    switch (provider) {
      case 'sendgrid':
        return 'https://api.sendgrid.com/v3';
      case 'ses':
        return 'https://email.amazonaws.com';
      case 'mailgun':
        return 'https://api.mailgun.net/v3';
      default:
        return '';
    }
  }

  async sendEmail(
    to: string,
    subject: string,
    htmlContent: string,
    textContent?: string,
    templateId?: string
  ): Promise<boolean> {
    try {
      const response = await fetch('/api/integrations/email/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          provider: this.config.service,
          to,
          subject,
          htmlContent,
          textContent,
          templateId,
          from: 'noreply@onemedi.com',
          fromName: 'OneMedi Healthcare'
        })
      });

      const result = await response.json();
      return result.success === true;
    } catch (error) {
      console.error('Email sending failed:', error);
      return false;
    }
  }

  async sendWelcomeEmail(to: string, name: string): Promise<boolean> {
    const subject = 'Welcome to OneMedi Healthcare!';
    const htmlContent = `
      <h1>Welcome to OneMedi, ${name}!</h1>
      <p>Thank you for joining India's leading healthcare platform.</p>
      <p>You can now:</p>
      <ul>
        <li>Order medicines online</li>
        <li>Book lab tests and scans</li>
        <li>Consult with doctors</li>
        <li>Access home care services</li>
      </ul>
      <p>Download our app for the best experience!</p>
    `;

    return this.sendEmail(to, subject, htmlContent, undefined, 'welcome_template');
  }

  async sendOrderConfirmationEmail(
    to: string,
    orderDetails: {
      orderNumber: string;
      items: Array<{ name: string; quantity: number; price: number }>;
      total: number;
      deliveryAddress: string;
    }
  ): Promise<boolean> {
    const subject = `Order Confirmation - ${orderDetails.orderNumber}`;
    const htmlContent = `
      <h1>Order Confirmed!</h1>
      <p>Your order ${orderDetails.orderNumber} has been confirmed.</p>
      <h3>Order Details:</h3>
      <ul>
        ${orderDetails.items.map(item =>
          `<li>${item.name} - Qty: ${item.quantity} - ₹${item.price}</li>`
        ).join('')}
      </ul>
      <p><strong>Total: ₹${orderDetails.total}</strong></p>
      <p><strong>Delivery Address:</strong> ${orderDetails.deliveryAddress}</p>
      <p>We'll notify you once your order is shipped!</p>
    `;

    return this.sendEmail(to, subject, htmlContent, undefined, 'order_confirmation');
  }
}

// WhatsApp Integration (Twilio WhatsApp API, WhatsApp Business API)
export class WhatsAppService {
  private config: IntegrationConfig;

  constructor() {
    this.config = {
      service: 'whatsapp',
      apiKey: process.env.VITE_WHATSAPP_API_KEY || '',
      apiSecret: process.env.WHATSAPP_API_SECRET || '',
      baseUrl: 'https://api.twilio.com/2010-04-01',
      isActive: true,
      environment: process.env.NODE_ENV === 'production' ? 'production' : 'test',
      configuration: {
        fromNumber: process.env.WHATSAPP_FROM_NUMBER || 'whatsapp:+14155238886'
      }
    };
  }

  async sendWhatsAppMessage(to: string, message: string, templateName?: string): Promise<boolean> {
    try {
      const response = await fetch('/api/integrations/whatsapp/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: `whatsapp:+91${to.replace(/^\+91/, '')}`,
          message,
          templateName,
          from: this.config.configuration?.fromNumber
        })
      });

      const result = await response.json();
      return result.success === true;
    } catch (error) {
      console.error('WhatsApp message sending failed:', error);
      return false;
    }
  }

  async sendOrderUpdate(to: string, orderNumber: string, status: string): Promise<boolean> {
    const message = `🏥 *OneMedi Update*\n\nOrder: ${orderNumber}\nStatus: ${status}\n\nTrack your order: ${window.location.origin}/track/${orderNumber}`;
    return this.sendWhatsAppMessage(to, message, 'order_update');
  }

  async sendAppointmentReminder(to: string, doctorName: string, appointmentTime: string): Promise<boolean> {
    const message = `🩺 *Appointment Reminder*\n\nDoctor: ${doctorName}\nTime: ${appointmentTime}\n\nJoin consultation: ${window.location.origin}/consultation`;
    return this.sendWhatsAppMessage(to, message, 'appointment_reminder');
  }
}

// Analytics Integration (Google Analytics, Mixpanel, Amplitude)
export class AnalyticsService {
  private config: IntegrationConfig;

  constructor(provider: 'google' | 'mixpanel' | 'amplitude' = 'google') {
    this.config = {
      service: provider,
      apiKey: process.env[`VITE_${provider.toUpperCase()}_API_KEY`] || '',
      isActive: true,
      environment: process.env.NODE_ENV === 'production' ? 'production' : 'test'
    };
  }

  async trackEvent(eventName: string, properties: Record<string, any> = {}): Promise<void> {
    try {
      // Google Analytics 4
      if (this.config.service === 'google' && window.gtag) {
        window.gtag('event', eventName, {
          ...properties,
          custom_parameter: true
        });
      }

      // Also send to our backend for custom analytics
      await fetch('/api/analytics/track', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          event: eventName,
          properties,
          timestamp: new Date().toISOString(),
          provider: this.config.service
        })
      });
    } catch (error) {
      console.error('Analytics tracking failed:', error);
    }
  }

  async trackPageView(page: string, title?: string): Promise<void> {
    await this.trackEvent('page_view', {
      page_path: page,
      page_title: title || document.title
    });
  }

  async trackPurchase(orderId: string, value: number, currency: string = 'INR'): Promise<void> {
    await this.trackEvent('purchase', {
      transaction_id: orderId,
      value,
      currency
    });
  }

  async trackUserSignup(userId: string, method: string): Promise<void> {
    await this.trackEvent('sign_up', {
      user_id: userId,
      method
    });
  }
}

// Unified Communication Service
export class CommunicationService {
  private sms: SMSService;
  private email: EmailService;
  private whatsapp: WhatsAppService;
  private analytics: AnalyticsService;

  constructor() {
    this.sms = new SMSService();
    this.email = new EmailService();
    this.whatsapp = new WhatsAppService();
    this.analytics = new AnalyticsService();
  }

  async sendOrderConfirmation(
    customerInfo: {
      phone: string;
      email: string;
      name: string;
      userId: string;
    },
    orderDetails: {
      orderNumber: string;
      items: Array<{ name: string; quantity: number; price: number }>;
      total: number;
      deliveryAddress: string;
    }
  ): Promise<void> {
    try {
      // Send SMS
      await this.sms.sendOrderConfirmation(
        customerInfo.phone,
        orderDetails.orderNumber,
        orderDetails.total
      );

      // Send Email
      await this.email.sendOrderConfirmationEmail(customerInfo.email, orderDetails);

      // Send WhatsApp (optional)
      await this.whatsapp.sendOrderUpdate(
        customerInfo.phone,
        orderDetails.orderNumber,
        'Confirmed'
      );

      // Track analytics
      await this.analytics.trackPurchase(
        orderDetails.orderNumber,
        orderDetails.total
      );
    } catch (error) {
      console.error('Failed to send order confirmation:', error);
    }
  }

  async sendPaymentConfirmation(
    customerInfo: { phone: string; email: string; userId: string },
    paymentDetails: { orderId: string; amount: number; paymentId: string }
  ): Promise<void> {
    try {
      // Send SMS
      await this.sms.sendPaymentConfirmation(
        customerInfo.phone,
        paymentDetails.orderId,
        paymentDetails.amount
      );

      // Track analytics
      await this.analytics.trackEvent('payment_success', {
        order_id: paymentDetails.orderId,
        payment_id: paymentDetails.paymentId,
        amount: paymentDetails.amount
      });
    } catch (error) {
      console.error('Failed to send payment confirmation:', error);
    }
  }
}

// Export service instances
export const smsService = new SMSService();
export const emailService = new EmailService();
export const whatsappService = new WhatsAppService();
export const analyticsService = new AnalyticsService();
export const communicationService = new CommunicationService();

// SMS Integration (Twilio, MSG91, TextLocal)
export class SMSService {
  private config: IntegrationConfig;

  constructor(provider: 'twilio' | 'msg91' | 'textlocal' = 'msg91') {
    this.config = {
      service: provider,
      apiKey: process.env[`VITE_${provider.toUpperCase()}_API_KEY`] || '',
      apiSecret: process.env[`${provider.toUpperCase()}_API_SECRET`] || '',
      baseUrl: this.getBaseUrl(provider),
      isActive: true,
      environment: process.env.NODE_ENV === 'production' ? 'production' : 'test'
    };
  }

  private getBaseUrl(provider: string): string {
    switch (provider) {
      case 'twilio':
        return 'https://api.twilio.com/2010-04-01';
      case 'msg91':
        return 'https://api.msg91.com/api';
      case 'textlocal':
        return 'https://api.textlocal.in';
      default:
        return '';
    }
  }

  async sendSMS(to: string, message: string, templateId?: string): Promise<boolean> {
    try {
      const response = await fetch('/api/integrations/sms/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          provider: this.config.service,
          to: to.replace(/^\+91/, ''), // Remove country code for Indian numbers
          message,
          templateId,
          environment: this.config.environment
        })
      });

      const result = await response.json();
      return result.success === true;
    } catch (error) {
      console.error('SMS sending failed:', error);
      return false;
    }
  }

  async sendOTP(to: string, otp: string): Promise<boolean> {
    const message = `Your OneMedi verification code is: ${otp}. Valid for 10 minutes. Do not share with anyone.`;
    return this.sendSMS(to, message, 'otp_template');
  }

  async sendOrderConfirmation(to: string, orderNumber: string, amount: number): Promise<boolean> {
    const message = `Order ${orderNumber} confirmed! Amount: ₹${amount}. Track your order on OneMedi app. Thank you!`;
    return this.sendSMS(to, message, 'order_confirmation');
  }

  async sendPaymentConfirmation(to: string, orderNumber: string, amount: number): Promise<boolean> {
    const message = `Payment of ₹${amount} received for order ${orderNumber}. Your medicines will be delivered soon. OneMedi`;
    return this.sendSMS(to, message, 'payment_confirmation');
  }
}

// Email Integration (SendGrid, AWS SES, Mailgun)
export class EmailService {
  private config: IntegrationConfig;

  constructor(provider: 'sendgrid' | 'ses' | 'mailgun' = 'sendgrid') {
    this.config = {
      service: provider,
      apiKey: process.env[`VITE_${provider.toUpperCase()}_API_KEY`] || '',
      baseUrl: this.getBaseUrl(provider),
      isActive: true,
      environment: process.env.NODE_ENV === 'production' ? 'production' : 'test'
    };
  }

  private getBaseUrl(provider: string): string {
    switch (provider) {
      case 'sendgrid':
        return 'https://api.sendgrid.com/v3';
      case 'ses':
        return 'https://email.amazonaws.com';
      case 'mailgun':
        return 'https://api.mailgun.net/v3';
      default:
        return '';
    }
  }

  async sendEmail(
    to: string,
    subject: string,
    htmlContent: string,
    textContent?: string,
    templateId?: string
  ): Promise<boolean> {
    try {
      const response = await fetch('/api/integrations/email/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          provider: this.config.service,
          to,
          subject,
          htmlContent,
          textContent,
          templateId,
          from: 'noreply@onemedi.com',
          fromName: 'OneMedi Healthcare'
        })
      });

      const result = await response.json();
      return result.success === true;
    } catch (error) {
      console.error('Email sending failed:', error);
      return false;
    }
  }

  async sendWelcomeEmail(to: string, name: string): Promise<boolean> {
    const subject = 'Welcome to OneMedi Healthcare!';
    const htmlContent = `
      <h1>Welcome to OneMedi, ${name}!</h1>
      <p>Thank you for joining India's leading healthcare platform.</p>
      <p>You can now:</p>
      <ul>
        <li>Order medicines online</li>
        <li>Book lab tests and scans</li>
        <li>Consult with doctors</li>
        <li>Access home care services</li>
      </ul>
      <p>Download our app for the best experience!</p>
    `;
    
    return this.sendEmail(to, subject, htmlContent, undefined, 'welcome_template');
  }

  async sendOrderConfirmationEmail(
    to: string,
    orderDetails: {
      orderNumber: string;
      items: Array<{ name: string; quantity: number; price: number }>;
      total: number;
      deliveryAddress: string;
    }
  ): Promise<boolean> {
    const subject = `Order Confirmation - ${orderDetails.orderNumber}`;
    const htmlContent = `
      <h1>Order Confirmed!</h1>
      <p>Your order ${orderDetails.orderNumber} has been confirmed.</p>
      <h3>Order Details:</h3>
      <ul>
        ${orderDetails.items.map(item => 
          `<li>${item.name} - Qty: ${item.quantity} - ₹${item.price}</li>`
        ).join('')}
      </ul>
      <p><strong>Total: ₹${orderDetails.total}</strong></p>
      <p><strong>Delivery Address:</strong> ${orderDetails.deliveryAddress}</p>
      <p>We'll notify you once your order is shipped!</p>
    `;
    
    return this.sendEmail(to, subject, htmlContent, undefined, 'order_confirmation');
  }
}

// WhatsApp Integration (Twilio WhatsApp API, WhatsApp Business API)
export class WhatsAppService {
  private config: IntegrationConfig;

  constructor() {
    this.config = {
      service: 'whatsapp',
      apiKey: process.env.VITE_WHATSAPP_API_KEY || '',
      apiSecret: process.env.WHATSAPP_API_SECRET || '',
      baseUrl: 'https://api.twilio.com/2010-04-01',
      isActive: true,
      environment: process.env.NODE_ENV === 'production' ? 'production' : 'test',
      configuration: {
        fromNumber: process.env.WHATSAPP_FROM_NUMBER || 'whatsapp:+14155238886'
      }
    };
  }

  async sendWhatsAppMessage(to: string, message: string, templateName?: string): Promise<boolean> {
    try {
      const response = await fetch('/api/integrations/whatsapp/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: `whatsapp:+91${to.replace(/^\+91/, '')}`,
          message,
          templateName,
          from: this.config.configuration?.fromNumber
        })
      });

      const result = await response.json();
      return result.success === true;
    } catch (error) {
      console.error('WhatsApp message sending failed:', error);
      return false;
    }
  }

  async sendOrderUpdate(to: string, orderNumber: string, status: string): Promise<boolean> {
    const message = `🏥 *OneMedi Update*\n\nOrder: ${orderNumber}\nStatus: ${status}\n\nTrack your order: ${window.location.origin}/track/${orderNumber}`;
    return this.sendWhatsAppMessage(to, message, 'order_update');
  }

  async sendAppointmentReminder(to: string, doctorName: string, appointmentTime: string): Promise<boolean> {
    const message = `🩺 *Appointment Reminder*\n\nDoctor: ${doctorName}\nTime: ${appointmentTime}\n\nJoin consultation: ${window.location.origin}/consultation`;
    return this.sendWhatsAppMessage(to, message, 'appointment_reminder');
  }
}

// Analytics Integration (Google Analytics, Mixpanel, Amplitude)
export class AnalyticsService {
  private config: IntegrationConfig;

  constructor(provider: 'google' | 'mixpanel' | 'amplitude' = 'google') {
    this.config = {
      service: provider,
      apiKey: process.env[`VITE_${provider.toUpperCase()}_API_KEY`] || '',
      isActive: true,
      environment: process.env.NODE_ENV === 'production' ? 'production' : 'test'
    };
  }

  async trackEvent(eventName: string, properties: Record<string, any> = {}): Promise<void> {
    try {
      // Google Analytics 4
      if (this.config.service === 'google' && window.gtag) {
        window.gtag('event', eventName, {
          ...properties,
          custom_parameter: true
        });
      }

      // Also send to our backend for custom analytics
      await fetch('/api/analytics/track', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          event: eventName,
          properties,
          timestamp: new Date().toISOString(),
          provider: this.config.service
        })
      });
    } catch (error) {
      console.error('Analytics tracking failed:', error);
    }
  }

  async trackPageView(page: string, title?: string): Promise<void> {
    await this.trackEvent('page_view', {
      page_path: page,
      page_title: title || document.title
    });
  }

  async trackPurchase(orderId: string, value: number, currency: string = 'INR'): Promise<void> {
    await this.trackEvent('purchase', {
      transaction_id: orderId,
      value,
      currency
    });
  }

  async trackUserSignup(userId: string, method: string): Promise<void> {
    await this.trackEvent('sign_up', {
      user_id: userId,
      method
    });
  }
}

// Notification Service (Firebase Cloud Messaging, OneSignal)
export class NotificationService {
  private config: IntegrationConfig;

  constructor(provider: 'fcm' | 'onesignal' = 'fcm') {
    this.config = {
      service: provider,
      apiKey: process.env[`VITE_${provider.toUpperCase()}_API_KEY`] || '',
      isActive: true,
      environment: process.env.NODE_ENV === 'production' ? 'production' : 'test'
    };
  }

  async sendPushNotification(
    userId: string,
    title: string,
    body: string,
    data?: Record<string, any>
  ): Promise<boolean> {
    try {
      const response = await fetch('/api/integrations/push/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          provider: this.config.service,
          userId,
          title,
          body,
          data
        })
      });

      const result = await response.json();
      return result.success === true;
    } catch (error) {
      console.error('Push notification failed:', error);
      return false;
    }
  }
}

// Unified Communication Service
export class CommunicationService {
  private sms: SMSService;
  private email: EmailService;
  private whatsapp: WhatsAppService;
  private analytics: AnalyticsService;
  private notifications: NotificationService;

  constructor() {
    this.sms = new SMSService();
    this.email = new EmailService();
    this.whatsapp = new WhatsAppService();
    this.analytics = new AnalyticsService();
    this.notifications = new NotificationService();
  }

  async sendOrderConfirmation(
    customerInfo: {
      phone: string;
      email: string;
      name: string;
      userId: string;
    },
    orderDetails: {
      orderNumber: string;
      items: Array<{ name: string; quantity: number; price: number }>;
      total: number;
      deliveryAddress: string;
    }
  ): Promise<void> {
    try {
      // Send SMS
      await this.sms.sendOrderConfirmation(
        customerInfo.phone,
        orderDetails.orderNumber,
        orderDetails.total
      );

      // Send Email
      await this.email.sendOrderConfirmationEmail(customerInfo.email, orderDetails);

      // Send WhatsApp (optional)
      await this.whatsapp.sendOrderUpdate(
        customerInfo.phone,
        orderDetails.orderNumber,
        'Confirmed'
      );

      // Send Push Notification
      await this.notifications.sendPushNotification(
        customerInfo.userId,
        'Order Confirmed!',
        `Your order ${orderDetails.orderNumber} has been confirmed.`
      );

      // Track analytics
      await this.analytics.trackPurchase(
        orderDetails.orderNumber,
        orderDetails.total
      );
    } catch (error) {
      console.error('Failed to send order confirmation:', error);
    }
  }

  async sendPaymentConfirmation(
    customerInfo: { phone: string; email: string; userId: string },
    paymentDetails: { orderId: string; amount: number; paymentId: string }
  ): Promise<void> {
    try {
      // Send SMS
      await this.sms.sendPaymentConfirmation(
        customerInfo.phone,
        paymentDetails.orderId,
        paymentDetails.amount
      );

      // Send Push Notification
      await this.notifications.sendPushNotification(
        customerInfo.userId,
        'Payment Received!',
        `Payment of ₹${paymentDetails.amount} received for order ${paymentDetails.orderId}`
      );

      // Track analytics
      await this.analytics.trackEvent('payment_success', {
        order_id: paymentDetails.orderId,
        payment_id: paymentDetails.paymentId,
        amount: paymentDetails.amount
      });
    } catch (error) {
      console.error('Failed to send payment confirmation:', error);
    }
  }
}

// Export service instances
export const smsService = new SMSService();
export const emailService = new EmailService();
export const whatsappService = new WhatsAppService();
export const analyticsService = new AnalyticsService();
export const notificationService = new NotificationService();
export const communicationService = new CommunicationService();

// Initialize integrations
export const initializeIntegrations = () => {
  // Load Google Analytics
  if (process.env.VITE_GOOGLE_ANALYTICS_ID) {
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${process.env.VITE_GOOGLE_ANALYTICS_ID}`;
    document.head.appendChild(script);

    window.dataLayer = window.dataLayer || [];
    function gtag(...args: any[]) {
      window.dataLayer.push(args);
    }
    window.gtag = gtag;
    gtag('js', new Date());
    gtag('config', process.env.VITE_GOOGLE_ANALYTICS_ID);
  }

  console.log('Third-party integrations initialized');
};
