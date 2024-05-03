require('dotenv').config();

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();

app.use(bodyParser.json());
app.use(cors({ origin: 'http://localhost:8080', credentials: true}));

// Routing
const authRouter = require('./routes/auth');
app.use('/', authRouter);

const port = process.env.PORT;

app.listen(port, () => {
  try {
    console.log(`Starting Express Server...`);
    console.log(`Listening on Port:${port}`);
  }
  catch (error) {
    console.error('Error starting server:', error.message);
  }
});
