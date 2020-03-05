FROM node:lts
WORKDIR .
COPY package*.json .
RUN npm install --no-save
RUN npm install -g pm2
COPY . .
EXPOSE [[PORT]]
CMD ["pm2-runtime", "./server/index.js"]
