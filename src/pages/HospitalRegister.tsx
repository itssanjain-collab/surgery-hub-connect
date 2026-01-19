import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Building2, ArrowLeft, ArrowRight, Check, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { KARNATAKA_REGIONS } from '@/types';
import { z } from 'zod';

const step1Schema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

const step2Schema = z.object({
  name: z.string().min(2, 'Hospital name must be at least 2 characters'),
  tagline: z.string().optional(),
  address: z.string().min(5, 'Please enter a complete address'),
  city: z.string().min(2, 'Please enter a city'),
  region: z.string().min(1, 'Please select a region'),
  contactPhone: z.string().min(10, 'Please enter a valid phone number'),
  contactEmail: z.string().email('Please enter a valid email'),
});

export default function HospitalRegister() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Step 1: Account details
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Step 2: Hospital details
  const [name, setName] = useState('');
  const [tagline, setTagline] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [region, setRegion] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [description, setDescription] = useState('');

  const validateStep1 = () => {
    const result = step1Schema.safeParse({ email, password, confirmPassword });
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.issues.forEach((err) => {
        if (err.path[0]) {
          fieldErrors[err.path[0] as string] = err.message;
        }
      });
      setErrors(fieldErrors);
      return false;
    }
    setErrors({});
    return true;
  };

  const validateStep2 = () => {
    const result = step2Schema.safeParse({
      name,
      tagline,
      address,
      city,
      region,
      contactPhone,
      contactEmail,
    });
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.issues.forEach((err) => {
        if (err.path[0]) {
          fieldErrors[err.path[0] as string] = err.message;
        }
      });
      setErrors(fieldErrors);
      return false;
    }
    setErrors({});
    return true;
  };

  const handleNextStep = () => {
    if (step === 1 && validateStep1()) {
      setStep(2);
    }
  };

  const handleSubmit = async () => {
    if (!validateStep2()) return;

    setIsLoading(true);
    try {
      // 1. Create the user account
      const redirectUrl = `${window.location.origin}/dashboard`;
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
        },
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error('Failed to create account');

      const userId = authData.user.id;

      // 2. Add hospital role
      const { error: roleError } = await supabase
        .from('user_roles')
        .insert({ user_id: userId, role: 'hospital' });

      if (roleError) throw roleError;

      // 3. Create hospital profile
      const { error: hospitalError } = await supabase
        .from('hospitals')
        .insert({
          user_id: userId,
          name,
          tagline: tagline || null,
          description: description || null,
          address,
          city,
          region,
          contact_phone: contactPhone,
          contact_email: contactEmail,
        });

      if (hospitalError) throw hospitalError;

      toast({
        title: 'Registration successful!',
        description: 'Your hospital account has been created. You can now access your dashboard.',
      });

      navigate('/dashboard');
    } catch (error: any) {
      console.error('Registration error:', error);
      toast({
        title: 'Registration failed',
        description: error.message || 'Something went wrong. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-muted/30">
      <Header />

      <div className="container max-w-2xl py-12">
        {/* Progress indicator */}
        <div className="flex items-center justify-center gap-4 mb-8">
          <div className={`flex items-center gap-2 ${step >= 1 ? 'text-primary' : 'text-muted-foreground'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${step >= 1 ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
              {step > 1 ? <Check className="w-4 h-4" /> : '1'}
            </div>
            <span className="font-medium hidden sm:inline">Account</span>
          </div>
          <div className={`w-12 h-0.5 ${step > 1 ? 'bg-primary' : 'bg-muted'}`} />
          <div className={`flex items-center gap-2 ${step >= 2 ? 'text-primary' : 'text-muted-foreground'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${step >= 2 ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
              2
            </div>
            <span className="font-medium hidden sm:inline">Hospital Details</span>
          </div>
        </div>

        <div className="card-elevated p-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <Building2 className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Register Your Hospital</h1>
              <p className="text-muted-foreground">
                {step === 1 ? 'Create your account to get started' : 'Tell us about your hospital'}
              </p>
            </div>
          </div>

          {step === 1 && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="hospital@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={errors.email ? 'border-destructive' : ''}
                />
                {errors.email && <p className="text-sm text-destructive mt-1">{errors.email}</p>}
              </div>

              <div>
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Create a strong password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={errors.password ? 'border-destructive' : ''}
                />
                {errors.password && <p className="text-sm text-destructive mt-1">{errors.password}</p>}
              </div>

              <div>
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Confirm your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={errors.confirmPassword ? 'border-destructive' : ''}
                />
                {errors.confirmPassword && <p className="text-sm text-destructive mt-1">{errors.confirmPassword}</p>}
              </div>

              <Button onClick={handleNextStep} className="w-full gap-2" size="lg">
                Continue
                <ArrowRight className="w-4 h-4" />
              </Button>

              <p className="text-center text-sm text-muted-foreground">
                Already have an account?{' '}
                <button onClick={() => navigate('/auth')} className="text-primary hover:underline">
                  Sign in
                </button>
              </p>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <Label htmlFor="name">Hospital Name *</Label>
                  <Input
                    id="name"
                    placeholder="e.g., City General Hospital"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className={errors.name ? 'border-destructive' : ''}
                  />
                  {errors.name && <p className="text-sm text-destructive mt-1">{errors.name}</p>}
                </div>

                <div className="md:col-span-2">
                  <Label htmlFor="tagline">Tagline</Label>
                  <Input
                    id="tagline"
                    placeholder="e.g., Excellence in Healthcare"
                    value={tagline}
                    onChange={(e) => setTagline(e.target.value)}
                  />
                </div>

                <div className="md:col-span-2">
                  <Label htmlFor="address">Address *</Label>
                  <Input
                    id="address"
                    placeholder="Full street address"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className={errors.address ? 'border-destructive' : ''}
                  />
                  {errors.address && <p className="text-sm text-destructive mt-1">{errors.address}</p>}
                </div>

                <div>
                  <Label htmlFor="city">City *</Label>
                  <Input
                    id="city"
                    placeholder="e.g., Bangalore"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className={errors.city ? 'border-destructive' : ''}
                  />
                  {errors.city && <p className="text-sm text-destructive mt-1">{errors.city}</p>}
                </div>

                <div>
                  <Label htmlFor="region">Region *</Label>
                  <select
                    id="region"
                    value={region}
                    onChange={(e) => setRegion(e.target.value)}
                    className={`w-full h-10 px-3 rounded-lg border bg-background ${errors.region ? 'border-destructive' : 'border-input'}`}
                  >
                    <option value="">Select region</option>
                    {KARNATAKA_REGIONS.map((r) => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                  {errors.region && <p className="text-sm text-destructive mt-1">{errors.region}</p>}
                </div>

                <div>
                  <Label htmlFor="contactPhone">Contact Phone *</Label>
                  <Input
                    id="contactPhone"
                    type="tel"
                    placeholder="+91 98765 43210"
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    className={errors.contactPhone ? 'border-destructive' : ''}
                  />
                  {errors.contactPhone && <p className="text-sm text-destructive mt-1">{errors.contactPhone}</p>}
                </div>

                <div>
                  <Label htmlFor="contactEmail">Contact Email *</Label>
                  <Input
                    id="contactEmail"
                    type="email"
                    placeholder="contact@hospital.com"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    className={errors.contactEmail ? 'border-destructive' : ''}
                  />
                  {errors.contactEmail && <p className="text-sm text-destructive mt-1">{errors.contactEmail}</p>}
                </div>

                <div className="md:col-span-2">
                  <Label htmlFor="description">Description (Optional)</Label>
                  <Textarea
                    id="description"
                    placeholder="Tell patients about your hospital, specialties, and what makes you unique..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={4}
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <Button variant="outline" onClick={() => setStep(1)} className="gap-2">
                  <ArrowLeft className="w-4 h-4" />
                  Back
                </Button>
                <Button onClick={handleSubmit} disabled={isLoading} className="flex-1 gap-2" size="lg">
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Creating Account...
                    </>
                  ) : (
                    <>
                      Complete Registration
                      <Check className="w-4 h-4" />
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
