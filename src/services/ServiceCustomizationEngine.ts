
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

// Mock data for demonstration
const mockPincodeZones = [
  { pincode: '518001', zone_id: 'zone-1', verified: true },
  { pincode: '518002', zone_id: 'zone-2', verified: true },
  { pincode: '518003', zone_id: 'zone-1', verified: true },
];

// Service Customization Engine
export class ServiceCustomizationEngine {
  // Get service configuration for a zone (mock implementation)
  async getZoneServiceConfig(
    zoneId: string, 
    serviceType: ServiceType
  ): Promise<ZoneServiceConfig | null> {
    try {
      // Mock implementation - return null for now since table doesn't exist
      console.log(`Mock: Getting config for zone ${zoneId}, service ${serviceType}`);
      return null;
    } catch (error) {
      console.error('Error fetching zone service config:', error);
      return null;
    }
  }

  // Save or update zone service configuration (mock implementation)
  async saveZoneServiceConfig(config: ZoneServiceConfig): Promise<ZoneServiceConfig> {
    try {
      // Mock implementation - just return the config with an ID
      console.log('Mock: Saving zone service config', config);
      return { ...config, id: crypto.randomUUID() };
    } catch (error) {
      console.error('Error saving zone service config:', error);
      throw error;
    }
  }

  // Get service availability for a pincode (mock implementation)
  async getServiceAvailability(
    pincode: string,
    serviceType: ServiceType
  ): Promise<ServiceAvailability> {
    try {
      // Mock implementation using mock data
      console.log(`Mock: Checking availability for pincode ${pincode}, service ${serviceType}`);
      
      const pincodeData = mockPincodeZones.find(p => p.pincode === pincode && p.verified);
      
      if (!pincodeData) {
        return { 
          available: false, 
          reason: 'Pincode not serviceable' 
        };
      }

      // Mock service configuration
      const mockConfig = this.getDefaultServiceConfig(serviceType);
      
      return {
        available: true,
        estimatedDeliveryTime: mockConfig.estimatedDeliveryTime,
        deliveryFee: mockConfig.deliveryFee,
        minOrderAmount: mockConfig.minOrderAmount
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
    const currentDay = now.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase().substring(0, 3); // mon, tue, etc.
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

  // Calculate dynamic pricing (mock implementation)
  async calculateDynamicPrice(
    zoneId: string,
    serviceType: ServiceType,
    orderDetails: OrderDetails
  ): Promise<PriceCalculation> {
    console.log(`Mock: Calculating price for zone ${zoneId}, service ${serviceType}`);
    
    const mockConfig = this.getDefaultServiceConfig(serviceType);
    
    let finalPrice = orderDetails.orderValue;
    const breakdown: PriceBreakdown = {
      basePrice: orderDetails.orderValue,
      deliveryFee: mockConfig.deliveryFee,
      adjustments: []
    };

    // Add delivery fee
    finalPrice += mockConfig.deliveryFee;

    // Peak hour pricing (mock calculation)
    const currentHour = new Date().getHours();
    const isPeakHour = (currentHour >= 18 && currentHour <= 21) || (currentHour >= 8 && currentHour <= 10);
    
    if (isPeakHour) {
      const peakAdjustment = orderDetails.orderValue * 0.2; // 20% surcharge
      finalPrice += peakAdjustment;
      breakdown.adjustments.push({
        type: 'peak_hour',
        amount: peakAdjustment,
        description: 'Peak hour surcharge (20%)'
      });
    }

    // Distance-based pricing (mock)
    if (orderDetails.distance && orderDetails.distance > 5) {
      const distanceCharge = (orderDetails.distance - 5) * 10; // ₹10 per km after 5km
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
      originalPrice: orderDetails.orderValue + mockConfig.deliveryFee,
      finalPrice,
      breakdown,
      savings: Math.max(0, (orderDetails.orderValue + mockConfig.deliveryFee) - finalPrice)
    };
  }

  // Check service capacity (mock implementation)
  async checkServiceCapacity(
    zoneId: string,
    serviceType: ServiceType,
    requestedDateTime: Date
  ): Promise<CapacityStatus> {
    console.log(`Mock: Checking capacity for zone ${zoneId}, service ${serviceType}`);
    
    const mockConfig = this.getDefaultServiceConfig(serviceType);
    
    // Mock capacity calculation
    const existingBookings = Math.floor(Math.random() * mockConfig.capacityPerHour);
    const availableSlots = mockConfig.capacityPerHour - existingBookings;
    
    return {
      available: availableSlots > 0,
      availableSlots,
      totalCapacity: mockConfig.capacityPerHour,
      nextAvailableSlot: availableSlots > 0 ? requestedDateTime : this.getNextAvailableSlot(mockConfig, requestedDateTime)
    };
  }

  // Get next available time slot
  private getNextAvailableSlot(config: Partial<ZoneServiceConfig>, fromDateTime: Date): Date {
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

  // Bulk configure services for a zone (mock implementation)
  async bulkConfigureZoneServices(
    zoneId: string,
    serviceTypes: ServiceType[]
  ): Promise<ZoneServiceConfig[]> {
    console.log(`Mock: Bulk configuring services for zone ${zoneId}`);
    
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

  // Get all service configurations for a zone (mock implementation)
  async getZoneServiceConfigs(zoneId: string): Promise<ZoneServiceConfig[]> {
    try {
      // Mock implementation - return empty array for now
      console.log(`Mock: Getting all configs for zone ${zoneId}`);
      return [];
    } catch (error) {
      console.error('Error fetching zone service configs:', error);
      return [];
    }
  }

  // Delete zone service configuration (mock implementation)
  async deleteZoneServiceConfig(configId: string): Promise<void> {
    try {
      console.log(`Mock: Deleting config ${configId}`);
    } catch (error) {
      console.error('Error deleting zone service config:', error);
      throw error;
    }
  }

  // Toggle service availability for a zone (mock implementation)
  async toggleServiceAvailability(
    zoneId: string,
    serviceType: ServiceType,
    isEnabled: boolean
  ): Promise<void> {
    try {
      console.log(`Mock: Toggling service ${serviceType} in zone ${zoneId} to ${isEnabled}`);
    } catch (error) {
      console.error('Error toggling service availability:', error);
      throw error;
    }
  }
}
