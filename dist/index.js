import express from 'express';
import dotenv from 'dotenv';
// Load environment variables
dotenv.config();
const app = express();
const port = process.env.PORT || 3000;
// Middleware
app.use(express.json());
// Sample route
app.get('/', (_req, res) => {
    res.send('BuildasLab API is running!');
});
// Start server
app.listen(port, () => {
    console.log(`🚀 Server is running on http://localhost:${port}`);
});
