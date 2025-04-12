import express from "express";

const app = express();
app.set('port', process.env.PORT || 3000);
const PORT = app.get('port');

// Middleware
app.use(express.json());

// Routes
app.get('/', (req, res) => {
  res.send('Hello, world!');
});

app.get('/api/users/currentuser', (req, res) => {
  res.send('Hello, GetCurrentUser API has been hit.');
});
// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://ticketing.com`);
});