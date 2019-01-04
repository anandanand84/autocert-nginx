var cp = require('child_process');
var getTemplate = require('./servertemplate').getTemplate;
var getTemplateNoNSSL = require('./servertemplate').getTemplateNoNSSL;
var express = require('express');
var fs = require('fs');
var bodyParser = require('body-parser')
var app = express();
var dataRoot = `/etc/nginx/`
var nginxServerName = `autocert-nginx_nginx_1`;
app.use(express.static('public'))
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

app.put('/domain/create', function (req, res) {
  if (!req.body) return res.sendStatus(400);
  console.log(req.body);
  createDomain(req.body);
  res.json(req.body);
});

app.delete('/domain/delete', function(req,res) {
    if (!req.body) return res.sendStatus(400);
    var { domain } = req.body;
    var exists = fs.existsSync(`${dataRoot}sites-enabled/${domain}.conf`)
    if(exists) {
        fs.truncateSync(`${dataRoot}sites-enabled/${domain}.conf`)
        fs.truncateSync(`${dataRoot}sites-available/${domain}.conf`)
    }
    res.json(exists);
});

app.get('/domains', function(req, res) {
    const testFolder = `${dataRoot}sites-available/`;
    var available = fs.readdirSync(testFolder).map(f=>f.split('.conf')[0])
    res.json(available);
})

function createDomain({ domain, email, locationPath, proxyPath}) {
    email = email || 'anand.anand84@gmail.com'
    var template = getTemplate({ domain,locationPath, proxyPath })
    var templateNonSSL = getTemplateNoNSSL({ domain,locationPath, proxyPath })
    var serverConfigLocation = `${dataRoot}sites-available/${domain}.conf`
    fs.writeFileSync(serverConfigLocation, templateNonSSL);  
    var linkFileCommand = ['Generating virtual server config file', `ln`, `-s` ,serverConfigLocation, `${dataRoot}sites-enabled/${domain}.conf`]
    var nginxReload = ['Reloading nginx config', `docker`, `exec`, nginxServerName, `nginx`, `-s`, `reload`]
    // var disableCertsCommand = ['Preparing for certificate generation', `sed`, `-i`, `-r`, `s/(listen .*443)/\\1;#/g; s/(ssl_(certificate|certificate_key|trusted_certificate) )/#;#\\1/g` ,serverConfigLocation]
    var generateCertsCommand = ['Generating certificate generation', `certbot`, `certonly`, `--webroot`, `-d`, domain, `--email`, email, `-w` ,`/var/www/_letsencrypt`, `-n`, `--agree-tos`, `--force-renewal`]
    // var enableCertsCommand = ['Applying certs..', `sed`, `-i` , `-r`, `s/#?;#//g`, serverConfigLocation]
    var commands = [linkFileCommand,  nginxReload, generateCertsCommand];
    commands.forEach((command)=> {
        console.log(command[0]);
        var response = cp.spawnSync(command[1], command.slice(2))
        var result, stdout, stderr;
        if(response.output) [result , stdout, stderr]  = response.output
        if(response.status === 0) {
            console.log(stdout);
            console.log('Success');
        } else {
            console.log(response.stdout ? response.stdout.toString() : "")
            console.log(response.stderr ? response.stderr.toString() : "")
        }
    })
    fs.writeFileSync(serverConfigLocation, template);  
    var commands = [nginxReload];
    commands.forEach((command)=> {
        console.log(command[0]);
        var response = cp.spawnSync(command[1], command.slice(2))
        var result, stdout, stderr;
        if(response.output) [result , stdout, stderr]  = response.output
        if(response.status === 0) {
            console.log(stdout);
            console.log('Success');
        } else {
            console.log(response.stdout ? response.stdout.toString() : "")
            console.log(response.stderr ? response.stderr.toString() : "")
        }
    })
}

let port = 3300;
app.listen(port,()=>console.log('App listening in port ', port))
