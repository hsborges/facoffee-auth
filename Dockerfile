# ---- Base Node ----
FROM node:lts AS build
WORKDIR /app
COPY package.json ./
RUN yarn install
COPY . ./
RUN yarn build

# --- Release with Alpine ----
FROM node:lts-alpine AS release
WORKDIR /app
COPY --from=build /app/package.json ./package.json
COPY --from=build /app/dist ./dist
RUN yarn install --production
CMD PORT=80 yarn start