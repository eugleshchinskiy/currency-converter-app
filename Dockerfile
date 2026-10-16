FROM node:26-slim

WORKDIR /app

COPY package*.json .

RUN npm install

COPY . .

EXPOSE 5173

ENV VITE_API_KEY=currencybeacon_api_key

CMD ["npm", "run", "dev", "--", "--host"]