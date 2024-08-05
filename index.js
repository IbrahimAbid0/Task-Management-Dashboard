require('dotenv').config();  // Load environment variables from .env file
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');

const User = require('./User');
const Task = require('./Task');
const path = require('path');

const app = express();
const port = process.env.PORT; // || 8000;

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URL)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// Middleware
app.use(cors());
app.use(bodyParser.json());

app.use(express.static(path.join(__dirname, 'build')));

// User routes
app.post('/api/users/register', async (req, res) => {
  const { name, email, password } = req.body;

  try {
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required' });
    }

    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ msg: 'User already exists' });
    }

    user = new User({
      name,
      email,
      password
    });

    await user.save();
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

app.post('/api/users/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }

    res.json({ user }); // Send user data in the response
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Task routes
app.post('/api/tasks', async (req, res) => {
  try {
    const task = new Task(req.body);
    await task.save();
    res.json(task);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

app.get('/api/tasks', async (req, res) => {
  try {
    const tasks = await Task.find();
    res.json(tasks);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

app.put('/api/tasks/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    if (!['started', 'completed'].includes(status)) {
      return res.status(400).json({ msg: 'Invalid status' });
    }
    const task = await Task.findByIdAndUpdate(req.params.id, { status }, { new: true });
    res.json(task);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

app.delete('/api/tasks/:id', async (req, res) => {
  try {
    await Task.findByIdAndRemove(req.params.id);
    res.json({ msg: 'Task removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

app.listen(port, () => console.log(`Server started on port ${port}`));
