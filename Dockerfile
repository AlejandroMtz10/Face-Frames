# 1. Build application
FROM node:22-slim AS build

# Install pnpm
RUN npm install -g pnpm

WORKDIR /app

# Copy dependences of the files
COPY package.json pnpm-lock.yaml ./

# Install dependencies
RUN pnpm install

# Copy the rest of the code
COPY . .

# Build the application to production
RUN pnpm run build

# 2. Production environment (Web Server)
# Nginx will serve the static files
FROM nginx:stable-alpine

# Copy the built files from the build stage to the Nginx directory
COPY --from=build /app/dist /usr/share/nginx/html

# Expose port 80
EXPOSE 80

# Command to start Nginx
CMD ["nginx", "-g", "daemon off;"]