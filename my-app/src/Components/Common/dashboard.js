import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './dashboard.css';

const Dashboard = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [location, setLocation] = useState('');
  const [searchResult, setSearchResult] = useState('');
  const [processedData, setProcessedData] = useState(null);
  const [error, setError] = useState(null);
  const [rawJson, setRawJson] = useState('');

  const handleSearchQueryChange = (e) => setSearchQuery(e.target.value);
  const handleLocationChange = (e) => setLocation(e.target.value);

  const handleSearch = async () => {
    console.log('Search initiated with:', { searchQuery, location });

    try {
      // Reset the state before new search
      setSearchResult('');
      setProcessedData(null);
      setError(null);

      console.log('Sending search request to backend...', {
        query: searchQuery,
        location: location,
      });

      const response = await axios.post('http://localhost:5000/search', {
        query: searchQuery,
        location: location,
      }, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      console.log('Received response from /search:', response.data);
      setSearchResult(response.data.message);

      console.log('Search successful. Now sending processing request...');

      const processResponse = await axios.post('http://localhost:5000/process', {
        query: searchQuery,
        location: location,
      }, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      console.log('Received response from /process:', processResponse.data);

      // Fetch processed data immediately after the search and processing
      fetchProcessedData();
    } catch (error) {
      console.error('Error during search or processing:', error);

      if (error.response) {
        console.error('Backend error response:', error.response.data);
        setError(`Error: ${error.response.data.error || 'An unexpected error occurred'}`);
      } else if (error.request) {
        console.error('No response received:', error.request);
        setError('No response received from the server. Please try again.');
      } else {
        console.error('Error setting up request:', error.message);
        setError(`Error: ${error.message}`);
      }
    }
  };

  const fetchProcessedData = async () => {
    try {
      console.log('Fetching processed data from /api/results...');
      const response = await axios.get('http://localhost:5000/api/results', {
        responseType: 'json',
        timeout: 5000, // 5 seconds timeout
      });

      if (response.status === 200 && response.data) {
        console.log('Received processed data:', response.data);
        setProcessedData(response.data);
        setRawJson(JSON.stringify(response.data, null, 2));
        setError(null);
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (error) {
      console.error('Error fetching processed data:', error);

      if (error.response) {
        console.error('Backend error response:', error.response.data);
        setError(`Failed to fetch results. Error: ${error.response.data.error || 'An unexpected error occurred'}`);
      } else if (error.request) {
        console.error('No response received:', error.request);
        setError('No response received from the server. Please try again.');
      } else {
        console.error('Error setting up request:', error.message);
        setError(`Error: ${error.message}`);
      }

      setProcessedData(null);
      setRawJson('Failed to fetch results.json');
    }
  };

  useEffect(() => {
    console.log('Dashboard component mounted. Setting up data fetch interval...');
    const interval = setInterval(fetchProcessedData, 1000); // Fetch every second

    return () => {
      console.log('Dashboard component unmounted. Clearing data fetch interval...');
      clearInterval(interval);
    };
  }, []);

  return (
    <div className="dashboard container mx-auto p-4">
      <div className="header mb-4">
        <h1 className="text-3xl font-bold">UDDHRTI Report Dashboard</h1>
        <div className="search-container flex space-x-2 mt-4">
          <input
            type="text"
            placeholder="Search Query..."
            value={searchQuery}
            onChange={handleSearchQueryChange}
            className="border p-2 rounded w-full md:w-1/3"
          />
          <input
            type="text"
            placeholder="Location..."
            value={location}
            onChange={handleLocationChange}
            className="border p-2 rounded w-full md:w-1/3"
          />
          <button onClick={handleSearch} className="bg-blue-500 text-white p-2 rounded w-full md:w-1/6">Search</button>
        </div>
      </div>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
          <strong className="font-bold">Error!</strong>
          <span className="block sm:inline">{error}</span>
        </div>
      )}

      {searchResult && (
        <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded mb-4">
          <div className="font-bold">Search Result:</div>
          <p>{searchResult}</p>
        </div>
      )}

      <div className="bg-white shadow-md rounded-lg p-4 mb-4">
        <h2 className="text-2xl font-semibold mb-2">Raw JSON Content (results.json)</h2>
        <pre className="bg-gray-100 p-4 rounded overflow-x-auto">
          {rawJson}
        </pre>
      </div>

      {processedData && (
        <>
          <div className="bg-white shadow-md rounded-lg p-4 mb-4">
            <h2 className="text-2xl font-semibold mb-2">Processed Data</h2>
            <pre className="bg-gray-100 p-4 rounded overflow-x-auto">
              {JSON.stringify(processedData, null, 2)}
            </pre>
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard;