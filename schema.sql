-- schema.sql
CREATE TABLE help_posts (
  id SERIAL PRIMARY KEY,
  type VARCHAR(10) NOT NULL,
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  location TEXT NOT NULL,
  description TEXT NOT NULL,
  contact_name TEXT,
  contact_phone TEXT,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  password TEXT
);





-- sample_data.sql
INSERT INTO help_posts (type, title, category, location, description, contact_name, contact_phone)
VALUES
('request', 'Need food in Sector 15', 'Food', 'Sector 15, Chandigarh', 'Family stranded without food', 'Rahul Sharma', '9876543210'),
('offer', 'Offering shelter for 2 people', 'Shelter', 'Mohali', '2 rooms available for flood-affected families', 'Priya Kaur', '9811122233');