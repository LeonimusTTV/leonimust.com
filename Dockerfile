FROM oven/bun:canary-alpine

WORKDIR /app

COPY . .

RUN bun install

EXPOSE 3001

CMD ["bun", "run", "start"]