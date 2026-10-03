# Node 20 slim base for the blog API server.
FROM node:20-slim

WORKDIR /app

# Install dependencies first (layer-cached unless package.json changes).
COPY package.json ./
RUN npm ci --omit=dev || npm install --omit=dev

# Copy the server code.
COPY . .

EXPOSE 5000

CMD ["node", "server.js"]
