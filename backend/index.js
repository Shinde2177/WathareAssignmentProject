// Assuming you're using Express for your Node.js server
const express = require('express');
const multer = require('multer'); // Middleware for handling multipart/form-data
const mysql = require('mysql2');
const cors = require('cors');

const app = express();
const port = 3001;

// Configure multer to store uploaded files in memory
const upload = multer({ storage: multer.memoryStorage() });

// Create MySQL connection pool
const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: 'manager',
  database: 'wathare',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

app.use(cors());

// Endpoint to receive JSON file from frontend
app.post('/upload-json', upload.single('file'), (req, res) => {
  // Get the uploaded file from req.file
  const fileData = req.file.buffer.toString();

  // Parse the JSON data
  const data = JSON.parse(fileData);

  // Get a connection from the pool
  pool.getConnection((err, connection) => {
    if (err) {
      console.error('Error getting MySQL connection:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }

    // Extract values for bulk insert
    const values = data.map((item) => [
      new Date(item.ts).toISOString().slice(0, 19).replace('T', ' '),
      item.machine_status,
      item.vibration
    ]);

    // Perform bulk insert
    connection.query('INSERT INTO sample_data (ts, machine_status, vibration) VALUES ?', [values], (err, result) => {
      if (err) {
        console.error('Error inserting data into MySQL:', err);
        connection.release(); // Release the connection back to the pool
        return res.status(500).json({ error: 'Internal server error' });
      }
      console.log('Inserted data:', result);

      // Release the connection back to the pool
      connection.release();

      // Send response to frontend
      res.status(200).json({ message: 'Data uploaded successfully' });
    });
  });
});

// Endpoint to fetch data for a specific hour
// Endpoint to fetch data for a specific hour
app.get('/data', (req, res) => {
    const { startDate, startHour,timeSlotSize } = req.query;
    console.log("===",req.query)
    const targetDate = new Date(`${startDate} ${startHour}:00:00`);
    const slot=timeSlotSize*3600000;
    const nextHour = new Date(targetDate.getTime() +slot); // Add one hour
  console.log("===",targetDate)
    // Get a connection from the pool
    pool.getConnection((err, connection) => {
      if (err) {
        console.error('Error getting MySQL connection:', err);
        return res.status(500).json({ error: 'Internal server error' });
      }
  
      // Perform SELECT query to fetch data for the specified hour
      connection.query('SELECT * FROM sample_data WHERE ts >= ? AND ts < ?', [targetDate, nextHour], (err, results) => {
        // Release the connection back to the pool
        connection.release();
  
        if (err) {
          console.error('Error fetching data from MySQL:', err);
          return res.status(500).json({ error: 'Internal server error' });
        }
  
        // Send data to frontend
        res.status(200).json(results);
      });
    });
  });
  
//================================================================
// Endpoint to fetch first and last timestamps
app.get('/timestamps', (req, res) => {
    // Get a connection from the pool
    console.log("in ts")
    pool.getConnection((err, connection) => {
      if (err) {
        console.error('Error getting MySQL connection:', err);
        return res.status(500).json({ error: 'Internal server error' });
      }
  
      // Perform SELECT queries to fetch the first and last timestamps
      connection.query('SELECT MIN(ts) AS firstTimestamp FROM sample_data', (err, firstResult) => {
        if (err) {
          console.error('Error fetching first timestamp from MySQL:', err);
          connection.release();
          return res.status(500).json({ error: 'Internal server error' });
        }
  
        connection.query('SELECT MAX(ts) AS lastTimestamp FROM sample_data', (err, lastResult) => {
          // Release the connection back to the pool
          connection.release();
  
          if (err) {
            console.error('Error fetching last timestamp from MySQL:', err);
            return res.status(500).json({ error: 'Internal server error' });
          }
  
          const firstTimestamp = firstResult[0].firstTimestamp;
          const lastTimestamp = lastResult[0].lastTimestamp;
          res.status(200).json({ firstTimestamp, lastTimestamp });
        });
      });
    });
  });
  
//==================================================================

//get all data
app.get('/data/all', (req, res) => {
  console.log("in get")
  // Get a connection from the pool
  pool.getConnection((err, connection) => {

    if (err) {
      console.error('Error getting MySQL connection:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }

    // Perform SELECT query to fetch all data
    connection.query('SELECT * FROM sample_data', (err, results) => {
      // Release the connection back to the pool
      connection.release();

      if (err) {
        console.error('Error fetching data from MySQL:', err);
        return res.status(500).json({ error: 'Internal server error' });
      }
      
      // Send data to frontend
      res.status(200).json(results);
    });
  });
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
