-- Create role enum
CREATE TYPE public.app_role AS ENUM ('user', 'hospital', 'admin');

-- Create user_roles table for role management
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function to check roles (prevents RLS recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- RLS policies for user_roles
CREATE POLICY "Users can view their own roles"
ON public.user_roles FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own roles during signup"
ON public.user_roles FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Create hospitals table
CREATE TABLE public.hospitals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  name TEXT NOT NULL,
  tagline TEXT,
  description TEXT,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  region TEXT NOT NULL,
  contact_phone TEXT NOT NULL,
  contact_email TEXT NOT NULL,
  website TEXT,
  image_url TEXT,
  gallery_images TEXT[] DEFAULT '{}',
  is_accredited BOOLEAN DEFAULT false,
  established_year INTEGER,
  bed_count INTEGER,
  specialties TEXT[] DEFAULT '{}',
  amenities TEXT[] DEFAULT '{}',
  rating NUMERIC(2,1) DEFAULT 0,
  review_count INTEGER DEFAULT 0,
  is_verified BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on hospitals
ALTER TABLE public.hospitals ENABLE ROW LEVEL SECURITY;

-- RLS policies for hospitals
CREATE POLICY "Anyone can view active hospitals"
ON public.hospitals FOR SELECT
USING (is_active = true);

CREATE POLICY "Hospital owners can insert their hospital"
ON public.hospitals FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Hospital owners can update their hospital"
ON public.hospitals FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Hospital owners can delete their hospital"
ON public.hospitals FOR DELETE
USING (auth.uid() = user_id);

-- Add updated_at trigger for hospitals
CREATE TRIGGER update_hospitals_updated_at
BEFORE UPDATE ON public.hospitals
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();