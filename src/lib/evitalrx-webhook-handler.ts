// eVitalRx Webhook Handler for OneMedi Healthcare Platform
// Handles real-time updates from eVitalRx for stock, orders, and product changes

import { supabase } from '@/integrations/supabase/client';

export interface WebhookEvent {
  id: string;
  event_type: string;
  timestamp: string;
  data: any;
  signature?: string;
}

export interface StockUpdateEvent {
  product_id: string;
  quantity: number;
  batch_number?: string;
  expiry_date?: string;
  is_available: boolean;
  updated_at: string;
}

export interface OrderStatusEvent {
  order_id: string;
  status: string;
  updated_at: string;
  notes?: string;
}

export interface ProductUpdateEvent {
  product_id: string;
  name?: string;
  mrp?: number;
  selling_price?: number;
  is_available?: boolean;
  updated_at: string;
}

export interface PriceUpdateEvent {
  product_id: string;
  old_mrp: number;
  new_mrp: number;
  old_selling_price: number;
  new_selling_price: number;
  effective_date: string;
}

export class eVitalRxWebhookHandler {
  private supabase: any;

  constructor(supabaseClient: any) {
    this.supabase = supabaseClient;
  }

  async handleWebhook(event: WebhookEvent): Promise<{ success: boolean; message?: string }> {
    try {
      // Log the webhook event
      await this.logWebhookEvent(event);

      // Process based on event type
      switch (event.event_type) {
        case 'stock.updated':
          return await this.handleStockUpdate(event.data as StockUpdateEvent);
        
        case 'order.status_changed':
          return await this.handleOrderStatusChange(event.data as OrderStatusEvent);
        
        case 'product.updated':
          return await this.handleProductUpdate(event.data as ProductUpdateEvent);
        
        case 'price.updated':
          return await this.handlePriceUpdate(event.data as PriceUpdateEvent);
        
        case 'product.discontinued':
          return await this.handleProductDiscontinued(event.data);
        
        case 'batch.expired':
          return await this.handleBatchExpired(event.data);
        
        default:
          console.warn(`Unhandled webhook event type: ${event.event_type}`);
          return { success: true, message: `Event type ${event.event_type} not handled` };
      }
    } catch (error: any) {
      console.error('Webhook processing error:', error);
      
      // Update webhook event with error
      await this.supabase
        .from('evitalrx_webhook_events')
        .update({
          processing_error: error.message,
          processed_at: new Date().toISOString()
        })
        .eq('id', event.id);

      return { success: false, message: error.message };
    }
  }

  private async logWebhookEvent(event: WebhookEvent): Promise<void> {
    await this.supabase
      .from('evitalrx_webhook_events')
      .insert([{
        event_type: event.event_type,
        event_data: event.data,
        processed: false,
        received_at: new Date().toISOString()
      }]);
  }

  private async handleStockUpdate(data: StockUpdateEvent): Promise<{ success: boolean; message?: string }> {
    try {
      // Update medicine stock in database
      const { data: medicine, error } = await this.supabase
        .from('medicines')
        .update({
          stock_quantity: data.quantity,
          batch_number: data.batch_number,
          expiry_date: data.expiry_date,
          is_available: data.is_available,
          last_synced_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('evitalrx_id', data.product_id)
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to update stock: ${error.message}`);
      }

      if (!medicine) {
        throw new Error(`Medicine with eVitalRx ID ${data.product_id} not found`);
      }

      // Create stock alerts if necessary
      await this.checkAndCreateStockAlerts(medicine);

      // Update batch information if provided
      if (data.batch_number && data.expiry_date) {
        await this.updateBatchInformation(medicine.id, data);
      }

      return { 
        success: true, 
        message: `Stock updated for product ${data.product_id}: ${data.quantity} units` 
      };
    } catch (error: any) {
      throw new Error(`Stock update failed: ${error.message}`);
    }
  }

  private async handleOrderStatusChange(data: OrderStatusEvent): Promise<{ success: boolean; message?: string }> {
    try {
      // Update order status in database
      const { data: order, error } = await this.supabase
        .from('orders')
        .update({
          evitalrx_status: data.status,
          updated_at: new Date().toISOString()
        })
        .eq('evitalrx_order_id', data.order_id)
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to update order status: ${error.message}`);
      }

      if (!order) {
        throw new Error(`Order with eVitalRx ID ${data.order_id} not found`);
      }

      // Map eVitalRx status to OneMedi status
      const statusMapping: Record<string, string> = {
        'confirmed': 'confirmed',
        'processing': 'processing',
        'packed': 'processing',
        'shipped': 'shipped',
        'delivered': 'delivered',
        'cancelled': 'cancelled',
        'returned': 'cancelled'
      };

      const oneMediStatus = statusMapping[data.status] || data.status;

      // Update OneMedi order status if different
      if (order.order_status !== oneMediStatus) {
        await this.supabase
          .from('orders')
          .update({
            order_status: oneMediStatus,
            updated_at: new Date().toISOString()
          })
          .eq('id', order.id);
      }

      // Send notifications based on status change
      await this.sendOrderStatusNotification(order, data.status);

      return { 
        success: true, 
        message: `Order status updated for ${data.order_id}: ${data.status}` 
      };
    } catch (error: any) {
      throw new Error(`Order status update failed: ${error.message}`);
    }
  }

