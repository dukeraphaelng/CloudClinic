// Instruction: https://www.youtube.com/watch?v=2jqok-WgelI

const router = require('express').Router();

const User = require('../models/User');
const Session = require('../models/Session');
const verifyToken = require('./verifyToken');
const {
  schemaValidation,
  signInValidation,
} = require('../utils/validations/users');

// Sign up
router.post('/signup', async (req, res) => {
  // Validation before creation
  const { error } = schemaValidation(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  // Check for unique email
  const emailExist = await User.findOne({ email: req.body.email });
  if (emailExist) return res.status(400).send('email already exists');

  // Check if confirmPassword is the same as password
  if (!req.body.confirmPassword === req.body.password) {
    return res.status(404).send('confirmed password is incorrect');
  }

  // Try to save otherwise send error
  const user = new User(req.body);

  try {
    // Protect from malicious account information assignment
    if (user.isDoctor) {
      delete user.clientInfo;
      user.doctorInfo.rating = 0;
    } else {
      delete user.doctorInfo;
    }
    user.tokens = [];

    await user.save();
    const token = await user.generateAuthToken();
    res.status(201).send({ user, token });
  } catch (e) {
    res.status(400).send(e);
  }
});

// Sign in
router.post('/signin', async (req, res) => {
  try {
    // Validation before creation
    const { error } = signInValidation(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    // Check if email & password are correct
    const user = await User.findByCredentials(
      req.body.email,
      req.body.password
    );

    // Create and assign a token
    const token = await user.generateAuthToken();

    res.status(201).send({ user, token });
  } catch (e) {
    res.status(400).send(e);
  }
});

// Sign out of current session
router.patch('/signout', verifyToken, async (req, res) => {
  try {
    req.user.tokens = req.user.tokens.filter((token) => {
      return token.token !== req.token;
    });
    await req.user.save();

    res.send();
  } catch (e) {
    res.status(500).send();
  }
});

// Sign out of all sessions
router.patch('/signoutall', verifyToken, async (req, res) => {
  try {
    req.user.tokens = [];
    await req.user.save();

    res.send();
  } catch (e) {
    res.status(500).send();
  }
});

// Get own user's profile
router.get('/profile', verifyToken, async (req, res) => {
  res.send(req.user);
});

// Update profile
router.patch('/profile', verifyToken, async (req, res) => {
  try {
    // Unrequire confirm password
    req.body.confirmPassword = req.body.password;

    const { error } = schemaValidation(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    Object.keys(req.body).forEach((update) => {
      req.user[update] = req.body[update];
    });

    await req.user.save();

    res.status(201).send(req.user);
  } catch (e) {
    res.status(400).send(e);
  }
});

// Delete user's profile
router.delete('/profile', verifyToken, async (req, res) => {
  try {
    await req.user.remove();
    res.send(req.user);
  } catch (e) {
    res.status(500).send();
  }
});

// // GET DOCTORS ROUTE (ADD MORE VALIDATION HERE)
// Users (All)
router.get('/', async (req, res) => {
  try {
    const users = await User.find({ isDoctor: true });

    // Only send appropriate data
    res.send(users);
  } catch (e) {
    res.status(500).send();
  }
});

// User (One)
router.get('/:id', async (req, res) => {
  try {
    const user = await User.find({ _id: req.params.id, isDoctor: true });

    if (!user) {
      return res.status(404).send();
    }

    // Only send appropriate data
    res.send(user);
  } catch (e) {
    res.status(500).send();
  }
});

// // GET CLIENTS ROUTE

// // NEED TESTING
// Get all
router.get('/clients', verifyToken, async (req, res) => {
  if (!req.user.isDoctor) {
    res.status(404).send({ error: 'Forbidden' });
  }

  try {
    const bookedSessions = await Session.find({ doctor: req.user._id });
    // client: not null

    if (!bookedSessions) {
      res.status(404).send();
    }

    const bookedWithClients = bookedSessions.map((session) => session.client);

    // Assign all users to the user of bookedSessions
    const users = await User.find({ _id: { $in: bookedWithClients } });

    // Only send appropriate data
    res.send(users);
  } catch (e) {
    res.status(500).send();
  }
});

// // NEED TESTING
// Get Single
router.get('/clients/:id', verifyToken, async (req, res) => {
  try {
    const bookedSessions = await Session.find({
      doctor: req.user._id,
      client: req.params.id,
    });
    if (!bookedSessions) {
      res.status(404).send();
    }
    const user = await User.find({ _id: req.params.id, isDoctor: false });

    if (!user) {
      return res.status(404).send();
    }

    // Only send appropriate data
    res.send(user);
  } catch (e) {
    res.status(500).send();
  }
});

module.exports = router;