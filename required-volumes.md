# Volumes

These are the volumes that are required to be mounted in the baremetal.

## Nginx Sites

`/etc/nginx/sites-available` and `/etc/nginx/sites-enabled` so we can add new sites 

## Letsencrypt challenge

`/var/www/_letsencrypt` is the root for letsencrypt acme challenges, this should be shared between letsencrypt container and nginx, below is the nginx conf used

`
location ^~ /.well-known/acme-challenge/ {
	root /var/www/_letsencrypt;
}
`

`/etc/letsencrypt` where ssl certs are stored
