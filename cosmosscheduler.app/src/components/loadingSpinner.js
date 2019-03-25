import React from 'react';
import '../styles/app.css'

const LoadingSpinner = ({ loading }) => (
  <div className={loading ? 'app-logo-animated' : ''}/>
);

export default LoadingSpinner;
