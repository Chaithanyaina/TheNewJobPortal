# 1. Use an official Node.js runtime as a parent image
FROM node:20-alpine

# 2. Set the working directory in the container
WORKDIR /app

# 3. Copy package.json and package-lock.json
COPY package*.json ./

# 4. Install production dependencies
RUN npm install --only=production

# 5. Copy the rest of your application's code
COPY . .

# Expose the port the app runs on
EXPOSE 5000

# Set environment variables
# Note: These are build-time variables. You should override them at runtime.
ENV NODE_ENV=production
ENV PORT=5000

# 6. Define the command to run your app
CMD ["node", "src/server.js"]