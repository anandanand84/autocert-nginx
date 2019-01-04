function getTemplate({domain, locationPath, proxyPath}) {
return `
server {
	listen 443 ssl http2;
	listen [::]:443 ssl http2;

	server_name ${domain};
	
	ssl_certificate /etc/letsencrypt/live/${domain}/fullchain.pem;
	ssl_certificate_key /etc/letsencrypt/live/${domain}/privkey.pem;
	ssl_trusted_certificate /etc/letsencrypt/live/${domain}/fullchain.pem;

	location ${locationPath} {
		proxy_pass ${proxyPath};
		include proxy.conf;
	}

	include general.conf;
}

# HTTP redirect
server {
	listen 80;
	listen [::]:80;

	server_name .${domain};

	include letsencrypt.conf;

	location / {
		return 301 https://${domain}$request_uri;
	}
}
`
}

function getTemplateNoNSSL({domain, locationPath, proxyPath}) {
return`
server {
	listen 80;
	listen [::]:80;

	server_name .${domain};

	include letsencrypt.conf;

	location / {
		return 301 https://${domain}$request_uri;
	}
}`
}

module.exports =  {
	getTemplate, getTemplateNoNSSL
}