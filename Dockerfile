FROM nginx:stable-alpine

COPY index.html dashboard.html style.css login.js dashboard.js /usr/share/nginx/html/

EXPOSE 80
