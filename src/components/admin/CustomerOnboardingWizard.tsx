
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { CheckCircle, ArrowRight, ArrowLeft, User, MapPin, Heart, CreditCard } from 'lucide-react';
import { toast } from 'sonner';

interface OnboardingData {
  personalInfo: {
    fullName: string;
    phone: string;
    email: string;
    dateOfBirth: string;
    gender: string;
  };
  addressInfo: {
    street: string;
    city: string;
    state: string;
    pincode: string;
    landmark: string;
  };
  healthInfo: {
    allergies: string[];
    chronicConditions: string[];
    emergencyContact: string;
    bloodGroup: string;
  };
  preferences: {
    notifications: boolean;
    marketingEmails: boolean;
    dataSharing: boolean;
    preferredLanguage: string;
  };
}

interface CustomerOnboardingWizardProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (data: OnboardingData) => void;
}

const CustomerOnboardingWizard: React.FC<CustomerOnboardingWizardProps> = ({
  isOpen,
  onClose,
  onComplete
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<OnboardingData>({
    personalInfo: {
      fullName: '',
      phone: '',
      email: '',
      dateOfBirth: '',
      gender: ''
    },
    addressInfo: {
      street: '',
      city: '',
      state: '',
      pincode: '',
      landmark: ''
    },
    healthInfo: {
      allergies: [],
      chronicConditions: [],
      emergencyContact: '',
      bloodGroup: ''
    },
    preferences: {
      notifications: true,
      marketingEmails: false,
      dataSharing: true,
      preferredLanguage: 'english'
    }
  });

  const steps = [
    {
      title: 'Personal Information',
      description: 'Basic details about the customer',
      icon: User,
      component: PersonalInfoStep
    },
    {
      title: 'Address Details',
      description: 'Where we can reach you',
      icon: MapPin,
      component: AddressInfoStep
    },
    {
      title: 'Health Information',
      description: 'Medical history and preferences',
      icon: Heart,
      component: HealthInfoStep
    },
    {
      title: 'Preferences',
      description: 'Communication and privacy settings',
      icon: CreditCard,
      component: PreferencesStep
    }
  ];

  const updateFormData = (section: keyof OnboardingData, data: any) => {
    setFormData(prev => ({
      ...prev,
      [section]: { ...prev[section], ...data }
    }));
  };

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    onComplete(formData);
    toast.success('Customer onboarding completed successfully!');
    onClose();
  };

  const progress = ((currentStep + 1) / steps.length) * 100;
  const CurrentStepComponent = steps[currentStep].component;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Customer Onboarding</DialogTitle>
          <DialogDescription>
            Help new customers get started with ONE MEDI
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Step {currentStep + 1} of {steps.length}</span>
              <span>{Math.round(progress)}% Complete</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          {/* Step Navigation */}
          <div className="flex items-center justify-between">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isActive = index === currentStep;
              const isCompleted = index < currentStep;
              
              return (
                <div key={index} className="flex items-center">
                  <div className={`
                    flex items-center justify-center w-10 h-10 rounded-full border-2
                    ${isActive ? 'border-primary bg-primary text-white' :
                      isCompleted ? 'border-green-500 bg-green-500 text-white' :
                      'border-muted bg-background'}
                  `}>
                    {isCompleted ? (
                      <CheckCircle className="w-5 h-5" />
                    ) : (
                      <Icon className="w-5 h-5" />
                    )}
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`w-16 h-0.5 mx-2 ${
                      isCompleted ? 'bg-green-500' : 'bg-muted'
                    }`} />
                  )}
                </div>
              );
            })}
          </div>

          {/* Current Step Content */}
          <Card>
            <CardHeader>
              <CardTitle>{steps[currentStep].title}</CardTitle>
              <CardDescription>{steps[currentStep].description}</CardDescription>
            </CardHeader>
            <CardContent>
              <CurrentStepComponent
                data={formData}
                updateData={updateFormData}
              />
            </CardContent>
          </Card>

          {/* Navigation Buttons */}
          <div className="flex justify-between">
            <Button
              variant="outline"
              onClick={prevStep}
              disabled={currentStep === 0}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Previous
            </Button>

            {currentStep === steps.length - 1 ? (
              <Button onClick={handleComplete}>
                Complete Onboarding
                <CheckCircle className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button onClick={nextStep}>
                Next
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// Step Components
function PersonalInfoStep({ data, updateData }: any) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="fullName">Full Name *</Label>
          <Input
            id="fullName"
            value={data.personalInfo.fullName}
            onChange={(e) => updateData('personalInfo', { fullName: e.target.value })}
            placeholder="Enter full name"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone">Phone Number *</Label>
          <Input
            id="phone"
            value={data.personalInfo.phone}
            onChange={(e) => updateData('personalInfo', { phone: e.target.value })}
            placeholder="Enter phone number"
          />
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="email">Email Address</Label>
        <Input
          id="email"
          type="email"
          value={data.personalInfo.email}
          onChange={(e) => updateData('personalInfo', { email: e.target.value })}
          placeholder="Enter email address"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="dateOfBirth">Date of Birth</Label>
          <Input
            id="dateOfBirth"
            type="date"
            value={data.personalInfo.dateOfBirth}
            onChange={(e) => updateData('personalInfo', { dateOfBirth: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="gender">Gender</Label>
          <Select
            value={data.personalInfo.gender}
            onValueChange={(value) => updateData('personalInfo', { gender: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select gender" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="male">Male</SelectItem>
              <SelectItem value="female">Female</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}

function AddressInfoStep({ data, updateData }: any) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="street">Street Address *</Label>
        <Input
          id="street"
          value={data.addressInfo.street}
          onChange={(e) => updateData('addressInfo', { street: e.target.value })}
          placeholder="Enter street address"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="city">City *</Label>
          <Input
            id="city"
            value={data.addressInfo.city}
            onChange={(e) => updateData('addressInfo', { city: e.target.value })}
            placeholder="Enter city"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="state">State *</Label>
          <Input
            id="state"
            value={data.addressInfo.state}
            onChange={(e) => updateData('addressInfo', { state: e.target.value })}
            placeholder="Enter state"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="pincode">PIN Code *</Label>
          <Input
            id="pincode"
            value={data.addressInfo.pincode}
            onChange={(e) => updateData('addressInfo', { pincode: e.target.value })}
            placeholder="Enter PIN code"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="landmark">Landmark</Label>
          <Input
            id="landmark"
            value={data.addressInfo.landmark}
            onChange={(e) => updateData('addressInfo', { landmark: e.target.value })}
            placeholder="Enter nearby landmark"
          />
        </div>
      </div>
    </div>
  );
}

function HealthInfoStep({ data, updateData }: any) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="bloodGroup">Blood Group</Label>
        <Select
          value={data.healthInfo.bloodGroup}
          onValueChange={(value) => updateData('healthInfo', { bloodGroup: value })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select blood group" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="A+">A+</SelectItem>
            <SelectItem value="A-">A-</SelectItem>
            <SelectItem value="B+">B+</SelectItem>
            <SelectItem value="B-">B-</SelectItem>
            <SelectItem value="AB+">AB+</SelectItem>
            <SelectItem value="AB-">AB-</SelectItem>
            <SelectItem value="O+">O+</SelectItem>
            <SelectItem value="O-">O-</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="emergencyContact">Emergency Contact</Label>
        <Input
          id="emergencyContact"
          value={data.healthInfo.emergencyContact}
          onChange={(e) => updateData('healthInfo', { emergencyContact: e.target.value })}
          placeholder="Enter emergency contact number"
        />
      </div>

      <div className="space-y-2">
        <Label>Known Allergies (Optional)</Label>
        <Input
          placeholder="Enter any known allergies, separated by commas"
          onChange={(e) => updateData('healthInfo', { 
            allergies: e.target.value.split(',').map(s => s.trim()).filter(s => s)
          })}
        />
      </div>

      <div className="space-y-2">
        <Label>Chronic Conditions (Optional)</Label>
        <Input
          placeholder="Enter any chronic conditions, separated by commas"
          onChange={(e) => updateData('healthInfo', { 
            chronicConditions: e.target.value.split(',').map(s => s.trim()).filter(s => s)
          })}
        />
      </div>
    </div>
  );
}

function PreferencesStep({ data, updateData }: any) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="language">Preferred Language</Label>
        <Select
          value={data.preferences.preferredLanguage}
          onValueChange={(value) => updateData('preferences', { preferredLanguage: value })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select language" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="english">English</SelectItem>
            <SelectItem value="telugu">Telugu</SelectItem>
            <SelectItem value="hindi">Hindi</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="notifications"
            checked={data.preferences.notifications}
            onCheckedChange={(checked) => updateData('preferences', { notifications: checked })}
          />
          <Label htmlFor="notifications" className="text-sm font-normal">
            Receive order updates and health reminders via SMS/WhatsApp
          </Label>
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="marketing"
            checked={data.preferences.marketingEmails}
            onCheckedChange={(checked) => updateData('preferences', { marketingEmails: checked })}
          />
          <Label htmlFor="marketing" className="text-sm font-normal">
            Receive promotional offers and health tips via email
          </Label>
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="dataSharing"
            checked={data.preferences.dataSharing}
            onCheckedChange={(checked) => updateData('preferences', { dataSharing: checked })}
          />
          <Label htmlFor="dataSharing" className="text-sm font-normal">
            Allow sharing anonymized data for improving healthcare services
          </Label>
        </div>
      </div>
    </div>
  );
}

export default CustomerOnboardingWizard;
