# Navigation Update Script for Remaining Pages
# This script documents what needs to be updated in about-us.html, property-mgmt.html, and bid-projects.html

## Updates Required:

### 1. Update Top Bar on ALL pages
Replace old top bar:
```html
<div class="top-bar">
  <a href="#">CONTACT US</a>
  <a href="#">SUGGEST A FEATURE</a>
</div>
```

With new top bar:
```html
<div class="top-bar">
  <div style="display: flex; gap: 1.5rem; align-items: center;">
    <span style="font-size: 0.75rem;">📞 Call 24/7 | Call in Orders Only | Live Operator</span>
  </div>
  <div style="display: flex; gap: 1rem;">
    <a href="contact-us.html">CONTACT US</a>
    <a href="suggest-feature.html">SUGGEST A FEATURE</a>
    <a href="sales-login.html" style="background: var(--primary); color: white; padding: 0.3rem 0.8rem; border-radius: 4px;">SALES TEAM LOGIN</a>
  </div>
</div>
```

### 2. Update Navigation Menu on ALL pages
Replace old navigation:
```html
<ul class="nav-links">
  <li><a href="index.html">Home</a></li>
  <li><a href="bid-projects.html">Work We Completed</a></li>
  <li><a href="property-mgmt.html">Property Mgmt Crew</a></li>
  <li><a href="bid-projects.html">Bid Projects</a></li>
  <li><a href="career-move.html">Career Move</a></li>
  <li><a href="about-us.html">About Us</a></li>
</ul>
<div class="header-icons">
  <a href="index.html#parts">10M+ PARTS</a>
</div>
```

With new navigation (adjust active page highlighting accordingly):
```html
<ul class="nav-links">
  <li><a href="index.html">HOME</a></li>
  <li><a href="#">WORK FORCE</a></li>
  <li><a href="about-us.html">ABOUT US</a></li>
  <li><a href="index.html#parts">10M+ PARTS</a></li>
  <li><a href="career-move.html">CAREER MOVE</a></li>
  <li><a href="property-mgmt.html">PROPERTY MGMT CREW</a></li>
  <li><a href="bid-projects.html">BID PROJECTS</a></li>
  <li><a href="bid-projects.html">WORK COMPLETED BY KJRID</a></li>
  <li><a href="contact-us.html">CONTACT US</a></li>
  <li><a href="suggest-feature.html">SUGGEST A FEATURE</a></li>
</ul>
```

### 3. Update Footer Sign In Link
In footer, change:
```html
<li><a href="#">Sign In</a></li>
```
To:
```html
<li><a href="sales-login.html">Sign In</a></li>
```

And:
```html
<li><a href="#">Contact Support</a></li>
```
To:
```html
<li><a href="contact-us.html">Contact Support</a></li>
```

## Files to Update:
1. about-us.html
2. property-mgmt.html  
3. bid-projects.html

All updates are for consistency with Phase 1 changes.
