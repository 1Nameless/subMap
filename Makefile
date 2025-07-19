ARTIFACTS_DIR=dist
DEPLOYMENT_DIR=/etc/nginx/html/transmap

build:
	git pull
	npm run build

install:
	rm -r  "${DEPLOYMENT_DIR}" || true
	mkdir -p "${DEPLOYMENT_DIR}"
	cp -r ${ARTIFACTS_DIR}/* "${DEPLOYMENT_DIR}"
	systemctl reload nginx