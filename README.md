# TZT Quick Access Portal (QAP)

[![Docker](https://img.shields.io/badge/Docker-2496ED?style=flat&logo=docker&logoColor=white)](https://www.docker.com/)
[![Node.js](https://img.shields.io/badge/Node.js-339933?style=flat&logo=node.js&logoColor=white)](https://nodejs.org/)
[![Vue.js](https://img.shields.io/badge/Vue.js-4FC08D?style=flat&logo=vue.js&logoColor=white)](https://vuejs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=flat&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![GPLv3](https://img.shields.io/badge/License-GPLv3-blue.svg)](https://www.gnu.org/licenses/gpl-3.0.html)

一个简洁高效的网站书签管理与快速访问门户，支持分类浏览、搜索和访问统计功能。

## 功能特性

- 🔗 **网站管理** - 添加、编辑、删除网站书签
- 📂 **分类浏览** - 按类别组织网站
- 🔍 **快速搜索** - 实时搜索网站名称和描述
- 📊 **访问统计** - 记录网站访问次数
- 🔐 **安全访问** - 路径密钥认证的管理员模式
- 📱 **响应式设计** - 支持桌面和移动设备

## 技术栈

| 组件 | 技术 | 版本 |
|------|------|------|
| 前端框架 | Vue.js | 3.x |
| UI 组件 | Element Plus | 2.x |
| 后端运行时 | Node.js | 18.x |
| Web 框架 | Express | 4.x |
| 数据库 | PostgreSQL | 15.x |
| Web 服务器 | Nginx | Alpine |
| 容器化 | Docker | Latest |

## 项目架构

```
QAP/
├── backend-node/          # Node.js 后端
│   ├── server.js          # Express 服务
│   └── Dockerfile         # 后端容器配置
├── frontend-static/       # 前端静态文件
│   ├── index.html         # 单页应用入口
│   ├── nginx.conf         # Nginx 配置
│   └── Dockerfile         # 前端容器配置
├── docker-compose-hub.yaml # Docker Compose 配置
└── compose.yaml           # 本地开发配置
```

## 快速开始

### 方式一：Docker Compose 部署（推荐）

```bash
# 克隆或下载项目
cd QAP

# 启动服务
docker compose up -d

# 访问应用
# 前端: http://localhost:3333
# 后端 API: http://localhost:8080
```

### 方式二：手动部署

```bash
# 1. 启动 PostgreSQL
docker run -d \
  --name postgres \
  -e POSTGRES_DB=qapdb \
  -e POSTGRES_USER=qapuser \
  -e POSTGRES_PASSWORD=qappassword \
  -p 5432:5432 \
  postgres:15-alpine

# 2. 构建并启动后端
cd backend-node
npm install
npm start

# 3. 启动前端（Nginx）
# 将 frontend-static 配置到 Nginx
```

## 配置说明

### 环境变量

| 变量 | 默认值 | 说明 |
|------|--------|------|
| `PORT` | 8080 | 后端服务端口 |
| `DB_HOST` | postgres | 数据库主机 |
| `DB_PORT` | 5432 | 数据库端口 |
| `DB_NAME` | qapdb | 数据库名称 |
| `DB_USER` | qapuser | 数据库用户 |
| `DB_PASSWORD` | qappassword | 数据库密码 |
| `ADMIN_SECRET` | 123456 | 管理员访问密钥 |

### 端口映射

| 端口 | 服务 | 说明 |
|------|------|------|
| 3333 | Frontend | 前端 Web 服务 |
| 8080 | Backend | 后端 API 服务 |
| 5432 | PostgreSQL | 数据库服务 |

## 使用指南

### 普通用户访问

- 访问 `http://your-ip:3333` 进入首页
- 浏览网站列表，点击即可快速访问
- 使用搜索框或分类筛选网站

### 管理员访问

**方式一：通过 URL 直接访问**
```
http://your-ip:3333/123456
```

**方式二：登录验证**
1. 点击页面右上角 "Admin Mode"
2. 输入管理员密钥（默认：`123456`）
3. 进入管理面板

### 管理员功能

- 添加新网站
- 编辑网站信息（名称、URL、描述、分类、图标）
- 删除网站
- 查看所有网站（包括已禁用的）

## API 接口

### 公开接口

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/health` | 健康检查 |
| GET | `/api/websites` | 获取网站列表 |
| GET | `/api/websites/popular` | 获取热门网站 |
| GET | `/api/websites/category/:category` | 按分类获取 |
| GET | `/api/categories` | 获取分类列表 |
| POST | `/api/websites/:id/access` | 记录访问 |

### 管理接口

> 注意：需要在请求头中添加 `X-Admin-Secret: 123456`

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/admin/websites` | 获取所有网站 |
| POST | `/api/admin/websites` | 添加网站 |
| PUT | `/api/admin/websites/:id` | 更新网站 |
| DELETE | `/api/admin/websites/:id` | 删除网站 |

## 开发过程

### 第一阶段：需求分析与架构设计

1. 确定核心功能：网站书签管理、分类浏览、搜索、访问统计
2. 选择技术栈：Node.js + Express + PostgreSQL + Vue 3
3. 设计数据库 schema
4. 规划 API 接口

### 第二阶段：后端开发

1. 使用 Express 搭建 RESTful API
2. 集成 PostgreSQL 数据库
3. 实现 CRUD 操作
4. 添加访问统计功能

### 第三阶段：前端开发

1. 使用 Vue 3 构建单页应用
2. 集成 Element Plus UI 组件
3. 实现搜索和分类过滤
4. 开发管理员面板

### 第四阶段：安全与部署

1. 实现路径密钥认证机制
2. 使用 Nginx 反向代理
3. Docker 容器化部署
4. 配置端口和域名

### 第五阶段：优化与完善

1. 修复已知问题
2. 优化用户体验
3. 添加访问统计
4. 完善文档

## 常见问题

### Q: 如何修改管理员密码？

A: 修改以下位置：
- `docker-compose.yaml` 或 `docker-compose-hub.yaml` 中的 `ADMIN_SECRET` 环境变量
- `frontend-static/index.html` 中的 `ADMIN_SECRET` 常量

### Q: 数据库如何备份？

A: PostgreSQL 数据卷在 `postgres_data` 目录，可使用以下命令备份：
```bash
docker compose exec postgres pg_dump -U qapuser qapdb > backup.sql
```

### Q: 如何升级版本？

A: 重新构建并推送镜像：
```bash
docker compose -f docker-compose-hub.yaml build
docker compose -f docker-compose-hub.yaml push
```

## 部署到服务器

### 服务器要求

- Linux 系统（Ubuntu 20.04+ 推荐）
- Docker 20.10+
- Docker Compose 2.0+

### 部署步骤

```bash
# 1. 创建部署目录
mkdir -p ~/qap && cd ~/qap

# 2. 创建 docker-compose.yaml
cat > docker-compose.yaml << 'EOF'
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: qapdb
      POSTGRES_USER: qapuser
      POSTGRES_PASSWORD: qappassword
    volumes:
      - postgres_data:/var/lib/postgresql/data

  backend:
    image: usertzt/tztquickaccess:backend
    environment:
      DB_HOST: postgres
      ADMIN_SECRET: "123456"

  frontend:
    image: usertzt/tztquickaccess:frontend
    ports:
      - "3333:80"

volumes:
  postgres_data:
EOF

# 3. 启动服务
docker compose up -d
```

## 贡献指南

欢迎提交 Issue 和 Pull Request！

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/amazing-feature`)
3. 提交更改 (`git commit -m 'Add some amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 打开 Pull Request

## 开源协议

本项目采用 **GNU General Public License v3.0** 开源协议。

```
TZT Quick Access Portal
Copyright (C) 2026 TZT

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see <https://www.gnu.org/licenses/>.
```

详细协议内容请查看 [LICENSE](LICENSE) 文件。

## 致谢

- [Vue.js](https://vuejs.org/) - 渐进式 JavaScript 框架
- [Element Plus](https://element-plus.org/) - 基于 Vue 3 的 UI 组件库
- [Express](https://expressjs.com/) - 快速、无偏见的 Web 框架
- [PostgreSQL](https://www.postgresql.org/) - 强大的开源关系数据库
- [Nginx](https://nginx.org/) - 高性能 HTTP 服务器

---

如果这个项目对你有帮助，欢迎 ⭐ Star！
