# Use official Node.js image
FROM node:18

# Set the working directory
WORKDIR /usr/src/app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of your application files
COPY . .

# Expose the application port
EXPOSE 4000

# Start the app
CMD ["npm", "run", "start"]
