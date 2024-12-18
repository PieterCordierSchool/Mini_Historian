const express = require('express');
const cors = require('cors');
const mssql = require('mssql');
const { v4: uuidv4 } = require('uuid');

const app = express();
app.use(cors());
app.use(express.json());

const config = {
    user: 'Admin',
    password: 'Psc7438#',
    server: 'PIETER',
    database: 'historian_db',
    options: {
        encrypt: true,
        trustServerCertificate: true,
    },
};


// DELETE route to delete all data from the database
app.delete('/api/deleteData', async (req, res) => {
    try {
        const pool = await mssql.connect(config);
        await pool.request().query('DELETE FROM historian_data');
        res.status(200).json({ message: 'All data deleted successfully!' });
    } catch (error) {
        console.error('Error deleting data:', error);
        res.status(500).json({ error: 'Failed to delete data', details: error.message });
    }
});

// POST route to save data to the database
app.post('/api/saveData', async (req, res) => {
    const data = req.body;
    try {
        const pool = await mssql.connect(config);
        const insertPromises = data.map(entry => {
            return pool.request()
                .input('ID', mssql.NVarChar, entry.ID)
                .input('tagname', mssql.NVarChar, entry.tagname)
                .input('quality', mssql.Int, entry.quality)
                .input('value', mssql.Float, entry.value)
                .query('INSERT INTO historian_data (ID, tagname, quality, value) VALUES (@ID, @tagname, @quality, @value)');
        });

        await Promise.all(insertPromises);
        res.status(200).json({ message: 'Data saved successfully!' });
    } catch (error) {
        console.error('Error saving data:', error);
        res.status(500).json({ error: 'Failed to save data', details: error.message });
    }
});

// GET route to fetch data from the database
app.get('/api/getData', async (req, res) => {
    try {
        const pool = await mssql.connect(config);
        const result = await pool.request().query('SELECT * FROM historian_data');
        res.status(200).json(result.recordset);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch data' });
    }
});

const PORT = 5000;
app.listen(PORT, () => {
    console.log('Server running on http://localhost:${PORT}');
});