<template>
  <div class="container">
    <div class="header">
      <h1>内网Web应用快速直达通道</h1>
      <p>快速访问内网中的Web应用</p>
    </div>

    <!-- 普通访问模式 -->
    <div v-if="!isAdminMode">
      <div v-if="loading" class="loading">加载中...</div>
      <div v-else-if="error" class="error">{{ error }}</div>
      <div v-else>
        <div v-if="apps.length === 0" class="empty-state">
          <h3>暂无应用</h3>
          <p>请联系管理员添加应用</p>
        </div>
        <div v-else class="app-grid">
          <div
            v-for="app in apps"
            :key="app.id"
            class="app-card"
            @click="openApp(app)"
          >
            <h3>{{ app.name }}</h3>
            <div class="url">{{ app.url }}</div>
            <div v-if="app.description" class="description">
              {{ app.description }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 管理模式 -->
    <div v-else class="admin-panel">
      <div class="admin-header">
        <h2>管理面板</h2>
        <button class="btn btn-primary" @click="showAddModal = true">
          添加应用
        </button>
      </div>

      <div v-if="loading" class="loading">加载中...</div>
      <div v-else-if="error" class="error">{{ error }}</div>
      <div v-else>
        <table class="table">
          <thead>
            <tr>
              <th>ID</th>
              <th>名称</th>
              <th>IP地址</th>
              <th>端口</th>
              <th>描述</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="app in apps" :key="app.id">
              <td>{{ app.id }}</td>
              <td>{{ app.name }}</td>
              <td>{{ app.ipAddress }}</td>
              <td>{{ app.port }}</td>
              <td>{{ app.description || '-' }}</td>
              <td>
                <div class="actions">
                  <button class="btn btn-primary" @click="editApp(app)">
                    编辑
                  </button>
                  <button class="btn btn-danger" @click="deleteApp(app.id)">
                    删除
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
        <div v-if="apps.length === 0" class="empty-state">
          <h3>暂无应用</h3>
          <p>点击"添加应用"按钮开始添加</p>
        </div>
      </div>
    </div>

    <!-- 添加/编辑模态框 -->
    <div v-if="showAddModal || showEditModal" class="modal" @click.self="closeModal">
      <div class="modal-content">
        <div class="modal-header">
          <h3>{{ showEditModal ? '编辑应用' : '添加应用' }}</h3>
          <button class="close-btn" @click="closeModal">&times;</button>
        </div>
        <form @submit.prevent="saveApp">
          <div class="form-group">
            <label>应用名称 *</label>
            <input v-model="formData.name" type="text" required />
          </div>
          <div class="form-group">
            <label>IP地址 *</label>
            <input v-model="formData.ipAddress" type="text" required />
          </div>
          <div class="form-group">
            <label>端口号 *</label>
            <input v-model.number="formData.port" type="number" required />
          </div>
          <div class="form-group">
            <label>描述</label>
            <textarea v-model="formData.description"></textarea>
          </div>
          <div class="form-actions">
            <button type="submit" class="btn btn-success">
              {{ showEditModal ? '更新' : '添加' }}
            </button>
            <button type="button" class="btn btn-secondary" @click="closeModal">
              取消
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import api from './api'

export default {
  name: 'App',
  setup() {
    const apps = ref([])
    const loading = ref(false)
    const error = ref('')
    const isAdminMode = ref(false)
    const showAddModal = ref(false)
    const showEditModal = ref(false)
    const formData = ref({
      id: null,
      name: '',
      ipAddress: '',
      port: '',
      description: ''
    })

    // 检查URL中是否包含管理密匙
    const checkAdminMode = async () => {
      const urlParams = new URLSearchParams(window.location.search)
      const key = urlParams.get('key')
      const port = window.location.port
      const adminKey = '123456' // 从后端配置读取，这里硬编码
      
      // 支持两种方式：URL参数 ?key=123456 或端口号匹配
      if (key === adminKey || port === adminKey) {
        try {
          const response = await api.verifyAdminKey(adminKey)
          if (response.data && response.data.valid) {
            isAdminMode.value = true
          } else {
            isAdminMode.value = false
          }
        } catch (err) {
          isAdminMode.value = false
        }
      } else {
        isAdminMode.value = false
      }
    }

    // 加载应用列表
    const loadApps = async () => {
      loading.value = true
      error.value = ''
      try {
        if (isAdminMode.value) {
          apps.value = await api.getAdminApps()
        } else {
          apps.value = await api.getApps()
        }
      } catch (err) {
        error.value = '加载应用列表失败: ' + (err.message || '未知错误')
      } finally {
        loading.value = false
      }
    }

    // 打开应用
    const openApp = (app) => {
      window.open(app.url, '_blank')
    }

    // 编辑应用
    const editApp = (app) => {
      formData.value = {
        id: app.id,
        name: app.name,
        ipAddress: app.ipAddress,
        port: app.port,
        description: app.description || ''
      }
      showEditModal.value = true
    }

    // 删除应用
    const deleteApp = async (id) => {
      if (!confirm('确定要删除这个应用吗？')) {
        return
      }
      try {
        await api.deleteApp(id)
        await loadApps()
      } catch (err) {
        error.value = '删除失败: ' + (err.message || '未知错误')
      }
    }

    // 保存应用
    const saveApp = async () => {
      try {
        if (showEditModal.value) {
          await api.updateApp(formData.value.id, formData.value)
        } else {
          await api.createApp(formData.value)
        }
        closeModal()
        await loadApps()
      } catch (err) {
        error.value = '保存失败: ' + (err.message || '未知错误')
      }
    }

    // 关闭模态框
    const closeModal = () => {
      showAddModal.value = false
      showEditModal.value = false
      formData.value = {
        id: null,
        name: '',
        ipAddress: '',
        port: '',
        description: ''
      }
    }

    onMounted(() => {
      checkAdminMode()
      loadApps()
    })

    return {
      apps,
      loading,
      error,
      isAdminMode,
      showAddModal,
      showEditModal,
      formData,
      openApp,
      editApp,
      deleteApp,
      saveApp,
      closeModal
    }
  }
}
</script>

