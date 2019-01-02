var cp = require('child_process');
var express = require('express');
var bodyParser = require('body-parser')
var app = express();
app.use(express.static('public'))
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
app.put('/domain/create', function (req, res) {
  if (!req.body) return res.sendStatus(400);
  console.log(req.body);
  res.json(req.body);
});
let port = 3300;
app.listen(port,()=>console.log('App listening in port ', port))
function createDomain() {
    var domain = 'anand.crypotradinghub.app';
    var email = 'anand.anand84@gmail.com'
    var locationPath = '/test';
    var proxyPath = 'http://localhost:3001/test';
    var template = getTemplate({domain,locationPath, proxyPath} )
    var serverConfigLocation = `/etc/nginx/sites-available/${domain}.conf`
    fs.writeFileSync(serverConfigLocation, template);  
    var linkFileCommand = ['Generating virtual server config file', `ln`, `-s` ,serverConfigLocation, `/etc/nginx/sites-enabled/${domain}.conf`]
    var disableCertsCommand = ['Preparing for certificate generation', `sed`, `-i`, `-r`, `s/(listen .*443)/\\1;#/g; s/(ssl_(certificate|certificate_key|trusted_certificate) )/#;#\\1/g` ,serverConfigLocation]
    var generateCertsCommand = ['Generating certificate generation', `certbot`, `certonly`, `--webroot`, `-d`, domain, `--email`, email, `-w` ,`/var/www/_letsencrypt`, `-n`, `--agree-tos`, `--force-renewal`]
    var enableCertsCommand = ['Applying certs..', `sed`, `-i` , `-r`, `s/#?;#//g`, serverConfigLocation]
    var commands = [linkFileCommand, disableCertsCommand, generateCertsCommand, enableCertsCommand];
    commands.forEach((command)=> {
        console.log(command[0]);
        var response = cp.spawnSync(command[1], command.slice(2))
        var result, stdout, stderr;
        if(response.output) [result , stdout, stderr]  = response.output
        if(response.status === 0) {
            console.log(stdout);
        } else {
            console.log(response)
        }
    })
}
