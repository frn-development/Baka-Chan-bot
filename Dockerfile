# ─── Base Image ───
FROM node:18-alpine AS base
WORKDIR /usr/src/app

# ─── Install Dependencies (with caching) ───
COPY package*.json ./
RUN npm install --production

# ─── Copy Source Code ───
COPY . .

# ─── Expose Port ───
# Note: Render, Railway, Heroku, Koyeb set $PORT dynamically.
EXPOSE 3000

# ─── Start Bot ───
CMD ["node", "index.js"]
