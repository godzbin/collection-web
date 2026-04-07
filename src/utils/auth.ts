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

// 加载配置
export const loadConfig = async () => {
    let config: any = null
  try {
    if (window.electronAPI) {
      const result = await window.electronAPI.getConfig()
      if (result.success) {
        config = result.data
        console.log('✅ 配置加载成功:', config)
      } else {
        console.error('❌ 配置加载失败')
      }
    } else {
      // 非 Electron 环境，使用 localStorage
      const saved = localStorage.getItem('systemConfig')
      if (saved) {
        config = JSON.parse(saved)
      }
    }
  } catch (error) {
    console.error('加载配置时出错:', error)
    }
    return config
}



