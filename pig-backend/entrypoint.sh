#! /bin/bash

mkdir -p /var/run/celery /var/log/celery
chown -R nobody:nogroup /var/run/celery /var/log/celery

export CELERY_UID=nobody
export CELERY_GID=nogroup

python main.py $1