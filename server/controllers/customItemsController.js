import { pool } from '../config/database.js';

// Utility function to calculate total price of a car
const calculateTotalPriceForCar = async (carId) => {
  const priceResult = await pool.query(`
    SELECT SUM(o.price_modifier) AS total_price 
    FROM SelectedOptions so 
    JOIN FeatureOptions o ON so.feature_option_id = o.id 
    WHERE so.car_id = $1
  `, [carId]);
  return priceResult.rows[0].total_price || 0;
};

// Function to create a new custom car with all customizable options
export const createCustomItem = async (req, res) => {
  const { car_name, selectedOptions } = req.body;

  try {
    // Create the car in CustomItem table
    const carResult = await pool.query(
      'INSERT INTO CustomItem (car_name) VALUES ($1) RETURNING *',
      [car_name]
    );
    const newCar = carResult.rows[0];
    const carId = newCar.id;

    // Insert selected options for the new car into SelectedOptions table
    await Promise.all(
      selectedOptions.map(async (option) => {
        console.log("Inserting option:", option);
        await pool.query(
          'INSERT INTO SelectedOptions (car_id, feature_option_id) VALUES ($1, $2)',
          [carId, option.feature_option_id]
        );
      })
    );

    // Calculate total price after inserting options
    const totalPrice = await calculateTotalPriceForCar(carId);

    res.status(201).json({ car: newCar, total_price: totalPrice });
  } catch (error) {
    console.error('Error creating custom car:', error);
    res.status(500).json({ error: 'Error creating custom car' });
  }
};

// Function to update a custom car's details and selected options
export const updateCustomItem = async (req, res) => {
  const { id } = req.params;
  const { car_name, selectedOptions } = req.body;

  try {
    // Start a transaction
    await pool.query('BEGIN');

    // Update car name
    await pool.query('UPDATE CustomItem SET car_name = $1 WHERE id = $2', [car_name, id]);

    // Clear previous selected options for the car
    const deleteResult = await pool.query('DELETE FROM SelectedOptions WHERE car_id = $1', [id]);
    console.log(`Deleted rows: ${deleteResult.rowCount}`);
    if (deleteResult.rowCount === 0) {
      console.warn(`Warning: No rows were deleted for car_id ${id}. Check if car_id is correct.`);
    }

    // Insert updated selected options
    console.log('Inserting new selected options for car ID:', id);
    for (let option of selectedOptions) {
      console.log('Inserting option:', option);
      await pool.query(
        'INSERT INTO SelectedOptions (car_id, feature_option_id) VALUES ($1, $2)',
        [id, option.feature_option_id]
      );
    }

    // Commit the transaction
    await pool.query('COMMIT');

    res.json({ message: 'Custom car updated successfully' });
  } catch (error) {
    // Rollback in case of an error
    await pool.query('ROLLBACK');
    console.error('Error updating custom car:', error);
    res.status(500).json({ error: 'Error updating custom car' });
  }
};
// Function to get all custom cars along with their selected options
export const getCustomItems = async (req, res) => {
  try {
    const carResult = await pool.query('SELECT * FROM CustomItem');
    const cars = carResult.rows;

    // For each car, get its selected options and calculate total price
    const carsWithFeatures = await Promise.all(
      cars.map(async (car) => {
        const featureResult = await pool.query(`
          SELECT f.feature_name, o.option_name, o.price_modifier
          FROM SelectedOptions so
          JOIN FeatureOptions o ON so.feature_option_id = o.id
          JOIN Features f ON o.feature_id = f.id
          WHERE so.car_id = $1
        `, [car.id]);

        const totalPrice = await calculateTotalPriceForCar(car.id);

        return {
          ...car,
          features: featureResult.rows,
          total_price: totalPrice,
        };
      })
    );

    res.json(carsWithFeatures);
  } catch (error) {
    console.error('Error fetching custom cars:', error);
    res.status(500).json({ error: 'Error fetching custom cars' });
  }
};

// Function to get a single custom car by ID
export const getCustomItemById = async (req, res) => {
  const { id } = req.params;

  try {
    const carResult = await pool.query('SELECT * FROM CustomItem WHERE id = $1', [id]);
    const car = carResult.rows[0];

    if (!car) {
      return res.status(404).json({ error: 'Car not found' });
    }

    const selectedOptionsResult = await pool.query(`
      SELECT so.*, fo.option_name, fo.price_modifier
      FROM SelectedOptions so
      JOIN FeatureOptions fo ON so.feature_option_id = fo.id
      WHERE so.car_id = $1
    `, [id]);

    car.selectedOptions = selectedOptionsResult.rows;

    res.json(car);
  } catch (error) {
    console.error('Error fetching custom car:', error);
    res.status(500).json({ error: 'Error fetching custom car' });
  }
};


// Function to delete a custom car and its selected options
export const deleteCustomItem = async (req, res) => {
  const { id } = req.params;

  try {
    // Delete selected options and then delete the car
    await pool.query('DELETE FROM SelectedOptions WHERE car_id = $1', [id]);
    await pool.query('DELETE FROM CustomItem WHERE id = $1', [id]);

    res.json({ message: 'Custom car deleted successfully' });
  } catch (error) {
    console.error('Error deleting custom car:', error);
    res.status(500).json({ error: 'Error deleting custom car' });
  }
};

// Function to get all features along with their options
export const getFeaturesWithOptions = async (req, res) => {
  try {
    // Get all features
    const featuresResult = await pool.query('SELECT * FROM Features');
    const features = featuresResult.rows;

    // For each feature, get its available options
    const featuresWithOptions = await Promise.all(
      features.map(async (feature) => {
        const optionsResult = await pool.query(
          'SELECT * FROM FeatureOptions WHERE feature_id = $1',
          [feature.id]
        );
        return {
          ...feature,
          options: optionsResult.rows,
        };
      })
    );

    res.json(featuresWithOptions);
  } catch (error) {
    console.error('Error fetching features and options:', error);
    res.status(500).json({ error: 'Error fetching features and options' });
  }
};
