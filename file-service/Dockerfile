FROM node:20

WORKDIR /octaltask-api/file-service

# Copies root files
COPY ../package*.json ./
# Installs based on root files
RUN npm install
# Overwrites with microservice files to get the scripts for building and starting
COPY package*.json ./
# Copy all the project to the working directory
COPY . .

RUN npm run build

# The command below can be replaced by "npm run start"
CMD ["node", "dist/main"]