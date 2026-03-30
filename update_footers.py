import os
import glob
import re

html_files = glob.glob('/Users/suddhajit21/Documents/KJR/*.html')

insurance_regex = re.compile(r'<h4>INSURANCE\s+REQUIREMENTS</h4>\s*<ul class="footer-links">\s*<li>.*?</li>\s*<li>.*?</li>\s*<li>.*?</li>\s*<li>.*?</li>\s*</ul>', re.DOTALL | re.IGNORECASE)
insurance_replacement = '''<h4>INSURANCE REQUIREMENTS</h4>
        <ul class="footer-links">
          <li><a href="property-mgmt.html">Workers Comp</a></li>
          <li><a href="property-mgmt.html">General Liability</a></li>
          <li><a href="property-mgmt.html">Auto Insurance</a></li>
          <li><a href="property-profile-creation.html">Vendor Profile</a></li>
        </ul>'''

quick_links_regex = re.compile(r'<h4>QUICK\s+LINKS</h4>\s*<ul class="footer-links">\s*<li>.*?</li>\s*<li>.*?</li>\s*<li>.*?</li>\s*<li>.*?</li>\s*</ul>', re.DOTALL | re.IGNORECASE)
quick_links_replacement = '''<h4>QUICK LINKS</h4>
        <ul class="footer-links">
          <li><a href="property-mgmt.html">Upload Invoice</a></li>
          <li><a href="sales-login.html">Sign In</a></li>
          <li><a href="registration.html">Create Profile</a></li>
          <li><a href="contact-us.html">Contact Support</a></li>
        </ul>'''

contact_regex = re.compile(r'<div class="footer-col">\s*<h4>(CONTACT|ESTIMATING)</h4>(?:(?!<div class="footer-col">).)*?</div>', re.DOTALL | re.IGNORECASE)
contact_replacement = '''<div class="footer-col">
        <h4>CONTACT</h4>
        <p><a href="tel:888-944-6313" style="color: inherit; text-decoration: none;">888-944-6313</a><br>Open 24/7</p>
        <p style="margin-top: 1rem;"><a href="https://maps.google.com/?q=1420+Industrial+Park+Road,+Paris,+TN+38242" target="_blank" style="color: inherit; text-decoration: none;">1420 Industrial Park Road<br>Paris, TN 38242</a></p>
      </div>'''

for file in html_files:
    try:
        with open(file, 'r', encoding='utf-8') as f:
            content = f.read()

        new_content = content
        
        parts = new_content.split('<footer>')
        if len(parts) > 1:
            footer_parts = parts[1].split('</footer>')
            if len(footer_parts) > 1:
                footer_inner = footer_parts[0]
                
                footer_inner = insurance_regex.sub(insurance_replacement, footer_inner)
                footer_inner = quick_links_regex.sub(quick_links_replacement, footer_inner)
                footer_inner = contact_regex.sub(contact_replacement, footer_inner)
                
                parts[1] = footer_inner + '</footer>' + footer_parts[1]
            
        new_content = '<footer>'.join(parts)

        if new_content != content:
            with open(file, 'w', encoding='utf-8') as f:
                f.write(new_content)
            print(f"Updated {os.path.basename(file)}")
    except Exception as e:
        print(f"Error on {file}: {e}")
