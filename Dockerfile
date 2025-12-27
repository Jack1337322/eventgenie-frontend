FROM node:20-alpine AS build

# Accept build argument for VITE_API_URL
ARG VITE_API_URL=http://localhost:8080

WORKDIR /app

# Copy package files
COPY package.json ./

# Install dependencies (including dev dependencies for build)
RUN npm install

# Copy all necessary files for build
COPY . .

# Create .env file with build-time variables from ARG
RUN echo "VITE_API_URL=${VITE_API_URL}" > .env

# Build for production
RUN npm run build

# List dist contents for debugging
RUN ls -la /app/ && ls -la /app/dist || echo "Dist folder not found"

# Production stage with nginx
FROM nginx:alpine

# Copy built files
COPY --from=build /app/dist /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 3000

CMD ["nginx", "-g", "daemon off;"]
