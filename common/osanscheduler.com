server {

  root /var/www/osanscheduler.com/html;
  index index.html index.htm;

  server_name osanscheduler.com www.osanscheduler.com;

  location / {
    try_files $uri $uri/ =404;
  }

  location /metrics/ {
    proxy_pass http://192.168.100.107:8093/metrics3/;
  }

  location /metrics3/ {
    proxy_pass http://192.168.100.107:8093/metrics3/;
  }

  location /scheduler/ {
    proxy_pass http://192.168.100.106:8087/scheduler3/;
  }

  location /scheduler3/ {
    proxy_pass http://192.168.100.106:8087/scheduler3/;
  }

  location /api/v2/authentication/ {
    proxy_pass http://192.168.100.103:7004/api/v2/authentication/;
  }

  location /api/v2/metrics/ {
    proxy_pass http://192.168.100.105:7010/api/v2/metrics/;
  }

  location /api/v2/scheduler/ {
    proxy_pass http://192.168.100.104:7002/api/v2/scheduler/;
  }

  location /api/v2/query/ {
    proxy_pass http://192.168.100.104:7003/api/v2/query/;
  }


  location /metrics/reportlists {
    alias /data/reports;
    autoindex on;
  }

    listen [::]:443 ssl ipv6only=on; # managed by Certbot
    listen 443 ssl; # managed by Certbot
    ssl_certificate /etc/letsencrypt/live/osanscheduler.com/fullchain.pem; # managed by Certbot
    ssl_certificate_key /etc/letsencrypt/live/osanscheduler.com/privkey.pem; # managed by Certbot
    include /etc/letsencrypt/options-ssl-nginx.conf; # managed by Certbot
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem; # managed by Certbot


}
server {
    if ($host = www.osanscheduler.com) {
        return 301 https://$host$request_uri;
    } # managed by Certbot


    if ($host = osanscheduler.com) {
        return 301 https://$host$request_uri;
    } # managed by Certbot


  listen 80;
  listen [::]:80;

  server_name osanscheduler.com www.osanscheduler.com;
    return 404; # managed by Certbot

}
