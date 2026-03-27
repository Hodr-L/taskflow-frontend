<template>
  <div class="team-settings-tab">
    <!-- 设置头部 -->
    <div class="settings-header">
      <h3>团队设置</h3>
      <p class="settings-description">管理团队的基本设置、权限和高级选项</p>
    </div>

    <!-- 设置内容 -->
    <div class="settings-content">
      <el-tabs v-model="activeSetting" class="settings-tabs">
        <!-- 基本信息设置 -->
        <el-tab-pane label="基本信息" name="basic">
          <div class="setting-section">
            <h4 class="section-title">团队信息</h4>
            <p class="section-description">更新团队的基本信息和描述</p>

            <el-form
              ref="basicFormRef"
              :model="basicForm"
              :rules="basicRules"
              label-width="120px"
              class="setting-form"
            >
              <el-form-item label="团队名称" prop="name">
                <el-input
                  v-model="basicForm.name"
                  placeholder="请输入团队名称"
                  maxlength="50"
                  show-word-limit
                />
              </el-form-item>

              <el-form-item label="团队描述" prop="description">
                <el-input
                  v-model="basicForm.description"
                  type="textarea"
                  :rows="4"
                  placeholder="请输入团队描述"
                  maxlength="200"
                  show-word-limit
                />
              </el-form-item>

              <el-form-item label="团队头像" prop="avatar">
                <div class="avatar-upload">
                  <el-upload
                    class="avatar-uploader"
                    action="#"
                    :show-file-list="false"
                    :on-change="handleAvatarChange"
                    :auto-upload="false"
                  >
                    <el-avatar
                      v-if="basicForm.avatar_url"
                      :size="100"
                      :src="basicForm.avatar_url"
                    />
                    <el-icon v-else class="avatar-uploader-icon">
                      <Plus />
                    </el-icon>
                  </el-upload>
                  <div class="avatar-upload-hint">
                    <p>建议尺寸：200×200像素</p>
                    <p>支持 JPG、PNG 格式，大小不超过2MB</p>
                  </div>
                </div>
              </el-form-item>

              <el-form-item>
                <el-button type="primary" :loading="updatingBasic" @click="handleUpdateBasic">
                  保存修改
                </el-button>
              </el-form-item>
            </el-form>
          </div>
        </el-tab-pane>

        <!-- 隐私设置 -->
        <el-tab-pane label="隐私设置" name="privacy" v-if="userRole === 'owner'">
          <div class="setting-section">
            <h4 class="section-title">团队可见性</h4>
            <p class="section-description">控制谁可以查看和加入你的团队</p>

            <div class="privacy-options">
              <el-radio-group v-model="privacyForm.privacy">
                <div class="privacy-option">
                  <div class="privacy-option-header">
                    <el-radio label="public" />
                    <div class="privacy-option-content">
                      <h5>公开团队</h5>
                      <p>所有人都可以查看团队信息和项目，但只有受邀成员可以加入</p>
                    </div>
                  </div>
                </div>

                <div class="privacy-option">
                  <div class="privacy-option-header">
                    <el-radio label="private" />
                    <div class="privacy-option-content">
                      <h5>私有团队</h5>
                      <p>只有团队成员可以查看团队信息和项目</p>
                    </div>
                  </div>
                </div>
              </el-radio-group>
            </div>

            <div class="setting-actions">
              <el-button type="primary" :loading="updatingPrivacy" @click="handleUpdatePrivacy">
                更新隐私设置
              </el-button>
            </div>
          </div>
        </el-tab-pane>

        <!-- 成员权限 -->
        <el-tab-pane label="成员权限" name="permissions" v-if="userRole === 'owner'">
          <div class="setting-section">
            <h4 class="section-title">成员权限设置</h4>
            <p class="section-description">配置团队成员可以执行的操作</p>

            <div class="permission-settings">
              <div class="permission-item">
                <div class="permission-info">
                  <h5>创建项目</h5>
                  <p>允许成员在团队中创建新项目</p>
                </div>
                <el-switch
                  v-model="permissionForm.can_create_project"
                  active-text="允许"
                  inactive-text="禁止"
                />
              </div>

              <div class="permission-item">
                <div class="permission-info">
                  <h5>邀请成员</h5>
                  <p>允许成员邀请新成员加入团队</p>
                </div>
                <el-switch
                  v-model="permissionForm.can_invite_member"
                  active-text="允许"
                  inactive-text="禁止"
                />
              </div>

              <div class="permission-item">
                <div class="permission-info">
                  <h5>删除项目</h5>
                  <p>允许成员删除他们创建的项目</p>
                </div>
                <el-switch
                  v-model="permissionForm.can_delete_project"
                  active-text="允许"
                  inactive-text="禁止"
                />
              </div>

              <div class="permission-item">
                <div class="permission-info">
                  <h5>编辑团队信息</h5>
                  <p>允许成员编辑团队名称和描述</p>
                </div>
                <el-switch
                  v-model="permissionForm.can_edit_team"
                  active-text="允许"
                  inactive-text="禁止"
                />
              </div>
            </div>

            <div class="setting-actions">
              <el-button
                type="primary"
                :loading="updatingPermissions"
                @click="handleUpdatePermissions"
              >
                更新权限设置
              </el-button>
            </div>
          </div>
        </el-tab-pane>

        <!-- 危险区域 -->
        <el-tab-pane label="危险区域" name="danger" v-if="userRole === 'owner'">
          <div class="setting-section danger-section">
            <h4 class="section-title danger-title">⚠️ 危险操作</h4>
            <p class="section-description">这些操作可能无法撤销，请谨慎操作</p>

            <div class="danger-actions">
              <div class="danger-action">
                <div class="danger-action-info">
                  <h5>转让团队所有权</h5>
                  <p>将团队所有权转让给其他成员。转让后你将变为管理员角色。</p>
                </div>
                <el-button type="warning" @click="showTransferDialog = true">
                  转让所有权
                </el-button>
              </div>

              <div class="danger-action">
                <div class="danger-action-info">
                  <h5>解散团队</h5>
                  <p>永久删除团队及其所有数据。此操作不可撤销。</p>
                </div>
                <el-button type="danger" @click="handleDeleteTeam"> 解散团队 </el-button>
              </div>
            </div>
          </div>
        </el-tab-pane>
      </el-tabs>
    </div>

    <!-- 转让所有权对话框 -->
    <el-dialog v-model="showTransferDialog" title="转让团队所有权" width="500px">
      <el-form
        ref="transferFormRef"
        :model="transferForm"
        :rules="transferRules"
        label-width="100px"
      >
        <el-form-item label="新所有者" prop="new_owner_id">
          <el-select
            v-model="transferForm.new_owner_id"
            placeholder="请选择新所有者"
            style="width: 100%"
          >
            <el-option
              v-for="member in eligibleMembers"
              :key="member.id"
              :label="member.full_name || member.username"
              :value="member.id"
            >
              <div style="display: flex; align-items: center">
                <el-avatar :size="24" :src="member.avatar_url" style="margin-right: 8px">
                  {{ member.full_name?.substring(0, 1) || member.username.substring(0, 1) }}
                </el-avatar>
                <span>{{ member.full_name || member.username }}</span>
                <el-tag size="small" style="margin-left: 8px">
                  {{ member.role === 'admin' ? '管理员' : '成员' }}
                </el-tag>
              </div>
            </el-option>
          </el-select>
        </el-form-item>

        <el-form-item label="确认操作" prop="confirm">
          <el-checkbox v-model="transferForm.confirm">
            我确认要将团队所有权转让给该成员，转让后我将变为管理员角色
          </el-checkbox>
        </el-form-item>
      </el-form>

      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showTransferDialog = false">取消</el-button>
          <el-button type="warning" :loading="transferring" @click="handleTransferOwnership">
            确认转让
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import type { Team } from '../../../types/team'
import type { Member } from '../../../types/member'

