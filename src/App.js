import React, { useState, useEffect } from 'react';
import './App.css'; // Assuming you have a CSS file for basic styling

const App = () => {
    const [locations, setLocations] = useState([]);
    const [source, setSource] = useState('');
    const [destination, setDestination] = useState('');
    const [price, setPrice] = useState(null);
    const [error, setError] = useState('');

    // Form data
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phoneNumber: '',
        passDuration: '',
    });

    // Fetch locations from the backend
    useEffect(() => {
        const fetchLocations = async () => {
            try {
                const response = await fetch('http://localhost:5001/api/locations');
                if (!response.ok) {
                    throw new Error('Failed to fetch locations');
                }
                const data = await response.json();
                setLocations(data);
            } catch (error) {
                console.error('Error fetching locations:', error);
                setError('Error fetching locations');
            }
        };

        fetchLocations();
    }, []);

    // Fetch price when source or destination changes
    useEffect(() => {
        const fetchPrice = async () => {
            if (source && destination) {
                try {
                  const response = await fetch(`http://localhost:5001/api/price?source=${source}&destination=${destination}`);
                    if (!response.ok) {
                        throw new Error('Failed to fetch price');
                    }
                    const data = await response.json();
                    setPrice(data.price);
                    setError('');
                } catch (error) {
                    setPrice(null);
                    setError('Error fetching price');
                }
            }
        };

        fetchPrice();
    }, [source, destination]);

    // Handle form input changes
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch('http://localhost:5001/bus-pass', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ...formData,
                    source,
                    destination,
                    price,
                }),
            });

            const data = await response.json();
            if (response.ok) {
                alert('Bus pass created successfully!');
                // Reset form
                setFormData({
                    name: '',
                    email: '',
                    phoneNumber: '',
                    passDuration: '',
                });
                setSource('');
                setDestination('');
                setPrice(null);
            } else {
                setError(data.message || 'Error creating bus pass');
            }
        } catch (error) {
            setError('Error creating bus pass');
        }
    };

    // Extract unique sources and destinations
    const uniqueSources = Array.from(new Set(locations.map(loc => loc.source)));
    const filteredDestinations = locations.filter(loc => loc.source === source);

    return (
        <div className="App">
            <h1>Bus Pass Form</h1>

            <form onSubmit={handleSubmit} className="bus-pass-form">
                <div className="form-group">
                    <label htmlFor="name">Name:</label>
                    <input
                        id="name"
                        name="name"
                        type="text"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="email">Email:</label>
                    <input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="phoneNumber">Phone Number:</label>
                    <input
                        id="phoneNumber"
                        name="phoneNumber"
                        type="tel"
                        value={formData.phoneNumber}
                        onChange={handleInputChange}
                        required
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="passDuration">Pass Duration:</label>
                    <select
                        id="passDuration"
                        name="passDuration"
                        value={formData.passDuration}
                        onChange={handleInputChange}
                        required
                    >
                        <option value="">Select Duration</option>
                        <option value="monthly">Monthly</option>
                        <option value="quarterly">Quarterly</option>
                        <option value="annually">Annually</option>
                    </select>
                </div>

                <div className="form-group">
                    <label htmlFor="source">Source:</label>
                    <select id="source" value={source} onChange={(e) => setSource(e.target.value)}>
                        <option value="">Select Source</option>
                        {uniqueSources.map((src, index) => (
                            <option key={index} value={src}>{src}</option>
                        ))}
                    </select>
                </div>

                <div className="form-group">
                    <label htmlFor="destination">Destination:</label>
                    <select id="destination" value={destination} onChange={(e) => setDestination(e.target.value)}>
                        <option value="">Select Destination</option>
                        {filteredDestinations.map((loc, index) => (
                            <option key={index} value={loc.destination}>{loc.destination}</option>
                        ))}
                    </select>
                </div>

                <div className="form-group">
                    <label htmlFor="price">Price:</label>
                    <input
                        id="price"
                        type="text"
                        value={price !== null ? `${price} INR` : ''}
                        readOnly
                    />

                </div>

                {error && <p style={{ color: 'red' }}>{error}</p>}

                <button type="submit">Submit</button>
            </form>
        </div>
    );
};

export default App;