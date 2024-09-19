// components/CallbackPage.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useLocation } from 'react-router-dom';

const CallbackPage = () => {
  const [status, setStatus] = useState('');
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const txRef = params.get('tx_ref');
    const status = params.get('status');

    console.log('Callback parameters:', { txRef, status });

    if (txRef && status) {
      axios.post('http://localhost:5000/api/callback', { tx_ref: txRef, status })
        .then(response => {
          setStatus('Payment processed successfully!');
        })
        .catch(error => {
          setStatus('Failed to process payment.');
          console.error('Error:', error);
        });
    } else {
      setStatus('Invalid callback parameters.');
    }
  }, [location.search]);

  return (
    <div className="callback-container">
      <h1>Payment Callback</h1>
      <p>{status}</p>
    </div>
  );
};

export default CallbackPage;
