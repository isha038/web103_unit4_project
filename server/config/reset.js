import { pool } from './database.js';

// Table for storing the car with basic information (name and total price)
const createCustomItemTableQuery = `
  CREATE TABLE IF NOT EXISTS CustomItem (
    id SERIAL PRIMARY KEY,
    car_name VARCHAR(100) NOT NULL,
    total_price NUMERIC NOT NULL DEFAULT 0
  )
`;

// Table for storing different features like 'Color', 'Wheels', 'Interior', etc.
const createFeaturesTableQuery = `
  CREATE TABLE IF NOT EXISTS Features (
    id SERIAL PRIMARY KEY,
    feature_name VARCHAR(100) NOT NULL,
    item_id INT REFERENCES CustomItem(id) ON DELETE CASCADE
  )
`;

// Table for storing available options for each feature, like 'Red', 'Blue', 'Leather Interior', etc.
const createFeatureOptionsTableQuery = `
  CREATE TABLE IF NOT EXISTS FeatureOptions (
    id SERIAL PRIMARY KEY,
    option_name VARCHAR(100) NOT NULL,
    feature_id INT REFERENCES Features(id) ON DELETE CASCADE,
    price_modifier NUMERIC NOT NULL DEFAULT 0
  )
`;

// Table for storing the selected options by the user for each car
const createSelectedOptionsTableQuery = `
  CREATE TABLE IF NOT EXISTS SelectedOptions (
    id SERIAL PRIMARY KEY,
    car_id INT REFERENCES CustomItem(id) ON DELETE CASCADE,
    feature_option_id INT REFERENCES FeatureOptions(id) ON DELETE CASCADE
  )
`;

// Function to seed features and options
async function seedFeaturesAndOptions() {
  try {
    // Insert features (like 'Color', 'Wheels', 'Interior')
    const featureResults = await pool.query(`
      INSERT INTO Features (feature_name) 
      VALUES 
      ('Color'),
      ('Wheels'),
      ('Interior')
      RETURNING id
    `);

    const colorFeatureId = featureResults.rows[0].id;
    const wheelsFeatureId = featureResults.rows[1].id;
    const interiorFeatureId = featureResults.rows[2].id;

    // Insert options for 'Color'
    await pool.query(`
      INSERT INTO FeatureOptions (option_name, feature_id, price_modifier) 
      VALUES 
      ('Red', $1, 500),
      ('Blue', $1, 400),
      ('Green', $1, 450)
    `, [colorFeatureId]);

    // Insert options for 'Wheels'
    await pool.query(`
      INSERT INTO FeatureOptions (option_name, feature_id, price_modifier) 
      VALUES 
      ('18-inch Wheels', $1, 800),
      ('20-inch Wheels', $1, 1000)
    `, [wheelsFeatureId]);

    // Insert options for 'Interior'
    await pool.query(`
      INSERT INTO FeatureOptions (option_name, feature_id, price_modifier) 
      VALUES 
      ('Leather Interior', $1, 1200),
      ('Fabric Interior', $1, 600)
    `, [interiorFeatureId]);

    console.log('Features and options seeded successfully.');
  } catch (error) {
    console.error('Error seeding features and options:', error);
  }
}

async function resetDatabase() {
  try {
    // Create the tables
    await pool.query(createCustomItemTableQuery);
    console.log('CustomItem table created successfully.');

    await pool.query(createFeaturesTableQuery);
    console.log('Features table created successfully.');

    await pool.query(createFeatureOptionsTableQuery);
    console.log('FeatureOptions table created successfully.');

    await pool.query(createSelectedOptionsTableQuery);
    console.log('SelectedOptions table created successfully.');

    // Seed the features and their options
    await seedFeaturesAndOptions();
  } catch (error) {
    console.error('Error creating tables or seeding data:', error);
  } finally {
    pool.end();
  }
}

resetDatabase();
