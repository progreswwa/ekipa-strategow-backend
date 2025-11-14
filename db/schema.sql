-- PostgreSQL Schema for EKIPA STRATEGÓW - AI Website Generation System
-- Created for EKIPA_STRATEGOW project
-- Database: ekipa-strategow-db

-- 1. CLIENTS TABLE - Store customer information
CREATE TABLE IF NOT EXISTS clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  company_name VARCHAR(255),
  phone VARCHAR(20),
  country VARCHAR(100),
  subscription_plan VARCHAR(50) DEFAULT 'starter',
  subscription_status VARCHAR(50) DEFAULT 'active',
  stripe_customer_id VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP
);

-- 2. BRIEFS TABLE - Website briefing requests from clients
CREATE TABLE IF NOT EXISTS briefs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  industry VARCHAR(100),
  page_type VARCHAR(50),
  business_name VARCHAR(255),
  description TEXT,
  target_audience TEXT,
  color_primary VARCHAR(7),
  color_secondary VARCHAR(7),
  requirements JSONB,
  status VARCHAR(50) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. DEPLOYMENTS TABLE - Track each generated website
CREATE TABLE IF NOT EXISTS deployments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brief_id UUID NOT NULL REFERENCES briefs(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  site_url VARCHAR(500),
  netlify_site_id VARCHAR(255),
  html_generated_at TIMESTAMP,
  deployed_at TIMESTAMP,
  status VARCHAR(50) DEFAULT 'generating',
  error_message TEXT,
  cost_breakdown JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. INVOICES TABLE - Billing and payment records
CREATE TABLE IF NOT EXISTS invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  deployment_id UUID REFERENCES deployments(id) ON DELETE SET NULL,
  amount DECIMAL(10, 2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'USD',
  status VARCHAR(50) DEFAULT 'pending',
  stripe_invoice_id VARCHAR(255),
  due_date DATE,
  paid_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. ANALYTICS TABLE - Track system performance
CREATE TABLE IF NOT EXISTS analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  metric_type VARCHAR(100),
  metric_value DECIMAL(12, 4),
  brief_id UUID REFERENCES briefs(id) ON DELETE SET NULL,
  deployment_id UUID REFERENCES deployments(id) ON DELETE SET NULL,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- INDEXES for performance
CREATE INDEX idx_clients_email ON clients(email);
CREATE INDEX idx_briefs_client_id ON briefs(client_id);
CREATE INDEX idx_briefs_status ON briefs(status);
CREATE INDEX idx_deployments_brief_id ON deployments(brief_id);
CREATE INDEX idx_deployments_client_id ON deployments(client_id);
CREATE INDEX idx_deployments_status ON deployments(status);
CREATE INDEX idx_invoices_client_id ON invoices(client_id);
CREATE INDEX idx_invoices_status ON invoices(status);
CREATE INDEX idx_analytics_timestamp ON analytics(timestamp);

-- TABLES ALREADY EXISTING (from bytebot setup, keep for compatibility)
-- File, Message, Summary, Task tables
-- These integrate with the briefing system

COMMIT;
