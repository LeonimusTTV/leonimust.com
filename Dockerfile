FROM oven/bun:canary-alpine

WORKDIR /app

COPY package.json ./

RUN bun install

COPY . .

RUN bun run build

EXPOSE 3001

CMD ["bun", "run", "start"]