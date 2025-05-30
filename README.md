# Monorepo: SvelteKit + Express + Prisma + SQLite

## Project Structure

- `/frontend` — SvelteKit app (with Tailwind CSS, Storybook, Svelte Testing Library)
- `/backend` — TypeScript Express API (REST & GraphQL, Prisma ORM, SQLite, Jest)
- Shared config/scripts at root

## Getting Started

### Prerequisites
- Node.js (LTS)
- npm

### Setup
1. Install dependencies:
   ```sh
   npm install
   cd frontend && npm install
   cd ../backend && npm install
   ```
2. Copy `.env.example` to `.env` in both `/frontend` and `/backend` and adjust as needed.
3. Run database migration:
   ```sh
   cd backend
   npx prisma migrate dev --name init
   ```

### Development
- **Frontend:**
  ```sh
  cd frontend
  npm run dev
  ```
- **Backend:**
  ```sh
  cd backend
  npm run dev
  ```

### Testing
- **Frontend:**
  ```sh
  cd frontend
  npm test
  ```
- **Backend:**
  ```sh
  cd backend
  npm test
  ```

### Linting & Formatting
- At root:
  ```sh
  npm run lint
  npm run format
  ```

### Storybook
- ```sh
  cd frontend
  npm run storybook
  ```

### Docker
- Build and run all services:
  ```sh
  docker-compose up --build
  ```

### Deployment
- **Frontend:** GitHub Pages (see GitHub Actions workflow)
- **Backend:** Vercel (see GitHub Actions workflow)

## Contribution Guidelines
- Use feature branches and submit PRs.
- All commits and pushes are checked for lint, format, and tests (Husky + GitHub Actions).
- See `.env.example` for required environment variables.

## License
MIT

---

## Further Improvements
- Add authentication (e.g., NextAuth.js, Auth.js, or custom JWT)
- Add e2e tests (e.g., Playwright or Cypress)
- Add API rate limiting and security best practices
- Add production Docker and deployment configs
- Add more sample CRUD and GraphQL operations
