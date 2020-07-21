const User = require('../models/User');
const Session = require('../models/Session');
const {
  schemaValidation,
  signInValidation,
} = require('../utils/validations/users');

// Sign up
exports.signUp = async (req, res) => {
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
};

// Sign in
exports.signIn = async (req, res) => {
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
};

// Sign out of current session
exports.signOut = async (req, res) => {
  try {
    req.user.tokens = req.user.tokens.filter((token) => {
      return token.token !== req.token;
    });
    await req.user.save();

    res.send();
  } catch (e) {
    // res.status(500).send();
    res.status(401).send(e); // Unauthorized request
  }
};

// Sign out of all sessions
exports.signOutAll = async (req, res) => {
  try {
    req.user.tokens = [];
    await req.user.save();

    res.send();
  } catch (e) {
    // res.status(500).send();
    res.status(401).send(e); // Unauthorized request
  }
};

// Get own user's profile
exports.viewProfile = async (req, res) => {
  try {
    res.send(req.user);
  } catch (e) {
    // res.status(500).send();
    res.status(401).send(e); // Unauthorized request
  }
};

// Update profile
exports.updateProfile = async (req, res) => {
  try {
    // Unrequire list of fields if not provided
    const unrequiredFields = ['firstName', 'lastName', 'password'];
    unrequiredFields.forEach((field) => {
      if (!req.body[field]) {
        req.body[field] = req.user[field];
      }
    });

    // Unrequire confirm password
    req.body.confirmPassword = req.body.password;

    // Disable updating email & isDoctor
    req.body.email = req.user.email;
    req.body.isDoctor = req.user.isDoctor;

    const { error } = schemaValidation(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    Object.keys(req.body).forEach((update) => {
      req.user[update] = req.body[update];
    });

    await req.user.save();

    res.status(201).send(req.user);
  } catch (e) {
    // res.status(400).send(e);
    // res.status(500).send();
    res.status(401).send(e); // Unauthorized request
  }
};

// Delete user's profile
exports.deleteProfile = async (req, res) => {
  try {
    await req.user.remove();
    res.send(req.user);
  } catch (e) {
    // res.status(500).send();
    res.status(401).send(e); // Unauthorized request
  }
};

// // GET CLIENTS ROUTE
// All Clients
exports.viewClients = async (req, res) => {
  try {
    console.log('1');
    if (!req.user.isDoctor) {
      res.status(404).send({ error: 'Forbidden' });
    }
    console.log('2');
    const bookedSessions = await Session.find({ doctor: req.user._id });
    // client: not null
    console.log('3');
    if (!bookedSessions) {
      res.status(404).send();
    }
    console.log('4');
    console.log(bookedSessions);
    const bookedWithClients = bookedSessions.map((session) => session.client);
    console.log('5');
    // Assign all users to the user of bookedSessions
    const users = await User.find({ _id: { $in: bookedWithClients } });
    console.log('6');
    // Only send appropriate data
    res.send(users);
    console.log('7');
  } catch (e) {
    // console.log(e.message);
    // res.status(500).send(e);
    res.status(403).send(e); // Forbidden
  }
};

// One Client
exports.viewClient = async (req, res) => {
  console.log('hEre 1');
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
};

// // GET DOCTORS ROUTE (ADD MORE VALIDATION HERE)
// All Doctors
exports.viewDoctors = async (req, res) => {
  try {
    const users = await User.find({ isDoctor: true });

    // Only send appropriate data
    res.send(users);
  } catch (e) {
    res.status(500).send();
  }
};

// One Doctor
exports.viewDoctor = async (req, res) => {
  try {
    const user = await User.find({ _id: req.params.id, isDoctor: true });

    if (!user) {
      return res.status(404).send();
    }

    // Only send appropriate data
    res.send(user);
  } catch (e) {
    // res.status(500).send(); // For some reason not working
    res.status(404).send(); // Remedied te 404 not working above
  }
};
