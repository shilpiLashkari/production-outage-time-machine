# Build Stage
FROM node:18-alpine as build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Production Stage
FROM nginx:alpine
# Copy the build output to replace the default nginx contents.
# Note: Angular build folder name depends on angular.json. Assuming 'angular-admin' based on project name.
COPY --from=build /app/dist/angular-admin/browser /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
