FROM node:10-alpine AS builder
WORKDIR /app
COPY ./package.json ./
RUN yarn install
COPY . .
RUN yarn build

FROM builder
WORKDIR /app
COPY --from=builder /app ./

CMD ["node", "dist/src/main"]