# Stage 1: Build the app
FROM node:18 AS build

WORKDIR /app

# Copy package.json and install deps first for caching
COPY package*.json ./
RUN npm install

# Copy rest of the app and build
COPY . .
RUN npm run build

# Stage 2: Serve with nginx
FROM nginx:alpine

# Copy built files from previous stage
COPY --from=build /app/build /usr/share/nginx/html


# Expose port and start server
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
