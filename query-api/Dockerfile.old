# specify the base image to be used for this application
FROM golang:1.21.5-bullseye

# create a working directory inside the image
WORKDIR /app

# copy the go modules and dependencies
COPY go.mod ./

# download necessary GO modules and dependencies
RUN go mod download

# copy the the files to the directory
COPY . .

# compile the application
RUN go build -o /queryApi

# add directory for reports to be stored and mounted with compose
ADD . /data/reports
ADD . /data/logs

# expose the network port for runtime access
EXPOSE 6003

# command used to execute the api 
CMD [ "/queryApi" ]