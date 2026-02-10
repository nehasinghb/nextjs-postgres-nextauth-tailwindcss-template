'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { User, Calendar, GraduationCap, School, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface UserProfile {
  user_id: string;
  email: string;
  display_name: string;
  date_of_birth?: string;
  current_grade?: string;
  school_university?: string;
  profile_picture_url?: string;
}

const gradeOptions = [
  'Pre-K',
  'Kindergarten',
  '1st Grade',
  '2nd Grade',
  '3rd Grade',
  '4th Grade',
  '5th Grade',
  '6th Grade',
  '7th Grade',
  '8th Grade',
  '9th Grade',
  '10th Grade',
  '11th Grade',
  '12th Grade',
  'Freshman',
  'Sophomore',
  'Junior',
  'Senior',
  'Graduate Student',
  'Other'
];

export default function UserProfilePage() {
  const router = useRouter();
  const { toast, toasts } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [formData, setFormData] = useState({
    display_name: '',
    date_of_birth: '',
    current_grade: '',
    school_university: ''
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      console.log('[Client] Fetching profile from /api/user/profile');
      
      const response = await fetch('/api/user/profile', {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      console.log('[Client] Response status:', response.status);
      console.log('[Client] Response ok:', response.ok);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('[Client] Error response:', errorText);
        throw new Error(`Failed to fetch profile: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('[Client] Profile data received:', {
        email: data.email,
        display_name: data.display_name,
        has_dob: !!data.date_of_birth,
        has_grade: !!data.current_grade
      });
      
      setProfile(data);
      setFormData({
        display_name: data.display_name || '',
        date_of_birth: data.date_of_birth || '',
        current_grade: data.current_grade || '',
        school_university: data.school_university || ''
      });
    } catch (error) {
      console.error('[Client] Error fetching profile:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to load profile',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    console.log('[Client] handleSubmit called, formData:', formData);

    // Validation
    if (!formData.display_name.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Name is required',
        variant: 'destructive'
      });
      return;
    }

    if (!formData.date_of_birth) {
      toast({
        title: 'Validation Error',
        description: 'Date of birth is required',
        variant: 'destructive'
      });
      return;
    }

    if (!formData.current_grade) {
      toast({
        title: 'Validation Error',
        description: 'Current grade is required',
        variant: 'destructive'
      });
      return;
    }

    setSaving(true);
    
    try {
      console.log('[Client] Updating profile...');
      
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      console.log('[Client] Update response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('[Client] Update error response:', errorText);
        throw new Error(`Failed to update profile: ${response.status}`);
      }

      const updatedProfile = await response.json();
      console.log('[Client] Profile updated successfully');
      
      setProfile(updatedProfile);
      
      toast({
        title: 'Success',
        description: 'Profile updated successfully'
      });
    } catch (error) {
      console.error('[Client] Error updating profile:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to update profile',
        variant: 'destructive'
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-2 text-muted-foreground">Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="w-full px-2 py-4">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">User Profile</h1>
        <p className="text-muted-foreground">
          Manage your personal information and preferences
        </p>
      </div>

      <div className="grid gap-6 max-w-4xl">
        {/* Profile Card */}
        <Card>
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
            <CardDescription>
              Update your personal details. Fields marked with * are required.
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-6">
              {/* Email (read-only) */}
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="flex items-center space-x-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    value={profile?.email || ''}
                    disabled
                    className="bg-muted"
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Email cannot be changed
                </p>
              </div>

              {/* Display Name */}
              <div className="space-y-2">
                <Label htmlFor="display_name">
                  Name <span className="text-destructive">*</span>
                </Label>
                <div className="flex items-center space-x-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <Input
                    id="display_name"
                    type="text"
                    value={formData.display_name}
                    onChange={(e) => setFormData({ ...formData, display_name: e.target.value })}
                    placeholder="Enter your full name"
                    required
                  />
                </div>
              </div>

              {/* Date of Birth */}
              <div className="space-y-2">
                <Label htmlFor="date_of_birth">
                  Date of Birth <span className="text-destructive">*</span>
                </Label>
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <Input
                    id="date_of_birth"
                    type="date"
                    value={formData.date_of_birth}
                    onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
                    max={new Date().toISOString().split('T')[0]}
                    required
                  />
                </div>
              </div>

              {/* Current Grade */}
              <div className="space-y-2">
                <Label htmlFor="current_grade">
                  Current Grade <span className="text-destructive">*</span>
                </Label>
                <div className="flex items-center space-x-2">
                  <GraduationCap className="h-4 w-4 text-muted-foreground" />
                  <Select
                    value={formData.current_grade}
                    onValueChange={(value) => setFormData({ ...formData, current_grade: value })}
                    required
                  >
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="Select your current grade" />
                    </SelectTrigger>
                    <SelectContent>
                      {gradeOptions.map((grade) => (
                        <SelectItem key={grade} value={grade}>
                          {grade}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* School/University */}
              <div className="space-y-2">
                <Label htmlFor="school_university">
                  School / University (Optional)
                </Label>
                <div className="flex items-center space-x-2">
                  <School className="h-4 w-4 text-muted-foreground" />
                  <Input
                    id="school_university"
                    type="text"
                    value={formData.school_university}
                    onChange={(e) => setFormData({ ...formData, school_university: e.target.value })}
                    placeholder="Enter your school or university name"
                  />
                </div>
              </div>
            </CardContent>

            <CardFooter className="flex justify-between">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push('/dashboard')}
                disabled={saving}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Save Changes'
                )}
              </Button>
            </CardFooter>
          </form>
        </Card>

        {/* Additional Info Card */}
        <Card>
          <CardHeader>
            <CardTitle>Account Information</CardTitle>
            <CardDescription>
              View your account details
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">User ID</p>
                <p className="text-sm font-mono mt-1">{profile?.user_id}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Account Type</p>
                <p className="text-sm mt-1">Standard User</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Toast notifications */}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
        {toasts.map((t, i) => (
          <div
            key={i}
            className={`rounded-lg border px-4 py-3 shadow-lg transition-all ${
              t.variant === 'destructive'
                ? 'border-red-200 bg-red-50 text-red-900'
                : 'border-green-200 bg-green-50 text-green-900'
            }`}
          >
            <p className="text-sm font-semibold">{t.title}</p>
            {t.description && (
              <p className="text-sm opacity-80">{t.description}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}