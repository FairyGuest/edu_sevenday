#!/bin/bash


#  测试环境
npm run build:edu_test
scp -r ./dist/* root@192.168.6.77:/usr/share/nginx/html/edu_test

# aminer111.