# KJRID Website - Backend Database Schema
# Phase 1 Implementation (Pages 1-4)

## Overview
This document outlines the database structure required for Phase 1 of the KJRID website update.
The schema supports contact forms, feature suggestions, surveys, and sales team authentication with logging.

---

## Database Tables

### 1. contact_submissions
Stores all contact form submissions from the Contact Us page.

```sql
CREATE TABLE contact_submissions (
  id INT PRIMARY KEY AUTO_INCREMENT,
  full_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(50) NULL,
  subject VARCHAR(100) NOT NULL,
  message TEXT NOT NULL,
  submitted_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  ip_address VARCHAR(45) NULL,
  user_agent TEXT NULL,
  status ENUM('new', 'read', 'replied', 'archived') DEFAULT 'new',
  admin_notes TEXT NULL,
  INDEX idx_submitted_at (submitted_at),
  INDEX idx_status (status),
  INDEX idx_email (email)
);
```

**Purpose**: Admin can view all contact messages, filter by status, and add internal notes.

---

### 2. feature_suggestions
Stores feature suggestions and improvement ideas from users.

```sql
CREATE TABLE feature_suggestions (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NULL,
  email VARCHAR(255) NULL,
  category ENUM('website', 'service', 'parts', 'mobile', 'communication', 'other') NOT NULL,
  suggestion TEXT NOT NULL,
  submitted_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  ip_address VARCHAR(45) NULL,
  status ENUM('new', 'under_review', 'approved', 'implemented', 'rejected') DEFAULT 'new',
  priority ENUM('low', 'medium', 'high') DEFAULT 'medium',
  admin_notes TEXT NULL,
  potential_savings DECIMAL(10, 2) NULL COMMENT 'Future: estimated savings for user',
  points_awarded INT DEFAULT 0 COMMENT 'Future: reward points for suggestion',
  INDEX idx_submitted_at (submitted_at),
  INDEX idx_status (status),
  INDEX idx_category (category)
);
```

**Purpose**: Admin can review suggestions, set priority, track implementation status.
**Future Enhancement**: Implement points/rewards system for valuable suggestions.

---

### 3. survey_responses
Stores responses from quick surveys on the Suggest A Feature page.

```sql
CREATE TABLE survey_responses (
  id INT PRIMARY KEY AUTO_INCREMENT,
  survey_id VARCHAR(100) NOT NULL COMMENT 'e.g., service-satisfaction, feature-priority',
  response_data JSON NOT NULL COMMENT 'Stores all survey answers as JSON',
  submitted_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  ip_address VARCHAR(45) NULL,
  user_agent TEXT NULL,
  INDEX idx_survey_id (survey_id),
  INDEX idx_submitted_at (submitted_at)
);
```

**Example JSON structure**:
```json
{
  "survey_id": "service-satisfaction",
  "response": {
    "satisfaction": "very-satisfied"
  }
}
```

**Purpose**: Admin can analyze survey data, generate reports on user satisfaction and feature priorities.

---

### 4. sales_users
Stores sales team user accounts for login.

```sql
CREATE TABLE sales_users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  username VARCHAR(100) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(50) NULL,
  password_hash VARCHAR(255) NOT NULL COMMENT 'Bcrypt/Argon2 hashed password',
  two_factor_secret VARCHAR(255) NULL COMMENT 'TOTP secret for 2FA',
  status ENUM('active', 'suspended', 'inactive') DEFAULT 'active',
  role ENUM('sales_rep', 'sales_manager', 'admin') DEFAULT 'sales_rep',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  last_login DATETIME NULL,
  failed_login_attempts INT DEFAULT 0,
  account_locked_until DATETIME NULL,
  INDEX idx_username (username),
  INDEX idx_email (email),
  INDEX idx_status (status)
);
```

**Security Notes**:
- Passwords must be hashed using bcrypt or Argon2
- Implement rate limiting to prevent brute force attacks
- Lock account after 5 failed attempts for 15 minutes

---

### 5. sales_login_logs
Stores detailed logs of all login attempts and activities.

```sql
CREATE TABLE sales_login_logs (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NULL COMMENT 'NULL if login failed before user identification',
  username VARCHAR(100) NULL,
  action ENUM(
    'LOGIN_STEP1_SUCCESS',
    'LOGIN_STEP1_FAILED',
    'LOGIN_STEP2_FAILED',
    'LOGIN_SUCCESS',
    'LOGOUT',
    'VERIFICATION_CODE_SENT',
    'VERIFICATION_CODE_RESENT',
    'PASSWORD_RESET_REQUESTED',
    'PASSWORD_CHANGED',
    'ACCOUNT_LOCKED'
  ) NOT NULL,
  ip_address VARCHAR(45) NOT NULL,
  user_agent TEXT NULL,
  session_id VARCHAR(255) NULL,
  additional_data JSON NULL COMMENT 'Extra context (e.g., failed reason, geolocation)',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES sales_users(id) ON DELETE SET NULL,
  INDEX idx_user_id (user_id),
  INDEX idx_username (username),
  INDEX idx_action (action),
  INDEX idx_created_at (created_at),
  INDEX idx_ip_address (ip_address)
);
```

**Purpose**: 
- Admin can view complete audit trail of all login activities
- Track suspicious login patterns
- Compliance and security monitoring
- Investigate security incidents

