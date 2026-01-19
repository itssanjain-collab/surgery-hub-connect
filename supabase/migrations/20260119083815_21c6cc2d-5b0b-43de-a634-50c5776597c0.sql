-- Create storage bucket for doctor photos
INSERT INTO storage.buckets (id, name, public)
VALUES ('doctor-photos', 'doctor-photos', true)
ON CONFLICT (id) DO NOTHING;

-- Allow anyone to view doctor photos (public bucket)
CREATE POLICY "Anyone can view doctor photos"
ON storage.objects FOR SELECT
USING (bucket_id = 'doctor-photos');

-- Allow authenticated hospital users to upload doctor photos
CREATE POLICY "Authenticated users can upload doctor photos"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'doctor-photos' AND auth.role() = 'authenticated');

-- Allow authenticated users to update their doctor photos
CREATE POLICY "Authenticated users can update doctor photos"
ON storage.objects FOR UPDATE
USING (bucket_id = 'doctor-photos' AND auth.role() = 'authenticated');

-- Allow authenticated users to delete doctor photos
CREATE POLICY "Authenticated users can delete doctor photos"
ON storage.objects FOR DELETE
USING (bucket_id = 'doctor-photos' AND auth.role() = 'authenticated');