require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');

const connectDB = require('./src/config/db');
const errorHandler = require('./src/middleware/errorHandler');

const authRoutes = require('./src/routes/authRoutes');
const leadRoutes = require('./src/routes/leadRoutes');
const noteRoutes = require('./src/routes/noteRoutes');
const activityRoutes = require('./src/routes/activityRoutes');

connectDB();

const app = express();

app.use(cors({
    origin: [
        "http://localhost:5173",
        "https://lead-management-omega-cyan.vercel.app/"
    ],
    credentials: true
}));
app.use(express.json());
app.use(cookieParser());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/leads', leadRoutes);
app.use('/api/notes', noteRoutes);
app.use('/api/activity', activityRoutes);

// Health check
app.get('/', (req, res) => res.json({ message: 'Lead Management API running' }));

app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
