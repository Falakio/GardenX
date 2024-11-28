-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create storage bucket for product images
INSERT INTO storage.buckets (id, name, public) 
VALUES ('product-images', 'product-images', true);

-- Create storage policy for public access to product images
CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING (bucket_id = 'product-images');
CREATE POLICY "Authenticated Users Can Upload" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'product-images' AND auth.role() = 'authenticated');
CREATE POLICY "Owners Can Update and Delete" ON storage.objects USING (bucket_id = 'product-images' AND auth.uid() = owner);

-- Create user_profiles table
CREATE TABLE IF NOT EXISTS user_profiles (
    id UUID REFERENCES auth.users(id) PRIMARY KEY,
    parent_name TEXT NOT NULL,
    parent_email TEXT NOT NULL,
    student_name TEXT NOT NULL,
    student_class TEXT NOT NULL CHECK (student_class IN ('KG1', 'KG2', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', 'NA')),
    student_section CHAR(1) NOT NULL CHECK (student_section ~ '^[A-Z]$'),
    gems_id_last_six TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'parent',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT gems_id_unique UNIQUE (gems_id_last_six)
);

-- Add role column to existing table
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS role TEXT NOT NULL DEFAULT 'parent';

-- Update student_class check constraint if not exists
DO $$ 
BEGIN 
    ALTER TABLE user_profiles DROP CONSTRAINT IF EXISTS user_profiles_student_class_check;
    ALTER TABLE user_profiles ADD CONSTRAINT user_profiles_student_class_check 
        CHECK (student_class IN ('KG1', 'KG2', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', 'NA'));
EXCEPTION
    WHEN others THEN null;
END $$;

-- Update student_section type and constraint if not exists
DO $$ 
BEGIN 
    ALTER TABLE user_profiles ALTER COLUMN student_section TYPE CHAR(1);
    ALTER TABLE user_profiles DROP CONSTRAINT IF EXISTS user_profiles_student_section_check;
    ALTER TABLE user_profiles ADD CONSTRAINT user_profiles_student_section_check 
        CHECK (student_section ~ '^[A-Z]$');
EXCEPTION
    WHEN others THEN null;
END $$;

-- Create products table
CREATE TABLE products (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    stock_quantity INTEGER NOT NULL DEFAULT 0,
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create orders table
CREATE TABLE orders (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    total_amount DECIMAL(10,2) NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending',
    items JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create function to handle user deletion
CREATE OR REPLACE FUNCTION delete_user(user_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  DELETE FROM auth.users WHERE id = user_id;
END;
$$;

-- Create RLS policies

-- User Profiles policies
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
ON user_profiles FOR SELECT
USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
ON user_profiles FOR UPDATE
USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
ON user_profiles FOR INSERT
WITH CHECK (auth.uid() = id);

-- Products policies
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view products"
ON products FOR SELECT
USING (true);

CREATE POLICY "Only admins can insert products"
ON products FOR INSERT
WITH CHECK (auth.jwt()->>'email' LIKE '%@oisorganicgarden.edu');

CREATE POLICY "Only admins can update products"
ON products FOR UPDATE
USING (auth.jwt()->>'email' LIKE '%@oisorganicgarden.edu');

CREATE POLICY "Only admins can delete products"
ON products FOR DELETE
USING (auth.jwt()->>'email' LIKE '%@oisorganicgarden.edu');

-- Orders policies
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own orders"
ON orders FOR SELECT
USING (
    auth.uid() = user_id OR 
    auth.jwt()->>'email' LIKE '%@oisorganicgarden.edu'
);

CREATE POLICY "Users can insert own orders"
ON orders FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Only admins can update orders"
ON orders FOR UPDATE
USING (auth.jwt()->>'email' LIKE '%@oisorganicgarden.edu');

-- Create triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_user_profiles_updated_at
    BEFORE UPDATE ON user_profiles
    FOR EACH ROW
    EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_products_updated_at
    BEFORE UPDATE ON products
    FOR EACH ROW
    EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_orders_updated_at
    BEFORE UPDATE ON orders
    FOR EACH ROW
    EXECUTE PROCEDURE update_updated_at_column();
