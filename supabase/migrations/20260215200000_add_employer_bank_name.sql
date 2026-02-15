-- Feature 1: Add employer bank name to user profiles
ALTER TABLE user_profiles
ADD COLUMN employer_bank_name TEXT;
