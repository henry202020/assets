#!/bin/bash
# 🔐 Script de Configuração de Segurança para Projeto Frontend HTML/JS

set -e

echo "🔐 Configurando segurança do projeto HTML/JS..."
echo ""

# 1. Criar arquivo .env local se não existir
if [ ! -f .env ]; then
    echo "📝 Criando arquivo .env..."
    cat > .env << 'EOF'
# Frontend - Configurações Públicas
VITE_API_URL=https://api.exemplo.com
VITE_APP_NAME=Meu Site Seguro
VITE_APP_VERSION=1.0.0

# Backend - Configurações Privadas (NUNCA exponha no frontend)
# JWT_SECRET=sua_chave_aqui
# API_KEY=sua_chave_aqui
# DB_PASSWORD=sua_senha_aqui
EOF
    echo "✅ .env criado"
    echo "⚠️  IMPORTANTE: Edite .env com suas configurações reais!"
    echo "   nano .env"
else
    echo "✅ .env já existe"
fi

echo ""

# 2. Verificar .gitignore
if [ ! -f .gitignore ]; then
    echo "📝 Criando .gitignore..."
    cat > .gitignore << 'EOF'
# Variáveis de ambiente
.env
.env.local
.env.*.local

# Git
.git

# Logs
*.log
logs/

# Dependências
node_modules/
package-lock.json
yarn.lock

# IDE
.vscode/
.idea/
*.swp

# OS
.DS_Store
Thumbs.db

# Chaves e certificados
*.pem
*.key
*.ppk
id_rsa*

# Build
dist/
build/

# Credenciais
credentials.json
secrets.json
EOF
    echo "✅ .gitignore criado"
else
    echo "✅ .gitignore já existe"
    # Verificar se .env está lá
    if ! grep -q "^\.env$" .gitignore; then
        echo "   Adicionando .env ao .gitignore..."
        echo ".env" >> .gitignore
    fi
fi

echo ""

# 3. Configurar git hooks
if command -v git &> /dev/null; then
    echo "🔍 Configurando git hooks..."
    
    mkdir -p .githooks
    
    # Criar pre-commit hook
    cat > .githooks/pre-commit << 'EOF'
#!/bin/bash
# Verificar se .env vai ser commitado
if git diff --cached --name-only | grep -q "^\.env$"; then
    echo "❌ ERRO: Tentando fazer commit de .env!"
    echo "   Arquivo .env deve estar em .gitignore"
    exit 1
fi

# Verificar se há chaves SSH
if git diff --cached --name-only | grep -qE "\.(pem|key|ppk)$"; then
    echo "❌ ERRO: Detectado arquivo de chave SSH!"
    exit 1
fi

# Verificar padrões de API Key
if git diff --cached -U0 | grep -iE "api.?key|secret|token" | grep -v "\.gitignore"; then
    echo "⚠️  AVISO: Possível exposição de credencial"
    echo "   Verifique antes de fazer commit"
fi

echo "✅ Pre-commit checks passed"
EOF
    
    chmod +x .githooks/pre-commit
    
    # Configurar git para usar hooks
    if [ -d .git ]; then
        git config core.hooksPath .githooks 2>/dev/null && echo "   ✅ Git hooks configurados"
    fi
fi

echo ""

# 4. Criar arquivo de documentação
if [ ! -f FRONTEND_SECURITY_SETUP.md ]; then
    echo "📝 Criando documentação de segurança..."
    cat > FRONTEND_SECURITY_SETUP.md << 'EOF'
# 🔐 Configuração de Segurança - Frontend HTML/JS

## ✅ Configuração Concluída

Este script configurou as seguintes proteções:

- [x] `.env` - Variáveis de ambiente (não será commitado)
- [x] `.gitignore` - Proteção de arquivos sensíveis
- [x] `.githooks/pre-commit` - Validação antes de commit
- [x] Documentação de segurança

## 📋 Próximos Passos

### 1. Editar .env com valores reais
```bash
nano .env
```

Adicione suas configurações:
```
VITE_API_URL=https://sua-api.com
VITE_APP_NAME=Seu App
```

### 2. Usar no código JavaScript
```javascript
// Acessar variáveis (com Vite)
const API_URL = import.meta.env.VITE_API_URL;

// Ou com carregador .env
const API_URL = process.env.VITE_API_URL;
```

