
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChevronLeft, ChevronRight, User, Heart, Phone } from 'lucide-react';

interface CustomerOnboardingWizardProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (data: any) => void;
}

const CustomerOnboardingWizard: React.FC<CustomerOnboardingWizardProps> = ({
  isOpen,
  onClose,
  onComplete
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    gender: '',
    address: '',
    emergencyContact: '',
    medicalConditions: '',
    allergies: '',
    preferredLanguage: 'en'
  });

  const steps = [
    {
      title: 'Personal Information',
      description: 'Basic patient details',
      icon: User,
      fields: ['fullName', 'email', 'phone', 'dateOfBirth', 'gender']
    },
    {
      title: 'Contact & Address',
      description: 'Location and emergency contact',
      icon: Phone,
      fields: ['address', 'emergencyContact', 'preferredLanguage']
    },
    {
      title: 'Medical Information',
      description: 'Health history and conditions',
      icon: Heart,
      fields: ['medicalConditions', 'allergies']
    }
  ];

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleComplete = () => {
    onComplete(formData);
    onClose();
    // Reset form
    setCurrentStep(0);
    setFormData({
      fullName: '',
      email: '',
      phone: '',
      dateOfBirth: '',
      gender: '',
      address: '',
      emergencyContact: '',
      medicalConditions: '',
      allergies: '',
      preferredLanguage: 'en'
    });
  };

  const isStepValid = (stepIndex: number) => {
    const step = steps[stepIndex];
    return step.fields.every(field => {
      if (field === 'medicalConditions' || field === 'allergies') return true; // Optional fields
      return formData[field as keyof typeof formData].trim() !== '';
    });
  };

  const renderStepContent = () => {
    const currentStepData = steps[currentStep];
    const StepIcon = currentStepData.icon;

    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <StepIcon className="h-5 w-5" />
            {currentStepData.title}
          </CardTitle>
          <CardDescription>{currentStepData.description}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {currentStep === 0 && (
            <>
              <div>
                <Label htmlFor="fullName">Full Name *</Label>
                <Input
                  id="fullName"
                  value={formData.fullName}
                  onChange={(e) => handleInputChange('fullName', e.target.value)}
                  placeholder="Enter patient's full name"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="patient@example.com"
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Phone *</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    placeholder="+91 9876543210"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="dateOfBirth">Date of Birth *</Label>
                  <Input
                    id="dateOfBirth"
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="gender">Gender *</Label>
                  <Select value={formData.gender} onValueChange={(value) => handleInputChange('gender', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                      <SelectItem value="prefer_not_to_say">Prefer not to say</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </>
          )}

          {currentStep === 1 && (
            <>
              <div>
                <Label htmlFor="address">Address *</Label>
                <Textarea
                  id="address"
                  value={formData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  placeholder="Enter complete address"
                  rows={3}
                />
              </div>
              <div>
                <Label htmlFor="emergencyContact">Emergency Contact *</Label>
                <Input
                  id="emergencyContact"
                  value={formData.emergencyContact}
                  onChange={(e) => handleInputChange('emergencyContact', e.target.value)}
                  placeholder="Emergency contact number"
                />
              </div>
              <div>
                <Label htmlFor="preferredLanguage">Preferred Language *</Label>
                <Select value={formData.preferredLanguage} onValueChange={(value) => handleInputChange('preferredLanguage', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select language" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="te">Telugu</SelectItem>
                    <SelectItem value="hi">Hindi</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </>
          )}

          {currentStep === 2 && (
            <>
              <div>
                <Label htmlFor="medicalConditions">Medical Conditions</Label>
                <Textarea
                  id="medicalConditions"
                  value={formData.medicalConditions}
                  onChange={(e) => handleInputChange('medicalConditions', e.target.value)}
                  placeholder="List any existing medical conditions (optional)"
                  rows={3}
                />
              </div>
              <div>
                <Label htmlFor="allergies">Allergies</Label>
                <Textarea
                  id="allergies"
                  value={formData.allergies}
                  onChange={(e) => handleInputChange('allergies', e.target.value)}
                  placeholder="List any known allergies (optional)"
                  rows={3}
                />
              </div>
            </>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Patient Registration Wizard</DialogTitle>
          <DialogDescription>
            Step {currentStep + 1} of {steps.length}: Complete patient information
          </DialogDescription>
        </DialogHeader>

        {/* Progress Indicator */}
        <div className="flex items-center justify-center space-x-2 mb-6">
          {steps.map((step, index) => {
            const StepIcon = step.icon;
            return (
              <div key={index} className="flex items-center">
                <div
                  className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${
                    index === currentStep
                      ? 'bg-primary border-primary text-primary-foreground'
                      : index < currentStep
                      ? 'bg-green-500 border-green-500 text-white'
                      : 'bg-muted border-muted-foreground/50 text-muted-foreground'
                  }`}
                >
                  <StepIcon className="h-4 w-4" />
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`w-8 h-1 mx-2 ${
                      index < currentStep ? 'bg-green-500' : 'bg-muted'
                    }`}
                  />
                )}
              </div>
            );
          })}
        </div>

        {/* Step Content */}
        {renderStepContent()}

        {/* Navigation Buttons */}
        <div className="flex justify-between mt-6">
          <Button
            variant="outline"
            onClick={handlePrev}
            disabled={currentStep === 0}
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Previous
          </Button>

          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            
            {currentStep === steps.length - 1 ? (
              <Button onClick={handleComplete} disabled={!isStepValid(currentStep)}>
                Complete Registration
              </Button>
            ) : (
              <Button onClick={handleNext} disabled={!isStepValid(currentStep)}>
                Next
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CustomerOnboardingWizard;
