# Build stage for React
FROM node:20-alpine AS build
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Set production environment variables
#ENV REACT_APP_API_URL=https://api.yourcarrental.com
ENV DISABLE_ESLINT_PLUGIN=true
ENV GENERATE_SOURCEMAP=false
ENV CI=false

# Build React app
RUN npm run build

# Production stage with Nginx
FROM nginx:alpine AS final

# Copy build output to nginx
COPY --from=build /app/build /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]