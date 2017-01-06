# Dynamic Ip

### Description
Just a simple script that pings a 3rd party to find out if your ip changed every
x amount of time. If it changes, it will update specified domains and records.

### Installation

Create a file called config-local.js at the root of the project:
```javascript
module.exports = {
    'debug': true,
    'digitalOceanToken': 'xxx',
    'domains': [
        {
            'domain': 'foo.com',
            'records': ['bar', 'baz']
        }
    ]
}
```

Then run:
```bash
npm install
```

### Hooking it up with systemd

Clone the project in your home dir and install the dependencies:
```bash
cd ~
git clone git@gitlab.com:cmseguin/dynamic-ip.git
mv ~/dynamic-ip ~/.dynamic-ip
cd ~/.dynamic-ip
npm install --production
```

Create a file in /etc/systemd/system called dynamic-ip.service

```
[Unit]
Description=A script to update one or more domains record to point to a non-static ip address
After=network.target

[Service]
Type=fork
WorkingDirectory=/home/{user}
ExecStart=/usr/local/bin/node /home/{user}/.dynamic-ip/index.js
Restart=on-abort
```
