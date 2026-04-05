const fs = require('fs');
const path = require('path');

const apiPath = path.join('/Users/suddhajit21/Documents/KJR/backend/routes/api.js');
let content = fs.readFileSync(apiPath, 'utf8');

const formsRoute = `
// @route   POST api/forms
// @desc    Generic form submission route (replaces FormSubmit)
// @access  Public
router.post('/forms', upload.array('attachment', 5), async (req, res) => {
  try {
    const transporter = nodemailer.createTransport({
      host:   process.env.SMTP_HOST || 'smtp.gmail.com',
      port:   parseInt(process.env.SMTP_PORT) || 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });

    const notifyEmails = process.env.NOTIFY_EMAILS || 'estimating@kjrid.com';
    const subject = req.body._subject || 'New Form Submission';
    
    // Build HTML body from all form fields
    let htmlBody = '<div style="font-family: Arial, sans-serif;"><h2>' + subject + '</h2><table border="1" cellpadding="10" style="border-collapse: collapse;">';
    for (const key in req.body) {
      if (!key.startsWith('_')) {
        htmlBody += '<tr><td><strong>' + key + '</strong></td><td>' + req.body[key] + '</td></tr>';
      }
    }
    htmlBody += '</table></div>';

    const attachments = (req.files || []).map(f => ({
      filename:    f.originalname,
      content:     f.buffer,
      contentType: f.mimetype
    }));

    const mailOptions = {
      from:        \`"KJR Form System" <\${process.env.SMTP_USER}>\`,
      to:          notifyEmails,
      replyTo:     req.body.Email || req.body.email || process.env.SMTP_USER,
      subject:     subject,
      html:        htmlBody,
      attachments
    };

    await transporter.sendMail(mailOptions);
    res.json({ success: true });
  } catch (err) {
    console.error('Form submission failed:', err.message);
    res.status(500).json({ error: 'Server Error' });
  }
});

`;

// Insert the forms route right before // --- USER AUTH ROUTES ---
content = content.replace('// --- USER AUTH ROUTES ---', formsRoute + '\n// --- USER AUTH ROUTES ---');

fs.writeFileSync(apiPath, content, 'utf8');
console.log('Successfully added /forms route to api.js');
