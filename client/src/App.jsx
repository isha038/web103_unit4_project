import React from 'react';
import { useRoutes } from 'react-router-dom';
import Navigation from './components/Navigation';
import ViewCars from './pages/ViewCars';
import EditCar from './pages/EditCar';
import CreateCar from './pages/CreateCar';
import CarDetails from './pages/CarDetails';
import './App.css';

const App = () => {
  let element = useRoutes([
    {
      path: '/create-car',
      element: <CreateCar title='BOLT BUCKET | Customize' />
    },
    {
      path: '/car-details/:id',
      element: <CarDetails title='BOLT BUCKET | View' />
    },
    {
      path: '/edit-car/:id',
      element: <EditCar title='BOLT BUCKET | Edit' />
    },
    {
      path: '/view-cars',
      element: <ViewCars title='BOLT BUCKET | Custom Cars' />
    },
    {
      path: '/',
      element: <ViewCars title='BOLT BUCKET | Custom Cars' />
    }
  ]);

  return (
    <div className='app'>
      <Navigation />
      {element}
    </div>
  );
}

export default App;
