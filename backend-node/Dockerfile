ARG BASE_IMAGE=node:18-alpine
FROM ${BASE_IMAGE}

WORKDIR /app

# Install dependencies for health check
RUN apk add --no-cache wget

# Copy all files
COPY . .

# Install dependencies
RUN npm install --production

EXPOSE 8080

CMD ["node", "server.js"]
