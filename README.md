# NeoPasse - Consulta de Contas Free Fire

Site para consulta segura de informações de contas Free Fire com backend intermediário e criptografia.

## 🚀 Funcionalidades

- ✅ Consulta de contas nos formatos **UID:PASSWORD** e **JSON da Garena**
- ✅ Backend intermediário seguro que protege a API externa
- ✅ Criptografia AES-256-GCM para requisições sensíveis
- ✅ Interface moderna com tema escuro
- ✅ Histórico de consultas salvo no banco de dados
- ✅ Exibição completa de informações (ID, nickname, level, XP, access token)

## 📋 Pré-requisitos

- Node.js 18+
- Banco de dados MySQL ou TiDB
- Conta na Vercel (para deploy)

## 🔧 Variáveis de Ambiente

Configure as seguintes variáveis de ambiente na Vercel:

```env
# Banco de Dados
DATABASE_URL=mysql://user:password@host:port/database

# Autenticação
JWT_SECRET=sua-chave-secreta-aleatoria-aqui

# OAuth (se necessário)
OAUTH_SERVER_URL=https://api.manus.im
VITE_OAUTH_PORTAL_URL=https://login.manus.im
VITE_APP_ID=seu-app-id

# Aplicação
VITE_APP_TITLE=NeoPasse - Consulta de Contas Free Fire
VITE_APP_LOGO=https://seu-logo-url.com/logo.png
```

## 📦 Deploy na Vercel

### Opção 1: Via Interface Web (Recomendado)

1. Acesse [vercel.com/new](https://vercel.com/new)
2. Importe o repositório `neodouglas/neopassesite-vercel`
3. Configure as variáveis de ambiente listadas acima
4. Clique em **Deploy**

### Opção 2: Via CLI

```bash
# Instalar Vercel CLI
npm i -g vercel

# Fazer login
vercel login

# Deploy
vercel --prod
```

## 🛠️ Desenvolvimento Local

```bash
# Instalar dependências
pnpm install

# Configurar variáveis de ambiente
cp .env.example .env
# Edite o arquivo .env com suas credenciais

# Migrar banco de dados
pnpm db:push

# Iniciar servidor de desenvolvimento
pnpm dev
```

## 📝 Formatos de Entrada Suportados

### Formato 1: UID:PASSWORD
```
4218099837:C95587DF1ECEA5E312FEFE89E04F38CE75A8E785CEBF5910407373AB37FFA474
```

### Formato 2: JSON da Garena
```json
{
  "guest_account_info": {
    "com.garena.msdk.guest_uid": "4218099837",
    "com.garena.msdk.guest_password": "C95587DF1ECEA5E312FEFE89E04F38CE75A8E785CEBF5910407373AB37FFA474"
  }
}
```

## 🔒 Segurança

- Todas as requisições à API externa são processadas através de um backend intermediário
- Credenciais sensíveis são criptografadas usando AES-256-GCM
- A URL da API externa não é exposta ao frontend
- Histórico de consultas vinculado ao usuário autenticado

## 🏗️ Tecnologias

- **Frontend:** React 19 + Tailwind CSS 4 + shadcn/ui
- **Backend:** Express 4 + tRPC 11
- **Banco de Dados:** MySQL/TiDB + Drizzle ORM
- **Autenticação:** Manus OAuth
- **Deploy:** Vercel

## 📄 Licença

MIT

---

Desenvolvido com ❤️ para a comunidade Free Fire

