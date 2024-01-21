const express = require('express');
const bodyParser = require('body-parser');
const app = express();
app.use(bodyParser.json());
const port = 3000;

app.get('/hello', async (req, res) => {
  res.send('Hello World!');

});

app.listen(port, () => {
  try {
    console.log("Starting Express Server...");
    console.log(`Listening on Port:${port}`);
  }
  catch (error) {
    console.error('Error starting Express Server:', error.message);
  }
});