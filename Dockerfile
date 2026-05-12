# Use the official Playwright image matching your Playwright version
# (Check your package.json for your exact version, we'll use v1.44.0-jammy as an example)
FROM mcr.microsoft.com/playwright:v1.44.0-jammy

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json first to leverage Docker layer caching
COPY package*.json ./

# Install project dependencies
RUN npm ci

# Copy the rest of the testing framework (tests, config, page objects)
COPY . .

# Set the default command to run when the container starts
CMD ["npx", "playwright", "test"]