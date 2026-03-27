<template>
  <div class="team-settings-tab">
    <!-- 璁剧疆澶撮儴 -->
    <div class="settings-header">
      <h3>鍥㈤槦璁剧疆</h3>
      <p class="settings-description">绠＄悊鍥㈤槦鐨勫熀鏈缃€佹潈闄愬拰楂樼骇閫夐」</p>
    </div>

    <!-- 璁剧疆鍐呭 -->
    <div class="settings-content">
      <el-tabs v-model="activeSetting" class="settings-tabs">
        <!-- 鍩烘湰淇℃伅璁剧疆 -->
        <el-tab-pane label="鍩烘湰淇℃伅" name="basic">
          <div class="setting-section">
            <h4 class="section-title">鍥㈤槦淇℃伅</h4>
            <p class="section-description">鏇存柊鍥㈤槦鐨勫熀鏈俊鎭拰鎻忚堪</p>

            <el-form
              ref="basicFormRef"
              :model="basicForm"
              :rules="basicRules"
              label-width="120px"
              class="setting-form"
            >
              <el-form-item label="鍥㈤槦鍚嶇О" prop="name">
                <el-input
                  v-model="basicForm.name"
                  placeholder="璇疯緭鍏ュ洟闃熷悕绉?
                  maxlength="50"
                  show-word-limit
                />
              </el-form-item>

              <el-form-item label="鍥㈤槦鎻忚堪" prop="description">
                <el-input
                  v-model="basicForm.description"
                  type="textarea"
                  :rows="4"
                  placeholder="璇疯緭鍏ュ洟闃熸弿杩?
                  maxlength="200"
                  show-word-limit
                />
              </el-form-item>

              <el-form-item label="鍥㈤槦澶村儚" prop="avatar">
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
                    <p>寤鸿灏哄锛?00脳200鍍忕礌</p>
                    <p>鏀寔 JPG銆丳NG 鏍煎紡锛屽ぇ灏忎笉瓒呰繃2MB</p>
                  </div>
                </div>
              </el-form-item>

              <el-form-item>
                <el-button type="primary" :loading="updatingBasic" @click="handleUpdateBasic">
                  淇濆瓨淇敼
                </el-button>
              </el-form-item>
            </el-form>
          </div>
        </el-tab-pane>

        <!-- 闅愮璁剧疆 -->
        <el-tab-pane label="闅愮璁剧疆" name="privacy" v-if="userRole === 'owner'">
          <div class="setting-section">
            <h4 class="section-title">鍥㈤槦鍙鎬?/h4>
            <p class="section-description">鎺у埗璋佸彲浠ユ煡鐪嬪拰鍔犲叆浣犵殑鍥㈤槦</p>

            <div class="privacy-options">
              <el-radio-group v-model="privacyForm.privacy">
                <div class="privacy-option">
                  <div class="privacy-option-header">
                    <el-radio label="public" />
                    <div class="privacy-option-content">
                      <h5>鍏紑鍥㈤槦</h5>
                      <p>鎵€鏈変汉閮藉彲浠ユ煡鐪嬪洟闃熶俊鎭拰椤圭洰锛屼絾鍙湁鍙楅個鎴愬憳鍙互鍔犲叆</p>
                    </div>
                  </div>
                </div>

                <div class="privacy-option">
                  <div class="privacy-option-header">
                    <el-radio label="private" />
                    <div class="privacy-option-content">
                      <h5>绉佹湁鍥㈤槦</h5>
                      <p>鍙湁鍥㈤槦鎴愬憳鍙互鏌ョ湅鍥㈤槦淇℃伅鍜岄」鐩?/p>
                    </div>
                  </div>
                </div>
              </el-radio-group>
            </div>

            <div class="setting-actions">
              <el-button type="primary" :loading="updatingPrivacy" @click="handleUpdatePrivacy">
                鏇存柊闅愮璁剧疆
              </el-button>
            </div>
          </div>
        </el-tab-pane>

        <!-- 鎴愬憳鏉冮檺 -->
        <el-tab-pane label="鎴愬憳鏉冮檺" name="permissions" v-if="userRole === 'owner'">
          <div class="setting-section">
            <h4 class="section-title">鎴愬憳鏉冮檺璁剧疆</h4>
            <p class="section-description">閰嶇疆鍥㈤槦鎴愬憳鍙互鎵ц鐨勬搷浣?/p>

            <div class="permission-settings">
              <div class="permission-item">
                <div class="permission-info">
                  <h5>鍒涘缓椤圭洰</h5>
                  <p>鍏佽鎴愬憳鍦ㄥ洟闃熶腑鍒涘缓鏂伴」鐩?/p>
                </div>
                <el-switch
                  v-model="permissionForm.can_create_project"
                  active-text="鍏佽"
                  inactive-text="绂佹"
                />
              </div>

              <div class="permission-item">
                <div class="permission-info">
                  <h5>閭€璇锋垚鍛?/h5>
                  <p>鍏佽鎴愬憳閭€璇锋柊鎴愬憳鍔犲叆鍥㈤槦</p>
                </div>
                <el-switch
                  v-model="permissionForm.can_invite_member"
                  active-text="鍏佽"
                  inactive-text="绂佹"
                />
              </div>

              <div class="permission-item">
                <div class="permission-info">
                  <h5>鍒犻櫎椤圭洰</h5>
                  <p>鍏佽鎴愬憳鍒犻櫎浠栦滑鍒涘缓鐨勯」鐩?/p>
                </div>
                <el-switch
                  v-model="permissionForm.can_delete_project"
                  active-text="鍏佽"
                  inactive-text="绂佹"
                />
              </div>

              <div class="permission-item">
                <div class="permission-info">
                  <h5>缂栬緫鍥㈤槦淇℃伅</h5>
                  <p>鍏佽鎴愬憳缂栬緫鍥㈤槦鍚嶇О鍜屾弿杩?/p>
                </div>
                <el-switch
                  v-model="permissionForm.can_edit_team"
                  active-text="鍏佽"
                  inactive-text="绂佹"
                />
              </div>
            </div>

            <div class="setting-actions">
              <el-button
                type="primary"
                :loading="updatingPermissions"
                @click="handleUpdatePermissions"
              >
                鏇存柊鏉冮檺璁剧疆
              </el-button>
            </div>
          </div>
        </el-tab-pane>

        <!-- 鍗遍櫓鍖哄煙 -->
        <el-tab-pane label="鍗遍櫓鍖哄煙" name="danger" v-if="userRole === 'owner'">
          <div class="setting-section danger-section">
            <h4 class="section-title danger-title">鈿狅笍 鍗遍櫓鎿嶄綔</h4>
            <p class="section-description">杩欎簺鎿嶄綔鍙兘鏃犳硶鎾ら攢锛岃璋ㄦ厧鎿嶄綔</p>

            <div class="danger-actions">
              <div class="danger-action">
                <div class="danger-action-info">
                  <h5>杞鍥㈤槦鎵€鏈夋潈</h5>
                  <p>灏嗗洟闃熸墍鏈夋潈杞缁欏叾浠栨垚鍛樸€傝浆璁╁悗浣犲皢鍙樹负绠＄悊鍛樿鑹层€?/p>
                </div>
                <el-button type="warning" @click="showTransferDialog = true">
                  杞鎵€鏈夋潈
                </el-button>
              </div>

              <div class="danger-action">
                <div class="danger-action-info">
                  <h5>瑙ｆ暎鍥㈤槦</h5>
                  <p>姘镐箙鍒犻櫎鍥㈤槦鍙婂叾鎵€鏈夋暟鎹€傛鎿嶄綔涓嶅彲鎾ら攢銆?/p>
                </div>
                <el-button type="danger" @click="handleDeleteTeam"> 瑙ｆ暎鍥㈤槦 </el-button>
              </div>
            </div>
          </div>
        </el-tab-pane>
      </el-tabs>
    </div>

    <!-- 杞鎵€鏈夋潈瀵硅瘽妗?-->
    <el-dialog v-model="showTransferDialog" title="杞鍥㈤槦鎵€鏈夋潈" width="500px">
      <el-form
        ref="transferFormRef"
        :model="transferForm"
        :rules="transferRules"
        label-width="100px"
      >
        <el-form-item label="鏂版墍鏈夎€? prop="new_owner_id">
          <el-select
            v-model="transferForm.new_owner_id"
            placeholder="璇烽€夋嫨鏂版墍鏈夎€?
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
                  {{ member.role === 'admin' ? '绠＄悊鍛? : '鎴愬憳' }}
                </el-tag>
              </div>
            </el-option>
          </el-select>
        </el-form-item>

        <el-form-item label="纭鎿嶄綔" prop="confirm">
          <el-checkbox v-model="transferForm.confirm">
            鎴戠‘璁よ灏嗗洟闃熸墍鏈夋潈杞缁欒鎴愬憳锛岃浆璁╁悗鎴戝皢鍙樹负绠＄悊鍛樿鑹?          </el-checkbox>
        </el-form-item>
      </el-form>

      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showTransferDialog = false">鍙栨秷</el-button>
          <el-button type="warning" :loading="transferring" @click="handleTransferOwnership">
            纭杞
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

// 婵€娲荤殑璁剧疆鏍囩
const activeSetting = ref('basic')

// 鍩烘湰淇℃伅琛ㄥ崟
const basicForm = reactive({
  name: props.team.name,
  description: props.team.description,
  avatar_url: props.team.avatar_url,
})

const basicRules = {
  name: [
    { required: true, message: '璇疯緭鍏ュ洟闃熷悕绉?, trigger: 'blur' },
    { min: 2, max: 50, message: '鍥㈤槦鍚嶇О闀垮害鍦?鍒?0涓瓧绗︿箣闂?, trigger: 'blur' },
  ],
  description: [
    { required: true, message: '璇疯緭鍏ュ洟闃熸弿杩?, trigger: 'blur' },
    { max: 200, message: '鍥㈤槦鎻忚堪涓嶈兘瓒呰繃200涓瓧绗?, trigger: 'blur' },
  ],
}

const basicFormRef = ref()
const updatingBasic = ref(false)

// 闅愮璁剧疆琛ㄥ崟
const privacyForm = reactive({
  privacy: props.team.privacy || 'private',
})

const updatingPrivacy = ref(false)

// 鏉冮檺璁剧疆琛ㄥ崟
const permissionForm = reactive({
  can_create_project: true,
  can_invite_member: true,
  can_delete_project: false,
  can_edit_team: false,
})

const updatingPermissions = ref(false)

// 杞鎵€鏈夋潈琛ㄥ崟
const showTransferDialog = ref(false)
const transferForm = reactive({
  new_owner_id: '',
  confirm: false,
})

const transferRules = {
  new_owner_id: [{ required: true, message: '璇烽€夋嫨鏂版墍鏈夎€?, trigger: 'change' }],
  confirm: [
    {
      validator: (_rule: any, value: boolean, callback: any) => {
        if (!value) {
          callback(new Error('璇风‘璁よ浆璁╂搷浣?))
        } else {
          callback()
        }
      },
      trigger: 'change',
    },
  ],
}

const transferring = ref(false)

// 鎴愬憳鏁版嵁锛堟ā鎷燂級
const members = ref<Member[]>([
  {
    id: 1,
    username: 'zhangsan',
    email: 'zhangsan@example.com',
    fullname: '寮犱笁',
    bio: '鍥㈤槦璐熻矗浜?,
    avatar_url: '',
    role: 'owner',
    joined_at: '2026-01-15T10:30:00Z',
  },
  {
    id: 2,
    username: 'lisi',
    email: 'lisi@example.com',
    fullname: '鏉庡洓',
    bio: '绠＄悊鍛?,
    avatar_url: '',
    role: 'admin',
    joined_at: '2026-01-20T14:15:00Z',
  },
  {
    id: 3,
    username: 'wangwu',
    email: 'wangwu@example.com',
    fullname: '鐜嬩簲',
    bio: '寮€鍙戝伐绋嬪笀',
    avatar_url: '',
    role: 'member',
    joined_at: '2026-02-01T09:00:00Z',
  },
])

// 璁＄畻绗﹀悎鏉′欢鐨勬垚鍛橈紙鎺掗櫎褰撳墠鎵€鏈夎€咃級
const eligibleMembers = computed(() => {
  return members.value.filter((member: Member) => member.role !== 'owner')
})

// 鐢熷懡鍛ㄦ湡
onMounted(() => {
  // 鍙互鍦ㄨ繖閲屽姞杞藉疄闄呯殑鏉冮檺璁剧疆
  loadPermissionSettings()
})

// 鍔犺浇鏉冮檺璁剧疆
const loadPermissionSettings = async () => {
  try {
    // TODO: 璋冪敤API鑾峰彇鏉冮檺璁剧疆
    console.log('鍔犺浇鏉冮檺璁剧疆')
  } catch (error) {
    console.error('鍔犺浇鏉冮檺璁剧疆澶辫触:', error)
  }
}

// 澶勭悊澶村儚鍙樻洿
const handleAvatarChange = (file: any) => {
  // TODO: 澶勭悊澶村儚涓婁紶
  console.log('澶村儚鏂囦欢:', file)
  // 杩欓噷鍙互娣诲姞鏂囦欢涓婁紶閫昏緫
  // 鏆傛椂浣跨敤鏈湴棰勮
  if (file.raw) {
    const reader = new FileReader()
    reader.onload = (e) => {
      basicForm.avatar_url = e.target?.result as string
    }
    reader.readAsDataURL(file.raw)
  }
}

// 鏇存柊鍩烘湰淇℃伅
const handleUpdateBasic = async () => {
  try {
    await basicFormRef.value?.validate()

    updatingBasic.value = true

    // TODO: 璋冪敤鏇存柊鍥㈤槦鐨凙PI
    await new Promise((resolve) => setTimeout(resolve, 1000))

    emit('update-team', {
      name: basicForm.name,
      description: basicForm.description,
      avatar_url: basicForm.avatar_url,
    })

    ElMessage.success('鍥㈤槦淇℃伅鏇存柊鎴愬姛')
  } catch (error) {
    console.error('鏇存柊澶辫触:', error)
    ElMessage.error('鏇存柊澶辫触锛岃閲嶈瘯')
  } finally {
    updatingBasic.value = false
  }
}

// 鏇存柊闅愮璁剧疆
const handleUpdatePrivacy = async () => {
  updatingPrivacy.value = true

  try {
    // TODO: 璋冪敤鏇存柊闅愮璁剧疆鐨凙PI
    await new Promise((resolve) => setTimeout(resolve, 1000))

    emit('update-team', { privacy: privacyForm.privacy })

    ElMessage.success('闅愮璁剧疆鏇存柊鎴愬姛')
  } catch (error) {
    console.error('鏇存柊澶辫触:', error)
    ElMessage.error('鏇存柊澶辫触锛岃閲嶈瘯')
  } finally {
    updatingPrivacy.value = false
  }
}

// 鏇存柊鏉冮檺璁剧疆
const handleUpdatePermissions = async () => {
  updatingPermissions.value = true

  try {
    // TODO: 璋冪敤鏇存柊鏉冮檺璁剧疆鐨凙PI
    await new Promise((resolve) => setTimeout(resolve, 1000))

    ElMessage.success('鏉冮檺璁剧疆鏇存柊鎴愬姛')
  } catch (error) {
    console.error('鏇存柊澶辫触:', error)
    ElMessage.error('鏇存柊澶辫触锛岃閲嶈瘯')
  } finally {
    updatingPermissions.value = false
  }
}

// 杞鎵€鏈夋潈
const handleTransferOwnership = async () => {
  transferring.value = true

  try {
    // TODO: 璋冪敤杞鎵€鏈夋潈鐨凙PI
    await new Promise((resolve) => setTimeout(resolve, 1000))

    ElMessage.success('鍥㈤槦鎵€鏈夋潈杞鎴愬姛')
    showTransferDialog.value = false
    transferForm.new_owner_id = ''
    transferForm.confirm = false

    // 鏇存柊鏈湴鏁版嵁
    // 鍦ㄥ疄闄呭簲鐢ㄤ腑锛岃繖閲屽彲鑳介渶瑕侀噸鏂板姞杞介〉闈㈡垨鏇存柊鐢ㄦ埛瑙掕壊
  } catch (error) {
    console.error('杞澶辫触:', error)
    ElMessage.error('杞澶辫触锛岃閲嶈瘯')
  } finally {
    transferring.value = false
  }
}

// 瑙ｆ暎鍥㈤槦
const handleDeleteTeam = async () => {
  try {
    await ElMessageBox.confirm(
      '纭畾瑕佽В鏁ｈ繖涓洟闃熷悧锛熸鎿嶄綔灏嗘案涔呭垹闄ゅ洟闃熷強鍏舵墍鏈夋暟鎹紝涓斾笉鍙仮澶嶃€?,
      '纭瑙ｆ暎鍥㈤槦',
      {
        confirmButtonText: '纭畾瑙ｆ暎',
        cancelButtonText: '鍙栨秷',
        type: 'error',
        confirmButtonClass: 'el-button--danger',
      },
    )

    // TODO: 璋冪敤瑙ｆ暎鍥㈤槦鐨凙PI
    await new Promise((resolve) => setTimeout(resolve, 1000))

    ElMessage.success('鍥㈤槦宸茶В鏁?)
    // 鍦ㄥ疄闄呭簲鐢ㄤ腑锛岃繖閲屽彲鑳介渶瑕佽烦杞埌鍥㈤槦鍒楄〃椤甸潰
  } catch {
    // 鐢ㄦ埛鍙栨秷
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

/* 鍝嶅簲寮忚璁?*/
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
