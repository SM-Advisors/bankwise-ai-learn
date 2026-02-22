-- ============================================================
-- Departments & Roles System
-- Replaces hardcoded line_of_business enum with flexible,
-- admin-managed departments and roles tables.
-- Includes industries table for future multi-industry expansion.
-- ============================================================

-- ============================================================
-- 1. Industries table (future multi-industry support)
-- ============================================================
CREATE TABLE IF NOT EXISTS industries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE industries ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Authenticated users can view industries' AND tablename = 'industries') THEN
    EXECUTE 'CREATE POLICY "Authenticated users can view industries" ON industries FOR SELECT TO authenticated USING (true)';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Admins can manage industries' AND tablename = 'industries') THEN
    EXECUTE 'CREATE POLICY "Admins can manage industries" ON industries FOR ALL TO authenticated USING (EXISTS (SELECT 1 FROM user_roles WHERE user_roles.user_id = auth.uid() AND user_roles.role = ''admin''))';
  END IF;
END $$;

-- Seed banking industry
INSERT INTO industries (slug, name, is_active, display_order)
VALUES ('banking', 'Community Banking', true, 0)
ON CONFLICT (slug) DO NOTHING;

-- ============================================================
-- 2. Departments table (replaces line_of_business enum)
-- ============================================================
CREATE TABLE IF NOT EXISTS departments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  industry_id UUID NOT NULL REFERENCES industries(id) ON DELETE CASCADE,
  slug TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT DEFAULT 'Building2',
  is_active BOOLEAN NOT NULL DEFAULT true,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(industry_id, slug)
);

CREATE INDEX IF NOT EXISTS idx_departments_industry ON departments(industry_id);
CREATE INDEX IF NOT EXISTS idx_departments_active ON departments(is_active, display_order);

ALTER TABLE departments ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Authenticated users can view departments' AND tablename = 'departments') THEN
    EXECUTE 'CREATE POLICY "Authenticated users can view departments" ON departments FOR SELECT TO authenticated USING (true)';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Admins can manage departments' AND tablename = 'departments') THEN
    EXECUTE 'CREATE POLICY "Admins can manage departments" ON departments FOR ALL TO authenticated USING (EXISTS (SELECT 1 FROM user_roles WHERE user_roles.user_id = auth.uid() AND user_roles.role = ''admin''))';
  END IF;
END $$;

