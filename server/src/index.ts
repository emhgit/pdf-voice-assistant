import express from 'express';
const app = express();

const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() }); //store files in memory storage

//PDF Upload Route
app.post('/api/pdf', (req, res) => {

});

//Audio Upload Route
app.post('/api/audio', (req, res) => {

});

//Trnscription Route
app.post('/api/process', (req, res) => {

});

app.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});
