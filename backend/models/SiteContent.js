const mongoose = require('mongoose');

const serviceCardSchema = new mongoose.Schema({
  id: { type: String, required: true },
  meta: { type: String, default: '' },
  title: { type: String, default: '' },
  excerpt: { type: String, default: '' },
  img: { type: String, default: '' }   // URL or base64
}, { _id: false });

const marketAreaSchema = new mongoose.Schema({
  id: { type: String, required: true },
  label: { type: String, required: true },
  active: { type: Boolean, default: true }
}, { _id: false });

const siteContentSchema = new mongoose.Schema({
  key: { type: String, default: 'main', unique: true },

  // ── Hero Section ─────────────────────────────────────────
  heroHeading: { type: String, default: 'KJ Remodeling Interior Designs Inc.' },
  heroSubtitle: { type: String, default: 'Advancing the conversation on interior design, renovation, and supply chain solutions across the USA.' },
  heroVideoUrl: { type: String, default: 'https://res.cloudinary.com/dc8xxhoaf/video/upload/v1767988938/3773486-hd-1920-1080-30fps-tyea3fib-1_3P5aPwyY_online-video-cutter.com_tzwfze.mp4' },

  // ── Mission Section ───────────────────────────────────────
  missionSubLabel: { type: String, default: 'PRE-SET PRICING FOR CREWS' },
  missionQuote: { type: String, default: '"KJIR Interior Designs Inc. operates with pre-set pricing which makes sense for your business. Work orders are given to us with set prices and cannot be negotiated."' },

  // ── Services Section ──────────────────────────────────────
  servicesSectionTitle: { type: String, default: 'SERVICES WE PROVIDE' },
  servicesSectionSubtitle: { type: String, default: 'Contracting opportunities available across major metropolitan areas' },
  serviceCards: {
    type: [serviceCardSchema],
    default: [
      { id: 'service1', meta: 'RENOVATION', title: 'CABINETS & FLOORING', excerpt: 'Complete installation and replacement services. Baseboard replacement, luxury vinyl tile, and custom cabinetry solutions for modern homes.', img: 'assets/story1.png' },
      { id: 'service2', meta: 'SYSTEMS & UTILITIES', title: 'PLUMBING & HVAC', excerpt: 'Licensed repairs and installs. Water heaters, septic systems, main sewer line augers, and full HVAC unit replacements.', img: 'assets/story2.png' },
      { id: 'service3', meta: 'EXTERIOR', title: 'ROOFING & SIDING', excerpt: 'Full exterior remediation including bundle shingle replacement, vinyl siding repair, pressure washing, and structural maintenance.', img: 'assets/story3.png' }
    ]
  },

  // ── Market Areas ──────────────────────────────────────────
  marketSectionTitle: { type: String, default: 'OUR PRIMARY MARKET AREAS' },
  marketSectionSubtitle: { type: String, default: 'Serving major cities and surrounding regions' },
  marketAreas: {
    type: [marketAreaSchema],
    default: [
      { id: 'atlanta', label: 'ATLANTA, GA', active: true },
      { id: 'augusta', label: 'AUGUSTA, GA', active: true },
      { id: 'savannah', label: 'SAVANNAH, GA', active: true },
      { id: 'dallas', label: 'DALLAS, TX', active: true },
      { id: 'sanantonio', label: 'SAN ANTONIO, TX', active: true },
      { id: 'jacksonville', label: 'JACKSONVILLE, FL', active: true },
      { id: 'orlando', label: 'ORLANDO, FL', active: true },
      { id: 'tampa', label: 'TAMPA, FL', active: true },
      { id: 'nashville', label: 'NASHVILLE, TN', active: true },
      { id: 'knoxville', label: 'KNOXVILLE, TN', active: true }
    ]
  },

  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('SiteContent', siteContentSchema);
