import { pool } from '../config/database.js';

// Function to get all custom cars, including their selected options
export const getCustomItems = async (req, res) => {
  try {
    // Get all cars
    const carResult = await pool.query('SELECT * FROM CustomItem');
    const cars = carResult.rows;

    // For each car, get its selected options
    const carsWithFeatures = await Promise.all(
      cars.map(async (car) => {
        const featureResult = await pool.query(`
          SELECT f.feature_name, o.option_name, o.price_modifier
          FROM SelectedOptions so
          JOIN FeatureOptions o ON so.feature_option_id = o.id
          JOIN Features f ON o.feature_id = f.id
          WHERE so.car_id = $1
        `, [car.id]);

        return {
          ...car,
          features: featureResult.rows,  // Attach the features and options to the car
        };
      })
    );

    res.json(carsWithFeatures);
  } catch (error) {
    console.error('Error fetching custom cars:', error);
    res.status(500).json({ error: 'Error fetching custom cars' });
  }
};

// Function to create a new custom car and optionally add selected features and options
export const createCustomItem = async (req, res) => {
  const { car_name, selectedOptions } = req.body;  // Selected options are passed as an array
  
  try {
    // Create the car
    const carResult = await pool.query(
      'INSERT INTO CustomItem (car_name, total_price) VALUES ($1, 0) RETURNING *',
      [car_name]
    );
    const newCar = carResult.rows[0];
    const carId = newCar.id;

    // Add selected options if provided
    if (selectedOptions && selectedOptions.length > 0) {
      await Promise.all(
        selectedOptions.map(async (optionId) => {
          await pool.query(
            'INSERT INTO SelectedOptions (car_id, feature_option_id) VALUES ($1, $2)',
            [carId, optionId]
          );
        })
      );

      // Update total price after inserting options
      const totalPriceResult = await pool.query(`
        SELECT SUM(o.price_modifier) AS total_price 
        FROM SelectedOptions so 
        JOIN FeatureOptions o ON so.feature_option_id = o.id 
        WHERE so.car_id = $1
      `, [carId]);
      const totalPrice = totalPriceResult.rows[0].total_price || 0;

      // Update car total price
      await pool.query('UPDATE CustomItem SET total_price = $1 WHERE id = $2', [totalPrice, carId]);
    }

    // Return the newly created car along with the selected options
    res.status(201).json({ car: newCar, total_price: totalPrice || 0 });
  } catch (error) {
    console.error('Error creating custom car:', error);
    res.status(500).json({ error: 'Error creating custom car' });
  }
};

// Function to update a custom car's name, selected options, and total price
export const updateCustomItem = async (req, res) => {
  const { id } = req.params;
  const { car_name, selectedOptions } = req.body;

  try {
    // Update car name
    await pool.query('UPDATE CustomItem SET car_name = $1 WHERE id = $2', [car_name, id]);

    // Clear previous selected options and insert new ones
    await pool.query('DELETE FROM SelectedOptions WHERE car_id = $1', [id]);
    
    if (selectedOptions && selectedOptions.length > 0) {
      await Promise.all(
        selectedOptions.map(async (optionId) => {
          await pool.query(
            'INSERT INTO SelectedOptions (car_id, feature_option_id) VALUES ($1, $2)',
            [id, optionId]
          );
        })
      );

      // Update total price after inserting options
      const totalPriceResult = await pool.query(`
        SELECT SUM(o.price_modifier) AS total_price 
        FROM SelectedOptions so 
        JOIN FeatureOptions o ON so.feature_option_id = o.id 
        WHERE so.car_id = $1
      `, [id]);
      const totalPrice = totalPriceResult.rows[0].total_price || 0;

      // Update car total price
      await pool.query('UPDATE CustomItem SET total_price = $1 WHERE id = $2', [totalPrice, id]);

      res.json({ message: 'Custom car updated successfully', total_price: totalPrice });
    } else {
      res.json({ message: 'Custom car updated successfully, but no options selected' });
    }
  } catch (error) {
    console.error('Error updating custom car:', error);
    res.status(500).json({ error: 'Error updating custom car' });
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
