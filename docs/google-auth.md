# Autenticação com Google no mdnotes

## Visão Geral

A autenticação com o Google usa **Firebase Authentication** no frontend e o **Firebase Admin SDK** no backend. O fluxo é baseado em dois tokens: um **Firebase ID token** (gerado pelo Google/Firebase) e um **JWT próprio** (gerado pelo backend com dados do plano do usuário).

---

## Bibliotecas e Tecnologias

- **Frontend**: Firebase SDK (`signInWithPopup`, `GoogleAuthProvider`)
- **Backend**: Firebase Admin SDK (verificação de tokens)
- **JWT**: Token próprio com `HS256`, armazenando `userId` e `plan`
- **Banco de dados**: DynamoDB (usuários indexados por `providerId`)

---

## Fluxo de Autenticação

### 1. Login com Google (Frontend)

Arquivo: `packages/infra/websites/mdnotes-app/src/components/GoogleAuthModal.tsx`

1. O usuário clica em "Sign in with Google"
2. O Firebase abre um popup com a tela de login do Google
3. Após autenticação, o Firebase retorna um **ID token**
4. O frontend envia esse token para o backend:

```http
POST /auth/user/login-or-register
Content-Type: application/json

{ "token": "<firebase_id_token>" }
```

5. O backend retorna `{ process, user, accessToken }`
6. O frontend armazena os tokens em cookies:
   - `@mdnotes/jwttoken` — JWT do backend (5 dias)
   - `@mdnotes/authprovidertoken` — Firebase ID token (5 dias)

---

### 2. Login ou Registro (Backend)

Arquivo: `packages/domain/auth/src/application/use-cases/user/login-or-register.ts`

1. O Firebase Admin SDK verifica e decodifica o ID token
2. Extrai `providerId` (UID do Google), `email`, `name`, `photoUrl`
3. Busca o usuário no DynamoDB pelo `providerId`
   - **Encontrado** → retorna `{ process: 'login', user, accessToken }`
   - **Não encontrado** → cria o usuário (plano padrão: PRO) e retorna `{ process: 'register', user, accessToken }`
4. Gera o JWT com `{ userId, plan }` e expiração de **7 dias**

---

### 3. Proteção de Rotas (Backend)

Arquivo: `packages/infra/functions/src/utils/auth-controller.ts`

Todas as rotas protegidas exigem dois headers:

```http
jwtauthenticationtoken: <jwt_token>
providerauthenticationtoken: <firebase_id_token>
```

O `VerifyAuthenticationUseCase` valida a requisição:

1. Verifica se o JWT é válido e não expirou
   - **Válido** → prossegue com o token atual
   - **Expirado** → verifica o Firebase token e gera um novo JWT
2. O header `updatedjwtauthenticationtoken` é devolvido na resposta com o token atualizado

---

### 4. Estrutura do Usuário (DynamoDB)

Arquivo: `packages/domain/common/src/enterprise/entities/user.ts`

| Campo             | Tipo           | Descrição                        |
|-------------------|----------------|----------------------------------|
| `providerId`      | `string`       | UID do Google (Firebase)         |
| `email`           | `string`       | E-mail do usuário                |
| `name`            | `string`       | Nome                             |
| `photoUrl`        | `string`       | Foto de perfil                   |
| `plan`            | `FREE \| PRO`  | Plano do usuário                 |
| `stripeCustomerId`| `string?`      | ID no Stripe (opcional)          |
| `createdAt`       | `Date`         | Data de criação                  |

O DynamoDB usa o índice `idx-providerId` para localizar usuários pelo UID do Google.

---

## Variáveis de Ambiente

### Backend (`.env.dev`)

| Variável                        | Descrição                              |
|---------------------------------|----------------------------------------|
| `FIREBASE_PROJECT_ID`           | ID do projeto Firebase                 |
| `JWT_PRIVATE_KEY`               | Chave RSA (base64) para assinar JWTs   |
| `JWT_EXPIRATION_TIME_IN_SECONDS`| Expiração do JWT (padrão: `604800`)    |

### Frontend (`.env`)

| Variável                        | Descrição                              |
|---------------------------------|----------------------------------------|
| `NEXT_PUBLIC_FIREBASE_API_KEY`  | API key pública do Firebase            |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | Domínio de autenticação Firebase    |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID`  | ID do projeto Firebase              |
| `NEXT_PUBLIC_BACKEND_URL`       | URL base da API backend                |

---

## Diagrama do Fluxo

```
Usuário
  │
  ▼
GoogleAuthModal (Next.js)
  │  signInWithPopup(GoogleAuthProvider)
  ▼
Google (popup OAuth)
  │  retorna Firebase ID token
  ▼
Frontend
  │  POST /auth/user/login-or-register  { token }
  ▼
Backend (Lambda)
  │  Firebase Admin SDK verifica o token
  │  Busca usuário no DynamoDB por providerId
  │  Cria usuário se novo (plano PRO)
  │  Gera JWT { userId, plan }
  ▼
Frontend
  │  Salva cookies: jwttoken + authprovidertoken
  ▼
Requisições subsequentes
     Headers: jwtauthenticationtoken + providerauthenticationtoken
     Backend renova o JWT automaticamente se expirado
```
