import React, { useEffect, useState } from 'react';
import { Row, Col } from 'react-bootstrap';

const WeatherCard = () => {
  const [weatherData, setWeatherData] = useState(null);

  const gotLocation = async (position) => {
    const { latitude, longitude } = position.coords;
    try {
      const baseurl = "https://api.weatherapi.com/v1/current.json?key=766aaa46011e4d2eab6102327241704";
      const response = await fetch(`${baseurl}&q=${latitude},${longitude}`);
      if (!response.ok) {
        throw new Error('Failed to fetch weather data');
      }
      const data = await response.json();
      setWeatherData(data);
    } catch (error) {
      console.error('Error fetching weather data:', error);
    }
  };
  
  const failToGetLocation = (error) => {
    console.error("Failed to get location:", error.message);
  };

  const getLocationAndWeatherInfo = () => {
    navigator.geolocation.getCurrentPosition(gotLocation, failToGetLocation);
  };

  useEffect(() => {
    getLocationAndWeatherInfo();
  }, []);

  return (
    <footer className="fixed-bottom" style={{ backgroundColor: 'aqua', color: 'black', padding: '1rem' }}>
    <div className="container">
      {weatherData && (
        <Row className="align-items-center">
          <Col xs={4}>
            <h5>{weatherData.location.name}, {weatherData.location.region}</h5>
          </Col>
          <Col xs={4}>
            <p>{weatherData.current.condition.text}</p>
            <p>Temperature: {weatherData.current.temp_c}°C ({weatherData.current.temp_f}°F)</p>
          </Col>
          <Col xs={4}>
            <p className="text-muted">{new Date(weatherData.location.localtime).toLocaleTimeString()}</p>
            <div className="d-flex justify-content-center">
              <img src={weatherData.current.condition.icon} alt="Weather icon" style={{ maxWidth: '100%', height: 'auto' }} />
            </div>
          </Col>
        </Row>
      )}
    </div>
  </footer>
  );
};

export default WeatherCard;
