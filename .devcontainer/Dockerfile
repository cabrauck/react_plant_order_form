FROM node:18

WORKDIR /app
COPY . .

RUN npm install -g vite && npm install

EXPOSE 5173
CMD ["npm", "run", "dev", "--", "--host"]
