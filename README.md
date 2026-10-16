# Currency Converter App

Bootstrapped with `npm create vite@latest my-vite-app --template react-ts`.

To use locally:

1. Copy `./.env-sample` to `./.env` and put your api key `VITE_API_KEY`
2. Run `npm install` to install packages
3. Run `npm run start` to start local version for the app.

### My considerations

1. Storing an api key on FE side is not safe, it should be stored on BE side (for example Next.js). Used it here with a proxy for simplicity sake.

### TODO

- [x] Add some UI lib
- [x] Add error handling
- [x] Add loading handling
- [x] Add styling
- [x] Move out hooks
- [] Add basic accessibility
- [] Add Docker + Docker compose
