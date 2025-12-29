#!/bin/bash
export NODE_ENV=production

cd /home/ubuntu/api-backend

pm2 reload echosystem.config.js --update-env

pm2 save
