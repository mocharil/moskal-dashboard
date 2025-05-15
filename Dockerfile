# Build stage
FROM node:20-alpine AS build

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package.json package-lock.json ./

# Install dependencies
RUN npm ci

# Copy the rest of the code
COPY . .

# Build the application
RUN npm run build

# Production stage
FROM node:20-alpine AS production

# Set working directory
WORKDIR /app

# Install serve - a static file serving package
RUN npm install -g serve

# Copy built files from the build stage
COPY --from=build /app/dist /app

# Expose the port
EXPOSE 3000

# Command to run the application
CMD ["serve", "-s", ".", "-l", "3000"]
