-- Seed Parallon/HCA Healthcare departments for the healthcare industry
-- This replaces any existing banking-centric departments for healthcare orgs

-- First, ensure the healthcare industry exists
INSERT INTO industries (slug, name, is_active, display_order)
VALUES ('healthcare', 'Healthcare', true, 1)
ON CONFLICT (slug) DO NOTHING;

-- Get the healthcare industry ID
DO $$
DECLARE
  v_industry_id UUID;
BEGIN
  SELECT id INTO v_industry_id FROM industries WHERE slug = 'healthcare';

  IF v_industry_id IS NULL THEN
    RAISE NOTICE 'Healthcare industry not found, skipping department seed';
    RETURN;
  END IF;

  -- Insert Parallon/HCA departments (skip if slug already exists for this industry)
  INSERT INTO departments (industry_id, slug, name, description, icon, is_active, display_order)
  VALUES
    (v_industry_id, 'revenue_cycle_operations', 'Revenue Cycle Operations', 'End-to-end revenue cycle management, billing operations, and financial performance', 'Receipt', true, 1),
    (v_industry_id, 'patient_access_services', 'Patient Access Services', 'Patient registration, scheduling, insurance verification, and financial clearance', 'UserCheck', true, 2),
    (v_industry_id, 'health_information_management', 'Health Information Management', 'Medical coding, clinical documentation improvement, HIM operations, and data integrity', 'FileText', true, 3),
    (v_industry_id, 'claims_denials_management', 'Claims & Denials Management', 'Claims submission, denial prevention, appeals, and payer relations', 'ShieldCheck', true, 4),
    (v_industry_id, 'patient_financial_services', 'Patient Financial Services', 'Patient billing, collections, financial counseling, and payment plans', 'Wallet', true, 5),
    (v_industry_id, 'finance_accounting', 'Finance & Accounting', 'Financial reporting, general ledger, budgeting, cost accounting, and reimbursement analysis', 'Calculator', true, 6),
    (v_industry_id, 'supply_chain_management', 'Supply Chain Management', 'Procurement, inventory management, vendor relations, and logistics', 'Package', true, 7),
    (v_industry_id, 'clinical_operations', 'Clinical Operations', 'Patient care delivery, clinical workflows, care coordination, and operational efficiency', 'Stethoscope', true, 8),
    (v_industry_id, 'information_technology', 'Information Technology', 'EHR systems, health data analytics, infrastructure, cybersecurity, and digital health', 'Monitor', true, 9),
    (v_industry_id, 'compliance_audit', 'Compliance & Audit', 'HIPAA compliance, regulatory audits, internal controls, and risk assessments', 'Lock', true, 10),
    (v_industry_id, 'human_resources', 'Human Resources', 'Recruitment, retention, training, workforce planning, and employee engagement', 'UserPlus', true, 11),
    (v_industry_id, 'quality_performance_improvement', 'Quality & Performance Improvement', 'Quality metrics, process improvement, accreditation, and performance analytics', 'TrendingUp', true, 12)
  ON CONFLICT (industry_id, slug) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    display_order = EXCLUDED.display_order;

  -- Seed common roles for each department
  -- Revenue Cycle Operations
  INSERT INTO department_roles (department_id, name, description, display_order)
  SELECT d.id, r.name, r.description, r.display_order
  FROM departments d
  CROSS JOIN (VALUES
    ('Revenue Cycle Director', 'Oversees revenue cycle operations and performance', 1),
    ('Revenue Cycle Analyst', 'Analyzes revenue cycle data and identifies improvement opportunities', 2),
    ('Billing Supervisor', 'Manages billing team and ensures accurate claim submission', 3),
    ('Revenue Integrity Specialist', 'Ensures charge capture accuracy and compliance', 4)
  ) AS r(name, description, display_order)
  WHERE d.slug = 'revenue_cycle_operations' AND d.industry_id = v_industry_id
  AND NOT EXISTS (SELECT 1 FROM department_roles dr WHERE dr.department_id = d.id AND dr.name = r.name);

  -- Patient Access Services
  INSERT INTO department_roles (department_id, name, description, display_order)
  SELECT d.id, r.name, r.description, r.display_order
  FROM departments d
  CROSS JOIN (VALUES
    ('Patient Access Manager', 'Manages registration and financial clearance teams', 1),
    ('Registration Specialist', 'Handles patient registration and demographic verification', 2),
    ('Insurance Verification Specialist', 'Verifies insurance eligibility and obtains authorizations', 3),
    ('Financial Counselor', 'Assists patients with financial options and payment arrangements', 4)
  ) AS r(name, description, display_order)
  WHERE d.slug = 'patient_access_services' AND d.industry_id = v_industry_id
  AND NOT EXISTS (SELECT 1 FROM department_roles dr WHERE dr.department_id = d.id AND dr.name = r.name);

  -- Health Information Management
  INSERT INTO department_roles (department_id, name, description, display_order)
  SELECT d.id, r.name, r.description, r.display_order
  FROM departments d
  CROSS JOIN (VALUES
    ('HIM Director', 'Oversees coding, CDI, and health information operations', 1),
    ('Medical Coder', 'Assigns diagnosis and procedure codes for claims', 2),
    ('CDI Specialist', 'Improves clinical documentation for accurate coding', 3),
    ('HIM Analyst', 'Manages health data integrity and reporting', 4)
  ) AS r(name, description, display_order)
  WHERE d.slug = 'health_information_management' AND d.industry_id = v_industry_id
  AND NOT EXISTS (SELECT 1 FROM department_roles dr WHERE dr.department_id = d.id AND dr.name = r.name);

  -- Claims & Denials Management
  INSERT INTO department_roles (department_id, name, description, display_order)
  SELECT d.id, r.name, r.description, r.display_order
  FROM departments d
  CROSS JOIN (VALUES
    ('Denials Manager', 'Manages denial prevention and appeals processes', 1),
    ('Claims Analyst', 'Reviews and resolves claim issues and rejections', 2),
    ('Appeals Specialist', 'Drafts and submits appeals for denied claims', 3),
    ('Payer Relations Coordinator', 'Manages relationships with insurance payers', 4)
  ) AS r(name, description, display_order)
  WHERE d.slug = 'claims_denials_management' AND d.industry_id = v_industry_id
  AND NOT EXISTS (SELECT 1 FROM department_roles dr WHERE dr.department_id = d.id AND dr.name = r.name);

  -- Patient Financial Services
  INSERT INTO department_roles (department_id, name, description, display_order)
  SELECT d.id, r.name, r.description, r.display_order
  FROM departments d
  CROSS JOIN (VALUES
    ('Patient Financial Services Manager', 'Oversees patient billing and collections', 1),
    ('Patient Account Representative', 'Manages patient accounts and payment inquiries', 2),
    ('Collections Specialist', 'Handles account follow-up and collections', 3)
  ) AS r(name, description, display_order)
  WHERE d.slug = 'patient_financial_services' AND d.industry_id = v_industry_id
  AND NOT EXISTS (SELECT 1 FROM department_roles dr WHERE dr.department_id = d.id AND dr.name = r.name);

  -- Finance & Accounting
  INSERT INTO department_roles (department_id, name, description, display_order)
  SELECT d.id, r.name, r.description, r.display_order
  FROM departments d
  CROSS JOIN (VALUES
    ('Finance Director', 'Oversees financial planning, reporting, and analysis', 1),
    ('Staff Accountant', 'Manages general ledger entries and reconciliations', 2),
    ('Budget Analyst', 'Supports budgeting, forecasting, and variance analysis', 3)
  ) AS r(name, description, display_order)
  WHERE d.slug = 'finance_accounting' AND d.industry_id = v_industry_id
  AND NOT EXISTS (SELECT 1 FROM department_roles dr WHERE dr.department_id = d.id AND dr.name = r.name);

  -- Supply Chain Management
  INSERT INTO department_roles (department_id, name, description, display_order)
  SELECT d.id, r.name, r.description, r.display_order
  FROM departments d
  CROSS JOIN (VALUES
    ('Supply Chain Director', 'Oversees procurement and logistics operations', 1),
    ('Procurement Specialist', 'Manages vendor relations and purchasing', 2),
    ('Inventory Analyst', 'Monitors inventory levels and optimizes stock', 3)
  ) AS r(name, description, display_order)
  WHERE d.slug = 'supply_chain_management' AND d.industry_id = v_industry_id
  AND NOT EXISTS (SELECT 1 FROM department_roles dr WHERE dr.department_id = d.id AND dr.name = r.name);

  -- Clinical Operations
  INSERT INTO department_roles (department_id, name, description, display_order)
  SELECT d.id, r.name, r.description, r.display_order
  FROM departments d
  CROSS JOIN (VALUES
    ('Clinical Operations Director', 'Oversees patient care delivery and clinical workflows', 1),
    ('Nurse Manager', 'Manages nursing staff and clinical unit operations', 2),
    ('Care Coordinator', 'Coordinates patient care across departments', 3),
    ('Clinical Analyst', 'Analyzes clinical data for quality and efficiency', 4)
  ) AS r(name, description, display_order)
  WHERE d.slug = 'clinical_operations' AND d.industry_id = v_industry_id
  AND NOT EXISTS (SELECT 1 FROM department_roles dr WHERE dr.department_id = d.id AND dr.name = r.name);

  -- Information Technology
  INSERT INTO department_roles (department_id, name, description, display_order)
  SELECT d.id, r.name, r.description, r.display_order
  FROM departments d
  CROSS JOIN (VALUES
    ('IT Director', 'Oversees technology infrastructure and digital health', 1),
    ('EHR Analyst', 'Manages EHR configuration, optimization, and support', 2),
    ('Data Analyst', 'Develops reports and analyzes health data', 3),
    ('Cybersecurity Specialist', 'Manages information security and compliance', 4)
  ) AS r(name, description, display_order)
  WHERE d.slug = 'information_technology' AND d.industry_id = v_industry_id
  AND NOT EXISTS (SELECT 1 FROM department_roles dr WHERE dr.department_id = d.id AND dr.name = r.name);

  -- Compliance & Audit
  INSERT INTO department_roles (department_id, name, description, display_order)
  SELECT d.id, r.name, r.description, r.display_order
  FROM departments d
  CROSS JOIN (VALUES
    ('Compliance Officer', 'Leads compliance programs and regulatory oversight', 1),
    ('Internal Auditor', 'Conducts audits and assesses internal controls', 2),
    ('Privacy Analyst', 'Manages HIPAA privacy compliance and investigations', 3)
  ) AS r(name, description, display_order)
  WHERE d.slug = 'compliance_audit' AND d.industry_id = v_industry_id
  AND NOT EXISTS (SELECT 1 FROM department_roles dr WHERE dr.department_id = d.id AND dr.name = r.name);

  -- Human Resources
  INSERT INTO department_roles (department_id, name, description, display_order)
  SELECT d.id, r.name, r.description, r.display_order
  FROM departments d
  CROSS JOIN (VALUES
    ('HR Director', 'Oversees human resources and workforce development', 1),
    ('Recruiter', 'Manages talent acquisition and hiring', 2),
    ('Training Coordinator', 'Develops and delivers employee training programs', 3),
    ('HR Business Partner', 'Supports business units with HR strategy and operations', 4)
  ) AS r(name, description, display_order)
  WHERE d.slug = 'human_resources' AND d.industry_id = v_industry_id
  AND NOT EXISTS (SELECT 1 FROM department_roles dr WHERE dr.department_id = d.id AND dr.name = r.name);

  -- Quality & Performance Improvement
  INSERT INTO department_roles (department_id, name, description, display_order)
  SELECT d.id, r.name, r.description, r.display_order
  FROM departments d
  CROSS JOIN (VALUES
    ('Quality Director', 'Oversees quality improvement and accreditation', 1),
    ('Performance Improvement Specialist', 'Leads process improvement initiatives', 2),
    ('Quality Data Analyst', 'Analyzes quality metrics and outcomes data', 3)
  ) AS r(name, description, display_order)
  WHERE d.slug = 'quality_performance_improvement' AND d.industry_id = v_industry_id
  AND NOT EXISTS (SELECT 1 FROM department_roles dr WHERE dr.department_id = d.id AND dr.name = r.name);

END $$;
