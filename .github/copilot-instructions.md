---
mode: 'agent'
---
# Project Bootstrapper AI Prompt

You are an advanced project scaffolding agent. When invoked, you will generate and configure a full-stack TypeScript project with robust tooling and workflows. Follow all instructions, ask clarifying questions, and suggest improvements at each step.

---

## User Requirements & Preferences (Finalized)

- **Repo Structure:** Monorepo (frontend and backend managed together)
- **Frontend Framework:** SvelteKit with Tailwind CSS (latest)
- **Backend:** TypeScript-based Express server
- **Database:** SQLite
- **ORM:** Prisma (industry-standard, TypeScript-friendly)
- **Package Manager:** npm
- **Frontend Deployment:** GitHub Pages
- **Backend Deployment:** Vercel
- **CI/CD:** GitHub Actions—run lint, test, and deployment checks; block pushes if errors remain; enforce branch protection; pre-commit hooks (Husky)
- **Integrations:** ESLint, Prettier, Husky, Docker support, environment variable management, Storybook
- **API Communication:** Both REST and GraphQL endpoints should be set up in the backend, and the frontend should have example usage for both.
- **Testing:** Jest for backend, Svelte Testing Library for frontend
- **License:** MIT

---

## Project Requirements

1. **Repo Structure**
   - Monorepo with clear separation: `/frontend` (SvelteKit) and `/backend` (Express).
   - Shared configuration and scripts at the root (e.g., lint, format, test runners).

2. **TypeScript Configuration**
   - Root `tsconfig.json` with project references for both frontend and backend.
   - Strict typing, module resolution, compatibility with Jest, Express, SvelteKit.

3. **Frontend (SvelteKit + Tailwind + Storybook)**
   - Scaffold SvelteKit project in `/frontend`.
   - Integrate Tailwind CSS.
   - Set up Storybook for Svelte components.
   - Example component, page, and Storybook story.
   - Example code for fetching from both REST and GraphQL backend endpoints.

4. **Backend (Express + Prisma + SQLite)**
   - Scaffold TypeScript-based Express server in `/backend`.
   - Integrate Prisma ORM with SQLite as the default database.
   - Scaffold both REST and GraphQL endpoints with sample CRUD operations.
   - Example Prisma schema and migration.

5. **Testing**
   - Jest configured for backend (`/backend`).
   - Svelte Testing Library configured for frontend (`/frontend`).
   - Sample tests for both, including API endpoint tests.

6. **Linting & Formatting**
   - ESLint and Prettier configured at the root, extending into both frontend and backend.
   - Lint and format scripts in root `package.json`.

7. **Pre-commit Hooks**
   - Husky configured to run lint, format, and test on pre-commit and pre-push.

8. **Docker Support**
   - Dockerfiles for both frontend and backend, and a `docker-compose.yml` for development with SQLite.
   - Secure environment variable management for both frontend and backend, with `.env.example` files.

9. **Deployment**
   - GitHub Actions workflows:
     - Lint, test, and block pushes if errors remain.
     - Frontend deploys to GitHub Pages.
     - Backend deploys to Vercel.
   - Scripts for building and deploying both frontend and backend.

10. **Documentation**
    - Root `README.md` with:
      - Project structure
      - Setup, development, and deployment instructions
      - Contribution guidelines
      - Environment variable usage
      - License
      - How to use Storybook

11. **License**
    - MIT License included in the root.

---

## Expected Output

- A complete monorepo scaffold with `/frontend` and `/backend`, all requested tooling, configuration, and example code.
- Automated workflows for linting, testing, and deployment.
- Complete documentation for setup, development, contribution, and deployment.
- Suggestions for further improvements based on best practices.

---

## Constraints

- All code must be TypeScript-first.
- Use latest stable dependencies.
- All configuration files must be included and documented.
- Linting and testing must block commits/pushes if errors remain.
- Frontend deploys to GitHub Pages; backend deploys to Vercel.
- Minimal but functional starter code for both frontend (SvelteKit + Tailwind + Storybook) and backend (Express + Prisma + SQLite) with both REST and GraphQL endpoints.
- Example API communication in the frontend for both REST and GraphQL.

---

## Summary of Clarified Choices

1. **Monorepo** with `/frontend` (SvelteKit) and `/backend` (Express)
2. **SvelteKit** for frontend
3. **Prisma** ORM
4. **Both REST & GraphQL** in backend, with frontend examples for both
5. **Svelte Testing Library** for frontend; **Jest** for backend
6. **Pre-commit hooks** (Husky), **Docker** support, **dotenv** for env variables
7. **Storybook** integration for Svelte components
8. **MIT** license

---