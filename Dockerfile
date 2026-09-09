# 基础镜像
FROM node:20.20.2 AS builder

# 设置工作目录
WORKDIR /app

# 复制 package.json
COPY package.json ./

# 安装 pnpm 和依赖
#RUN npm i yarn --location=global
RUN yarn config set registry https://registry.npmmirror.com/ && yarn install --network-concurrency 8

# 复制所有源代码
COPY . .

RUN yarn build:prod

# 部署阶段
FROM nginx:1.28.2

# 复制构建产物到 nginx 目录
COPY --from=builder /app/dist /usr/share/nginx/html

# 复制nginx配置模板
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