-- ============================================================
-- 3. Department roles table (common roles within a department)
-- ============================================================
CREATE TABLE IF NOT EXISTS department_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  department_id UUID NOT NULL REFERENCES departments(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_department_roles_dept ON department_roles(department_id);

ALTER TABLE department_roles ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Authenticated users can view department roles' AND tablename = 'department_roles') THEN
    EXECUTE 'CREATE POLICY "Authenticated users can view department roles" ON department_roles FOR SELECT TO authenticated USING (true)';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Admins can manage department roles' AND tablename = 'department_roles') THEN
    EXECUTE 'CREATE POLICY "Admins can manage department roles" ON department_roles FOR ALL TO authenticated USING (EXISTS (SELECT 1 FROM user_roles WHERE user_roles.user_id = auth.uid() AND user_roles.role = ''admin''))';
  END IF;
END $$;

-- ============================================================
-- 4. Seed banking departments (14 departments)
-- ============================================================
DO $$
DECLARE
  banking_id UUID;
BEGIN
  SELECT id INTO banking_id FROM industries WHERE slug = 'banking';

  -- Insert departments with display_order
  INSERT INTO departments (industry_id, slug, name, description, icon, display_order) VALUES
    (banking_id, 'commercial_lending', 'Commercial Lending', 'Commercial real estate, C&I lending, and business loan origination', 'Landmark', 0),
    (banking_id, 'retail_banking', 'Retail Banking', 'Branch operations, consumer deposits, and customer service', 'Users', 1),
    (banking_id, 'mortgage_consumer_lending', 'Mortgage & Consumer Lending', 'Residential mortgage origination, consumer loans, and home equity', 'Home', 2),
    (banking_id, 'credit_administration', 'Credit Administration', 'Loan processing, credit analysis, underwriting, and portfolio management', 'FileCheck', 3),
    (banking_id, 'treasury_cash_management', 'Treasury & Cash Management', 'Asset-liability management, liquidity, investments, and cash management services', 'Vault', 4),
    (banking_id, 'operations', 'Operations', 'Deposit operations, payment processing, wire transfers, and back-office support', 'Settings', 5),
    (banking_id, 'compliance_bsa_aml', 'Compliance & BSA/AML', 'Regulatory compliance, Bank Secrecy Act, anti-money laundering, and fair lending', 'ShieldCheck', 6),
    (banking_id, 'risk_management', 'Risk Management', 'Enterprise risk, credit risk review, interest rate risk, and audit', 'AlertTriangle', 7),
    (banking_id, 'it_information_security', 'IT & Information Security', 'Technology infrastructure, cybersecurity, vendor management, and digital banking', 'Shield', 8),
    (banking_id, 'human_resources', 'Human Resources', 'Talent acquisition, training & development, benefits, and employee relations', 'UserPlus', 9),
    (banking_id, 'marketing_business_development', 'Marketing & Business Development', 'Brand management, digital marketing, community relations, and business growth', 'Megaphone', 10),
    (banking_id, 'accounting_finance', 'Accounting & Finance', 'Financial reporting, general ledger, reconciliation, budgeting, and regulatory filings', 'Calculator', 11),
    (banking_id, 'wealth_management_trust', 'Wealth Management & Trust', 'Trust administration, investment management, financial planning, and fiduciary services', 'TrendingUp', 12),
    (banking_id, 'executive_leadership', 'Executive & Leadership', 'Strategic planning, board governance, organizational management, and bank-wide oversight', 'Crown', 13)
  ON CONFLICT (industry_id, slug) DO NOTHING;
END $$;

-- ============================================================
-- 5. Seed department roles (3-5 common roles per department)
-- ============================================================
DO $$
DECLARE
  dept_id UUID;
BEGIN
  -- Commercial Lending
  SELECT id INTO dept_id FROM departments WHERE slug = 'commercial_lending';
  IF dept_id IS NOT NULL THEN
    INSERT INTO department_roles (department_id, name, description, display_order) VALUES
      (dept_id, 'Commercial Loan Officer', 'Originates and manages commercial loan relationships', 0),
      (dept_id, 'Commercial Credit Analyst', 'Analyzes financial statements and prepares credit packages', 1),
      (dept_id, 'Portfolio Manager', 'Manages existing loan portfolio and renewals', 2),
      (dept_id, 'Team Lead / SVP Lending', 'Oversees lending team and approves larger credits', 3)
    ON CONFLICT DO NOTHING;
  END IF;

  -- Retail Banking
  SELECT id INTO dept_id FROM departments WHERE slug = 'retail_banking';
  IF dept_id IS NOT NULL THEN
    INSERT INTO department_roles (department_id, name, description, display_order) VALUES
      (dept_id, 'Branch Manager', 'Manages branch operations and staff', 0),
      (dept_id, 'Universal Banker', 'Handles teller transactions and account opening', 1),
      (dept_id, 'Personal Banker', 'Manages consumer relationships and cross-sells products', 2),
      (dept_id, 'Customer Service Representative', 'Front-line customer support and transaction processing', 3)
    ON CONFLICT DO NOTHING;
  END IF;

  -- Mortgage & Consumer Lending
  SELECT id INTO dept_id FROM departments WHERE slug = 'mortgage_consumer_lending';
  IF dept_id IS NOT NULL THEN
    INSERT INTO department_roles (department_id, name, description, display_order) VALUES
      (dept_id, 'Mortgage Loan Officer', 'Originates residential mortgage loans', 0),
      (dept_id, 'Mortgage Processor', 'Processes mortgage applications and documentation', 1),
      (dept_id, 'Consumer Loan Officer', 'Originates auto, personal, and home equity loans', 2),
      (dept_id, 'Underwriter', 'Evaluates loan applications for risk and compliance', 3)
    ON CONFLICT DO NOTHING;
  END IF;

  -- Credit Administration
  SELECT id INTO dept_id FROM departments WHERE slug = 'credit_administration';
  IF dept_id IS NOT NULL THEN
    INSERT INTO department_roles (department_id, name, description, display_order) VALUES
      (dept_id, 'Credit Analyst', 'Prepares credit memos and financial analysis', 0),
      (dept_id, 'Credit Administrator', 'Manages credit policy and loan documentation', 1),
      (dept_id, 'Loan Review Officer', 'Conducts independent credit risk reviews', 2),
      (dept_id, 'Chief Credit Officer', 'Oversees credit policy and approves large exposures', 3)
    ON CONFLICT DO NOTHING;
  END IF;

  -- Treasury & Cash Management
  SELECT id INTO dept_id FROM departments WHERE slug = 'treasury_cash_management';
  IF dept_id IS NOT NULL THEN
    INSERT INTO department_roles (department_id, name, description, display_order) VALUES
      (dept_id, 'Treasurer / CFO', 'Manages bank liquidity and investment portfolio', 0),
      (dept_id, 'ALM Analyst', 'Monitors asset-liability and interest rate risk', 1),
      (dept_id, 'Cash Management Officer', 'Manages commercial cash management services', 2),
      (dept_id, 'Investment Analyst', 'Analyzes and manages the investment securities portfolio', 3)
    ON CONFLICT DO NOTHING;
  END IF;

  -- Operations
  SELECT id INTO dept_id FROM departments WHERE slug = 'operations';
  IF dept_id IS NOT NULL THEN
    INSERT INTO department_roles (department_id, name, description, display_order) VALUES
      (dept_id, 'Operations Manager', 'Oversees deposit ops, wires, and back-office functions', 0),
      (dept_id, 'Deposit Operations Specialist', 'Processes deposits, ACH, and account maintenance', 1),
      (dept_id, 'Wire Transfer Specialist', 'Handles domestic and international wire processing', 2),
      (dept_id, 'Item Processing Clerk', 'Manages check clearing and exception items', 3)
    ON CONFLICT DO NOTHING;
  END IF;

  -- Compliance & BSA/AML
  SELECT id INTO dept_id FROM departments WHERE slug = 'compliance_bsa_aml';
  IF dept_id IS NOT NULL THEN
    INSERT INTO department_roles (department_id, name, description, display_order) VALUES
      (dept_id, 'Chief Compliance Officer', 'Leads regulatory compliance and examination readiness', 0),
      (dept_id, 'BSA Officer', 'Manages Bank Secrecy Act and AML program', 1),
      (dept_id, 'Compliance Analyst', 'Monitors regulatory changes and conducts compliance testing', 2),
      (dept_id, 'Fair Lending Officer', 'Ensures fair lending compliance and HMDA reporting', 3)
    ON CONFLICT DO NOTHING;
  END IF;

  -- Risk Management
  SELECT id INTO dept_id FROM departments WHERE slug = 'risk_management';
  IF dept_id IS NOT NULL THEN
    INSERT INTO department_roles (department_id, name, description, display_order) VALUES
      (dept_id, 'Chief Risk Officer', 'Oversees enterprise risk management framework', 0),
      (dept_id, 'Credit Risk Analyst', 'Analyzes credit risk trends and concentrations', 1),
      (dept_id, 'Internal Auditor', 'Conducts internal audits and control testing', 2),
      (dept_id, 'Vendor Risk Manager', 'Manages third-party risk assessments', 3)
    ON CONFLICT DO NOTHING;
  END IF;

  -- IT & Information Security
  SELECT id INTO dept_id FROM departments WHERE slug = 'it_information_security';
  IF dept_id IS NOT NULL THEN
    INSERT INTO department_roles (department_id, name, description, display_order) VALUES
      (dept_id, 'CTO / IT Director', 'Oversees technology strategy and infrastructure', 0),
      (dept_id, 'Information Security Officer', 'Manages cybersecurity program and incident response', 1),
      (dept_id, 'Systems Administrator', 'Maintains servers, networks, and core banking systems', 2),
      (dept_id, 'Digital Banking Manager', 'Manages online/mobile banking platforms', 3)
    ON CONFLICT DO NOTHING;
  END IF;

  -- Human Resources
  SELECT id INTO dept_id FROM departments WHERE slug = 'human_resources';
  IF dept_id IS NOT NULL THEN
    INSERT INTO department_roles (department_id, name, description, display_order) VALUES
      (dept_id, 'HR Director', 'Leads human resources strategy and operations', 0),
      (dept_id, 'Training & Development Manager', 'Manages employee training programs', 1),
      (dept_id, 'Recruiter', 'Handles talent acquisition and onboarding', 2),
      (dept_id, 'Benefits Administrator', 'Manages employee benefits and compensation', 3)
    ON CONFLICT DO NOTHING;
  END IF;

  -- Marketing & Business Development
  SELECT id INTO dept_id FROM departments WHERE slug = 'marketing_business_development';
  IF dept_id IS NOT NULL THEN
    INSERT INTO department_roles (department_id, name, description, display_order) VALUES
      (dept_id, 'Marketing Director', 'Leads brand strategy and marketing campaigns', 0),
      (dept_id, 'Digital Marketing Specialist', 'Manages SEO, social media, and digital campaigns', 1),
      (dept_id, 'Business Development Officer', 'Identifies growth opportunities and new markets', 2),
      (dept_id, 'Community Relations Manager', 'Manages CRA and community engagement programs', 3)
    ON CONFLICT DO NOTHING;
  END IF;

  -- Accounting & Finance
  SELECT id INTO dept_id FROM departments WHERE slug = 'accounting_finance';
  IF dept_id IS NOT NULL THEN
    INSERT INTO department_roles (department_id, name, description, display_order) VALUES
      (dept_id, 'Controller', 'Manages financial reporting and general ledger', 0),
      (dept_id, 'Staff Accountant', 'Handles daily accounting entries and reconciliations', 1),
      (dept_id, 'Financial Analyst', 'Prepares budgets, forecasts, and variance analysis', 2),
      (dept_id, 'Accounts Payable / Receivable Specialist', 'Processes payments and receivables', 3)
    ON CONFLICT DO NOTHING;
  END IF;

  -- Wealth Management & Trust
  SELECT id INTO dept_id FROM departments WHERE slug = 'wealth_management_trust';
  IF dept_id IS NOT NULL THEN
    INSERT INTO department_roles (department_id, name, description, display_order) VALUES
      (dept_id, 'Trust Officer', 'Administers trust accounts and fiduciary responsibilities', 0),
      (dept_id, 'Financial Advisor', 'Provides investment advice and financial planning', 1),
      (dept_id, 'Portfolio Manager', 'Manages investment portfolios for clients', 2),
      (dept_id, 'Wealth Management Associate', 'Supports client relationships and account servicing', 3)
    ON CONFLICT DO NOTHING;
  END IF;

  -- Executive & Leadership
  SELECT id INTO dept_id FROM departments WHERE slug = 'executive_leadership';
  IF dept_id IS NOT NULL THEN
    INSERT INTO department_roles (department_id, name, description, display_order) VALUES
      (dept_id, 'CEO / President', 'Overall bank leadership and strategic direction', 0),
      (dept_id, 'COO', 'Manages day-to-day operations and efficiency', 1),
      (dept_id, 'CFO', 'Oversees financial strategy and reporting', 2),
      (dept_id, 'Chief AI Officer', 'Leads AI strategy, adoption, and governance', 3),
      (dept_id, 'Board Director', 'Provides governance and strategic oversight', 4)
    ON CONFLICT DO NOTHING;
  END IF;
END $$;

-- ============================================================
-- 6. Add department_id to user_profiles
-- ============================================================
ALTER TABLE user_profiles
  ADD COLUMN IF NOT EXISTS department_id UUID REFERENCES departments(id);

CREATE INDEX IF NOT EXISTS idx_user_profiles_department ON user_profiles(department_id);

-- ============================================================
-- 7. Backfill department_id from existing line_of_business values
-- ============================================================
DO $$
BEGIN
  -- Map existing enum values to department rows
  UPDATE user_profiles up
  SET department_id = d.id
  FROM departments d
  WHERE up.line_of_business IS NOT NULL
    AND up.department_id IS NULL
    AND d.slug = up.line_of_business::text;
END $$;
