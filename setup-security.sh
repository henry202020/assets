#!/bin/bash
# Setup script to configure git hooks
# Run this once: bash setup-security.sh

echo "🔐 Setting up security features..."

# Create hooks directory if it doesn't exist
mkdir -p .githooks

# Make pre-commit hook executable
chmod +x .githooks/pre-commit

# Configure git to use our hooks directory
git config core.hooksPath .githooks

# Create .env from template if it doesn't exist
if [ ! -f .env ]; then
    echo "📝 Creating .env from template..."
    cp .env.example .env
    echo "⚠️  Remember to fill in your actual credentials in .env"
fi

# Verify .gitignore has necessary patterns
echo "🔍 Checking .gitignore..."
for pattern in ".env" "*.pem" "*.key" "id_rsa"; do
    if ! grep -q "$pattern" .gitignore; then
        echo "Adding $pattern to .gitignore"
        echo "$pattern" >> .gitignore
    fi
done

echo ""
echo "✅ Security setup complete!"
echo ""
echo "Next steps:"
echo "1. Edit .env with your actual credentials"
echo "2. Never commit .env file"
echo "3. Review SECURITY_GUIDE.md for best practices"
echo "4. Enable GitHub Secret Scanning in Settings"
echo ""
