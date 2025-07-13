# Step 1: Use official Node.js image
FROM node:20 AS builder

# Step 2: Set working directory in the container
WORKDIR /app

# Step 3: Copy package.json and package-lock.json
COPY package*.json ./

# Step 4: Install dependencies
RUN npm install

# Step 5: Copy the entire project into the container
COPY . .

# Step 6: Build the Next.js application
RUN npm run build

# Step 7: Use official Node.js image for production environment
FROM node:20

# Step 8: Set working directory in the container
WORKDIR /app

# Step 9: Copy only the build output and dependencies from the builder image
COPY --from=builder /app ./

# Step 10: Expose the port the app runs on
EXPOSE 3000

# Step 11: Run the app in production mode
CMD ["npm", "start"]
