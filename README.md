# Currency Converter App

Bootstrapped with `npm create vite@latest my-vite-app --template react-ts`.

To use locally:

1. Copy `./.env-sample` to `./.env` and put your api key `VITE_API_KEY`
2. Run `npm install` to install packages
3. Run `npm run start` to start local version for the app.

Or add the env file and simply run (if Docker is installed):

`docker compose up`

### My considerations and intentional choices

1. Storing an api key on FE side is not safe, it should be stored on BE side (for example Next.js). I used it here with a proxy for simplicity sake.
2. I used Docker only to run the app in dev mode for this task. To serve a prod build I'd add a build step to Dockerfile and then served through a server like nginx.
3. I picked a random UI lib for components like input and select for simplicity and accessibility (even though for this simple app it is probably not worth it to pull a whole UI lib).
4. I have not mapped full API response types to API, just some basic fields to be able to complete the task.
5. I have not added unit tests or other tests.
