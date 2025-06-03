# Install dependencies only when needed
FROM node:23-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .

EXPOSE 3000

CMD ["npm", "run", "dev"]