**Example queries**:
```sql
-- View recent failed login attempts
SELECT * FROM sales_login_logs 
WHERE action LIKE '%FAILED%' 
ORDER BY created_at DESC LIMIT 50;

-- View all activity for a specific user
SELECT * FROM sales_login_logs 
WHERE username = 'john.doe' 
ORDER BY created_at DESC;

-- Count login attempts by IP
SELECT ip_address, COUNT(*) as attempts 
FROM sales_login_logs 
WHERE action = 'LOGIN_STEP1_FAILED' 
  AND created_at > DATE_SUB(NOW(), INTERVAL 1 HOUR)
GROUP BY ip_address 
HAVING attempts > 5;
```

---

### 6. verification_codes
Stores temporary verification codes for two-step authentication.

```sql
CREATE TABLE verification_codes (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  code VARCHAR(10) NOT NULL,
  code_type ENUM('login', 'password_reset') NOT NULL,
  sent_to VARCHAR(255) NOT NULL COMMENT 'Email or phone number',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  expires_at DATETIME NOT NULL,
  used_at DATETIME NULL,
  is_valid BOOLEAN DEFAULT TRUE,
  attempts INT DEFAULT 0 COMMENT 'Number of verification attempts',
  FOREIGN KEY (user_id) REFERENCES sales_users(id) ON DELETE CASCADE,
  INDEX idx_user_id (user_id),
  INDEX idx_code (code),
  INDEX idx_expires_at (expires_at)
);
```

**Security Notes**:
- Codes expire after 10 minutes
- Maximum 3 verification attempts per code
- Mark as invalid after successful use or expiration
- Implement cleanup job to delete old codes

---

## Admin Access & Features

### Admin Dashboard Requirements

1. **Contact Management**
   - View all contact submissions
   - Filter by status, date, subject
   - Mark as read/replied
   - Add internal notes
   - Export to CSV

2. **Feature Suggestions Management**
   - View all suggestions
   - Set priority and status
   - Add admin notes
   - Track implementation
   - Generate analytics reports

3. **Survey Analytics**
   - View aggregated survey results
   - Generate charts and graphs
   - Export data for analysis
   - Track trends over time

4. **Sales Team Management**
   - Create/edit/disable user accounts
   - Reset passwords
   - View login activity
   - Monitor failed login attempts
   - Lock/unlock accounts

5. **Security Logs**
   - View all login/logout events
   - Filter by user, IP, date, action
   - Export security logs
   - Set up alerts for suspicious activity

---

## API Endpoints (To Be Implemented)

### Contact Form
- `POST /api/contact/submit` - Submit contact form
- `GET /api/admin/contacts` - List all contacts (admin only)
- `PUT /api/admin/contacts/:id` - Update contact status (admin only)

### Feature Suggestions
- `POST /api/suggestions/submit` - Submit suggestion
- `POST /api/surveys/submit` - Submit survey response
- `GET /api/admin/suggestions` - List all suggestions (admin only)
- `GET /api/admin/surveys/results` - Get survey analytics (admin only)

### Sales Authentication
- `POST /api/auth/login/step1` - Username/password verification
- `POST /api/auth/login/step2` - Verification code check
- `POST /api/auth/logout` - Logout and log event
- `POST /api/auth/resend-code` - Resend verification code
- `GET /api/admin/logs` - View login logs (admin only)

---

## Security Recommendations

1. **Password Requirements**
   - Minimum 12 characters
   - Mix of uppercase, lowercase, numbers, symbols
   - No common passwords (use password blacklist)

2. **Rate Limiting**
   - Max 5 login attempts per IP per 15 minutes
   - Max 3 verification code attempts per code
   - Max 3 code resend requests per session

3. **Session Management**
   - Sessions expire after 60 minutes of inactivity
   - Logout on all devices when password changed
   - Secure, httpOnly, sameSite cookies

4. **Data Protection**
   - All API calls over HTTPS only
   - Encrypt sensitive data at rest
   - Regular security audits
   - GDPR compliance for user data

5. **Monitoring**
   - Alert on multiple failed logins
   - Alert on login from new location/device
   - Daily security log reviews
   - Automated suspicious activity detection

---

## Implementation Notes

**Priority**: High
**Complexity**: Medium
**Estimated Time**: 2-3 weeks for full implementation

### Phase 1 (Current) - Frontend Complete ✅
- Contact form page
- Suggest feature page with surveys
- Sales login page with 2FA UI
- All forms log to browser console (testing)

### Phase 2 - Backend Integration
- Set up database with above schema
- Implement API endpoints
- Connect frontend forms to backend
- Implement actual 2FA (email/SMS)
- Build admin dashboard

### Phase 3 - Advanced Features
- Points/rewards system for suggestions
- Advanced analytics and reporting
- Mobile app for sales team
- Real-time notifications

---

## Testing Requirements

1. **Contact Form**
   - Test form validation
   - Test data submission
   - Test admin viewing/filtering

2. **Suggestions & Surveys**
   - Test all survey types
   - Test suggestion submission
   - Test admin analytics

3. **Sales Login**
   - Test successful login
   - Test failed login attempts
   - Test account lockout
   - Test 2FA code flow
   - Test code expiration
   - Test logout
   - Verify all logs are created

4. **Security**
   - Penetration testing
   - SQL injection testing
   - XSS testing
   - CSRF protection testing
   - Rate limiting testing

---

**Last Updated**: 2024-01-28
**Version**: 1.0 (Phase 1)
