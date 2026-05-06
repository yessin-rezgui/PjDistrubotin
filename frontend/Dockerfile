FROM node:18-alpine as builder

WORKDIR /app

COPY package.json package-lock.json* ./

RUN npm install

COPY . .

RUN npm run build

# Production image
FROM node:18-alpine

WORKDIR /app

RUN npm install -g http-server

COPY --from=builder /app/dist/concert-ticketing-frontend /app/dist

EXPOSE 4200

CMD ["http-server", "dist", "-p", "4200", "-a", "0.0.0.0"]
