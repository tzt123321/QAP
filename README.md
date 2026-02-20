# 内网Web应用快速直达通道

一个基于SpringBoot + Vue3的内网Web应用管理平台，可以快速访问和管理内网中的Web应用。

## 功能特性

- ✅ 普通访问模式：查看和快速跳转到内网Web应用
- ✅ 管理模式：通过密匙访问管理界面，支持增删改查
- ✅ 响应式设计：美观的现代化UI界面
- ✅ 内网访问：默认运行在0.0.0.0:8999，支持内网其他设备访问

## 技术栈

### 后端
- Spring Boot 3.2.0
- Spring Data JPA
- MySQL 8.0
- Java 17

### 前端
- Vue 3
- Vite
- Axios
- 原生HTML/CSS/JavaScript

## 项目结构

```
projecte/
├── backend/              # SpringBoot后端
│   ├── src/
│   │   └── main/
│   │       ├── java/com/quickaccess/
│   │       │   ├── entity/        # 实体类
│   │       │   ├── repository/    # 数据访问层
│   │       │   ├── controller/    # 控制器
│   │       │   └── config/        # 配置类
│   │       └── resources/
│   │           └── application.yml
│   └── pom.xml
├── frontend/            # Vue3前端
│   ├── src/
│   │   ├── App.vue      # 主组件
│   │   ├── api.js       # API接口
│   │   ├── main.js      # 入口文件
│   │   └── style.css    # 样式文件
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
├── database/
│   └── init.sql         # 数据库初始化脚本
└── README.md
```

## 快速开始

### 1. 数据库准备

```sql
-- 创建数据库（或直接执行 database/init.sql）
CREATE DATABASE quick_access;
```

修改 `backend/src/main/resources/application.yml` 中的数据库连接信息：
```yaml
spring:
  datasource:
    url: jdbc:mysql://localhost:3306/quick_access?...
    username: root
    password: your_password
```

### 2. 启动后端

```bash
cd backend
mvn clean install
mvn spring-boot:run
```

后端将在 `http://0.0.0.0:8999` 启动

### 3. 启动前端

```bash
cd frontend
npm install
npm run dev
```

前端开发服务器将在 `http://localhost:3000` 启动

### 4. 生产环境构建

```bash
# 构建前端
cd frontend
npm run build

# 将 dist 目录内容部署到后端静态资源目录
# 或使用nginx等Web服务器
```

## 使用说明

### 普通访问模式

直接访问应用地址（如：`http://192.168.2.44:8999`），可以：
- 查看所有已添加的Web应用
- 点击应用卡片快速跳转到对应应用

### 管理模式

使用密匙访问（如：`http://192.168.2.44:123456`），可以：
- 查看所有应用列表（表格形式）
- 添加新应用
- 编辑现有应用
- 删除应用

**注意**：默认管理密匙为 `123456`，可在 `backend/src/main/resources/application.yml` 中修改：
```yaml
app:
  admin-key: your_admin_key
```

## API接口

### 普通接口
- `GET /api/apps` - 获取所有应用列表

### 管理接口（需要X-Admin-Key请求头）
- `POST /api/admin/verify` - 验证管理密匙
- `GET /api/admin/apps` - 获取所有应用（管理）
- `POST /api/admin/apps` - 创建应用
- `PUT /api/admin/apps/{id}` - 更新应用
- `DELETE /api/admin/apps/{id}` - 删除应用

## 配置说明

### 后端配置 (application.yml)
- `server.port`: 服务端口（默认8999）
- `server.address`: 绑定地址（默认0.0.0.0）
- `app.admin-key`: 管理密匙（默认123456）

### 前端配置 (vite.config.js)
- `server.port`: 开发服务器端口（默认3000）
- `proxy`: API代理配置

## 注意事项

1. 确保MySQL服务已启动
2. 确保8999端口未被占用
3. 管理密匙访问需要在URL中使用端口号方式（如：`:123456`）
4. 生产环境建议修改默认管理密匙

## 许可证

MIT License

