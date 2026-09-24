# Blog API (NestJS)

API REST de um blog, feita com **NestJS 11**, **TypeORM** e **SQLite**. Ela é o backend do frontend [blog-app](../blog-app) (Next.js).

Principais recursos:

- Cadastro de usuários e login com **JWT** (Passport)
- CRUD de posts: cada usuário gerencia os próprios posts, e os posts publicados são públicos
- Upload de imagens validado pelo conteúdo real do arquivo (não só pela extensão), servidas em `/uploads`
- Segurança: `helmet`, CORS por whitelist, rate limit no login (`@nestjs/throttler`) e validação de DTOs com `class-validator`

---

## Stack

| Camada       | Tecnologia                                       |
| ------------ | ------------------------------------------------ |
| Framework    | NestJS 11                                        |
| Banco        | SQLite (`better-sqlite3`) via TypeORM            |
| Autenticação | `@nestjs/jwt` + `passport-jwt`, senhas com `bcryptjs` |
| Upload       | `multer` (memória) + `file-type`                 |
| Testes       | Jest + Supertest                                 |

## Pré-requisitos

- **Node.js 20+** (desenvolvido com Node 24)
- npm

> O `better-sqlite3` é um módulo nativo. No Windows, se o `npm install` falhar ao compilá-lo, instale as *Build Tools* do Visual Studio (C++) ou use uma versão LTS do Node que tenha binários prontos.

## Como rodar localmente

```bash
# 1. Instale as dependências
npm install

# 2. Crie o arquivo de variáveis de ambiente
cp .env.example .env
#    e edite o .env (principalmente o JWT_SECRET)

# 3. Suba a API em modo desenvolvimento
npm run start:dev
```

A API sobe em `http://localhost:3001`.

O banco `db.sqlite` é criado automaticamente na raiz do projeto na primeira execução, e as tabelas são geradas pelo TypeORM (`synchronize: true`). Não há seed: crie um usuário pela rota `POST /user`.

## Variáveis de ambiente

Todas ficam no arquivo `.env`, que **não é versionado**. Use o [.env.example](.env.example) como modelo.

| Variável         | Obrigatória | Descrição                                                                                 |
| ---------------- | ----------- | ----------------------------------------------------------------------------------------- |
| `JWT_SECRET`     | Sim         | Chave usada para assinar os tokens. Deve ser **igual** ao `JWT_SECRET_KEY` do frontend.   |
| `PORT`           | Não         | Porta da API. Padrão: `3001`.                                                             |
| `CORS_WHITELIST` | Sim\*       | Origens liberadas no CORS, separadas por espaço. Ex.: `http://localhost:3000`.            |

\* Sem `CORS_WHITELIST`, só são aceitas requisições sem cabeçalho `Origin` (servidor a servidor, REST Client, curl). As chamadas do Next.js acontecem no servidor (Server Actions), então funcionam mesmo assim, mas o recomendado é configurar.

Para gerar um `JWT_SECRET` forte:

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

> **Nota:** as configurações do banco (tipo, arquivo, `synchronize`) estão fixas em [src/app.module.ts](src/app.module.ts) e o token expira em `1d` ([src/auth/auth.module.ts](src/auth/auth.module.ts)). Elas ainda não são lidas do `.env`.

## Scripts

| Comando              | O que faz                              |
| -------------------- | -------------------------------------- |
| `npm run start:dev`  | Desenvolvimento com *watch*            |
| `npm run start`      | Inicia sem *watch*                     |
| `npm run build`      | Compila para `dist/`                   |
| `npm run start:prod` | Roda o build (`node dist/main`)        |
| `npm run lint`       | ESLint com correção automática         |
| `npm run format`     | Prettier                               |
| `npm run test`       | Testes unitários                       |
| `npm run test:e2e`   | Testes end-to-end                      |
| `npm run test:cov`   | Cobertura de testes                    |

## Endpoints

🔒 = exige o header `Authorization: Bearer <accessToken>`

### Auth

| Método | Rota          | Descrição                                                                |
| ------ | ------------- | ------------------------------------------------------------------------ |
| POST   | `/auth/login` | Login com `{ email, password }`. Retorna `{ accessToken }`. Tem rate limit (10 req / 10 s). |

### Usuário

| Método | Rota                | Descrição                                            |
| ------ | ------------------- | ---------------------------------------------------- |
| POST   | `/user`             | Cria usuário `{ name, email, password }`             |
| GET    | `/user/me`          | 🔒 Dados do usuário logado                           |
| PATCH  | `/user/me`          | 🔒 Atualiza `{ name, email }`                        |
| PATCH  | `/user/me/password` | 🔒 Troca a senha `{ currentPassword, newPassword }`  |
| DELETE | `/user/me`          | 🔒 Remove a própria conta                            |

### Posts

| Método | Rota           | Descrição                                   |
| ------ | -------------- | ------------------------------------------- |
| GET    | `/post`        | Lista os posts publicados                   |
| GET    | `/post/:slug`  | Um post publicado, pelo slug                |
| POST   | `/post/me`     | 🔒 Cria um post                             |
| GET    | `/post/me`     | 🔒 Lista os posts do usuário logado         |
| GET    | `/post/me/:id` | 🔒 Um post do usuário (id UUID)             |
| PATCH  | `/post/me/:id` | 🔒 Atualiza um post do usuário              |
| DELETE | `/post/me/:id` | 🔒 Remove um post do usuário                |

### Upload

| Método | Rota                | Descrição                                                                                         |
| ------ | ------------------- | ------------------------------------------------------------------------------------------------- |
| POST   | `/upload`           | 🔒 `multipart/form-data` com o campo `file`. Aceita PNG, JPEG, WEBP e GIF de até 20 MB. Retorna `{ url }`. |
| GET    | `/uploads/<arquivo>`| Serve as imagens enviadas                                                                         |

As imagens são salvas em `uploads/AAAA-MM-DD/` na raiz do projeto. Essa pasta não é versionada.

### Testando as rotas

O arquivo [rest-client/requests.http](rest-client/requests.http) tem exemplos de todas as requisições. Ele funciona com a extensão [REST Client](https://marketplace.visualstudio.com/items?itemName=humao.rest-client) do VS Code: rode primeiro o `authLogin`, e o token é reaproveitado nas outras chamadas.

## Estrutura

```
src/
├── auth/        # login, estratégia JWT e guard
├── user/        # entidade, DTOs e rotas de usuário
├── post/        # entidade, DTOs e rotas de posts
├── upload/      # upload e servidor estático de imagens
├── common/      # filtro global de exceções, hashing, pipes e utils (slug etc.)
├── app.module.ts
└── main.ts      # helmet, CORS, ValidationPipe e porta
rest-client/     # requisições de exemplo (.http)
test/            # testes e2e
```

## Rodando junto com o frontend

1. Suba esta API (`npm run start:dev`, porta **3001**).
2. No [blog-app](../blog-app), configure `API_URL=http://localhost:3001` e use o mesmo segredo JWT (`JWT_SECRET_KEY` = `JWT_SECRET`).
3. Suba o frontend (`npm run dev`, porta **3000**) e coloque `http://localhost:3000` no `CORS_WHITELIST` daqui.

## O que não vai para o Git

Definido no [.gitignore](.gitignore): `.env`, `db.sqlite`, `uploads/`, `dist/` e `node_modules/`. Cada pessoa que clonar o projeto cria o próprio `.env` e o próprio banco.
