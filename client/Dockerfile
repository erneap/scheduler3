### Stage 1: Build ###
FROM node:20.10.0-bookworm as build
WORKDIR /app
COPY ./ /app/
RUN npm install
RUN npm run build

### Stage 2: Run ###
FROM nginx:1.25.3-alpine3.18
RUN mkdir -p /usr/share/nginx/html/scheduler
ADD . /data/reports
COPY --from=build /app/dist/scheduler-client /usr/share/nginx/html/scheduler/
COPY --from=build /app/scheduler.conf /etc/nginx/conf.d/scheduler.conf
EXPOSE 8083