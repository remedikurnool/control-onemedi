
import React from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { X, Plus } from 'lucide-react';
import { useState } from 'react';

interface PatientFormData {
  name: string;
  age: number;
  gender: string;
  phone: string;
  email?: string;
  address: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  blood_group?: string;
  allergies: string[];
  medical_conditions: string[];
  current_medications: string[];
  insurance_provider?: string;
  insurance_number?: string;
  preferred_language: string;
  occupation?: string;
  marital_status?: string;
  height?: number;
  weight?: number;
  date_of_birth?: string;
}

interface EnhancedPatientFormProps {
  onSubmit: (data: PatientFormData) => void;
  initialData?: Partial<PatientFormData>;
  isLoading?: boolean;
}

const EnhancedPatientForm: React.FC<EnhancedPatientFormProps> = ({
  onSubmit,
  initialData,
  isLoading = false
}) => {
  const [allergies, setAllergies] = useState<string[]>(initialData?.allergies || []);
  const [medicalConditions, setMedicalConditions] = useState<string[]>(initialData?.medical_conditions || []);
  const [medications, setMedications] = useState<string[]>(initialData?.current_medications || []);
  const [newAllergy, setNewAllergy] = useState('');
  const [newCondition, setNewCondition] = useState('');
  const [newMedication, setNewMedication] = useState('');

  const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm<PatientFormData>({
    defaultValues: initialData
  });

  const addItem = (item: string, list: string[], setList: React.Dispatch<React.SetStateAction<string[]>>, setInput: React.Dispatch<React.SetStateAction<string>>) => {
    if (item.trim() && !list.includes(item.trim())) {
      setList([...list, item.trim()]);
      setInput('');
    }
  };

  const removeItem = (item: string, list: string[], setList: React.Dispatch<React.SetStateAction<string[]>>) => {
    setList(list.filter(i => i !== item));
  };

  const onFormSubmit = (data: PatientFormData) => {
    onSubmit({
      ...data,
      allergies,
      medical_conditions: medicalConditions,
      current_medications: medications
    });
  };

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="name">Full Name *</Label>
              <Input
                id="name"
                {...register('name', { required: 'Name is required' })}
                placeholder="Enter patient's full name"
              />
              {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="age">Age *</Label>
                <Input
                  id="age"
                  type="number"
                  {...register('age', { required: 'Age is required', min: 1, max: 150 })}
                  placeholder="Age"
                />
                {errors.age && <p className="text-sm text-red-500">{errors.age.message}</p>}
              </div>

              <div>
                <Label htmlFor="gender">Gender *</Label>
                <Select onValueChange={(value) => setValue('gender', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
                {errors.gender && <p className="text-sm text-red-500">{errors.gender.message}</p>}
              </div>
            </div>

            <div>
              <Label htmlFor="date_of_birth">Date of Birth</Label>
              <Input
                id="date_of_birth"
                type="date"
                {...register('date_of_birth')}
              />
            </div>

            <div>
              <Label htmlFor="phone">Phone Number *</Label>
              <Input
                id="phone"
                {...register('phone', { required: 'Phone number is required' })}
                placeholder="Enter phone number"
              />
              {errors.phone && <p className="text-sm text-red-500">{errors.phone.message}</p>}
            </div>

            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                {...register('email')}
                placeholder="Enter email address"
              />
            </div>

            <div>
              <Label htmlFor="address">Address *</Label>
              <Textarea
                id="address"
                {...register('address', { required: 'Address is required' })}
                placeholder="Enter complete address"
              />
              {errors.address && <p className="text-sm text-red-500">{errors.address.message}</p>}
            </div>
          </CardContent>
        </Card>

        {/* Medical Information */}
        <Card>
          <CardHeader>
            <CardTitle>Medical Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="blood_group">Blood Group</Label>
              <Select onValueChange={(value) => setValue('blood_group', value)}>
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

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="height">Height (cm)</Label>
                <Input
                  id="height"
                  type="number"
                  {...register('height')}
                  placeholder="Height in cm"
                />
              </div>

              <div>
                <Label htmlFor="weight">Weight (kg)</Label>
                <Input
                  id="weight"
                  type="number"
                  {...register('weight')}
                  placeholder="Weight in kg"
                />
              </div>
            </div>

            {/* Allergies */}
            <div>
              <Label>Allergies</Label>
              <div className="flex gap-2 mb-2">
                <Input
                  value={newAllergy}
                  onChange={(e) => setNewAllergy(e.target.value)}
                  placeholder="Add allergy"
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addItem(newAllergy, allergies, setAllergies, setNewAllergy))}
                />
                <Button type="button" onClick={() => addItem(newAllergy, allergies, setAllergies, setNewAllergy)}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {allergies.map((allergy) => (
                  <Badge key={allergy} variant="secondary">
                    {allergy}
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="ml-2 h-auto p-0"
                      onClick={() => removeItem(allergy, allergies, setAllergies)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                ))}
              </div>
            </div>

            {/* Medical Conditions */}
            <div>
              <Label>Medical Conditions</Label>
              <div className="flex gap-2 mb-2">
                <Input
                  value={newCondition}
                  onChange={(e) => setNewCondition(e.target.value)}
                  placeholder="Add medical condition"
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addItem(newCondition, medicalConditions, setMedicalConditions, setNewCondition))}
                />
                <Button type="button" onClick={() => addItem(newCondition, medicalConditions, setMedicalConditions, setNewCondition)}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {medicalConditions.map((condition) => (
                  <Badge key={condition} variant="secondary">
                    {condition}
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="ml-2 h-auto p-0"
                      onClick={() => removeItem(condition, medicalConditions, setMedicalConditions)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                ))}
              </div>
            </div>

            {/* Current Medications */}
            <div>
              <Label>Current Medications</Label>
              <div className="flex gap-2 mb-2">
                <Input
                  value={newMedication}
                  onChange={(e) => setNewMedication(e.target.value)}
                  placeholder="Add medication"
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addItem(newMedication, medications, setMedications, setNewMedication))}
                />
                <Button type="button" onClick={() => addItem(newMedication, medications, setMedications, setNewMedication)}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {medications.map((medication) => (
                  <Badge key={medication} variant="secondary">
                    {medication}
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="ml-2 h-auto p-0"
                      onClick={() => removeItem(medication, medications, setMedications)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Emergency Contact */}
        <Card>
          <CardHeader>
            <CardTitle>Emergency Contact</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="emergency_contact_name">Contact Name</Label>
              <Input
                id="emergency_contact_name"
                {...register('emergency_contact_name')}
                placeholder="Emergency contact name"
              />
            </div>

            <div>
              <Label htmlFor="emergency_contact_phone">Contact Phone</Label>
              <Input
                id="emergency_contact_phone"
                {...register('emergency_contact_phone')}
                placeholder="Emergency contact phone"
              />
            </div>
          </CardContent>
        </Card>

        {/* Additional Information */}
        <Card>
          <CardHeader>
            <CardTitle>Additional Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="occupation">Occupation</Label>
              <Input
                id="occupation"
                {...register('occupation')}
                placeholder="Patient's occupation"
              />
            </div>

            <div>
              <Label htmlFor="marital_status">Marital Status</Label>
              <Select onValueChange={(value) => setValue('marital_status', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select marital status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="single">Single</SelectItem>
                  <SelectItem value="married">Married</SelectItem>
                  <SelectItem value="divorced">Divorced</SelectItem>
                  <SelectItem value="widowed">Widowed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="preferred_language">Preferred Language</Label>
              <Select onValueChange={(value) => setValue('preferred_language', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select preferred language" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="english">English</SelectItem>
                  <SelectItem value="telugu">Telugu</SelectItem>
                  <SelectItem value="hindi">Hindi</SelectItem>
                  <SelectItem value="tamil">Tamil</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="insurance_provider">Insurance Provider</Label>
              <Input
                id="insurance_provider"
                {...register('insurance_provider')}
                placeholder="Insurance company name"
              />
            </div>

            <div>
              <Label htmlFor="insurance_number">Insurance Number</Label>
              <Input
                id="insurance_number"
                {...register('insurance_number')}
                placeholder="Insurance policy number"
              />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-end">
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Saving...' : 'Save Patient'}
        </Button>
      </div>
    </form>
  );
};

export default EnhancedPatientForm;
