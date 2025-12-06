# Node.js TypeScript Express Template

[![Test](https://github.com/BobDempsey/node-ts-template/actions/workflows/test.yml/badge.svg)](https://github.com/BobDempsey/node-ts-template/actions/workflows/test.yml)
[![Build](https://github.com/BobDempsey/node-ts-template/actions/workflows/build.yml/badge.svg)](https://github.com/BobDempsey/node-ts-template/actions/workflows/build.yml)
[![Biome Lint and Format](https://github.com/BobDempsey/node-ts-template/actions/workflows/biome.yml/badge.svg)](https://github.com/BobDempsey/node-ts-template/actions/workflows/biome.yml)
[![codecov](https://codecov.io/gh/BobDempsey/node-ts-template/branch/main/graph/badge.svg)](https://codecov.io/gh/BobDempsey/node-ts-template)

A production-ready Node.js project template with TypeScript and Express.js support.

## Features

- ⚡ **Express.js** - Fast, unopinionated web framework with TypeScript support
- 🚀 **TypeScript** - Full TypeScript support with strict type checking
- 🔄 **Hot Reload** - Automatic restart on file changes during development
- 📦 **Modern Node.js** - Targets ES2020 and Node.js 24+
- 🛠️ **Development Ready** - Pre-configured build and development scripts
- 🔒 **Type-Safe Environment** - Zod-based environment variable validation and type safety
- 🧪 **Testing Suite** - Jest and Supertest for comprehensive unit and integration testing
- 🎨 **Code Quality** - Biome for fast linting and formatting
- 🪝 **Pre-commit Hooks** - Husky and lint-staged for automatic code quality checks
- 📝 **Built-in Logger** - Custom logger with timestamps and log levels
- 🛡️ **Error Handling** - Built-in 404 handler and error management

## Project Structure

```
node-ts-express-template/
├── .github/
│   └── workflows/          # GitHub Actions CI/CD workflows
│       ├── test.yml        # Test workflow with coverage
│       ├── build.yml       # Build validation workflow
│       └── biome.yml       # Code quality workflow
├── .husky/                 # Git hooks configuration
├── .vscode/                # VS Code workspace settings
│   ├── extensions.json     # Recommended extensions
│   └── settings.json       # Editor settings
├── src/
│   ├── lib/
│   │   ├── env.ts          # Environment variable schema and validation
│   │   ├── try-parse-env.ts # Zod environment parsing utility
│   │   ├── logger.ts       # Custom logger with timestamps and log levels
│   │   └── constants.ts    # Application constants
│   └── index.ts            # Main entry point (Express server)
├── tests/
│   ├── unit/               # Unit tests
│   ├── integration/        # Integration tests
│   ├── rest/               # VS Code REST Client requests
│   │   └── requests.http   # HTTP request examples
│   └── setup/              # Test configuration and utilities
│       ├── jest.setup.ts   # Jest global setup
│       └── test-utils.ts   # Test helper utilities
├── coverage/               # Test coverage reports (auto-generated)
├── dist/                   # Compiled JavaScript output (auto-generated)
├── node_modules/           # Dependencies
├── .env.example            # Example environment variables
├── .gitignore              # Git ignore rules
├── biome.json              # Biome linter and formatter configuration
├── jest.config.ts          # Jest testing configuration
├── package.json            # Project configuration
├── package-lock.json       # Locked dependency versions
├── tsconfig.json           # TypeScript configuration for development
├── tsconfig.build.json     # TypeScript configuration for production builds
└── README.md               # This file
```

## Getting Started

### Prerequisites

- Node.js 24.0.0 or higher
- npm 10.0.0 or higher

### Installation

1. Clone or download this template
2. Navigate to the project directory
3. Install dependencies:

   ```bash
   npm install
   ```

### Development

Start the development server with hot reload:

```bash
npm run dev
```

This will start the server on `http://localhost:3000` and automatically restart when you make changes to the code.

## Working with Express

### Basic Server Structure

The Express application is set up in `src/index.ts` with the following features:

```typescript
import express, { type Request, type Response } from "express"

const app = express()

// Middleware
app.use(express.json())                    // Parse JSON bodies
app.use(express.urlencoded({ extended: true }))  // Parse URL-encoded bodies

// Routes
app.get("/", (_req: Request, res: Response) => {
  res.send("Hello, World!")
})

// 404 handler
app.use((_req: Request, res: Response) => {
  res.status(404).json({ error: "Not Found" })
})
```

### Adding New Routes

You can add new routes directly in `src/index.ts` or organize them in separate files:

**Option 1: Add routes in index.ts**

```typescript
app.get("/api/users", (req: Request, res: Response) => {
  res.json({ users: [] })
})

app.post("/api/users", (req: Request, res: Response) => {
  const userData = req.body
  res.status(201).json({ message: "User created", data: userData })
})
```

**Option 2: Create route modules**

```typescript
// src/routes/users.ts
import { Router, type Request, type Response } from "express"

const router = Router()

router.get("/", (req: Request, res: Response) => {
  res.json({ users: [] })
})

router.post("/", (req: Request, res: Response) => {
  res.status(201).json({ message: "User created" })
})

export default router

// src/index.ts
import userRoutes from "./routes/users"
app.use("/api/users", userRoutes)
```

### Middleware

Express middleware is already configured for common use cases:

- **JSON parsing**: `express.json()` - Automatically parses JSON request bodies
- **URL-encoded parsing**: `express.urlencoded({ extended: true })` - Handles form data

Add custom middleware:

```typescript
// Logging middleware
app.use((req: Request, res: Response, next) => {
  logger.info(`${req.method} ${req.path}`)
  next()
})

// Authentication middleware
const authMiddleware = (req: Request, res: Response, next) => {
  const token = req.headers.authorization
  if (!token) {
    return res.status(401).json({ error: "Unauthorized" })
  }
  next()
}

app.get("/protected", authMiddleware, (req, res) => {
  res.json({ message: "Protected route" })
})
```

### Building

Compile TypeScript to JavaScript:

```bash
npm run build
```

This creates optimized JavaScript files in the `dist/` directory.

### Production

Run the compiled JavaScript in production:

```bash
npm start
```

### Other Commands

- `npm run clean` - Remove the `dist/` directory

### Code Quality

Format and lint your code with Biome:

```bash
npm run format        # Check formatting
npm run format:fix    # Fix formatting issues
npm run lint          # Check for linting issues
npm run lint:fix      # Fix linting issues
npm run check         # Run both linting and formatting checks
npm run check:fix     # Fix both linting and formatting issues
```

### Pre-commit Hooks

This template uses Husky and lint-staged to ensure code quality before commits:

- **Automatic Linting** - Biome automatically checks and fixes issues on staged files
- **Format Enforcement** - Code is formatted consistently before each commit
- **Zero Configuration** - Hooks are set up automatically on `npm install`

The pre-commit hook runs `biome check --write` on all staged files, ensuring that only properly formatted and linted code is committed.

### Testing

Run the test suite:

```bash
npm test
```

#### Test Scripts

- **`npm test`** - Run all tests once
- **`npm run test:watch`** - Run tests in watch mode (reruns on file changes)
- **`npm run test:coverage`** - Run tests with coverage report
- **`npm run test:ci`** - Run tests in CI mode (no watch, with coverage)

#### Running Specific Tests

Run a single test file:

```bash
npm test -- tests/unit/env.test.ts --watch
```

Run a specific test case by name:

```bash
npm test -- --testNamePattern="should define correct schema structure" --watch
```

#### Test Structure

The project includes comprehensive testing with Jest and Supertest:

- **Unit Tests** (`tests/unit/`) - Test individual functions and modules

  - Environment variable validation
  - Zod schema testing
  - Utility function testing

- **Integration Tests** (`tests/integration/`) - Test complete workflows

  - Express HTTP endpoints
  - Request/response handling
  - Middleware functionality
  - Server performance testing

- **Test Utilities** (`tests/setup/`) - Helper functions and configurations
  - Mock environment setup
  - Test server utilities
  - Common test patterns

#### Writing Tests

Create test files with `.test.ts` or `.spec.ts` extensions in the `tests/` directory:

```typescript
// tests/unit/example.test.ts
describe("Example Test", () => {
  it("should pass", () => {
    expect(true).toBe(true)
  })
})
```

Tests automatically have access to:

- Jest testing framework
- Supertest for HTTP testing
- TypeScript support
- Environment mocking utilities

#### Testing Express Routes

Use Supertest to test your Express routes:

```typescript
import request from "supertest"
import { app } from "@/index"

describe("API Tests", () => {
  it("should return users list", async () => {
    const response = await request(app)
      .get("/api/users")
      .expect(200)

    expect(response.body).toHaveProperty("users")
  })

  it("should create a new user", async () => {
    const newUser = { name: "John Doe", email: "john@example.com" }

    const response = await request(app)
      .post("/api/users")
      .send(newUser)
      .set("Content-Type", "application/json")
      .expect(201)

    expect(response.body).toHaveProperty("message", "User created")
  })

  it("should return 404 for undefined routes", async () => {
    const response = await request(app)
      .get("/nonexistent")
      .expect(404)

    expect(response.body).toEqual({ error: "Not Found" })
  })
})
```

### Manual API Testing

This project includes configuration for manual API testing using two popular VS Code extensions:

#### VS Code REST Client

REST Client requests are available in [tests/rest/requests.http](tests/rest/requests.http).

**Quick Start:**
1. Install the `humao.rest-client` extension (recommended via `.vscode/extensions.json`)
2. Start the server: `npm run dev`
3. Open [tests/rest/requests.http](tests/rest/requests.http)
4. Click "Send Request" above any request

**Features:**
- Simple text-based request format
- Variable support with `@baseUrl`
- Multiple requests in a single file
- Inline response viewing

See the comments in [tests/rest/requests.http](tests/rest/requests.http) for detailed usage instructions.

#### Available Test Requests

Both tools include the same set of test requests:
- **Basic GET Requests** - Simple GET with various headers
- **POST Requests** - JSON, form data, and plain text payloads
- **Other HTTP Methods** - PUT, DELETE, PATCH requests
- **Error & Edge Cases** - Content type mismatches and large payloads

## Recommended VS Code Extensions

This project includes recommended VS Code extensions in [.vscode/extensions.json](.vscode/extensions.json). When you open the project in VS Code, you'll be prompted to install them.

### Recommended Extensions

- **Better TypeScript Errors** (`better-ts-errors.better-ts-errors`) - Makes TypeScript error messages more readable and easier to understand
- **Biome** (`biomejs.biome`) - Official Biome extension for linting and formatting with real-time feedback
- **Jest** (`Orta.vscode-jest`) - Integrated Jest testing with inline test results and debugging
- **Path Intellisense** (`christian-kohler.path-intellisense`) - Autocomplete for file paths in your code

### Installing Extensions

VS Code will automatically prompt you to install recommended extensions when you open the project. Alternatively, you can:

1. Open the Extensions view (Cmd+Shift+X on macOS, Ctrl+Shift+X on Windows/Linux)
2. Type `@recommended` in the search box
3. Install the extensions listed under "Workspace Recommendations"

## Configuration

### TypeScript Configuration

The `tsconfig.json` is configured with:

- Target: ES2020
- Module: CommonJS
- Strict type checking enabled
- Source maps for debugging
- Declaration files generation

### Environment Variables

This project uses **Zod** for type-safe environment variable validation and parsing.

#### Configuration

Environment variables are defined and validated in `src/lib/env.ts` using Zod schemas:

```typescript
const EnvSchema = z.object({
  NODE_ENV: z.string().optional(),
  PORT: z.number().default(3000).optional(),
})
```

#### Supported Variables

- `PORT` - Server port (default: 3000)
- `NODE_ENV` - Environment mode (development, production, test)

#### Adding New Environment Variables

1. Update the Zod schema in `src/lib/env.ts`:

   ```typescript
   const EnvSchema = z.object({
     NODE_ENV: z.string().optional(),
     PORT: z.number().default(3000).optional(),
     // Add your new variable here
     DATABASE_URL: z.string().url(),
     API_KEY: z.string().min(1),
   })
   ```

2. Create a `.env` file in the root directory for development:
   ```env
   PORT=3000
   NODE_ENV=development
   DATABASE_URL=postgresql://localhost:5432/mydb
   API_KEY=your-secret-key
   ```

#### Benefits

- **Runtime Validation** - Environment variables are validated at startup
- **Type Safety** - Full TypeScript support for environment variables
- **Clear Error Messages** - Helpful error messages for missing or invalid variables
- **Default Values** - Support for default values when variables are optional

## CI/CD

This template includes GitHub Actions workflows for continuous integration and deployment:

### Test Workflow

Runs on every push and pull request to `main` and `develop` branches:

- **Node.js 24** - Tests on the latest required version
- **Test Coverage** - Runs full test suite with coverage reporting
- **Coverage Upload** - Automatically uploads coverage reports to Codecov

### Build Workflow

Runs on every push and pull request to `main` and `develop` branches:

- **Matrix Building** - Builds on Node.js versions 22 and 24
- **Build Validation** - Ensures the project builds successfully and verifies artifacts
- **Artifact Storage** - Saves build artifacts for 7 days

### Code Quality Workflow

Ensures code quality standards:

- **Biome Linting** - Checks code style and potential issues
- **Formatting** - Validates code formatting
- **Auto-fix** - Automatically fixes formatting issues when possible

### Setting Up Codecov (Optional)

To enable coverage reporting:

1. Sign up at [codecov.io](https://codecov.io)
2. Add your repository
3. Add `CODECOV_TOKEN` to your GitHub repository secrets
4. Coverage reports will be automatically uploaded on each CI run

If you don't want to use Codecov, the workflow will continue without failing.

## Scripts Explained

- **`npm run dev`** - Uses `nodemon` and `ts-node` to run TypeScript directly with hot reload
- **`npm run build`** - Compiles TypeScript using the TypeScript compiler (`tsc`)
- **`npm start`** - Runs the compiled JavaScript from the `dist/` directory
- **`npm run clean`** - Removes build artifacts
- **`npm run prepare`** - Automatically sets up Husky git hooks (runs on `npm install`)

## Dependencies

### Runtime Dependencies

- **express** - Fast, unopinionated, minimalist web framework for Node.js
- **dotenv** - Load environment variables from `.env` files
- **zod** - TypeScript-first schema validation for environment variables

### Development Dependencies

- **typescript** - TypeScript compiler
- **@types/node** - Node.js type definitions
- **@types/express** - TypeScript definitions for Express
- **ts-node** - Run TypeScript directly without compilation
- **nodemon** - Monitor for file changes and auto-restart
- **rimraf** - Cross-platform rm -rf command
- **@biomejs/biome** - Fast linter and formatter for JavaScript/TypeScript
- **husky** - Git hooks made easy
- **lint-staged** - Run linters on git staged files

### Testing Dependencies

- **jest** - JavaScript testing framework
- **@types/jest** - TypeScript definitions for Jest
- **ts-jest** - Jest transformer for TypeScript
- **supertest** - HTTP testing library
- **@types/supertest** - TypeScript definitions for Supertest

## Troubleshooting

### Jest Error When First Opening the Project

When you first open this project in your editor, you may see a Jest-related error before running `npm install`. This is expected behavior and occurs because Jest and its dependencies haven't been installed yet.

**Solution:** Simply run `npm install` to install all project dependencies. The error will disappear once the packages are installed.

## License

MIT
