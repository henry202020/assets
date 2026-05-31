# 🔐 Security Best Practices Guide

## Table of Contents
1. [Environment Variables](#environment-variables)
2. [API Keys & Tokens](#api-keys--tokens)
3. [Database Credentials](#database-credentials)
4. [SSH Keys & Certificates](#ssh-keys--certificates)
5. [GitHub Secrets](#github-secrets)
6. [Incident Response](#incident-response)
7. [Security Tools](#security-tools)
8. [Team Guidelines](#team-guidelines)

---

## Environment Variables

### What are they?
Environment variables are key-value pairs stored outside your code that contain sensitive configuration.

### How to use them:

#### Local Development
```bash
# Copy the template
cp .env.example .env

# Edit with your actual values
nano .env

# Load in your application
const apiKey = process.env.API_KEY;
const dbPassword = process.env.DB_PASSWORD;
```

#### Node.js Application
```javascript
require('dotenv').config();

const config = {
  apiKey: process.env.API_KEY,
  dbHost: process.env.DB_HOST,
  dbPassword: process.env.DB_PASSWORD,
  jwtSecret: process.env.JWT_SECRET
};

module.exports = config;
```

### Common variables to never commit:
- `API_KEY`, `API_SECRET`, `API_TOKEN`
- `DB_PASSWORD`, `DB_USER`
- `JWT_SECRET`, `SESSION_SECRET`
- `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`
- `STRIPE_API_KEY`, `SENDGRID_API_KEY`
- Any authentication credentials

---

## API Keys & Tokens

### Never do this ❌
```javascript
// BAD - Secret in code!
const apiKey = "sk_live_abc123xyz789";
fetch('https://api.example.com/data', {
  headers: { 'Authorization': 'Bearer sk_live_abc123xyz789' }
});
```

### Do this instead ✅
```javascript
// GOOD - Use environment variables
const apiKey = process.env.API_KEY;
fetch('https://api.example.com/data', {
  headers: { 'Authorization': `Bearer ${apiKey}` }
});
```

### Rotating Compromised Keys
If a key is exposed:
1. **Immediately revoke** it on the service provider
2. **Generate a new key**
3. **Update the secret** everywhere it's used
4. **Reissue to team members**
5. **Remove from git history** (see Incident Response)

---

## Database Credentials

### Bad Practice ❌
```javascript
const mysql = require('mysql');
const connection = mysql.createConnection({
  host: 'prod-db.example.com',
  user: 'admin',
  password: 'MyPassword123!', // EXPOSED!
  database: 'production'
});
```

### Good Practice ✅
```javascript
const mysql = require('mysql');
const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});
```

### .env file example
```env
DB_HOST=prod-db.example.com
DB_PORT=3306
DB_USER=dbuser
DB_PASSWORD=your_secure_password_here
DB_NAME=production_db
```

---

## SSH Keys & Certificates

### What should NEVER be committed:
- `id_rsa`, `id_dsa` (private SSH keys)
- `*.pem`, `*.key` (certificate keys)
- `*.ppk` (PuTTY private keys)
- `*.p12`, `*.pfx` (PKCS12 certificates)

### If accidentally committed:
1. **Revoke the key immediately** on all systems
2. **Generate a new key**
3. **Clean git history**:
```bash
# Using git filter-repo (recommended)
git filter-repo --invert-paths --path path/to/secret-key.pem

# OR using BFG Repo-Cleaner
bfg --delete-files path/to/secret-key.pem
```

---

## GitHub Secrets

### How to use GitHub Secrets in workflows:

#### Step 1: Add a Secret
1. Go to **Settings** → **Secrets and variables** → **Actions**
2. Click **New repository secret**
3. Name: `API_KEY`, Value: `your_actual_api_key`

#### Step 2: Use in Workflow
```yaml
name: Deploy

on: [push]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Use API Key
        run: |
          curl -H "Authorization: Bearer ${{ secrets.API_KEY }}" \
               https://api.example.com/deploy
      
      - name: Database Migration
        env:
          DB_PASSWORD: ${{ secrets.DB_PASSWORD }}
        run: npm run migrate
```

#### Step 3: View Secrets in Logs
✅ GitHub automatically masks secrets in logs!

---

## Incident Response

### If You Committed a Secret:

#### Immediate Actions (Within Minutes)
```bash
# 1. Revoke the compromised credential immediately
# 2. Generate a new one

# 3. Remove from git history
git filter-repo --invert-paths --path .env

# 4. Force push (careful!)
git push origin --force

# 5. Notify your team
# 6. Rotate the secret everywhere
```

#### Checking if Secret Was Exposed
```bash
# View your git history for the file
git log --all -- .env

# See what was in that commit
git show <commit-sha>:.env
```

#### Using git filter-repo
```bash
# Install (if needed)
pip install git-filter-repo

# Remove file from history
git filter-repo --invert-paths --path '.env'

# Push changes
git push origin --force-with-lease
```

### Prevention is Better!
- Use `.gitignore` ✅
- Review `.gitignore` before each commit ✅
- Use pre-commit hooks ✅
- Enable secret scanning ✅

---

## Security Tools

### Tools Used in This Repository

#### 1. TruffleHog
Scans for high-entropy secrets in your code.
```bash
pip install truffleHog
truffleHog filesystem .
```

#### 2. Gitleaks
Detects secrets in git repositories.
```bash
brew install gitleaks
gitleaks detect --source . --verbose
```

#### 3. GitGuardian
Commercial secret scanning (offers free tier).
https://www.gitguardian.com/

#### 4. npm audit
Check for vulnerable npm packages.
```bash
npm audit
npm audit fix
```

#### 5. Snyk
Continuous vulnerability scanning.
```bash
npm install -g snyk
snyk test
```

---

## Team Guidelines

### Code Review Checklist
Before approving a pull request, ensure:
- [ ] No `.env` files committed
- [ ] No hardcoded API keys
- [ ] No secrets in code strings
- [ ] No database credentials visible
- [ ] No SSH keys or certificates
- [ ] `.gitignore` is up to date

### Onboarding New Team Members
1. Share this `SECURITY.md` file
2. Have them copy `.env.example` to `.env`
3. Provide only the secrets they need
4. Explain `.gitignore` rules
5. Show how to use GitHub Secrets

### Regular Security Audits
```bash
# Weekly audit script
#!/bin/bash

echo "🔍 Running security checks..."

# Check for secrets
gitleaks detect --source . --exit-code 1

# Check npm vulnerabilities
npm audit

# Check file permissions
find . -type f -perm 600 -o -type f -perm 644 | grep -E "\.(pem|key|ppk|p12|pfx)$"

echo "✅ Security check complete!"
```

---

## Quick Reference

| What | Where | Example |
|------|-------|---------|
| **API Keys** | `.env` file + GitHub Secrets | `API_KEY=sk_live_...` |
| **Passwords** | Environment variables only | `DB_PASSWORD=...` |
| **SSH Keys** | Never in repo | Keep in `~/.ssh/` |
| **Tokens** | GitHub Secrets for CI/CD | `${{ secrets.TOKEN }}` |
| **Config** | `.env.example` (template only) | Show structure, not values |

---

## Resources

- [GitHub: Managing Secrets](https://docs.github.com/en/code-security/secret-scanning/managing-keys-and-secrets)
- [OWASP: Secrets Management](https://owasp.org/www-community/Sensitive_Data_Exposure)
- [TruffleHog](https://github.com/trufflesecurity/trufflehog)
- [Gitleaks](https://github.com/gitleaks/gitleaks)
- [npm audit](https://docs.npmjs.com/cli/v6/commands/npm-audit)

---

**Last Updated:** 2026-05-31
**Status:** ✅ Active
