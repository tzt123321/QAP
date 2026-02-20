package com.quickaccess.controller;

import com.quickaccess.entity.WebApp;
import com.quickaccess.repository.WebAppRepository;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
public class WebAppController {

    @Autowired
    private WebAppRepository webAppRepository;

    @Value("${app.admin-key}")
    private String adminKey;

    // 普通访问接口 - 获取所有应用列表（只读）
    @GetMapping("/apps")
    public ResponseEntity<List<WebApp>> getAllApps() {
        List<WebApp> apps = webAppRepository.findAllByOrderByCreatedAtDesc();
        return ResponseEntity.ok(apps);
    }

    // 管理接口 - 验证密匙
    @PostMapping("/admin/verify")
    public ResponseEntity<?> verifyAdminKey(@RequestBody String key) {
        // 处理JSON字符串格式的key（去除引号和空白）
        String cleanKey = key.replace("\"", "").trim();
        java.util.Map<String, Boolean> result = new java.util.HashMap<>();
        result.put("valid", adminKey.equals(cleanKey));
        return ResponseEntity.ok().body(result);
    }

    // 管理接口 - 创建应用
    @PostMapping("/admin/apps")
    public ResponseEntity<?> createApp(@RequestHeader("X-Admin-Key") String key, 
                                       @Valid @RequestBody WebApp webApp) {
        if (!adminKey.equals(key)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("{\"error\": \"未授权\"}");
        }
        WebApp savedApp = webAppRepository.save(webApp);
        return ResponseEntity.status(HttpStatus.CREATED).body(savedApp);
    }

    // 管理接口 - 更新应用
    @PutMapping("/admin/apps/{id}")
    public ResponseEntity<?> updateApp(@RequestHeader("X-Admin-Key") String key,
                                       @PathVariable Long id,
                                       @Valid @RequestBody WebApp webApp) {
        if (!adminKey.equals(key)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("{\"error\": \"未授权\"}");
        }
        Optional<WebApp> existingApp = webAppRepository.findById(id);
        if (existingApp.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("{\"error\": \"应用不存在\"}");
        }
        webApp.setId(id);
        WebApp updatedApp = webAppRepository.save(webApp);
        return ResponseEntity.ok(updatedApp);
    }

    // 管理接口 - 删除应用
    @DeleteMapping("/admin/apps/{id}")
    public ResponseEntity<?> deleteApp(@RequestHeader("X-Admin-Key") String key,
                                       @PathVariable Long id) {
        if (!adminKey.equals(key)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("{\"error\": \"未授权\"}");
        }
        if (!webAppRepository.existsById(id)) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("{\"error\": \"应用不存在\"}");
        }
        webAppRepository.deleteById(id);
        return ResponseEntity.ok().body("{\"message\": \"删除成功\"}");
    }

    // 管理接口 - 获取所有应用（用于管理）
    @GetMapping("/admin/apps")
    public ResponseEntity<?> getAllAppsForAdmin(@RequestHeader("X-Admin-Key") String key) {
        if (!adminKey.equals(key)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("{\"error\": \"未授权\"}");
        }
        List<WebApp> apps = webAppRepository.findAllByOrderByCreatedAtDesc();
        return ResponseEntity.ok(apps);
    }
}

