-- AI-Driven Supply Chain Management Database Schema
-- MySQL Database Setup

CREATE DATABASE IF NOT EXISTS supply_chain_ai;
USE supply_chain_ai;

-- Users table for authentication
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('admin', 'manager', 'user') DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Products table
CREATE TABLE IF NOT EXISTS products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    category VARCHAR(50) NOT NULL,
    material VARCHAR(50) NOT NULL,
    description TEXT,
    base_price DECIMAL(10,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Inventory table
CREATE TABLE IF NOT EXISTS inventory (
    id INT AUTO_INCREMENT PRIMARY KEY,
    product_id INT,
    quantity INT NOT NULL DEFAULT 0,
    min_stock_level INT DEFAULT 10,
    max_stock_level INT DEFAULT 100,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- Suppliers table
CREATE TABLE IF NOT EXISTS suppliers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    contact_person VARCHAR(100),
    email VARCHAR(100),
    phone VARCHAR(20),
    address TEXT,
    rating DECIMAL(3,2) DEFAULT 0.0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Demand forecasts table
CREATE TABLE IF NOT EXISTS demand_forecasts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    product_id INT,
    forecast_date DATE NOT NULL,
    predicted_demand INT NOT NULL,
    confidence_level DECIMAL(3,2) DEFAULT 0.95,
    model_used VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- Routes table for optimization
CREATE TABLE IF NOT EXISTS routes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    route_name VARCHAR(100) NOT NULL,
    start_location VARCHAR(100) NOT NULL,
    end_location VARCHAR(100) NOT NULL,
    distance_km DECIMAL(8,2),
    estimated_time_minutes INT,
    cost DECIMAL(10,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert sample data
INSERT INTO products (name, category, material, base_price) VALUES
('Wooden Table', 'Table', 'Wood', 150.00),
('Office Chair', 'Chair', 'Metal', 120.00),
('Storage Wardrobe', 'Wardrobe', 'Wood', 300.00),
('Leather Sofa', 'Sofa', 'Leather', 500.00),
('Glass Cabinet', 'Cabinet', 'Glass', 200.00);

INSERT INTO inventory (product_id, quantity, min_stock_level, max_stock_level) VALUES
(1, 25, 10, 50),
(2, 15, 5, 30),
(3, 8, 5, 20),
(4, 12, 5, 25),
(5, 20, 10, 40);

INSERT INTO suppliers (name, contact_person, email, phone, rating) VALUES
('Furniture World', 'John Smith', 'john@furnitureworld.com', '+91-9876543210', 4.5),
('Elegant Interiors', 'Sarah Johnson', 'sarah@elegant.com', '+91-9123456789', 4.2),
('Modern Furniture Co.', 'Mike Wilson', 'mike@modernfurniture.com', '+91-9988776655', 4.0);
