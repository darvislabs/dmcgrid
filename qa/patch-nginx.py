import subprocess
p = '/etc/nginx/sites-available/gomedicure-redirects.conf'
s = open(p).read()
old = """server {
    listen 443 ssl http2;
    server_name dmcgrid.gomedicure.com;
    ssl_certificate /etc/letsencrypt/live/dmcgrid.gomedicure.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/dmcgrid.gomedicure.com/privkey.pem;
    return 301 https://dmcgrid.darvis.si$request_uri;
}"""
new = """server {
    listen 443 ssl http2;
    server_name dmcgrid.gomedicure.com;
    ssl_certificate /etc/letsencrypt/live/dmcgrid.gomedicure.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/dmcgrid.gomedicure.com/privkey.pem;

    client_max_body_size 20m;

    # app owns /auth/callback (PKCE exchange); the rest of /auth/* goes to kong
    location = /auth/callback {
        proxy_pass http://127.0.0.1:3101;
        proxy_set_header Host $host;
        proxy_set_header X-Forwarded-Proto https;
    }
    location /auth/ {
        proxy_pass http://127.0.0.1:54321/auth/;
        proxy_set_header Host $host;
        proxy_set_header X-Forwarded-Proto https;
    }
    location /rest/ {
        proxy_pass http://127.0.0.1:54321/rest/;
        proxy_set_header Host $host;
        proxy_set_header X-Forwarded-Proto https;
    }
    location / {
        proxy_pass http://127.0.0.1:3101;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}"""
assert old in s, 'block not found'
open(p, 'w').write(s.replace(old, new))
print('patched OK')
