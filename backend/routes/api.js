const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const Project = require('../models/Project');
const Bid = require('../models/Bid');
const auth = require('../middleware/auth');
const nodemailer = require('nodemailer');

// --- ADMIN AUTHENTICATION ---
// @route   POST api/admin/login
// @desc    Authenticate admin & get token
router.post('/admin/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    // Check against ENV vars (Simple for single admin)
    if (email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD) {
      const payload = { admin: { id: 1, role: 'superadmin' } };
      jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '24h' }, (err, token) => {
        if (err) throw err;
        res.json({ token });
      });
    } else {
      return res.status(400).json({ errors: [{ msg: 'Invalid Credentials' }] });
    }
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// --- ADMIN: PROJECT ROUTES ---

// @route   POST api/projects
// @desc    Create a new project
// @access  Private
router.post('/projects', auth, async (req, res) => {
  try {
    const newProject = new Project(req.body);
    const project = await newProject.save();
    res.json(project);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/projects
// @desc    Get all projects (public view for website)
// @access  Public
router.get('/projects', async (req, res) => {
  try {
    const projects = await Project.find({ status: 'active' }).sort({ createdAt: -1 });
    res.json(projects);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/admin/projects
// @desc    Get all projects (including closed/draft)
// @access  Private
router.get('/admin/projects', auth, async (req, res) => {
  try {
    const projects = await Project.find().sort({ createdAt: -1 });
    res.json(projects);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   PUT api/projects/:id
// @desc    Update a project
// @access  Private
router.put('/projects/:id', auth, async (req, res) => {
  try {
    let project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ msg: 'Project not found' });

    project = await Project.findByIdAndUpdate(req.params.id, { $set: req.body, updatedAt: Date.now() }, { new: true });
    res.json(project);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   DELETE api/projects/:id
// @desc    Delete a project
// @access  Private
router.delete('/projects/:id', auth, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ msg: 'Project not found' });

    await project.deleteOne();
    res.json({ msg: 'Project removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});


// --- CONTRACTOR BID ROUTES ---

// @route   POST api/bids
// @desc    Submit a bid response
// @access  Public
router.post('/bids', async (req, res) => {
  try {
    // 1. Save to DB
    const newBid = new Bid(req.body);
    const bid = await newBid.save();

    // 2. Optional: Trigger email using nodemailer
    /*
    const transporter = nodemailer.createTransport({
       service: 'gmail',
       auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
    });
    // Send email logic here...
    */

    res.json(bid);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/admin/bids/:projectId
// @desc    Get all bids for a specific project
// @access  Private
router.get('/admin/bids/:projectId', auth, async (req, res) => {
  try {
    const bids = await Bid.find({ project: req.params.projectId }).sort({ createdAt: -1 });
    res.json(bids);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
