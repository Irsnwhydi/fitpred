DROP TABLE IF EXISTS prediction_results CASCADE;
DROP TABLE IF EXISTS health_inputs CASCADE;
DROP TABLE IF EXISTS user_profiles CASCADE;
DROP TABLE IF EXISTS users CASCADE;

CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('user')),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE user_profiles (
    id SERIAL PRIMARY KEY,
    user_id INTEGER UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    full_name VARCHAR(255),
    date_of_birth DATE,
    gender VARCHAR(10) CHECK (gender IN ('Male', 'Female', 'Other')),
    phone VARCHAR(20),
    address TEXT,
    city VARCHAR(100),
    country VARCHAR(100) DEFAULT 'Indonesia',
    avatar_url TEXT,
    bio TEXT,
    height_cm DECIMAL(5,2),
    weight_kg DECIMAL(5,2),
    blood_type VARCHAR(5),
    activity_level VARCHAR(50),
    dietary_preference VARCHAR(50),
    health_goals TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE health_inputs (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    age INTEGER,
    height_cm DECIMAL(5,2),
    weight_kg DECIMAL(5,2),
    blood_pressure_systolic INTEGER,
    blood_pressure_diastolic INTEGER,
    cholesterol_level DECIMAL(6,2),
    blood_sugar_level DECIMAL(6,2),
    daily_steps INTEGER,
    exercise_frequency INTEGER,
    sleep_hours DECIMAL(4,2),
    caloric_intake DECIMAL(8,2),
    protein_intake DECIMAL(8,2),
    carbohydrate_intake DECIMAL(8,2),
    fat_intake DECIMAL(8,2),
    gender_male BOOLEAN DEFAULT false,
    gender_other BOOLEAN DEFAULT false,
    chronic_disease_heart BOOLEAN DEFAULT false,
    chronic_disease_hypertension BOOLEAN DEFAULT false,
    chronic_disease_none BOOLEAN DEFAULT true,
    chronic_disease_obesity BOOLEAN DEFAULT false,
    genetic_risk_factor_yes BOOLEAN DEFAULT false,
    allergies_lactose BOOLEAN DEFAULT false,
    allergies_none BOOLEAN DEFAULT true,
    allergies_nut BOOLEAN DEFAULT false,
    alcohol_consumption_yes BOOLEAN DEFAULT false,
    smoking_habit_yes BOOLEAN DEFAULT false,
    dietary_habits_regular BOOLEAN DEFAULT true,
    dietary_habits_vegan BOOLEAN DEFAULT false,
    dietary_habits_vegetarian BOOLEAN DEFAULT false,
    preferred_cuisine_indian BOOLEAN DEFAULT false,
    preferred_cuisine_mediterranean BOOLEAN DEFAULT false,
    preferred_cuisine_western BOOLEAN DEFAULT false,
    food_aversions_salty BOOLEAN DEFAULT false,
    food_aversions_spicy BOOLEAN DEFAULT false,
    food_aversions_sweet BOOLEAN DEFAULT false,
    recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE prediction_results (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    health_input_id INTEGER REFERENCES health_inputs(id) ON DELETE SET NULL,
    predicted_class INTEGER,
    recommended_meal_plan VARCHAR(100),
    confidence_score DECIMAL(5,2),
    predicted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_health_inputs_user_id ON health_inputs(user_id);
CREATE INDEX idx_prediction_results_user_id ON prediction_results(user_id);
CREATE INDEX idx_health_inputs_recorded_at ON health_inputs(recorded_at);

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = CURRENT_TIMESTAMP; RETURN NEW; END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON user_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

COMMIT;
