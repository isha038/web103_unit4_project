import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getCar, deleteCar } from '../services/CarsAPI';
import '../App.css';

const CarDetails = () => {
  const { id } = useParams(); // Get car ID from the URL
  const navigate = useNavigate();
  const [car, setCar] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [totalPrice, setTotalPrice] = useState(0);

  useEffect(() => {
    const fetchCar = async () => {
      try {
        const carData = await getCar(id);
        setCar(carData);

        // Calculate total price from selected options
        const calculatedTotalPrice = carData.selectedOptions?.reduce(
          (acc, option) => acc + parseFloat(option.price_modifier),
          0
        ) || 0;
        setTotalPrice(calculatedTotalPrice);
      } catch (error) {
        console.error('Error fetching car:', error);
        setErrorMessage('Unable to load car details. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    fetchCar();
  }, [id]);

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this car?')) {
      try {
        await deleteCar(id);
        alert('Car deleted successfully!');
        navigate('/view-cars');
      } catch (error) {
        console.error('Error deleting car:', error);
        alert('Failed to delete the car. Please try again.');
      }
    }
  };

  const handleEdit = () => {
    navigate(`/edit-car/${id}`);
  };

  if (loading) {
    return <p>Loading...</p>;
  }

  if (errorMessage) {
    return <p>{errorMessage}</p>;
  }

  return (
    <div className="car-details-card">
      <h1>Car Details: {car?.car_name}</h1>
      <p>Total Price: ${totalPrice}</p>
      <h2>Selected Features:</h2>
      <ul>
        {car?.selectedOptions?.map((option, index) => (
          <li key={index}>
            {option.option_name} (+${option.price_modifier})
          </li>
        ))}
      </ul>
      <div className="button-group-horizontal">
        <button onClick={handleEdit}>Edit</button>
        <button onClick={handleDelete}>Delete</button>
      </div>
    </div>
  );
};

export default CarDetails;
