FROM node:14-alpine
WORKDIR /cookbook
COPY ["package.json", "package-lock.json", "./"]
RUN npm install
COPY . .
RUN npm run transpile
CMD npm run start