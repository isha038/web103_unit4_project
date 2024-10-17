const API_URL = '/api/features-options';

// Get all features and their available options
export const getFeaturesWithOptions = async () => {
  try {
    const response = await fetch(API_URL);
    if (!response.ok) {
      throw new Error('Failed to fetch features and options');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching features and options:', error);
    return [];
  }
};
