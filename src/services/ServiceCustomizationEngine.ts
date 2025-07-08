import { supabase } from '@/integrations/supabase/client';

// Types for service customization
export type ServiceType = 
  | 'medicine_delivery'
  | 'doctor_consultation'
  | 'scan_diagnostic'
  | 'blood_bank'
  | 'ambulance'
  | 'home_care'
  | 'physiotherapy'
  | 'diabetes_care'
  | 'diet_consultation';

export interface ZoneServiceConfig {
  id?: string;
  zoneId: string;
  serviceType: ServiceType;
  isEnabled: boolean;
  
  // Pricing Configuration
  deliveryFee: number;
  minOrderAmount: number;
  maxOrderAmount?: number;
  peakHourMultiplier: number;
  distanceBasedPricing: boolean;
  
  // Operational Configuration
  estimatedDeliveryTime: string;
  operatingHours: OperatingHours;
  capacityPerHour: number;
  staffRequired: number;
  equipmentRequired: string[];
  advanceBookingDays: number;
  
  // Service-specific settings
  emergencyAvailable: boolean;
  prescriptionRequired: boolean;
  ageRestrictions?: AgeRestrictions;
  specialRequirements: string[];
  
  // Custom configuration for service-specific needs
  customConfig: Record<string, any>;
}

export interface OperatingHours {
  [day: string]: {
    open: string;
    close: string;
    breaks?: TimeSlot[];
  };
}

export interface TimeSlot {
  start: string;
  end: string;
}

export interface AgeRestrictions {
  minAge: number;
  maxAge?: number;
}

export interface ServiceAvailability {
  available: boolean;
  reason?: string;
  config?: ZoneServiceConfig;
  estimatedDeliveryTime?: string;
  deliveryFee?: number;
  minOrderAmount?: number;
}

export interface PriceCalculation {
  originalPrice: number;
  finalPrice: number;
  breakdown: PriceBreakdown;
  savings: number;
}

export interface PriceBreakdown {
  basePrice: number;
  deliveryFee: number;
  adjustments: PriceAdjustment[];
}

export interface PriceAdjustment {
  type: string;
  amount: number;
  description: string;
}

export interface OrderDetails {
  orderValue: number;
  distance?: number;
  items: OrderItem[];
  customerType?: 'regular' | 'premium' | 'new';
}

export interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
  requiresPrescription?: boolean;
}

export interface CapacityStatus {
  available: boolean;
  reason?: string;
  availableSlots: number;
  totalCapacity: number;
  nextAvailableSlot?: Date;
}

// Healthcare service configurations
const HEALTHCARE_SERVICE_CONFIGS = {
  medicine_delivery: {
    label: 'Medicine Delivery',
    defaultConfig: {
      deliveryFee: 50,
      minOrderAmount: 200,
      estimatedDeliveryTime: '30-45 minutes',
      capacityPerHour: 20,
      staffRequired: 2,
      equipmentRequired: ['delivery_vehicle', 'cold_storage'],
      prescriptionRequired: true,
      emergencyAvailable: true,
      customConfig: {
        pharmacyLicense: 'required',
        coldChainSupport: true,
        maxDeliveryDistance: 25,
        prescriptionValidation: true
      }
    }
  },
  
  doctor_consultation: {
    label: 'Doctor Consultation',
    defaultConfig: {
      deliveryFee: 0,
      minOrderAmount: 500,
      estimatedDeliveryTime: '24 hours',
      capacityPerHour: 5,
      staffRequired: 1,
      equipmentRequired: ['consultation_room', 'medical_equipment'],
      prescriptionRequired: false,
      emergencyAvailable: true,
      customConfig: {
        specializations: ['General Medicine', 'Pediatrics', 'Cardiology'],
        homeVisitAvailable: true,
        telemedicineSupport: true,
        consultationDuration: 30
      }
    }
  },
  
  scan_diagnostic: {
    label: 'Scan & Diagnostic',
    defaultConfig: {
      deliveryFee: 100,
      minOrderAmount: 1000,
      estimatedDeliveryTime: '2-4 hours',
      capacityPerHour: 8,
      staffRequired: 2,
      equipmentRequired: ['mri_machine', 'ct_scanner', 'x_ray'],
      prescriptionRequired: false,
      emergencyAvailable: false,
      customConfig: {
        scanTypes: ['MRI', 'CT Scan', 'X-Ray', 'Ultrasound'],
        homeCollectionAvailable: true,
        reportDeliveryTime: '24 hours',
        fastingRequired: ['Ultrasound Abdomen']
      }
    }
  },
  
  ambulance: {
    label: 'Ambulance Service',
    defaultConfig: {
      deliveryFee: 0,
      minOrderAmount: 2000,
      estimatedDeliveryTime: '10-15 minutes',
      capacityPerHour: 3,
      staffRequired: 2,
      equipmentRequired: ['ambulance', 'medical_equipment', 'oxygen'],
      prescriptionRequired: false,
      emergencyAvailable: true,
      customConfig: {
        ambulanceTypes: ['Basic', 'Advanced', 'ICU'],
        responseTime: '15 minutes',
        hospitalNetwork: ['Kurnool Government Hospital', 'Apollo Clinic'],
        emergencyOnly: false
      }
    }
  },
  
  blood_bank: {
    label: 'Blood Bank',
    defaultConfig: {
      deliveryFee: 100,
      minOrderAmount: 0,
      estimatedDeliveryTime: '1-2 hours',
      capacityPerHour: 24,
      staffRequired: 1,
      equipmentRequired: ['blood_storage', 'transport_cooler'],
      prescriptionRequired: true,
      emergencyAvailable: true,
      customConfig: {
        bloodGroupsAvailable: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
        emergencyStock: true,
        donationCenterNearby: true,
        storageCapacity: 500
      }
    }
  }
};

