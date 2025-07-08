
import React from 'react';
import EnhancedLocationManager from './EnhancedLocationManager';
import PincodeManager from './PincodeManager';
import BusinessConfigManager from './BusinessConfigManager';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin, Target, Settings, Globe } from 'lucide-react';

const LocationManagement = () => {
  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Location Management System</h1>
        <p className="text-muted-foreground">
          Comprehensive multi-service location management with advanced features
        </p>
      </div>

      <Tabs defaultValue="enhanced" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="enhanced" className="flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            Enhanced Locations
          </TabsTrigger>
          <TabsTrigger value="pincodes" className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            Pincode Management
          </TabsTrigger>
          <TabsTrigger value="config" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Business Config
          </TabsTrigger>
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <Globe className="h-4 w-4" />
            Overview
          </TabsTrigger>
        </TabsList>

        <TabsContent value="enhanced">
          <EnhancedLocationManager />
        </TabsContent>

        <TabsContent value="pincodes">
          <PincodeManager />
        </TabsContent>

        <TabsContent value="config">
          <BusinessConfigManager />
        </TabsContent>

        <TabsContent value="overview">
          <div className="grid gap-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-blue-600" />
                    Location Features
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm">
                    <li>✓ Google Maps Integration</li>
                    <li>✓ Service-specific Configuration</li>
                    <li>✓ Multi-location Support</li>
                    <li>✓ Delivery Zone Management</li>
                    <li>✓ Real-time Analytics</li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Target className="h-5 w-5 text-green-600" />
                    Service Coverage
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm">
                    <li>• Medicine Delivery (Nationwide)</li>
                    <li>• Doctor Consultation (Online)</li>
                    <li>• Clinic Visits (Kurnool Only)</li>
                    <li>• Scan Centers (Location-based)</li>
                    <li>• Emergency Services (24x7)</li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Settings className="h-5 w-5 text-purple-600" />
                    Key Capabilities
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm">
                    <li>✓ Pincode-wise Service Mapping</li>
                    <li>✓ Dynamic Pricing Configuration</li>
                    <li>✓ Business Policy Management</li>
                    <li>✓ Location-based Analytics</li>
                    <li>✓ Future Expansion Ready</li>
                  </ul>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Business Model Overview</CardTitle>
                <CardDescription>
                  Current operational structure and expansion strategy
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold mb-3">Current Operations (Kurnool-based)</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Primary Location:</span>
                        <span className="font-medium">Kurnool, Andhra Pradesh</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Local Delivery Radius:</span>
                        <span className="font-medium">25 km</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Clinic Visits:</span>
                        <span className="font-medium">Kurnool Only</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Medicine Delivery:</span>
                        <span className="font-medium">Pan-India (Courier)</span>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold mb-3">Expansion Strategy</h4>
                    <div className="space-y-2 text-sm">
                      <div>• Multi-city service center setup</div>
                      <div>• Zone-wise service customization</div>
                      <div>• Franchise/partner network</div>
                      <div>• Regional distribution hubs</div>
                      <div>• Advanced logistics integration</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default LocationManagement;