interface Props {
  team: Team
  userRole: 'owner' | 'admin' | 'member'
}

interface Emits {
  (e: 'update-team', team: Partial<Team>): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// 激活的设置标签
const activeSetting = ref('basic')

// 基本信息表单
const basicForm = reactive({
  name: props.team.name,
  description: props.team.description,
  avatar_url: props.team.avatar_url,
})

const basicRules = {
  name: [
    { required: true, message: '请输入团队名称', trigger: 'blur' },
    { min: 2, max: 50, message: '团队名称长度在2到50个字符之间', trigger: 'blur' },
  ],
  description: [
    { required: true, message: '请输入团队描述', trigger: 'blur' },
    { max: 200, message: '团队描述不能超过200个字符', trigger: 'blur' },
  ],
}

const basicFormRef = ref()
const updatingBasic = ref(false)

// 隐私设置表单
const privacyForm = reactive({
  privacy: props.team.privacy || 'private',
})

const updatingPrivacy = ref(false)

// 权限设置表单
const permissionForm = reactive({
  can_create_project: true,
  can_invite_member: true,
  can_delete_project: false,
  can_edit_team: false,
})

const updatingPermissions = ref(false)

// 转让所有权表单
const showTransferDialog = ref(false)
const transferForm = reactive({
  new_owner_id: '',
  confirm: false,
})

const transferRules = {
  new_owner_id: [{ required: true, message: '请选择新所有者', trigger: 'change' }],
  confirm: [
    {
      validator: (_rule: any, value: boolean, callback: any) => {
        if (!value) {
          callback(new Error('请确认转让操作'))
        } else {
          callback()
        }
      },
      trigger: 'change',
    },
  ],
}

const transferring = ref(false)

// 成员数据（模拟）
const members = ref<Member[]>([
  {
    id: 1,
    username: 'zhangsan',
    email: 'zhangsan@example.com',
    fullname: '张三',
    bio: '团队负责人',
    avatar_url: '',
    role: 'owner',
    joined_at: '2026-01-15T10:30:00Z',
  },
  {
    id: 2,
    username: 'lisi',
    email: 'lisi@example.com',
    fullname: '李四',
    bio: '管理员',
    avatar_url: '',
    role: 'admin',
    joined_at: '2026-01-20T14:15:00Z',
  },
  {
    id: 3,
    username: 'wangwu',
    email: 'wangwu@example.com',
    fullname: '王五',
    bio: '开发工程师',
    avatar_url: '',
    role: 'member',
    joined_at: '2026-02-01T09:00:00Z',
  },
])

// 计算符合条件的成员（排除当前所有者）
const eligibleMembers = computed(() => {
  return members.value.filter((member: Member) => member.role !== 'owner')
})

// 生命周期
onMounted(() => {
  // 可以在这里加载实际的权限设置
  loadPermissionSettings()
})

// 加载权限设置
const loadPermissionSettings = async () => {
  try {
    // TODO: 调用API获取权限设置
    console.log('加载权限设置')
  } catch (error) {
    console.error('加载权限设置失败:', error)
  }
}

// 处理头像变更
const handleAvatarChange = (file: any) => {
  // TODO: 处理头像上传
  console.log('头像文件:', file)
  // 这里可以添加文件上传逻辑
  // 暂时使用本地预览
  if (file.raw) {
    const reader = new FileReader()
    reader.onload = (e) => {
      basicForm.avatar_url = e.target?.result as string
    }
    reader.readAsDataURL(file.raw)
  }
}

// 更新基本信息
const handleUpdateBasic = async () => {
  try {
    await basicFormRef.value?.validate()

    updatingBasic.value = true

    // TODO: 调用更新团队的API
    await new Promise((resolve) => setTimeout(resolve, 1000))

    emit('update-team', {
      name: basicForm.name,
      description: basicForm.description,
      avatar_url: basicForm.avatar_url,
    })

    ElMessage.success('团队信息更新成功')
  } catch (error) {
    console.error('更新失败:', error)
    ElMessage.error('更新失败，请重试')
  } finally {
    updatingBasic.value = false
  }
}

// 更新隐私设置
const handleUpdatePrivacy = async () => {
  updatingPrivacy.value = true

  try {
    // TODO: 调用更新隐私设置的API
    await new Promise((resolve) => setTimeout(resolve, 1000))

    emit('update-team', { privacy: privacyForm.privacy })

    ElMessage.success('隐私设置更新成功')
  } catch (error) {
    console.error('更新失败:', error)
    ElMessage.error('更新失败，请重试')
  } finally {
    updatingPrivacy.value = false
  }
}

// 更新权限设置
const handleUpdatePermissions = async () => {
  updatingPermissions.value = true

  try {
    // TODO: 调用更新权限设置的API
    await new Promise((resolve) => setTimeout(resolve, 1000))

    ElMessage.success('权限设置更新成功')
  } catch (error) {
    console.error('更新失败:', error)
    ElMessage.error('更新失败，请重试')
  } finally {
    updatingPermissions.value = false
  }
}

// 转让所有权
const handleTransferOwnership = async () => {
  transferring.value = true

  try {
    // TODO: 调用转让所有权的API
    await new Promise((resolve) => setTimeout(resolve, 1000))

    ElMessage.success('团队所有权转让成功')
    showTransferDialog.value = false
    transferForm.new_owner_id = ''
    transferForm.confirm = false

    // 更新本地数据
    // 在实际应用中，这里可能需要重新加载页面或更新用户角色
  } catch (error) {
    console.error('转让失败:', error)
    ElMessage.error('转让失败，请重试')
  } finally {
    transferring.value = false
  }
}

// 解散团队
const handleDeleteTeam = async () => {
  try {
    await ElMessageBox.confirm(
      '确定要解散这个团队吗？此操作将永久删除团队及其所有数据，且不可恢复。',
      '确认解散团队',
      {
        confirmButtonText: '确定解散',
        cancelButtonText: '取消',
        type: 'error',
        confirmButtonClass: 'el-button--danger',
      },
    )

    // TODO: 调用解散团队的API
    await new Promise((resolve) => setTimeout(resolve, 1000))

    ElMessage.success('团队已解散')
    // 在实际应用中，这里可能需要跳转到团队列表页面
  } catch {
    // 用户取消
  }
}
</script>

<style scoped>
.team-settings-tab {
  padding: 20px 0;
}

.settings-header {
  margin-bottom: 32px;
}

.settings-header h3 {
  font-size: 24px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 8px;
}

.settings-description {
  font-size: 14px;
  color: #909399;
}

.settings-tabs {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

.setting-section {
  padding: 24px 0;
}

.section-title {
  font-size: 18px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 8px;
}

.section-description {
  font-size: 14px;
  color: #909399;
  margin-bottom: 24px;
}

.setting-form {
  max-width: 600px;
}

.avatar-upload {
  display: flex;
  align-items: flex-start;
  gap: 24px;
}

.avatar-uploader {
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  width: 100px;
  height: 100px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.avatar-uploader:hover {
  border-color: #409eff;
}

.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
}

.avatar-upload-hint p {
  font-size: 12px;
  color: #909399;
  margin: 4px 0;
}

.privacy-options {
  max-width: 600px;
  margin-bottom: 24px;
}

.privacy-option {
  margin-bottom: 16px;
  padding: 16px;
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  transition: all 0.3s;
}

.privacy-option:hover {
  border-color: #409eff;
  background: #f5f7fa;
}

.privacy-option-header {
  display: flex;
  align-items: flex-start;
  gap: 12px;
}

.privacy-option-content h5 {
  font-size: 16px;
  font-weight: 500;
  color: #303133;
  margin-bottom: 4px;
}

.privacy-option-content p {
  font-size: 14px;
  color: #606266;
}

.permission-settings {
  max-width: 600px;
}

.permission-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 0;
  border-bottom: 1px solid #e4e7ed;
}

.permission-item:last-child {
  border-bottom: none;
}

.permission-info h5 {
  font-size: 16px;
  font-weight: 500;
  color: #303133;
  margin-bottom: 4px;
}

.permission-info p {
  font-size: 14px;
  color: #606266;
}

.danger-section {
  border: 1px solid #fde2e2;
  border-radius: 8px;
  padding: 24px;
  background: #fef0f0;
}

.danger-title {
  color: #f56c6c;
}

.danger-actions {
  max-width: 600px;
}

.danger-action {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 0;
  border-bottom: 1px solid #fcd3d3;
}

.danger-action:last-child {
  border-bottom: none;
}

.danger-action-info h5 {
  font-size: 16px;
  font-weight: 500;
  color: #303133;
  margin-bottom: 4px;
}

.danger-action-info p {
  font-size: 14px;
  color: #606266;
  max-width: 400px;
}

.setting-actions {
  margin-top: 24px;
  padding-top: 24px;
  border-top: 1px solid #e4e7ed;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .settings-tabs {
    padding: 16px;
  }

  .setting-section {
    padding: 16px 0;
  }

  .avatar-upload {
    flex-direction: column;
    align-items: flex-start;
  }

  .permission-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }

  .danger-action {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }

  .danger-action-info p {
    max-width: 100%;
  }
}
</style>
