#
# 🧑‍💻 Development
#
FROM node:20-alpine as dev
# Create app folder
WORKDIR /app

# Copy source code into app folder
COPY --chown=node:node . .

# Install dependencies
RUN npm ci

EXPOSE 3000
