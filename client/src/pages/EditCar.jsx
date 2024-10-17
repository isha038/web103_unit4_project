import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getCar, updateCar, deleteCar } from '../services/CarsAPI';
import { getFeaturesWithOptions } from '../services/FeaturesAPI';
import { calculateTotalPrice } from '../utilities/calcPrice';
import { isValidFeatureCombination } from '../utilities/validateFeatures';
import '../App.css';

const EditCar = () => {
  const { id } = useParams(); // Get car ID from the URL
  const navigate = useNavigate();
  const [carName, setCarName] = useState('');
  const [features, setFeatures] = useState([]);
  const [selectedOptions, setSelectedOptions] = useState([]);
  const [totalPrice, setTotalPrice] = useState(0);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const fetchCarAndFeatures = async () => {
      try {
        const carData = await getCar(id);
        if (!carData) {
          throw new Error('Car data is not available');
        }
        setCarName(carData.car_name);
        const initialOptions = carData.selectedOptions.map(option => ({
          feature_id: option.feature_id,
          feature_option_id: option.feature_option_id,
          option_name: option.option_name,
          price_modifier: Number(option.price_modifier), // Make sure price_modifier is treated as a number
        }));
        setSelectedOptions(initialOptions);
        setTotalPrice(calculateTotalPrice(initialOptions)); 
        setSelectedOptions([]);
        

        const featuresData = await getFeaturesWithOptions();
        setFeatures(featuresData);
      } catch (error) {
        console.error('Error fetching car or features:', error);
        setErrorMessage('Unable to load car details. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    fetchCarAndFeatures();
  }, [id]);

  const handleOptionChange = (featureId, selectedOption) => {
    
    // Remove previous selected option for the given feature
    const updatedOptions = selectedOptions.filter(
      (option) => option.feature_id !== featureId
    );

    // Add the newly selected option for that feature
    updatedOptions.push({
      feature_id: featureId,
      feature_option_id: selectedOption.feature_option_id,
      option_name: selectedOption.option_name,
      price_modifier: parseInt(selectedOption.price_modifier),
    });
    

    // Update state with the newly selected options
    setSelectedOptions(updatedOptions);

    // Recalculate the total price with the updated selected options
    const newTotalPrice = calculateTotalPrice(updatedOptions);
    setTotalPrice(newTotalPrice);
    
    // Validate the selected combination
    if (!isValidFeatureCombination(updatedOptions)) {
      setErrorMessage('The selected combination of features is not possible. Please choose different options.');
    } else {
      setErrorMessage('');
    }
   
  console.log('Updated Selected Options:', updatedOptions);
  console.log('Validation Result:', isValidFeatureCombination(updatedOptions));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isValidFeatureCombination(selectedOptions)) {
      setErrorMessage('The selected combination of features is not possible. Please choose different options.');
      return;
    }

    // Only pass the feature_option_id to the backend, we don't need to pass all option details
    const updatedCar = {
      car_name: carName,
      selectedOptions: selectedOptions.map((option) => ({
        feature_option_id: option.feature_option_id,
      })),
    };

    try {
      await updateCar(id, updatedCar);
      alert('Car updated successfully!');
      navigate('/view-cars');
    } catch (error) {
      console.error('Error updating car:', error);
      setErrorMessage('Failed to update car. Please try again.');
    }
  };

  const handleDelete = async () => {
    try {
      await deleteCar(id);
      alert('Car deleted successfully!');
      navigate('/view-cars');
    } catch (error) {
      console.error('Error deleting car:', error);
      setErrorMessage('Failed to delete car. Please try again.');
    }
  };

  if (loading) {
    return <p>Loading...</p>;
  }

  return (
    <div>
      <h1>Edit Car: {carName}</h1>
      <form onSubmit={handleSubmit}>
        <label>Car Name:</label>
        <input
          type="text"
          value={carName}
          onChange={(e) => setCarName(e.target.value)}
          required
        />

        {features.map((feature) => (
          <div key={feature.id}>
            <label>{feature.feature_name}:</label>
            <select
              value={
                selectedOptions.find((option) => option.feature_id === feature.id)?.feature_option_id || ''
              }
              onChange={(e) =>
                handleOptionChange(feature.id, {
                  feature_option_id: parseInt(e.target.value),
                  option_name: e.target.selectedOptions[0].text,
                  price_modifier: parseFloat(e.target.selectedOptions[0].dataset.priceModifier),
                })
              }
            >
              <option value="">Select {feature.feature_name.toLowerCase()}</option>
              {feature.options.map((option) => (
                <option key={option.id} value={option.id} data-price-modifier={option.price_modifier}>
                  {option.option_name} (+${option.price_modifier})
                </option>
              ))}
            </select>
          </div>
        ))}

        {errorMessage && <p className="error-message">{errorMessage}</p>}

        <p>Total Price: ${totalPrice}</p>

        <button type="submit">Update Car</button>
      </form>

      <button onClick={handleDelete} className="delete-button">Delete Car</button>
    </div>
  );
};

export default EditCar;
