import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { User } from '@/types/auth'
import { login, register, logout, getProfile } from '@/services/auth'

// JWT宸ュ叿鍑芥暟
const decodeJWT = (token: string): any => {
  try {
    // JWT鏍煎紡: header.payload.signature
    const parts = token.split('.')
    if (parts.length !== 3) {
      return null
    }
    // 瑙ｇ爜payload閮ㄥ垎
    const payload = parts[1]
    // Base64瑙ｇ爜锛堝鐞哢RL瀹夊叏鐨凚ase64锛?    const decoded = atob(payload.replace(/-/g, '+').replace(/_/g, '/'))
    return JSON.parse(decoded)
  } catch (error) {
    console.error('瑙ｇ爜JWT澶辫触:', error)
    return null
  }
}

const isTokenExpired = (token: string): boolean => {
  try {
    const decoded = decodeJWT(token)
    if (!decoded || !decoded.exp) {
      return true // 娌℃湁杩囨湡鏃堕棿瑙嗕负宸茶繃鏈?    }
    // exp鏄疷nix鏃堕棿鎴筹紙绉掞級
    const currentTime = Math.floor(Date.now() / 1000)
    return decoded.exp < currentTime
  } catch (error) {
    console.error('妫€鏌oken杩囨湡澶辫触:', error)
    return true // 瑙ｆ瀽澶辫触瑙嗕负宸茶繃鏈?  }
}

export const useAuthStore = defineStore('auth', () => {
  // 鐘舵€?  const token = ref<string | null>(null)
  const user = ref<User | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // 鍒濆鍖栵細浠巐ocalStorage鍔犺浇token锛屼絾妫€鏌ユ槸鍚﹁繃鏈?  const storedToken = localStorage.getItem('token')
  if (storedToken) {
    if (isTokenExpired(storedToken)) {
      console.log('妫€娴嬪埌杩囨湡鐨則oken锛屽凡娓呴櫎')
      localStorage.removeItem('token')
      localStorage.removeItem('user')
    } else {
      token.value = storedToken
      console.log('鍔犺浇鏈夋晥鐨則oken锛岄暱搴?', storedToken.length)
    }
  }

  // 璁＄畻灞炴€?  const isAuthenticated = computed(() => !!token.value)
  const username = computed(() => user.value?.username || '')
  const email = computed(() => user.value?.email || '')
  const role = computed(() => user.value?.role || 'user')

  // Actions
  const setToken = (newToken: string) => {
    console.log('璁剧疆token锛岄暱搴?', newToken.length)
    token.value = newToken
    localStorage.setItem('token', newToken)
    console.log('token宸蹭繚瀛樺埌localStorage')
    
    // 楠岃瘉淇濆瓨缁撴灉
    const saved = localStorage.getItem('token')
    if (saved) {
      console.log('楠岃瘉淇濆瓨鐨則oken锛屽墠10浣?', saved.substring(0, 10), '...')
    }
  }

  const clearToken = () => {
    token.value = null
    localStorage.removeItem('token')
  }

  const setUser = (userData: User) => {
    console.log('璁剧疆鐢ㄦ埛鏁版嵁:', userData)
    console.log('鐢ㄦ埛瑙掕壊:', userData.role)
    user.value = userData
    // 缂撳瓨鐢ㄦ埛鏁版嵁鍒發ocalStorage
    localStorage.setItem('user', JSON.stringify(userData))
    console.log('鐢ㄦ埛鏁版嵁宸蹭繚瀛樺埌localStorage')
    
    // 楠岃瘉淇濆瓨缁撴灉
    const saved = localStorage.getItem('user')
    if (saved) {
      const parsed = JSON.parse(saved)
      console.log('楠岃瘉淇濆瓨鐨勭敤鎴锋暟鎹紝role:', parsed.role)
    }
  }

  const clearUser = () => {
    user.value = null
    localStorage.removeItem('user')
  }

  // 鐧诲綍
  const userLogin = async (email: string, password: string) => {
    isLoading.value = true
    error.value = null

    try {
      console.log('寮€濮嬬櫥褰曪紝閭:', email)
      const response = await login({ email, password })
      console.log('鐧诲綍API鍝嶅簲:', response)
      // api.ts鎷︽埅鍣ㄨ繑鍥瀝esponse.data.data锛屾墍浠esponse鐩存帴灏辨槸{access_token, ...}
      setToken(response.access_token)
      // 濡傛灉鍝嶅簲涓寘鍚敤鎴蜂俊鎭紝鐩存帴璁剧疆
      if (response.user) {
        console.log('鍝嶅簲涓寘鍚敤鎴蜂俊鎭紝role:', response.user.role)
        setUser(response.user)
      } else {
        console.log('鍝嶅簲涓笉鍖呭惈鐢ㄦ埛淇℃伅锛岃皟鐢╢etchUserProfile')
        await fetchUserProfile()
      }
      return { success: true }
    } catch (err: any) {
      console.error('鐧诲綍鍑洪敊:', err)
      error.value = err.message || '鐧诲綍澶辫触'
      return { success: false, error: error.value }
    } finally {
      isLoading.value = false
    }
  }

  // 娉ㄥ唽
  const userRegister = async (username: string, email: string, password: string) => {
    isLoading.value = true
    error.value = null

    try {
      const response = await register({ username, email, password })
      // api.ts鎷︽埅鍣ㄨ繑鍥瀝esponse.data.data锛屾墍浠esponse鐩存帴灏辨槸{access_token, ...}
      setToken(response.access_token)
      // 濡傛灉鍝嶅簲涓寘鍚敤鎴蜂俊鎭紝鐩存帴璁剧疆
      if (response.user) {
        setUser(response.user)
      } else {
        await fetchUserProfile()
      }
      return { success: true }
    } catch (err: any) {
      error.value = err.message || '娉ㄥ唽澶辫触'
      return { success: false, error: error.value }
    } finally {
      isLoading.value = false
    }
  }

  // 閫€鍑虹櫥褰?  const userLogout = async () => {
    try {
      await logout()
    } catch (err) {
      console.error('閫€鍑虹櫥褰曞け璐?', err)
    } finally {
      clearToken()
      clearUser()
    }
  }

  // 鑾峰彇鐢ㄦ埛淇℃伅
  const fetchUserProfile = async () => {
    if (!token.value) return

    try {
      // 棣栧厛灏濊瘯浣跨敤鏍囧噯鎺ュ彛鑾峰彇鐢ㄦ埛淇℃伅
      const response = await getProfile()
      setUser(response)
    } catch (err: any) {
      console.error('鑾峰彇鐢ㄦ埛淇℃伅澶辫触:', err)
      
      // 濡傛灉鏍囧噯鎺ュ彛澶辫触锛屾鏌ラ敊璇俊鎭?      if (err.message?.includes('user_id') || err.code === 401) {
        // 灏濊瘯浠巐ocalStorage鑾峰彇缂撳瓨鐨勭敤鎴稩D
        const cachedUser = localStorage.getItem('user')
        if (cachedUser) {
          try {
            const userData = JSON.parse(cachedUser)
            if (userData.id) {
              // 浣跨敤鐢ㄦ埛ID璋冪敤鐢ㄦ埛璇︽儏鎺ュ彛
              const { getUserById } = await import('@/services/user')
              const userResponse = await getUserById(userData.id)
              setUser(userResponse)
              return
            }
          } catch (cacheErr) {
            console.error('瑙ｆ瀽缂撳瓨鐢ㄦ埛鏁版嵁澶辫触:', cacheErr)
          }
        }
      }
      
      // 濡傛灉鎵€鏈夋柟娉曢兘澶辫触锛屾竻闄oken
      clearToken()
    }
  }

  // 鍒濆鍖栨椂灏濊瘯浠巐ocalStorage鍔犺浇鐢ㄦ埛鏁版嵁
  const cachedUser = localStorage.getItem('user')
  if (cachedUser) {
    try {
      const userData = JSON.parse(cachedUser)
      user.value = userData
      console.log('浠巐ocalStorage鍔犺浇鐢ㄦ埛鏁版嵁锛岃鑹?', userData.role)
    } catch (err) {
      console.error('鍔犺浇缂撳瓨鐢ㄦ埛鏁版嵁澶辫触:', err)
      localStorage.removeItem('user')
    }
  }

  // 鍒濆鍖栨椂鑾峰彇鐢ㄦ埛淇℃伅锛堟敼涓洪潤榛樻ā寮忥紝涓嶅洜澶辫触鑰屾竻闄oken锛?  // 鍙湁token瀛樺湪鏃舵墠灏濊瘯鑾峰彇鏈€鏂扮敤鎴蜂俊鎭?  if (token.value) {
    // 濡傛灉鏈夌紦瀛樼殑鐢ㄦ埛鏁版嵁锛屽欢杩熻幏鍙栵紙璁╅〉闈㈠厛鏄剧ず锛?    // 濡傛灉娌℃湁缂撳瓨鏁版嵁锛岀珛鍗宠幏鍙栵紙浣嗗欢杩?绉掗伩鍏嶄笌鐧诲綍娴佺▼鍐茬獊锛?    const delay = cachedUser ? 5000 : 1000  // 鏈夌紦瀛樻椂寤惰繜5绉掞紝鏃犵紦瀛樻椂寤惰繜1绉?    
    setTimeout(() => {
      // 鍐嶆妫€鏌oken鏄惁瀛樺湪锛堝彲鑳藉湪姝ゆ湡闂寸敤鎴峰凡閫€鍑猴級
      if (!token.value) {
        console.log('token宸蹭笉瀛樺湪锛岃烦杩囪幏鍙栫敤鎴蜂俊鎭?)
        return
      }
      
      // 閬垮厤閲嶅鑾峰彇锛氬鏋滅敤鎴锋暟鎹凡缁忛€氳繃鍏朵粬鏂瑰紡璁剧疆锛屼笖鏃堕棿寰堣繎锛屽彲浠ヨ烦杩?      // 杩欓噷绠€鍗曞疄鐜帮細鎬绘槸鑾峰彇鏈€鏂颁俊鎭紝浣嗘崟鑾烽敊璇笉褰卞搷鐘舵€?      fetchUserProfile().catch(err => {
        console.warn('鍒濆鍖栨椂鑾峰彇鐢ㄦ埛淇℃伅澶辫触锛堜笉褰卞搷鐧诲綍鐘舵€侊級:', err.message)
        // 涓嶈皟鐢╟learToken()锛屼繚鎸佸綋鍓嶇櫥褰曠姸鎬?      })
    }, delay)
  }

  return {
    // 鐘舵€?    token,
    user,
    isLoading,
    error,

    // 璁＄畻灞炴€?    isAuthenticated,
    username,
    email,
    role,

    // Actions
    userLogin,
    userRegister,
    userLogout,
    fetchUserProfile,
    clearToken,
    clearUser,
  }
})
