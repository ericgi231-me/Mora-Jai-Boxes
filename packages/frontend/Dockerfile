FROM node:22-alpine AS builder
WORKDIR /app
COPY package*.json ./
COPY packages/frontend/package.json ./packages/frontend/
RUN npm ci --workspace=frontend
COPY packages/frontend ./packages/frontend/
WORKDIR /app/packages/frontend
RUN npm run build

FROM nginx:alpine AS production
COPY --from=builder /app/packages/frontend/dist /usr/share/nginx/html
COPY packages/frontend/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
RUN apk add --no-cache curl
HEALTHCHECK --interval=30s --timeout=5s --retries=3 CMD curl -f http://127.0.0.1/health || exit 1
CMD ["nginx", "-g", "daemon off;"]