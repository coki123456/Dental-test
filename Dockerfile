# ─── Stage 1: Build ──────────────────────────────────────────
# Use Node 18 Alpine for a minimal builder image
FROM node:18-alpine AS builder

WORKDIR /app

# Install dependencies first — leverages Docker layer cache
# Only re-runs when package files change
COPY package*.json ./
RUN npm ci --ignore-scripts

# Copy the rest of the source code
COPY . .

# Build-time environment variables — baked in by Vite at compile time
# Pass with: docker build --build-arg VITE_SUPABASE_URL=xxx ...
ARG VITE_SUPABASE_URL
ARG VITE_SUPABASE_ANON_KEY

ENV VITE_SUPABASE_URL=${VITE_SUPABASE_URL}
ENV VITE_SUPABASE_ANON_KEY=${VITE_SUPABASE_ANON_KEY}
ENV NODE_ENV=production

# Build the Vite app → outputs to /app/dist
RUN npm run build

# ─── Stage 2: Serve ──────────────────────────────────────────
# Pure nginx:alpine — no Node, no source code, no secrets
FROM nginx:alpine AS runner

# Drop the default nginx page
RUN rm -rf /usr/share/nginx/html/*

# Copy only the compiled static assets from the builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy our custom nginx config (SPA routing + gzip + security headers)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Verify nginx config is valid before publishing the image
RUN nginx -t

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
