FROM node:20-alpine AS base

ARG DATABASE_URL \
	GOOGLE_CLIENT_ID \
	GOOGLE_CLIENT_SECRET
ENV DATABASE_URL=${DATABASE_URL} \
	GOOGLE_CLIENT_ID=${GOOGLE_CLIENT_ID} \
	GOOGLE_CLIENT_SECRET=${GOOGLE_CLIENT_SECRET}

# Install pnpm
RUN npm install -g pnpm

# Build
FROM base AS builder
WORKDIR /app
COPY . .
RUN pnpm install
RUN pnpm run build

# Run
FROM base AS deploy
WORKDIR /app
ENV NODE_ENV production
COPY --from=builder /app ./
CMD ["pnpm" ,"start"]