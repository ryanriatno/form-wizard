# Employee Dashboard Frontend

A React + TypeScript form wizard for managing employee data. Built with Vite, featuring a multi-step form flow and some nifty features like autocomplete and file uploads.

## Getting Started

You'll need Node.js 20+ and Yarn (npm works too, but we're using Yarn here). Docker is optional but makes things easier if you want to run everything in containers.

### Running Locally

First things first, install the dependencies:

```bash
yarn install
```

This app needs two mock API servers running (one for each step of the wizard). You can start them both at once:

```bash
yarn server
```

Or if you prefer to run them separately (useful for debugging):

```bash
yarn server:step1  # Runs on port 4001
yarn server:step2  # Runs on port 4002
```

Once the API servers are up, fire up the dev server in another terminal:

```bash
yarn dev
```

The app should be running at `http://localhost:5173`. Hot reload is enabled, so changes should appear automatically.

### Using Docker

If you'd rather not manage multiple terminals, Docker Compose has you covered:

```bash
docker-compose up
```

This spins up everything you need:

- Frontend dev server on port `5173`
- API Step 1 on port `4001`
- API Step 2 on port `4002`

All services are connected on the same network, so they can talk to each other.

### Building for Production

To create a production build:

```bash
yarn build
```

You can preview it locally with:

```bash
yarn preview
```

Or start the production server:

```bash
yarn start:frontend
```

The server defaults to port `3000`, but you can override it with the `PORT` environment variable.

## Live Demo

Check it out live: [https://form-wizard-fe.netlify.app/](https://form-wizard-fe.netlify.app/)

Currently deployed on Netlify. The `netlify.toml` file handles the SPA routing. We've also got Railway configs set up (`railway.json` and `nixpacks.toml`) if you want to deploy there instead.

## Testing

Vitest is used along with React Testing Library. It's fast, and the watch mode is pretty nice for TDD.

I went with Vitest instead of Jest mainly because we're already using Vite. They share the same config and build pipeline, so setup is basically zero. Plus it's way faster with ESM (which this project uses), and the watch mode is snappier for TDD. Jest would've required extra transformers and config just to handle TypeScript and CSS modules, but Vitest gets all that for free through Vite.

Run the test suite:

```bash
yarn test
```

This runs in watch mode by default, so it'll re-run when you change files. If you want the fancy UI:

```bash
yarn test:ui
```

And to see coverage:

```bash
yarn test:coverage
```

### Test Setup

Tests run in a jsdom environment (simulates the browser), and the setup file is at `src/test/setup.ts`. Test files live in `__tests__` folders next to their components. CSS modules work out of the box.

### Current Tests

Right now we have tests for:

- Autocomplete component (`src/components/autocomplete/__tests__/autocomplete.test.tsx`)
- Wizard Step 2 (`src/pages/wizard/__tests__/step2.test.tsx`)

### Adding New Tests

When you write new tests, keep them in `__tests__` directories next to the code they're testing. Use React Testing Library for rendering and user interactions, and try to follow the patterns already in the codebase. Make sure tests are isolated—mock any API calls so they don't depend on external services.
