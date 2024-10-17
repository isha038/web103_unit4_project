import React, { useState, useEffect } from 'react';
import { createCar } from '../services/CarsAPI';
import { getFeaturesWithOptions } from '../services/FeaturesAPI';
import { calculateTotalPrice } from '../utilities/calcPrice';
import { isValidFeatureCombination } from '../utilities/validateFeatures';
import '../App.css';
import { useNavigate } from 'react-router-dom';

const CreateCar = () => {
  const [carName, setCarName] = useState('');
  const [features, setFeatures] = useState([]);
  const [selectedOptions, setSelectedOptions] = useState([]);
  const [totalPrice, setTotalPrice] = useState(0);
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchFeatures = async () => {
      const featuresData = await getFeaturesWithOptions();
      setFeatures(featuresData);
    };
    fetchFeatures();
  }, []);

  const handleOptionChange = (featureId, selectedOption) => {
    const updatedOptions = selectedOptions.filter(
      (option) => option.feature_id !== featureId
    );
    updatedOptions.push({
      feature_id: featureId,
      feature_option_id: selectedOption.id,
      option_name: selectedOption.option_name,
      price_modifier: selectedOption.price_modifier,
    });

    // Check for impossible combination
    const isValidCombination = isValidFeatureCombination(updatedOptions);
    if (!isValidCombination) {
      setErrorMessage('The selected combination of features(Green & Leather Interior) is not possible. Please choose different options.');
      return;
    } else {
      setErrorMessage('');
    }

    setSelectedOptions(updatedOptions);
    const newTotalPrice = calculateTotalPrice(updatedOptions);
    setTotalPrice(newTotalPrice);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (errorMessage) {
      alert('Please fix the errors before submitting.');
      return;
    }
    const newCar = {
      car_name: carName,
      selectedOptions: selectedOptions.map((option) => ({
        feature_option_id: option.feature_option_id,
      })),
    };
    await createCar(newCar);
    alert('Car created successfully!');
    navigate('/view-cars');
  };

  return (
    <div>
      <h1>Create a New Car</h1>
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
              onChange={(e) =>
                handleOptionChange(feature.id, {
                  id: feature.options.find(option => option.option_name === e.target.value)?.id,
                  feature_id: feature.id,
                  option_name: e.target.value,
                  price_modifier: parseInt(e.target.selectedOptions[0].dataset.priceModifier),
                })
              }
            >
              <option value="">Select {feature.feature_name.toLowerCase()}</option>
              {feature.options.map((option) => (
                <option key={option.id} value={option.option_name} data-price-modifier={option.price_modifier}>
                  {option.option_name} (+${option.price_modifier})
                </option>
              ))}
            </select>
          </div>
        ))}

        {errorMessage && <p className="error-message">{errorMessage}</p>}

        <p>Total Price: ${totalPrice}</p>

        <button type="submit">Create Car</button>
      </form>
    </div>
  );
};

export default CreateCar;
