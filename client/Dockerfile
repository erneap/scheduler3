### Stage 1: Build ###
FROM node:20.10.0-bookworm as build
WORKDIR /app
COPY ./ /app/
RUN npm install
RUN npm run build

### Stage 2: Run ###
FROM nginx:1.27.0-alpine-slim
RUN mkdir -p /usr/share/nginx/html/scheduler3
ADD . /data/reports
COPY --from=build /app/dist/scheduler-client /usr/share/nginx/html/scheduler3/
COPY --from=build /app/scheduler.conf /etc/nginx/conf.d/scheduler.conf
EXPOSE 8087