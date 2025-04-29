# Use official Node.js image
FROM node:16

# Set the working directory
WORKDIR /usr/src/app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of your application files
COPY . .

# Build the Nest.js app
RUN npm run build

# Expose the application port
EXPOSE 3000

# Start the app
CMD ["npm", "run", "start:prod"]