// Service Customization Engine
export class ServiceCustomizationEngine {
  // Get service configuration for a zone
  async getZoneServiceConfig(
    zoneId: string, 
    serviceType: ServiceType
  ): Promise<ZoneServiceConfig | null> {
    try {
      const { data, error } = await supabase
        .from('zone_service_configs')
        .select('*')
        .eq('zone_id', zoneId)
        .eq('service_type', serviceType)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      
      if (!data) return null;

      return {
        id: data.id,
        zoneId: data.zone_id,
        serviceType: data.service_type,
        isEnabled: data.is_enabled,
        deliveryFee: data.delivery_fee || 0,
        minOrderAmount: data.min_order_amount || 0,
        maxOrderAmount: data.max_order_amount,
        peakHourMultiplier: data.peak_hour_multiplier || 1.0,
        distanceBasedPricing: data.distance_based_pricing || false,
        estimatedDeliveryTime: data.estimated_delivery_time || '30-45 minutes',
        operatingHours: data.operating_hours || {},
        capacityPerHour: data.capacity_per_hour || 10,
        staffRequired: data.staff_required || 1,
        equipmentRequired: data.equipment_required || [],
        advanceBookingDays: data.advance_booking_days || 7,
        emergencyAvailable: data.emergency_available || false,
        prescriptionRequired: data.prescription_required || false,
        ageRestrictions: data.age_restrictions,
        specialRequirements: data.special_requirements || [],
        customConfig: data.custom_config || {}
      };
    } catch (error) {
      console.error('Error fetching zone service config:', error);
      return null;
    }
  }

  // Save or update zone service configuration
  async saveZoneServiceConfig(config: ZoneServiceConfig): Promise<ZoneServiceConfig> {
    try {
      const configData = {
        zone_id: config.zoneId,
        service_type: config.serviceType,
        is_enabled: config.isEnabled,
        delivery_fee: config.deliveryFee,
        min_order_amount: config.minOrderAmount,
        max_order_amount: config.maxOrderAmount,
        peak_hour_multiplier: config.peakHourMultiplier,
        distance_based_pricing: config.distanceBasedPricing,
        estimated_delivery_time: config.estimatedDeliveryTime,
        operating_hours: config.operatingHours,
        capacity_per_hour: config.capacityPerHour,
        staff_required: config.staffRequired,
        equipment_required: config.equipmentRequired,
        advance_booking_days: config.advanceBookingDays,
        emergency_available: config.emergencyAvailable,
        prescription_required: config.prescriptionRequired,
        age_restrictions: config.ageRestrictions,
        special_requirements: config.specialRequirements,
        custom_config: config.customConfig
      };

      if (config.id) {
        // Update existing configuration
        const { data, error } = await supabase
          .from('zone_service_configs')
          .update(configData)
          .eq('id', config.id)
          .select()
          .single();

        if (error) throw error;
        return { ...config, id: data.id };
      } else {
        // Create new configuration
        const { data, error } = await supabase
          .from('zone_service_configs')
          .insert(configData)
          .select()
          .single();

        if (error) throw error;
        return { ...config, id: data.id };
      }
    } catch (error) {
      console.error('Error saving zone service config:', error);
      throw error;
    }
  }

