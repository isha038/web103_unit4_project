import React, { useEffect, useState } from 'react';
import { getAllCars, deleteCar } from '../services/CarsAPI';
import '../App.css';
import { Link } from 'react-router-dom';

const ViewCars = () => {
  const [cars, setCars] = useState([]);

  useEffect(() => {
    const fetchCars = async () => {
      const carsList = await getAllCars();
      setCars(carsList);
    };
    fetchCars();
  }, []);

  const handleDelete = async (carId) => {
    if (window.confirm('Are you sure you want to delete this car?')) {
      try {
        await deleteCar(carId);
        setCars(cars.filter((car) => car.id !== carId));
        alert('Car deleted successfully!');
      } catch (error) {
        console.error('Error deleting car:', error);
        alert('Failed to delete the car. Please try again.');
      }
    }
  };
  return (
    <div className="cars-container">
      {cars.map((car) => (
        <div key={car.id} className="car-card">
          <h2>{car.car_name}</h2>
          <p>Total Price: ${car.total_price}</p>
          <Link to={`/car-details/${car.id}`}>
            <button>View Details</button>
          </Link>
          <Link to={`/edit-car/${car.id}`}>
            <button>Edit</button>
          </Link>
          <button onClick={() => handleDelete(car.id)}>
            Delete
          </button>
        </div>
      ))}
    </div>
  );
};

export default ViewCars;
