require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
app.use(express.json());
app.use(cors());

// 1. DATABASE CONNECTION
const MONGO_URI = process.env.MONGO_URI;
mongoose.connect(MONGO_URI)
  .then(() => console.log("✅ SYSTEM: ATLAS DATABASE CONNECTED"))
  .catch(err => console.error("❌ SYSTEM: CONNECTION ERROR", err));

// 2. DATA SCHEMAS
const UserSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  role: { type: String, default: 'user' }
});
const User = mongoose.model('User', UserSchema);

const RequestSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  userName: String,
  type: String,
  licenseNumber: String,
  documentUrl: String,
  status: { type: String, default: 'Pending' },
  submittedAt: { type: Date, default: Date.now }
});
const Request = mongoose.model('Request', RequestSchema);

const SupportSchema = new mongoose.Schema({
  userId: String,
  userName: String,
  message: String,
  status: { type: String, default: 'Open' },
  date: { type: Date, default: Date.now }
});
const Support = mongoose.model('Support', SupportSchema);

// 3. AUTHENTICATION (USER & ADMIN)
app.post('/api/auth/register', async (req, res) => {
  try {
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    const user = new User({ ...req.body, password: hashedPassword });
    await user.save();
    res.status(201).json({ msg: "Registered Successfully" });
  } catch (err) { res.status(400).json({ msg: "Email already exists" }); }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user || !(await bcrypt.compare(req.body.password, user.password))) {
      return res.status(401).json({ msg: "Invalid Credentials" });
    }
    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET);
    res.json({ token, user: { _id: user._id, name: user.name, role: user.role, email: user.email } });
  } catch (err) { res.status(500).json(err); }
});

// 4. USER FEATURES (Submit & Track)
app.post('/api/requests/submit', async (req, res) => {
  try {
    const newRequest = new Request(req.body);
    await newRequest.save();
    res.status(201).json(newRequest);
  } catch (err) { res.status(500).json(err); }
});

app.get('/api/requests/user/:id', async (req, res) => {
  const requests = await Request.find({ userId: req.params.id }).sort({ submittedAt: -1 });
  res.json(requests);
});

app.post('/api/support/ticket', async (req, res) => {
  const ticket = new Support(req.body);
  await ticket.save();
  res.json({ msg: "Ticket Created" });
});

// 5. ADMIN PANEL FEATURES (Stats & Management)
app.get('/api/admin/dashboard', async (req, res) => {
  try {
    const requests = await Request.find().sort({ submittedAt: -1 });
    const usersCount = await User.countDocuments({ role: 'user' });
    const pendingCount = await Request.countDocuments({ status: 'Pending' });
    const approvedCount = await Request.countDocuments({ status: 'Approved' });
    res.json({ requests, usersCount, pendingCount, approvedCount });
  } catch (err) { res.status(500).json(err); }
});

app.put('/api/admin/status/:id', async (req, res) => {
  try {
    const updated = await Request.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true });
    res.json(updated);
  } catch (err) { res.status(500).json(err); }
});

app.listen(5000, () => console.log("🚀 BACKEND ENGINE ACTIVE ON PORT 5000"));
module.exports = app;