require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const app = express();
const tasksRouter = require('./routes/tasks');

app.use(cors());
app.use(helmet());
app.use(morgan('combined'));
app.use(express.json());

mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('MongoDB connection error:', err));

app.use('/api/tasks', tasksRouter);

app.get('/health', (req, res) => {
    res.status(200).json({ status: 'OK' });
});

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!' });
});

const PORT = process.env.PORT || 3303;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

module.exports = app;