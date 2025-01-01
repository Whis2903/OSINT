// filepath: /C:/Users/visha/OneDrive/Desktop/OSINT/osint-mern-app/client/src/components/Dashboard.jsx
import React from 'react';
import Navbar from './Navbar';
import SearchForm from './SearchForm';
import './Dashboard.css';

const Dashboard = () => {
  return (
    <div className="dashboard">
      <Navbar />
      <SearchForm />
    </div>
  );
};

export default Dashboard;