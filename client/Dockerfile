# ---- Stage 1: build the Vite app ------------------------------------
FROM node:20-alpine AS build

WORKDIR /app

# Production API base URL, baked into the bundle at build time.
# Override with: docker build --build-arg VITE_API_URL=https://api.example.com/api .
ARG VITE_API_URL=http://localhost:5000/api
ENV VITE_API_URL=${VITE_API_URL}

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build

# ---- Stage 2: serve the static bundle with nginx ---------------------
FROM nginx:alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
