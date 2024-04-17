

import React, { useState, useEffect } from 'react';
import { Button, Container, Table } from 'react-bootstrap';
import './GetData.css'; // Import the CSS file for styling

import { Link } from 'react-router-dom';

const GetData = () => {
  const [data, setData] = useState([]);
 
  const [statusCounts, setStatusCounts] = useState({});
  const [continuousVariations, setContinuousVariations] = useState({});

  useEffect(() => {
    calculateStatusCounts();
    calculateContinuousVariations();
  }, [data]);

  const calculateStatusCounts = () => {
    const counts = {
      0: 0, // for yellow
      1: 0, // for green
      default: 0, // for red
    };

    data.forEach(item => {
      counts[item.machine_status] = (counts[item.machine_status] || 0) + 1;
    });

    setStatusCounts(counts);
  };

  const calculateContinuousVariations = () => {
    let continuousZeros = 0;
    let continuousOnes = 0;
    let maxContinuousZeros = 0;
    let maxContinuousOnes = 0;

    data.forEach(item => {
      if (item.machine_status === 0) {
        continuousOnes = 0;
        continuousZeros++;
        maxContinuousZeros = Math.max(maxContinuousZeros, continuousZeros);
      } else if (item.machine_status === 1) {
        continuousZeros = 0;
        continuousOnes++;
        maxContinuousOnes = Math.max(maxContinuousOnes, continuousOnes);
      }
    });

    setContinuousVariations({ maxContinuousZeros, maxContinuousOnes });
  };

  const fetchData = async () => {
    try {
      const response = await fetch(`http://localhost:3001/data/all`);
      if (!response.ok) {
        throw new Error('Failed to fetch data');
      }
      const jsonData = await response.json();
      setData(jsonData);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const getColor = (status) => {
    switch (status) {
      case 0:
        return 'yellow'; // Plot yellow if sample is 0
      case 1:
        return 'green'; // Plot green if sample is 1
      default:
        return 'red'; // Plot red if sample is missing
    }
  };

  const renderCandles = () => {
    const candles = [];
    let prevTimestamp = null;

    data.forEach((item, index) => {
      const currentTimestamp = new Date(item.ts).getTime();
      if (prevTimestamp && currentTimestamp - prevTimestamp > 1000) {
        // There's a gap, insert red divs
        const missingSeconds = Math.floor((currentTimestamp - prevTimestamp) / 1000);
        for (let i = 1; i < missingSeconds; i++) {
          candles.push(
            <div
              key={`missing-${index}-${i}`}
              className="candle"
              style={{ backgroundColor: 'red' }}
              title={`Missing Timestamp`}
            />
          );
        }
      }
      candles.push(
        <div
          key={index}
          className="candle"
          style={{ backgroundColor: getColor(item.machine_status) }}
          title={`Timestamp: ${item.ts}`}
        />
      );
      prevTimestamp = currentTimestamp;
    });

    return candles;
  };

  return (
    <Container fluid>
      <div className="d-flex justify-content-around">
        <br />
      </div>
      
      <h2>Data from Server:</h2>
      
      <Button onClick={fetchData}>Fetch All Data</Button>
      <div className="candle-strip">
        {renderCandles()}
      </div>
      <h2>Machine Status Counts:</h2>
      <Table striped bordered hover>
        <thead>
          <tr>
            <th>Status</th>
            <th>Count</th>
          </tr>
        </thead>
        <tbody>
          {Object.entries(statusCounts).map(([status, count]) => (
            <tr key={status}>
              <td>{status === 'default' ? 'Status null' : status === '0' ? 'Status Zero' : 'Status one'}</td>
              <td>{count}</td>
            </tr>
          ))}
        </tbody>
      </Table>
      <h2>Continuous Variations:</h2>
      <Table striped bordered hover>
        <thead>
          <tr>
            <th>Variation</th>
            <th>Count</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Max Continuous Zeros</td>
            <td>{continuousVariations.maxContinuousZeros}</td>
          </tr>
          <tr>
            <td>Max Continuous Ones</td>
            <td>{continuousVariations.maxContinuousOnes}</td>
          </tr>
        </tbody>
      </Table>
    </Container>
  );
};

export default GetData;