  // Get service availability for a pincode
  async getServiceAvailability(
    pincode: string,
    serviceType: ServiceType
  ): Promise<ServiceAvailability> {
    try {
      // First, find the zone for this pincode
      const { data: pincodeData, error: pincodeError } = await supabase
        .from('enhanced_pincode_zones')
        .select('zone_id')
        .eq('pincode', pincode)
        .eq('verified', true)
        .single();

      if (pincodeError || !pincodeData) {
        return { 
          available: false, 
          reason: 'Pincode not serviceable' 
        };
      }

      // Get zone service configuration
      const config = await this.getZoneServiceConfig(pincodeData.zone_id, serviceType);
      
      if (!config || !config.isEnabled) {
        return { 
          available: false, 
          reason: 'Service not available in this zone' 
        };
      }

      // Check operational hours
      const isOperational = this.isServiceOperational(config);
      if (!isOperational) {
        return { 
          available: false, 
          reason: 'Service not operational at this time' 
        };
      }

      return {
        available: true,
        config,
        estimatedDeliveryTime: config.estimatedDeliveryTime,
        deliveryFee: config.deliveryFee,
        minOrderAmount: config.minOrderAmount
      };
    } catch (error) {
      console.error('Error checking service availability:', error);
      return { 
        available: false, 
        reason: 'Error checking availability' 
      };
    }
  }

  // Check if service is operational at current time
  private isServiceOperational(config: ZoneServiceConfig): boolean {
    const now = new Date();
    const currentDay = now.toLocaleLowerCase().substring(0, 3); // mon, tue, etc.
    const currentTime = now.toTimeString().substring(0, 5); // HH:MM

    const daySchedule = config.operatingHours[currentDay];
    if (!daySchedule) return false;

    // Check if current time is within operating hours
    if (currentTime < daySchedule.open || currentTime > daySchedule.close) {
      return false;
    }

    // Check if current time is during a break
    if (daySchedule.breaks) {
      for (const breakTime of daySchedule.breaks) {
        if (currentTime >= breakTime.start && currentTime <= breakTime.end) {
          return false;
        }
      }
    }

    return true;
  }

  // Calculate dynamic pricing
  async calculateDynamicPrice(
    zoneId: string,
    serviceType: ServiceType,
    orderDetails: OrderDetails
  ): Promise<PriceCalculation> {
    const config = await this.getZoneServiceConfig(zoneId, serviceType);
    if (!config) {
      throw new Error('Zone service configuration not found');
    }

    let finalPrice = orderDetails.orderValue;
    const breakdown: PriceBreakdown = {
      basePrice: orderDetails.orderValue,
      deliveryFee: config.deliveryFee,
      adjustments: []
    };

    // Add delivery fee
    finalPrice += config.deliveryFee;

    // Peak hour pricing
    const currentHour = new Date().getHours();
    const isPeakHour = (currentHour >= 18 && currentHour <= 21) || (currentHour >= 8 && currentHour <= 10);
    
    if (isPeakHour && config.peakHourMultiplier > 1) {
      const peakAdjustment = orderDetails.orderValue * (config.peakHourMultiplier - 1);
      finalPrice += peakAdjustment;
      breakdown.adjustments.push({
        type: 'peak_hour',
        amount: peakAdjustment,
        description: `Peak hour surcharge (${((config.peakHourMultiplier - 1) * 100).toFixed(0)}%)`
      });
    }

    // Distance-based pricing
    if (config.distanceBasedPricing && orderDetails.distance) {
      const distanceCharge = Math.max(0, (orderDetails.distance - 5) * 10); // ₹10 per km after 5km
      finalPrice += distanceCharge;
      breakdown.adjustments.push({
        type: 'distance',
        amount: distanceCharge,
        description: `Distance charge for ${orderDetails.distance}km`
      });
    }

    // Customer type discounts
    if (orderDetails.customerType === 'premium') {
      const premiumDiscount = orderDetails.orderValue * 0.1; // 10% discount
      finalPrice -= premiumDiscount;
      breakdown.adjustments.push({
        type: 'premium_discount',
        amount: -premiumDiscount,
        description: 'Premium customer discount (10%)'
      });
    }

    return {
      originalPrice: orderDetails.orderValue + config.deliveryFee,
      finalPrice,
      breakdown,
      savings: Math.max(0, (orderDetails.orderValue + config.deliveryFee) - finalPrice)
    };
  }

  // Check service capacity
  async checkServiceCapacity(
    zoneId: string,
    serviceType: ServiceType,
    requestedDateTime: Date
  ): Promise<CapacityStatus> {
    const config = await this.getZoneServiceConfig(zoneId, serviceType);
    if (!config) {
      return { 
        available: false, 
        reason: 'Zone configuration not found',
        availableSlots: 0,
        totalCapacity: 0
      };
    }

    // Get existing bookings for the requested time slot
    const startOfHour = new Date(requestedDateTime);
    startOfHour.setMinutes(0, 0, 0);
    const endOfHour = new Date(startOfHour);
    endOfHour.setHours(endOfHour.getHours() + 1);

    // This would typically query a bookings table
    // For now, we'll simulate with random data
    const existingBookings = Math.floor(Math.random() * config.capacityPerHour);
    const availableSlots = config.capacityPerHour - existingBookings;
    
    return {
      available: availableSlots > 0,
      availableSlots,
      totalCapacity: config.capacityPerHour,
      nextAvailableSlot: availableSlots > 0 ? requestedDateTime : this.getNextAvailableSlot(config, requestedDateTime)
    };
  }

