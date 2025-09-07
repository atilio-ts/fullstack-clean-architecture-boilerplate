-- Initial database schema for file management system
-- Migration: V1__Initial_files_schema.sql

-- Create UUID extension for primary keys
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create files table for document storage and management
CREATE TABLE files (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    filename VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL UNIQUE,
    file_size INTEGER NOT NULL CHECK (file_size > 0 AND file_size <= 1048576), -- Max 1MB
    content_type VARCHAR(50) NOT NULL CHECK (content_type IN ('text/plain', 'text/markdown', 'application/json')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for optimal query performance
CREATE INDEX idx_files_filename ON files(filename);
CREATE INDEX idx_files_created_at ON files(created_at);
CREATE INDEX idx_files_content_type ON files(content_type);
CREATE UNIQUE INDEX idx_files_file_path ON files(file_path);

-- Add trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_files_updated_at 
    BEFORE UPDATE ON files 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();