### 3. Nunca fazer commit de .env
```bash
git add .
# .env será ignorado automaticamente ✅
```

### 4. Verificar segurança
```bash
# Verificar se há secrets exposto
gitleaks detect --source . --verbose

# Verificar se .env foi commitado
git log --all -- .env
# Não deve aparecer nada!
```

## 🛡️ Proteções Implementadas

### 1. Content Security Policy (CSP)
```html
<!-- No seu index.html -->
<meta http-equiv="Content-Security-Policy" content="
    default-src 'self';
    script-src 'self' 'nonce-abc123';
    style-src 'self' 'unsafe-inline';
    connect-src 'self' https://api.seu-dominio.com;
">
```

### 2. Proteção contra XSS
Use `textContent` em vez de `innerHTML`:
```javascript
// ❌ PERIGO
element.innerHTML = userInput;

// ✅ SEGURO
element.textContent = userInput;
```

### 3. Validação de Entrada
```javascript
function validateInput(input) {
    if (input.length === 0 || input.length > 100) return false;
    if (/<>"`/.test(input)) return false; // Caracteres perigosos
    return true;
}
```

### 4. Armazenamento Seguro
```javascript
// ❌ NÃO USE
localStorage.setItem('token', token); // Vulnerável a XSS!

// ✅ USE
// HTTPOnly Cookies (gerenciado pelo servidor)
// O servidor envia: Set-Cookie: token=...; HttpOnly; Secure;
```

### 5. API Keys Protegidas
```javascript
// ❌ NUNCA exponha API Key no frontend
const API_KEY = 'sk_live_123456';

// ✅ USE backend como proxy
fetch('/api/data') // Backend usa a chave protegida
    .then(r => r.json());
```

## 📊 Checklist de Segurança

### Antes de Commit
- [ ] `.env` está em `.gitignore`?
- [ ] Nenhuma API Key no código?
- [ ] Usando `textContent` não `innerHTML`?
- [ ] Validando entrada do usuário?

```bash
# Verificar
grep -r "password\|api.key\|secret" --include="*.js" .
# Não deve retornar nada!
```

### Antes de Push
- [ ] Rodei `gitleaks detect`?
- [ ] Histórico git limpo?

```bash
gitleaks detect --source . --verbose
git log --all -- .env
```

### Em Produção
- [ ] HTTPS habilitado?
- [ ] CSP headers configurados?
- [ ] HTTPOnly Cookies configurados?
- [ ] CORS restritivo?

## 🔧 Ferramentas Úteis

```bash
# Verificar secrets
gitleaks detect --source . --verbose

# Verificar vulnerabilidades npm
npm audit

# Verificar histórico
git log --oneline -20
```

## 📚 Guias Completos

- `FRONTEND_SECURITY_GUIDE.md` - Detalhes técnicos
- `FRONTEND_SECURITY_CHECKLIST.md` - Checklist dia a dia

## ⚠️ Avisos Importantes

- **NUNCA** commit `.env`
- **NUNCA** deixe API Keys no código
- **NUNCA** use `innerHTML` com entrada do usuário
- **NUNCA** armazene tokens em localStorage

---

**Setup concluído em:** $(date)
**Status:** ✅ Seguro para desenvolvimento

Qualquer dúvida? Veja `FRONTEND_SECURITY_GUIDE.md`
EOF
    echo "✅ Documentação criada"
fi

echo ""
echo "═══════════════════════════════════════════════════════"
echo "✅ CONFIGURAÇÃO DE SEGURANÇA COMPLETA!"
echo "═══════════════════════════════════════════════════════"
echo ""
echo "📋 Próximos passos:"
echo "1. Editar .env com suas configurações reais"
echo "   $ nano .env"
echo ""
echo "2. Revisar guias de segurança"
echo "   - FRONTEND_SECURITY_GUIDE.md"
echo "   - FRONTEND_SECURITY_CHECKLIST.md"
echo ""
echo "3. Fazer primeiro commit"
echo "   $ git add ."
echo "   $ git commit -m 'chore: add security configuration'"
echo ""
echo "4. Verificar histórico (não deve ter .env)"
echo "   $ git log --all -- .env"
echo ""
echo "═══════════════════════════════════════════════════════"