  // Get next available time slot
  private getNextAvailableSlot(config: ZoneServiceConfig, fromDateTime: Date): Date {
    const nextSlot = new Date(fromDateTime);
    nextSlot.setHours(nextSlot.getHours() + 1);
    return nextSlot;
  }

  // Get default configuration for a service type
  getDefaultServiceConfig(serviceType: ServiceType): Partial<ZoneServiceConfig> {
    const serviceConfig = HEALTHCARE_SERVICE_CONFIGS[serviceType];
    if (!serviceConfig) {
      throw new Error(`Unknown service type: ${serviceType}`);
    }

    return {
      serviceType,
      isEnabled: true,
      peakHourMultiplier: 1.2,
      distanceBasedPricing: true,
      operatingHours: {
        monday: { open: '08:00', close: '22:00' },
        tuesday: { open: '08:00', close: '22:00' },
        wednesday: { open: '08:00', close: '22:00' },
        thursday: { open: '08:00', close: '22:00' },
        friday: { open: '08:00', close: '22:00' },
        saturday: { open: '08:00', close: '20:00' },
        sunday: { open: '10:00', close: '18:00' }
      },
      ageRestrictions: undefined,
      specialRequirements: [],
      ...serviceConfig.defaultConfig
    };
  }

  // Bulk configure services for a zone
  async bulkConfigureZoneServices(
    zoneId: string,
    serviceTypes: ServiceType[]
  ): Promise<ZoneServiceConfig[]> {
    const configs: ZoneServiceConfig[] = [];

    for (const serviceType of serviceTypes) {
      const defaultConfig = this.getDefaultServiceConfig(serviceType);
      const config: ZoneServiceConfig = {
        zoneId,
        ...defaultConfig
      } as ZoneServiceConfig;

      try {
        const savedConfig = await this.saveZoneServiceConfig(config);
        configs.push(savedConfig);
      } catch (error) {
        console.error(`Error configuring ${serviceType} for zone ${zoneId}:`, error);
      }
    }

    return configs;
  }

  // Get all service configurations for a zone
  async getZoneServiceConfigs(zoneId: string): Promise<ZoneServiceConfig[]> {
    try {
      const { data, error } = await supabase
        .from('zone_service_configs')
        .select('*')
        .eq('zone_id', zoneId);

      if (error) throw error;

      return data.map(item => ({
        id: item.id,
        zoneId: item.zone_id,
        serviceType: item.service_type,
        isEnabled: item.is_enabled,
        deliveryFee: item.delivery_fee || 0,
        minOrderAmount: item.min_order_amount || 0,
        maxOrderAmount: item.max_order_amount,
        peakHourMultiplier: item.peak_hour_multiplier || 1.0,
        distanceBasedPricing: item.distance_based_pricing || false,
        estimatedDeliveryTime: item.estimated_delivery_time || '30-45 minutes',
        operatingHours: item.operating_hours || {},
        capacityPerHour: item.capacity_per_hour || 10,
        staffRequired: item.staff_required || 1,
        equipmentRequired: item.equipment_required || [],
        advanceBookingDays: item.advance_booking_days || 7,
        emergencyAvailable: item.emergency_available || false,
        prescriptionRequired: item.prescription_required || false,
        ageRestrictions: item.age_restrictions,
        specialRequirements: item.special_requirements || [],
        customConfig: item.custom_config || {}
      }));
    } catch (error) {
      console.error('Error fetching zone service configs:', error);
      return [];
    }
  }

  // Delete zone service configuration
  async deleteZoneServiceConfig(configId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('zone_service_configs')
        .delete()
        .eq('id', configId);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting zone service config:', error);
      throw error;
    }
  }

  // Toggle service availability for a zone
  async toggleServiceAvailability(
    zoneId: string,
    serviceType: ServiceType,
    isEnabled: boolean
  ): Promise<void> {
    try {
      const { error } = await supabase
        .from('zone_service_configs')
        .update({ is_enabled: isEnabled })
        .eq('zone_id', zoneId)
        .eq('service_type', serviceType);

      if (error) throw error;
    } catch (error) {
      console.error('Error toggling service availability:', error);
      throw error;
    }
  }
}
