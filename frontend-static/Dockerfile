ARG BASE_IMAGE=nginx:alpine
FROM ${BASE_IMAGE}

# Remove default nginx config
RUN rm -f /etc/nginx/conf.d/default.conf

# Copy custom nginx config
COPY nginx.conf /etc/nginx/conf.d/qap.conf

# Copy HTML files
COPY index.html /usr/share/nginx/html/

# Set proper permissions
RUN chmod -R 755 /usr/share/nginx/html/

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
