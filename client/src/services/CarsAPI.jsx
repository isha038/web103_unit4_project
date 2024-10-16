const API_URL = '/api/custom-items';  // Base URL for your custom items API

// Get all cars
export const getAllCars = async () => {
  try {
    const response = await fetch(API_URL);
    if (!response.ok) {
      throw new Error('Failed to fetch cars');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching cars:', error);
    return [];
  }
};

// Get a single car by ID
export const getCar = async (id) => {
  try {
    const response = await fetch(`${API_URL}/${id}`);
    if (!response.ok) {
      throw new Error('Failed to fetch car');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching car:', error);
  }
};

// Create a new car
export const createCar = async (carData) => {
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(carData),
    });
    if (!response.ok) {
      throw new Error('Failed to create car');
    }
    return await response.json();
  } catch (error) {
    console.error('Error creating car:', error);
  }
};

// Update a car by ID
export const updateCar = async (id, carData) => {
  try {
    const response = await fetch(`${API_URL}/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(carData),
    });
    if (!response.ok) {
      throw new Error('Failed to update car');
    }
    return await response.json();
  } catch (error) {
    console.error('Error updating car:', error);
  }
};

// Delete a car by ID
export const deleteCar = async (id) => {
  try {
    const response = await fetch(`${API_URL}/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error('Failed to delete car');
    }
    return await response.json();
  } catch (error) {
    console.error('Error deleting car:', error);
  }
};
