-- Add sample data for development
-- Migration: V2__Add_sample_data.sql

-- Insert sample users for development/testing
INSERT INTO users (name, email, password_hash) VALUES
('John Doe', 'john.doe@example.com', '$2b$10$abcdefghijklmnopqrstuvwxyz123456789'),
('Jane Smith', 'jane.smith@example.com', '$2b$10$zyxwvutsrqponmlkjihgfedcba987654321'),
('Admin User', 'admin@atilio.com', '$2b$10$adminhashabcdefghijklmnopqrstuvwxyz123');

-- Note: These are example password hashes, replace with actual bcrypt hashes in production