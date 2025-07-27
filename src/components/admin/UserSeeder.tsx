
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { seedAdminUsers } from '@/lib/seed-users';
import { AlertTriangle, CheckCircle, Loader2 } from 'lucide-react';

const UserSeeder = () => {
  const [isSeeding, setIsSeeding] = useState(false);
  const [message, setMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSeedUsers = async () => {
    setIsSeeding(true);
    setMessage('');
    setIsSuccess(false);

    try {
      await seedAdminUsers();
      setMessage('Admin users have been successfully created! You can now login with the demo credentials.');
      setIsSuccess(true);
    } catch (error) {
      setMessage('Failed to create admin users. Please check the console for details.');
      setIsSuccess(false);
      console.error('Seeding error:', error);
    } finally {
      setIsSeeding(false);
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-yellow-500" />
          Setup Required
        </CardTitle>
        <CardDescription>
          Create demo admin users to enable login functionality
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {message && (
          <Alert variant={isSuccess ? "default" : "destructive"}>
            {isSuccess ? (
              <CheckCircle className="h-4 w-4" />
            ) : (
              <AlertTriangle className="h-4 w-4" />
            )}
            <AlertDescription>{message}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">
            This will create the following admin users:
          </p>
          <ul className="text-xs space-y-1">
            <li>• remedikurnool@gmail.com (Super Admin)</li>
            <li>• superadmin@onemedi.com (Super Admin)</li>
            <li>• admin@onemedi.com (Admin)</li>
            <li>• manager@onemedi.com (Manager)</li>
            <li>• pharmacist@onemedi.com (Pharmacist)</li>
          </ul>
        </div>

        <Button 
          onClick={handleSeedUsers} 
          disabled={isSeeding}
          className="w-full"
        >
          {isSeeding ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creating Users...
            </>
          ) : (
            'Create Admin Users'
          )}
        </Button>
      </CardContent>
    </Card>
  );
};

export default UserSeeder;
