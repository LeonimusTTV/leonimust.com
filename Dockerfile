FROM oven/bun:canary-alpine

WORKDIR /app

COPY . .

RUN bun install
RUN bun run build

EXPOSE 3001

CMD ["bun", "run", "start"]