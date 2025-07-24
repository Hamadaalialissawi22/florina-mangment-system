/*
  # Create users table with authentication and roles

  1. New Tables
    - `users`
      - `id` (uuid, primary key)
      - `email` (text, unique)
      - `name` (text, default empty)
      - `role` (text, default 'employee', check constraint for valid roles)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on `users` table
    - Add policy for users to read their own data
    - Add policy for admins to manage all users

  3. Sample Data
    - Admin user for testing
    - Manager user for testing
    - Employee user for testing
*/

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  name text DEFAULT '' NOT NULL,
  role text DEFAULT 'employee' NOT NULL CHECK (role IN ('admin', 'manager', 'employee')),
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can read own data" ON users;
DROP POLICY IF EXISTS "Admins can manage all users" ON users;

-- Create policies
CREATE POLICY "Users can read own data"
  ON users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Admins can manage all users"
  ON users
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND auth.users.raw_user_meta_data->>'role' = 'admin'
    )
  );

-- Insert sample data
INSERT INTO users (id, email, name, role) VALUES
  ('550e8400-e29b-41d4-a716-446655440000', 'admin@florina.com', 'مدير النظام', 'admin'),
  ('550e8400-e29b-41d4-a716-446655440001', 'manager@florina.com', 'مدير المقهى', 'manager'),
  ('550e8400-e29b-41d4-a716-446655440002', 'employee@florina.com', 'موظف المبيعات', 'employee')
ON CONFLICT (email) DO NOTHING;