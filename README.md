# Vue 3 + Vite

This template should help get you started developing with Vue 3 in Vite. The template uses Vue 3 `<script setup>` SFCs, check out the [script setup docs](https://v3.vuejs.org/api/sfc-script-setup.html#sfc-script-setup) to learn more.

Learn more about IDE Support for Vue in the [Vue Docs Scaling up Guide](https://vuejs.org/guide/scaling-up/tooling.html#ide-support).



# Nginx

The base config file for nginx is at /etc/nginx/nginx.conf

in that we can include other config files with "include filename.conf"
by default it includes all .conf files in /etc/nginx/conf.d
we also want to include everything in /etc/nginx/sites-enabled
In that folder we can now put our own config files for our server
(symlink the file into the folder might be better)

## reloading the ngincx server

sudo systemctl reload nginx


## nginx logs

/var/log/nginx/access.log
/var/log/nginx/error.log


# SSL
managed on the server by Certbot


# how to Deploy

1. git pull
2. npm run build
3. delete old deployed files and copy over the newly generated ones into /etc/nginx/html/transmap and /etc/nginx/html/assets
4. reload nginx (sudo systemctl reload nginx)