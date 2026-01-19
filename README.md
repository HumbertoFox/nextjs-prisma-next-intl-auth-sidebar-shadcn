# nextjs-prisma-auth-sidebar-shadcn

## NextJS Prisma Auth Sidebar ShadCN – Documentação

### 📋 Sumário

- [Introdução](#introdu&#231;&#227;o)

- [Stack](#stack)

- [Requisitos](#requisitos)

- [Variáveis de Ambiente](#vari&#225;veis-de-ambiente)

- [Rodando o Projeto](#rodando-o-projeto)

- [Prisma & Banco de Dados](#prisma--banco-de-dados)

  - [Prisma Schema](#prisma-schema)

  - [Gerar Prisma Client](#gerar-prisma-client)

  - [Criar / Atualizar Banco de Dados](#criar--atualizar-banco-de-dados)

  - [Resetar Banco de Dados](#resetar-banco-de-dados)

  - [Modelo de Dados](#modelo-de-dados)

- [Usuários e Autenticação](#usu&#225;rios-e-autentica&#231;&#227;o)

- [Internacionalização (i18n)](#internacionaliza&#231;&#227;o-i18n)

- [Fluxo de Desenvolvimento](#fluxo-de-desenvolvimento)

- [Dependências](#depend&#234;ncias)

---

### Introdução

Aplicação `Next.js` com autenticação completa usando `Prisma ORM` e `PostgreSQL`.

Funcionalidades principais:

- Autenticação por e-mail e senha

- Login mágico (Magic Link)

- Verificação de e-mail

- Controle de papéis (`ADMIN`, `USER`)

- Soft delete de usuários

- Sidebar com `Shadcn/ui`

---

### Stack

- Next.js 16+

- Prisma ORM

- PostgreSQL

- Shadcn/ui

- TailwindCSS

- Nodemailer

- Zod

- bcrypt-ts

- JWT (jose)

- next-intl (i18n)

---

### Requisitos

- Node.js 20+

- PostgreSQL 17+

---

### Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto:

```env
    DATABASE_URL="postgresql://user:password@localhost:5432/dbname"
    AUTH_SECRET="your-secret-key"
    SMTP_HOST="smtp.example.com"
    SMTP_PORT="587"
    SMTP_USER="your@email.com"
    SMTP_PASS="yourpassword"
    NEXT_URL="http://localhost:3000"
```

---

### Rodando o Projeto

```bash
    npm install
    npm run dev
```

A aplicação estará disponível em:

```bash
    http://localhost:3000
```

---

### Prisma & Banco de Dados

O projeto utiliza `Prisma ORM` para modelagem, versionamento e acesso ao banco de dados `PostgreSQL`.

A criação e manutenção das estruturas do banco (tabelas, enums, extensões e triggers) é feita exclusivamente via migrations do Prisma.

---

### Prisma Schema

Arquivo: prisma/schema.prisma

```prisma

    generator client {
      provider = "prisma-client"
      output   = "../app/generated/prisma"
    }

    datasource db {
      provider = "postgresql"
    }

    model users {
      id                String      @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
      name              String
      email             String      @unique @db.Citext
      password          String?
      role              user_role   @default(USER)
      email_verified    DateTime?   @db.Timestamptz(6)
      avatar            String?
      deleted_at        DateTime?   @db.Timestamptz(6)
      created_at        DateTime    @default(now()) @db.Timestamptz(6)
      updated_at        DateTime    @default(now()) @db.Timestamptz(6)
    }

    model verification_tokens {
      identifier    String      @db.Citext
      token         String
      expires_at    DateTime    @db.Timestamptz(6)

      @@id([identifier, token])
    }

    enum user_role {
      ADMIN
      USER
    }

```

---

### Gerar Prisma Client

Sempre que o schema for alterado:

```bash

    npx prisma generate

```

O Prisma Client será gerado em:

```text

    /app/generated/prisma

```

---

### Criar / Atualizar Banco de Dados

Para criar o banco e aplicar o schema pela primeira vez:

```bash

    npx prisma migrate dev

```

Esse comando:

- Cria as tabelas no PostgreSQL

- Cria o ENUM user_role

- Versiona o schema via migrations

- Mantém histórico de alterações

---

### Resetar Banco de Dados

Para apagar todas as tabelas e recriar o banco:

```bash

    npx prisma migrate reset

```

⚠️ **Atenção:**

- Remove todos os dados

- Reexecuta todas as migrations

- Uso recomendado apenas em ambiente de desenvolvimento

---

### Modelo de Dados

**Tabelas**

- users

- verification_tokens

### ENUM

- user_role

  - ADMIN

  - USER

### Regras importantes

`users.email` utiliza `CITEXT` (case-insensitive)

Primeiro usuário criado recebe automaticamente o papel `ADMIN`

Soft delete através do campo `deleted_at`

Campos de data usam `TIMESTAMPTZ`

Caso seja necessário criar triggers, extensões (`pgcrypto`, `citext`) ou funções SQL, elas devem ser adicionadas via **migration SQL do Prisma**.

---

### Usuários e Autenticação

- Primeiro usuário registrado → ADMIN

- Apenas ADMINs podem criar novos usuários

- Login: e-mail + senha ou login mágico

- Controle de acesso por papéis (`ADMIN`, `USER`)

- Soft delete de usuários

---

### Internacionalização (i18n)

O projeto utiliza next-intl para oferecer suporte a múltiplos idiomas de forma integrada ao App Router do Next.js.

**Idiomas suportados**

- pt

- en - (padrão)

---

### Fluxo de Desenvolvimento

```text
    1. Configurar .env
    2. Executar prisma migrate dev
    3. Gerar Prisma Client
    4. Criar primeiro usuário (ADMIN)
    5. Desenvolver normalmente
    6. Resetar banco se necessário → prisma migrate reset
```
---

### Dependências

- Next.js, React, TailwindCSS

- Radix UI, Nodemailer, jose, bcrypt-ts, pg, Zod, gsap

---