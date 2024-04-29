##############################
# Step 1 build executable binary
##############################
FROM golang:alpine AS builder

## Install git
RUN apk update && apk add --no-cache git

ENV USER=scheduler
ENV UID=10001

RUN adduser \
    --disabled-password \
    --gecos "" \
    --home "/nonexistent" \
    --shell "/sbin/nologin" \
    --no-create-home \
    --uid "${UID}" \
    "${USER}"

WORKDIR $GOPATH/src/scheduler2/query-api/
COPY . .

# Fetch Dependencies
RUN go get -d -v

# build binary
RUN go build -o /go/bin/query-api

################################
# Step 2 Build the small image
################################
FROM scratch

ADD . /data/reports
ADD . /data/logs

COPY --from=builder /etc/passwd /etc/passwd
COPY --from=builder /etc/group /etc/group

COPY --from=builder /go/bin/query-api /go/bin/query-api

USER scheduler:scheduler

EXPOSE 6002

ENTRYPOINT [ "/go/bin/query-api" ]