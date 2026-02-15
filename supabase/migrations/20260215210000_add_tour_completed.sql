-- Feature 3: Add tour_completed flag to user profiles
ALTER TABLE user_profiles
ADD COLUMN tour_completed BOOLEAN DEFAULT false;
