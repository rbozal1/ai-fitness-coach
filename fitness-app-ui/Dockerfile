# Stage 1: Build the Angular application
FROM node:20-alpine AS build

WORKDIR /app

# Copy dependency manifests
COPY package*.json ./

# Install project dependencies
RUN npm ci

# Copy project source files
COPY . .

# Build production bundle
RUN npm run build -- --configuration production

# Stage 2: Serve application with Nginx
FROM nginx:alpine

# Copy custom Nginx configuration for SPA routing and Cloud Run port 8080
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy build artifacts to Nginx web root
COPY --from=build /app/dist/fitness-app-ui/browser /usr/share/nginx/html

# Expose default Cloud Run container port
EXPOSE 8080

CMD ["nginx", "-g", "daemon off;"]

