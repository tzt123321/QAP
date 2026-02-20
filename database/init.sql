-- 创建数据库
CREATE DATABASE IF NOT EXISTS quick_access DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE quick_access;

-- 创建web应用表
CREATE TABLE IF NOT EXISTS web_apps (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL COMMENT '应用名称',
    ip_address VARCHAR(50) NOT NULL COMMENT 'IP地址',
    port INT NOT NULL COMMENT '端口号',
    description VARCHAR(500) COMMENT '描述',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Web应用表';

-- 插入示例数据
INSERT INTO web_apps (name, ip_address, port, description) VALUES
('示例应用1', '192.168.1.100', 8080, '这是一个示例Web应用'),
('示例应用2', '192.168.1.101', 3000, '另一个示例Web应用');