  private async handleProductUpdate(data: ProductUpdateEvent): Promise<{ success: boolean; message?: string }> {
    try {
      const updateData: any = {
        last_synced_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      if (data.name) updateData.name_en = data.name;
      if (data.mrp !== undefined) updateData.mrp = data.mrp;
      if (data.selling_price !== undefined) updateData.selling_price = data.selling_price;
      if (data.is_available !== undefined) updateData.is_available = data.is_available;

      const { data: medicine, error } = await this.supabase
        .from('medicines')
        .update(updateData)
        .eq('evitalrx_id', data.product_id)
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to update product: ${error.message}`);
      }

      if (!medicine) {
        throw new Error(`Medicine with eVitalRx ID ${data.product_id} not found`);
      }

      return { 
        success: true, 
        message: `Product updated for ${data.product_id}` 
      };
    } catch (error: any) {
      throw new Error(`Product update failed: ${error.message}`);
    }
  }

  private async handlePriceUpdate(data: PriceUpdateEvent): Promise<{ success: boolean; message?: string }> {
    try {
      // Update product prices
      const { data: medicine, error } = await this.supabase
        .from('medicines')
        .update({
          mrp: data.new_mrp,
          selling_price: data.new_selling_price,
          discount_percent: data.new_mrp > 0 ? ((data.new_mrp - data.new_selling_price) / data.new_mrp) * 100 : 0,
          last_synced_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('evitalrx_id', data.product_id)
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to update price: ${error.message}`);
      }

      if (!medicine) {
        throw new Error(`Medicine with eVitalRx ID ${data.product_id} not found`);
      }

      // Log price change for audit
      await this.logPriceChange(medicine.id, data);

      return { 
        success: true, 
        message: `Price updated for ${data.product_id}: ₹${data.old_selling_price} → ₹${data.new_selling_price}` 
      };
    } catch (error: any) {
      throw new Error(`Price update failed: ${error.message}`);
    }
  }

  private async handleProductDiscontinued(data: any): Promise<{ success: boolean; message?: string }> {
    try {
      const { data: medicine, error } = await this.supabase
        .from('medicines')
        .update({
          is_available: false,
          is_active: false,
          stock_quantity: 0,
          last_synced_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('evitalrx_id', data.product_id)
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to discontinue product: ${error.message}`);
      }

      if (!medicine) {
        throw new Error(`Medicine with eVitalRx ID ${data.product_id} not found`);
      }

      // Create alert for discontinued product
      await this.supabase
        .from('evitalrx_stock_alerts')
        .insert([{
          medicine_id: medicine.id,
          evitalrx_product_id: data.product_id,
          alert_type: 'discontinued',
          current_stock: 0,
          created_at: new Date().toISOString()
        }]);

      return { 
        success: true, 
        message: `Product discontinued: ${data.product_id}` 
      };
    } catch (error: any) {
      throw new Error(`Product discontinuation failed: ${error.message}`);
    }
  }

  private async handleBatchExpired(data: any): Promise<{ success: boolean; message?: string }> {
    try {
      // Update batch as expired
      await this.supabase
        .from('evitalrx_product_batches')
        .update({
          is_available: false,
          updated_at: new Date().toISOString()
        })
        .eq('evitalrx_product_id', data.product_id)
        .eq('batch_number', data.batch_number);

      // Get medicine info
      const { data: medicine } = await this.supabase
        .from('medicines')
        .select('id')
        .eq('evitalrx_id', data.product_id)
        .single();

      if (medicine) {
        // Create expiry alert
        await this.supabase
          .from('evitalrx_stock_alerts')
          .insert([{
            medicine_id: medicine.id,
            evitalrx_product_id: data.product_id,
            alert_type: 'batch_expired',
            expiry_date: data.expiry_date,
            created_at: new Date().toISOString()
          }]);
      }

      return { 
        success: true, 
        message: `Batch expired: ${data.product_id} - ${data.batch_number}` 
      };
    } catch (error: any) {
      throw new Error(`Batch expiry handling failed: ${error.message}`);
    }
  }

  private async checkAndCreateStockAlerts(medicine: any): Promise<void> {
    // Check for low stock
    if (medicine.stock_quantity <= medicine.min_stock_level && medicine.stock_quantity > 0) {
      await this.supabase
        .from('evitalrx_stock_alerts')
        .insert([{
          medicine_id: medicine.id,
          evitalrx_product_id: medicine.evitalrx_id,
          alert_type: 'low_stock',
          current_stock: medicine.stock_quantity,
          threshold_stock: medicine.min_stock_level,
          created_at: new Date().toISOString()
        }]);
    }

    // Check for out of stock
    if (medicine.stock_quantity === 0) {
      await this.supabase
        .from('evitalrx_stock_alerts')
        .insert([{
          medicine_id: medicine.id,
          evitalrx_product_id: medicine.evitalrx_id,
          alert_type: 'out_of_stock',
          current_stock: 0,
          threshold_stock: medicine.min_stock_level,
          created_at: new Date().toISOString()
        }]);
    }
  }

  private async updateBatchInformation(medicineId: string, data: StockUpdateEvent): Promise<void> {
    await this.supabase
      .from('evitalrx_product_batches')
      .upsert({
        medicine_id: medicineId,
        evitalrx_product_id: data.product_id,
        batch_number: data.batch_number,
        expiry_date: data.expiry_date,
        quantity: data.quantity,
        is_available: data.is_available,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'evitalrx_product_id,batch_number'
      });
  }

  private async sendOrderStatusNotification(order: any, status: string): Promise<void> {
    // Implementation for sending notifications
    // This would integrate with your communication service
    console.log(`Sending notification for order ${order.order_number}: ${status}`);
  }

  private async logPriceChange(medicineId: string, data: PriceUpdateEvent): Promise<void> {
    // Log price changes for audit trail
    await this.supabase
      .from('price_change_logs')
      .insert([{
        medicine_id: medicineId,
        old_mrp: data.old_mrp,
        new_mrp: data.new_mrp,
        old_selling_price: data.old_selling_price,
        new_selling_price: data.new_selling_price,
        effective_date: data.effective_date,
        source: 'evitalrx_webhook',
        created_at: new Date().toISOString()
      }]);
  }

  async markEventProcessed(eventId: string): Promise<void> {
    await this.supabase
      .from('evitalrx_webhook_events')
      .update({
        processed: true,
        processed_at: new Date().toISOString()
      })
      .eq('id', eventId);
  }
}

// Webhook signature verification
export function verifyWebhookSignature(
  payload: string,
  signature: string,
  secret: string
): boolean {
  // Implementation depends on eVitalRx's signature method
  // This is a placeholder - implement based on eVitalRx documentation
  return true;
}

// Export default handler instance
export const createWebhookHandler = (supabaseClient: any) => 
  new eVitalRxWebhookHandler(supabaseClient);
