# Production-Ready `package.json`

This file outlines a comprehensive `package.json` configuration for a production-grade, open-source React application. The stack is built around a modern, performant, and developer-friendly set of tools.

### Core Stack

*   **Build Tool**: [Vite](https://vitejs.dev/) - A next-generation frontend tool that provides an extremely fast development experience and optimized production builds.
*   **Framework**: [React](https://react.dev/) - The core UI library.
*   **Language**: [TypeScript](https://www.typescriptlang.org/) - For robust, scalable, and type-safe code.
*   **Styling**: [Tailwind CSS](https://tailwindcss.com/) - A utility-first CSS framework for rapid UI development.
*   **Testing**: [Vitest](https://vitest.dev/) & [React Testing Library](https://testing-library.com/) - A modern, Vite-native testing framework for fast and reliable unit and component tests.
*   **Code Quality**: [ESLint](https://eslint.org/) & [Prettier](https://prettier.io/) - For enforcing consistent code style and identifying potential issues early.

This configuration includes scripts for development, building, testing, and linting, along with a curated list of dependencies and devDependencies that are all free and open-source.

---

```json
{
  "name": "cyberpunk-hud-interface",
  "version": "1.0.0",
  "private": false,
  "description": "A futuristic, modular web application interface featuring a glass morphism cyberpunk aesthetic.",
  "author": "Your Name or Company <contact@example.com>",
  "license": "MIT",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "lint": "eslint . --ext ts,tsx --report-unused-disable-directives --max-warnings 0",
    "format": "prettier --write .",
    "preview": "vite preview",
    "test": "vitest",
    "coverage": "vitest run --coverage"
  },
  "dependencies": {
    "@google/genai": "^1.13.0",
    "clsx": "^2.1.1",
    "framer-motion": "^11.3.12",
    "html-to-image": "^1.11.11",
    "nanoid": "^5.1.5",
    "react": "^19.1.1",
    "react-dom": "^19.1.1",
    "react-rnd": "^10.5.2",
    "react-router-dom": "^6.25.1",
    "recharts": "^3.1.2",
    "tailwind-merge": "^2.4.0"
  },
  "devDependencies": {
    "@testing-library/jest-dom": "^6.4.8",
    "@testing-library/react": "^16.0.0",
    "@testing-library/user-event": "^14.5.2",
    "@types/react": "^18.3.3",
    "@types/react-dom": "^18.3.0",
    "@typescript-eslint/eslint-plugin": "^7.17.0",
    "@typescript-eslint/parser": "^7.17.0",
    "@vitejs/plugin-react": "^4.3.1",
    "@vitest/coverage-v8": "^2.0.4",
    "autoprefixer": "^10.4.19",
    "eslint": "^8.57.0",
    "eslint-config-prettier": "^9.1.0",
    "eslint-plugin-jsx-a11y": "^6.9.0",
    "eslint-plugin-react": "^7.35.0",
    "eslint-plugin-react-hooks": "^4.6.2",
    "eslint-plugin-react-refresh": "^0.4.8",
    "jsdom": "^24.1.1",
    "postcss": "^8.4.39",
    "prettier": "^3.3.3",
    "prettier-plugin-tailwindcss": "^0.6.5",
    "tailwindcss": "^3.4.6",
    "typescript": "^5.5.4",
    "vite": "^5.3.5",
    "vitest": "^2.0.4"
  },
  "browserslist": {
    "production": [
      ">0.2%",
      "not dead",
      "not op_mini all"
    ],
    "development": [
      "last 1 chrome version",
      "last 1 firefox version",
      "last 1 safari version"
    ]
  }
}


# Production-Ready Backend `package.json`

This file outlines a comprehensive `package.json` configuration for a production-grade, open-source backend application built with Node.js. The stack is designed for performance, security, and developer efficiency.

### Core Stack

*   **Runtime**: [Node.js](https://nodejs.org/)
*   **Framework**: [Express.js](https://expressjs.com/) - A fast, unopinionated, minimalist web framework for Node.js.
*   **Language**: [TypeScript](https://www.typescriptlang.org/) - For building a robust, scalable, and type-safe backend.
*   **Database ORM**: [Prisma](https://www.prisma.io/) - A next-generation, type-safe ORM for Node.js and TypeScript.
*   **Authentication**: [JSON Web Tokens (JWT)](https://jwt.io/) & [bcrypt](https://www.npmjs.com/package/bcrypt) - For secure, stateless authentication and password hashing.
*   **Validation**: [Zod](https://zod.dev/) - A TypeScript-first schema declaration and validation library.
*   **Testing**: [Jest](https://jestjs.io/) & [Supertest](https://www.npmjs.com/package/supertest) - For reliable unit, integration, and API endpoint testing.
*   **Code Quality**: [ESLint](https://eslint.org/) & [Prettier](https://prettier.io/) - For maintaining a consistent and high-quality codebase.

This configuration includes scripts for development (with live-reloading), building for production, running tests, and managing database migrations.

---

```json
{
  "name": "cyberpunk-hud-backend",
  "version": "1.0.0",
  "private": false,
  "description": "Backend service for the futuristic modular web application.",
  "author": "Your Name or Company <contact@example.com>",
  "license": "MIT",
  "main": "dist/server.js",
  "scripts": {
    "dev": "ts-node-dev --respawn --transpile-only src/server.ts",
    "build": "tsc",
    "start": "node dist/server.js",
    "start:prod": "pm2 start dist/server.js",
    "lint": "eslint . --ext .ts",
    "format": "prettier --write \"src/**/*.ts\"",
    "test": "jest",
    "test:watch": "jest --watch",
    "prisma:migrate": "prisma migrate dev",
    "prisma:generate": "prisma generate"
  },
  "dependencies": {
    "@prisma/client": "^5.17.0",
    "bcrypt": "^5.1.1",
    "cors": "^2.8.5",
    "dotenv": "^16.4.5",
    "express": "^4.19.2",
    "helmet": "^7.1.0",
    "jsonwebtoken": "^9.0.2",
    "morgan": "^1.10.0",
    "pm2": "^5.4.2",
    "zod": "^3.23.8"
  },
  "devDependencies": {
    "@types/bcrypt": "^5.0.2",
    "@types/cors": "^2.8.17",
    "@types/express": "^4.17.21",
    "@types/jest": "^29.5.12",
    "@types/jsonwebtoken": "^9.0.6",
    "@types/morgan": "^1.9.9",
    "@types/node": "^20.14.10",
    "@types/supertest": "^6.0.2",
    "@typescript-eslint/eslint-plugin": "^7.17.0",
    "@typescript-eslint/parser": "^7.17.0",
    "eslint": "^8.57.0",
    "eslint-config-prettier": "^9.1.0",
    "jest": "^29.7.0",
    "nodemon": "^3.1.4",
    "prettier": "^3.3.3",
    "prisma": "^5.17.0",
    "supertest": "^7.0.0",
    "ts-jest": "^29.2.0",
    "ts-node": "^10.9.2",
    "ts-node-dev": "^2.0.0",
    "typescript": "^5.5.4"
  }
}