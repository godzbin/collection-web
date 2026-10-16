import { getConfig, isTauri } from "../api/tauri";

// export const beianhao = "guoruixinneng.com 粤ICP备2022118025号-2";

export const tokenLocalName = "token";
export const userInfoLocalName = "userInfo";
export const getToken = (): string => {
    return localStorage.getItem(tokenLocalName) || "";
};

export const setToken = (token: string) => {
    localStorage.setItem(tokenLocalName, token);
};


export const removeLocalInfo = () => {
    localStorage.removeItem(tokenLocalName);
    localStorage.removeItem(userInfoLocalName);
};

// 系统配置默认值（来自 env：VITE_SERVICE_URL / VITE_XXL_JOB_URL / VITE_XXL_USERNAME / VITE_XXL_PASSWORD）
export const getDefaultConfig = () => ({
  serviceUrl: import.meta.env.VITE_SERVICE_URL || "",
  xxlJobUrl: import.meta.env.VITE_XXL_JOB_URL || "",
  logFilePath: import.meta.env.VITE_LOG_FILE_PATH || "",
  xxlUsername: import.meta.env.VITE_XXL_USERNAME || "",
  xxlPassword: import.meta.env.VITE_XXL_PASSWORD || "",
});

// 加载配置（未保存过时回退 env 默认值）
export const loadConfig = async () => {
    let config: any = null
  try {
    if (isTauri()) {
      const result = await getConfig()
      if (result.success) {
        config = { ...getDefaultConfig(), ...result.data }
        console.log('✅ 配置加载成功:', config)
      } else {
        console.error('❌ 配置加载失败')
      }
    } else {
      // 非 Electron 环境，使用 localStorage，缺省时回退 env 默认值
      const saved = localStorage.getItem('systemConfig')
      config = saved
        ? { ...getDefaultConfig(), ...JSON.parse(saved) }
        : getDefaultConfig()
    }
  } catch (error) {
      console.error('加载配置时出错:', error)
    }
    return config
}



