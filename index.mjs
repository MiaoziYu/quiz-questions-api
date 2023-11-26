import './loadEnvironment.mjs';
import 'express-async-errors';
import questions from './routes/questions.mjs';
import userStats from './routes/userStats.mjs';
import dashboard from './routes/dashboard.mjs';
import cors from 'cors';
import express from 'express';

const PORT = process.env.PORT || 5050;
const app = express();

app.use(cors());
app.use(express.json());
app.set('json spaces', 2);

// Load routes
app.use('/dashboard', dashboard);
app.use('/questions', questions);
app.use('/userStats', userStats);

// Global error handling
app.use((error, _req, res, next) => {
  res.status(500).send(error.message);
});

// start the Express server
app.listen(PORT, () => {
  console.log(`Server is running on port: ${PORT}`);
});
