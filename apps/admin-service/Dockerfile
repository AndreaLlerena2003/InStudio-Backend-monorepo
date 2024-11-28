FROM node:20 AS build

WORKDIR /app

COPY nx.json workspace.json package.json package-lock.json tsconfig.json ./


COPY . .

RUN npm install


RUN nx build admin-service


FROM node:20 AS production

WORKDIR /app


COPY --from=build /app/dist /app/dist
COPY --from=build /app/node_modules /app/node_modules


EXPOSE 3000


CMD ["node", "dist/apps/admin-service/main.js"]
