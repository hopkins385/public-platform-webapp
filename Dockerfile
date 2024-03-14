#
# 🧑‍💻 Development
#
FROM node:21-alpine as dev
# Create app folder
WORKDIR /app

# Copy source code into app folder
COPY --chown=node:node . .

# Install dependencies
RUN npm ci
# Install ts-node
RUN npm install -g ts-node
# Prisma
RUN npx prisma generate

EXPOSE 3000

# CMD ["node", ".output/server/index.mjs"]
