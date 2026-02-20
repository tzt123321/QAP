import axios from 'axios'

const API_BASE_URL = '/api'
const ADMIN_KEY = '123456'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
})

// 验证管理密匙
export const verifyAdminKey = (key) => {
  return api.post('/admin/verify', `"${key}"`)
}

// 获取所有应用（普通访问）
export const getApps = async () => {
  const response = await api.get('/apps')
  return response.data
}

// 获取所有应用（管理）
export const getAdminApps = async () => {
  const response = await api.get('/admin/apps', {
    headers: {
      'X-Admin-Key': ADMIN_KEY
    }
  })
  return response.data
}

// 创建应用
export const createApp = async (appData) => {
  const response = await api.post('/admin/apps', appData, {
    headers: {
      'X-Admin-Key': ADMIN_KEY
    }
  })
  return response.data
}

// 更新应用
export const updateApp = async (id, appData) => {
  const response = await api.put(`/admin/apps/${id}`, appData, {
    headers: {
      'X-Admin-Key': ADMIN_KEY
    }
  })
  return response.data
}

// 删除应用
export const deleteApp = async (id) => {
  const response = await api.delete(`/admin/apps/${id}`, {
    headers: {
      'X-Admin-Key': ADMIN_KEY
    }
  })
  return response.data
}

export default {
  verifyAdminKey,
  getApps,
  getAdminApps,
  createApp,
  updateApp,
  deleteApp
}

