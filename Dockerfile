# ─── Base Image ───
FROM node:16-alpine

# ─── Working Directory ───
WORKDIR /usr/src/app

# ─── Install Dependencies ───
# Copy only package.json and package-lock.json first for caching
COPY package*.json ./

# Ensure express is installed (needed for Render keep-alive)
RUN npm install 

# ─── Copy Source Code ───
COPY . .

# ─── Expose Port ───
# Render assigns $PORT automatically
EXPOSE 3000

# ─── Start Bot ───
CMD ["node", "index.js"]
