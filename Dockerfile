FROM node:20-alpine
WORKDIR /app

COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

COPY tsconfig.json ./
COPY src ./src
COPY scripts ./scripts
RUN yarn build

ENV NODE_ENV=production
EXPOSE 3000
USER node

CMD ["node", "./dist/index.js"]
