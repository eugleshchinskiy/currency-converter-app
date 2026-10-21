# Currency Converter App

Bootstrapped with `npm create vite@latest my-vite-app --template react-ts`.

To use locally clone the repository and then:

**Option 1:**

1. Copy `./.env-sample` to `./.env` and add your api key to `VITE_API_KEY`
2. Run `npm install` to install packages
3. Run `npm run dev` to start local version for the app.

**Option 2:**

1. Copy `./.env-sample` to `./.env` and add your api key to `VITE_API_KEY`
2. Run `docker compose up` in terminal

Open the app at http://localhost:5173/.

Run `npm run check` to type-check, lint, check formatting and run the tests in one go.

### My considerations and intentional choices

1. Storing an api key on FE side is not safe, it should be stored on BE side (for example Next.js). I used it here with a proxy for simplicity sake.
2. I used Docker only to run the app in dev mode for this task. To serve a prod build I'd add a build step to Dockerfile and then served through a server like nginx.
3. I picked a random UI lib for components like input and select for simplicity and accessibility (even though for this simple app it is probably not worth it to pull a whole UI lib).
4. I have not mapped full API response types to API, just some basic fields to be able to complete the task.
5. I added unit tests for main components and hooks scenarios and use cases.
6. I implemented very basic responsive design and added some basic error handling for the API (not added ErrorBoundary nor per code error handling).
7. The conversion result is stored together with the inputs it was fetched for (`from`, `to`, `amount`). When the inputs change, the old result is never shown next to them: the result field shows a loader until the new response arrives. Requests are debounced by 500 ms, and outdated ones are aborted.

### Future improvements

1. To add Next.js to remove env variables from the bundle
2. To cache responses using React Query (though not very beneficial in the current setup)
3. Proper prod deployment config if needed
4. E2E tests
5. Functionality & UX improvements: bidirectional converting, proper responsive design, better UI based on a mockup, etc
