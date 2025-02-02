FROM node:20.17-alpine

WORKDIR /app-restaurant

# Install pnpm
RUN npm install -g pnpm

# Copy package files
COPY package.json ./

# Install dependencies
RUN pnpm install

# Copy the rest of the application
COPY . .

EXPOSE 3002

CMD ["pnpm", "start:dev"] 