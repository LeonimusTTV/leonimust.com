FROM denoland/deno:latest

WORKDIR /app

COPY . .

RUN deno i

CMD [ "deno", "run", "start" ]