FROM nginx:alpine

# Copy the static website files to the nginx public folder
COPY . /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
