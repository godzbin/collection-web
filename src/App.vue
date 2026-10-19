<template>
  <div id="app" :class="{ 'menu-open': menuOpen }">
    <!-- 移动端顶栏：右上角汉堡菜单 -->
    <div class="mobile-header">
      <div class="mobile-logo bg">
        <img :src="logoUrl" alt="Logo">
      </div>
      <div class="hamburger" @click="menuOpen = true" title="菜单">
        <svg viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg" width="22" height="22">
          <path d="M128 213.333333h768a42.666667 42.666667 0 0 1 0 85.333334H128a42.666667 42.666667 0 0 1 0-85.333334z m0 256h768a42.666667 42.666667 0 0 1 0 85.333334H128a42.666667 42.666667 0 0 1 0-85.333334z m0 256h768a42.666667 42.666667 0 0 1 0 85.333334H128a42.666667 42.666667 0 0 1 0-85.333334z" fill="#fff"/>
        </svg>
      </div>
    </div>
    <!-- 移动端抽屉遮罩 -->
    <div class="sidebar-mask" @click="menuOpen = false" v-if="menuOpen"></div>

    <!-- 左侧导航栏 -->
    <div class="sidebar">
      <div class="logo-container">
        <div class="logo bg">
          <img :src="logoUrl" alt="Logo"></img>
        </div>
        <!-- <div class="app-name">0xa</div> -->
      </div>

      <div class="menu">
        <router-link to="/" class="menu-item" active-class="active" @click="closeMenu">
          <span class="menu-icon">
            <svg t="1768287904883" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="2520" width="200" height="200"><path d="M840.192497 1024h-178.309309a64.604822 64.604822 0 0 1-64.604823-64.604822V646.06179H419.615104v311.395243a64.604822 64.604822 0 0 1-64.604822 64.604822H181.22331a64.604822 64.604822 0 0 1-64.604822-64.604822V525.250772H76.563498a58.14434 58.14434 0 0 1-58.790388-38.762893A64.604822 64.604822 0 0 1 31.340122 416.068622L470.652914 18.102917a64.604822 64.604822 0 0 1 89.800703 0l432.852309 396.673609a64.604822 64.604822 0 0 1-45.869424 109.828198h-44.577327v436.728598a64.604822 64.604822 0 0 1-62.666678 62.666678zM422.199297 585.979305h179.601406a64.604822 64.604822 0 0 1 64.604822 64.604822v313.333388h175.725117V465.168287h109.182149L515.876289 64.618389 76.563498 462.584094h107.890053v501.333421h178.955358v-310.749195a64.604822 64.604822 0 0 1 58.790388-67.189015z" fill="#fff" p-id="2521"></path></svg>
          </span>
          <span class="menu-text">数据驾驶舱</span>
        </router-link>

        <router-link to="/taskInfo" class="menu-item" active-class="active" @click="closeMenu">
          <span class="menu-icon">
            <el-icon :size="20"><DocumentChecked /></el-icon>
          </span>
          <span class="menu-text">任务入库</span>
        </router-link>
        <router-link to="/taskList" class="menu-item" active-class="active" @click="closeMenu">
          <span class="menu-icon">
            <svg t="1775358885264" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="4798" width="200" height="200"><path d="M79.677 876.45H876.45v88.53H79.677z" fill="#fff" p-id="4799"></path><path d="M684.634 604.957H271.493c-17.706 0-29.51-11.804-29.51-29.51s11.804-29.51 29.51-29.51h413.141c17.706 0 29.51 11.804 29.51 29.51s-14.755 29.51-29.51 29.51z m0 120.991H271.493c-17.706 0-29.51-11.804-29.51-29.51s11.804-29.51 29.51-29.51h413.141c17.706 0 29.51 11.804 29.51 29.51s-14.755 29.51-29.51 29.51z m-35.412-360.023H448.553c-17.706 0-29.51-11.804-29.51-29.51s11.804-29.51 29.51-29.51h200.669c17.706 0 29.51 11.804 29.51 29.51s-11.804 29.51-29.51 29.51z m35.412 120.991H271.493c-17.706 0-29.51-11.804-29.51-29.51s11.804-29.51 29.51-29.51h413.141c17.706 0 29.51 11.804 29.51 29.51s-14.755 29.51-29.51 29.51z" fill="#fff" p-id="4800"></path><path d="M779.066 994.49h-616.76c-61.972 0-112.139-53.118-112.139-115.09V327.563c0-17.706 5.902-32.461 17.706-44.265L321.66 20.657C333.464 5.902 348.219 0 365.925 0h413.141c61.971 0 112.139 53.118 112.139 115.09v761.36c0 64.922-50.168 118.04-112.139 118.04zM365.926 59.02L109.186 324.611v554.79c0 32.46 23.608 56.069 53.118 56.069h616.761c29.51 0 53.118-26.56 53.118-56.07V115.09c0-32.462-23.608-56.07-53.118-56.07h-413.14z" fill="#fff" p-id="4801"></path><path d="M377.73 56.07l2.95 224.276c0 32.46-23.608 59.02-56.069 59.02l-218.375 2.951" fill="#fff" p-id="4802"></path><path d="M106.236 371.827v-59.02l218.375-2.951c14.755 0 26.559-14.755 26.559-29.51l-2.951-224.277h59.02l2.951 224.277c0 50.167-38.363 88.53-85.579 91.481H106.236z" fill="#fff" p-id="4803"></path><path d="M472.162 758.41a236.08 236.08 0 1 0 472.16 0 236.08 236.08 0 1 0-472.16 0z" fill="#fff" p-id="4804"></path><path d="M708.242 1024c-67.873 0-135.746-26.56-188.864-76.726-103.286-103.286-103.286-271.493 0-374.778 50.167-50.167 118.04-76.727 188.864-76.727s138.697 26.56 188.865 76.727c50.167 50.167 76.726 118.04 76.726 188.864s-26.56 138.698-76.726 188.865C843.988 997.44 776.115 1024 708.242 1024z m0-472.161c-56.07 0-106.236 20.657-144.6 61.97-79.677 79.678-79.677 212.473 0 292.15s212.473 79.678 292.15 0c38.364-38.362 61.972-91.48 61.972-144.599s-20.657-106.236-61.971-144.6c-41.315-44.264-91.482-64.921-147.55-64.921z" fill="#FFFFFF" p-id="4805"></path><path d="M802.674 826.282h-147.55v-147.55c0-17.706 11.804-29.51 29.51-29.51s29.51 11.804 29.51 29.51v88.53h88.53c17.706 0 29.51 11.804 29.51 29.51 0 14.755-11.804 29.51-29.51 29.51z" fill="#000" p-id="4806"></path></svg>
          </span>
          <span class="menu-text">任务管理</span>
        </router-link>

        <router-link to="/ghPush" class="menu-item" active-class="active" @click="closeMenu">
          <span class="menu-icon">
            <el-icon :size="20"><Promotion /></el-icon>
          </span>
          <span class="menu-text">推送管理</span>
        </router-link>

        <router-link to="/excelImport" class="menu-item" active-class="active" @click="closeMenu">
          <span class="menu-icon">
            <el-icon :size="20"><UploadFilled /></el-icon>
          </span>
          <span class="menu-text">Excel导入</span>
        </router-link>

        <router-link to="/log" class="menu-item" active-class="active" @click="closeMenu">
          <span class="menu-icon">
            <svg t="1768288027894" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="3533" width="200" height="200"><path d="M311.2 288H682v64H311.2zM311.2 480H682v64H311.2zM311.2 672H682v64H311.2z" fill="#fff" p-id="3534"></path><path d="M960 512c0-59.4-39.5-109.1-92.7-123.4V192c0-52.9-41.6-96-92.7-96H218.5c-51.1 0-92.7 43.1-92.7 96v160H64v64h61.8v192H64v64h61.8v160c0 52.9 41.6 96 92.7 96h556.1c51.1 0 92.7-43.1 92.7-96V635.4c53.2-14.3 92.7-64 92.7-123.4zM774.6 864H218.5c-17 0-30.9-14.4-30.9-32V672h61.8v-64h-61.8V416h61.8v-64h-61.8V192c0-17.6 13.8-32 30.9-32h556.1c17 0 30.9 14.4 30.9 32v196.6c-53.2 14.3-92.7 64-92.7 123.4s39.5 109.1 92.7 123.4V832c0 17.6-13.8 32-30.9 32z m61.8-288c-34.1 0-61.8-28.7-61.8-64s27.7-64 61.8-64c34.1 0 61.8 28.7 61.8 64s-27.7 64-61.8 64z" fill="#fff" p-id="3535"></path></svg>
          </span>
          <span class="menu-text">系统日志</span>
        </router-link>

        

        

        <router-link to="/about" class="menu-item" active-class="active" @click="closeMenu">
          <span class="menu-icon">
            <svg t="1768288118824" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="5570" width="200" height="200"><path d="M520.8 1013.6h-4.8c-61.6-0.8-121.6-12-178.4-34.4l12-29.6c52.8 20.8 109.6 32 167.2 32h4.8c251.2 0 461.6-203.2 469.6-454.4 4-131.2-44.8-254.4-137.6-347.2C760 87.2 636.8 38.4 505.6 42.4c-256 8-459.2 223.2-454.4 479.2 1.6 78.4 23.2 155.2 61.6 223.2l-28 16c-41.6-72-64-154.4-65.6-238.4C13.6 248.8 231.2 19.2 504 10.4c140-4.8 272 48 371.2 146.4C974.4 256 1026.4 388 1022.4 528c-8.8 268.8-233.6 485.6-501.6 485.6z" fill="#fff" p-id="5571"></path><path d="M543.2 375.2c-27.2 0-49.6-22.4-49.6-49.6 0-27.2 22.4-49.6 49.6-49.6 27.2 0 49.6 22.4 49.6 49.6 0 27.2-22.4 49.6-49.6 49.6zM512 747.2c-20 3.2-36.8-6.4-48-20-14.4-17.6-18.4-42.4-12.8-64L493.6 504c0-12-4-10.4-32.8-16-4-0.8-6.4-6.4-3.2-9.6 20-23.2 52-40 85.6-40 22.4 0 36 15.2 43.2 32.8 6.4 15.2 6.4 32.8 2.4 48l-38.4 144c-4.8 16.8 6.4 33.6 23.2 36.8 8.8 1.6 15.2 0.8 14.4 6.4-5.6 20-36.8 40.8-76 40.8z" fill="#fff" p-id="5572"></path><path d="M99.2 752.8m-16 0a16 16 0 1 0 32 0 16 16 0 1 0-32 0Z" fill="#fff" p-id="5573"></path><path d="M343.2 964.8m-16 0a16 16 0 1 0 32 0 16 16 0 1 0-32 0Z" fill="#fff" p-id="5574"></path><path d="M280 920m-16 0a16 16 0 1 0 32 0 16 16 0 1 0-32 0Z" fill="#fff" p-id="5575"></path></svg>
          </span>
          <span class="menu-text">关于我们</span>
        </router-link>

        <!-- 退出入口 -->
        <div class="menu-item logout-menu-item" @click="handleLogout" title="退出登录">
          <span class="menu-icon">
            <svg viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg" width="200" height="200">
              <path d="M170.666667 853.333333V170.666667h256V85.333333H128A42.666667 42.666667 0 0 0 85.333333 128v768a42.666667 42.666667 0 0 0 42.666667 42.666667h298.666667v-85.333334H170.666667z" fill="#fff"/>
              <path d="M810.666667 512L640 341.333333l60.330667-60.330666L917.333333 498.005333 700.330667 714.666667l-60.330667-60.330667L810.666667 483.669333H426.666667V398.336h384z" fill="#fff"/>
            </svg>
          </span>
          <span class="menu-text">退出登录</span>
        </div>
      </div>
    </div>

    <!-- 右侧内容区 -->
    <div class="content-area">
<!--      <keep-alive>-->
<!--        <RouterView />-->
<!--      </keep-alive>-->

      <router-view v-slot="{ Component, route }">
        <keep-alive>
          <component
              :key="route.name"
              :is="Component"
          ></component>
        </keep-alive>
      </router-view>
    </div>
  </div>
</template>

<script setup lang="ts">
import { RouterLink, RouterView, useRouter} from "vue-router";
import {DocumentChecked, Promotion, UploadFilled} from '@element-plus/icons-vue'
import {ElMessageBox} from "element-plus";
import { ref } from "vue";
const router = useRouter();

// 移动端抽屉菜单开关
const menuOpen = ref(false)
const closeMenu = () => {
  menuOpen.value = false
}

// 侧边栏 logo 从 env 读取，默认 public 目录下的 gh_logo.png
const logoUrl = import.meta.env.VITE_LOGO_URL || "/gh_logo.png";


// ✅ 新增：退出登录处理
const handleLogout = async () => {
  await ElMessageBox.confirm('确定要退出登录吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  })
  // 1. 清除本地认证数据（根据实际项目键名调整）
  localStorage.removeItem("token");
  sessionStorage.clear();

  // 2. 跳转至登录页（若路由路径不同请替换）
  router.push("/login");
};
</script>
<style>
* {
  padding: 0;
  margin: 0;
  box-sizing: border-box;
}
body { 
  padding: 0;
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}
</style>
<style scoped>


#app {
  display: flex;
  height: 100vh;
  overflow: hidden;
}
.logo.bg {
  padding: 5px;
  background-color: #fff;
  border-radius: 5px;
}
.title-bar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 30px;
  background-color: #1e293b;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 10px;
  z-index: 1000;
  -webkit-app-region: drag; /* 使标题栏可拖动 */
  -webkit-user-select: none; /* 防止文本选择 */
}

.app-title {
  color: white;
  font-size: 14px;
  font-weight: 500;
}

.window-controls {
  display: flex;
  -webkit-app-region: no-drag; /* 确保窗口控制按钮不可拖动 */
}

.control-btn {
  -webkit-app-region: no-drag; /* 控制按钮不可拖动 */
  width: 30px;
  height: 20px;
  border: none;
  background: transparent;
  color: white;
  font-size: 14px;
  cursor: pointer;
  margin-left: 5px;
}

.control-btn.minimize:hover {
  background-color: rgba(255, 255, 255, 0.2);
}

.control-btn.maximize:hover {
  background-color: rgba(255, 255, 255, 0.2);
}

.control-btn.close:hover {
  background-color: #ff5555;
}

.content-area {
  flex: 1;
  background: linear-gradient(160deg, #f4f6fa 0%, #eef1f8 100%);
  padding: 20px;
  overflow: auto;
  height: 100vh;
}

.sidebar {
  position: relative;
  width: 160px;
  background: linear-gradient(180deg, #1a2340 0%, #212d52 100%);
  color: white;
  /* padding: 20px 0; */
  /* border-right: 1px solid #334155; */
}

/* 退出按钮固定在侧边栏底部 */
.logout-menu-item {
  position: absolute;
  bottom: 20px;
  left: 0;
  right: 0;
}

.logo-container {
  /* padding: 0 20px 20px; */
  text-align: center;
}

.logo {
  /* font-size: 2rem; */
  margin: 5px 0;
}
.logo img {
  width: 60px;
  height: 20px;
}
.app-name {
  font-size: 1.2rem;
  font-weight: 500;
}

/* ========== H5 适配（<=768px）：右上角汉堡菜单 + 侧滑抽屉 ========== */
/* 移动端顶栏（仅 H5 显示） */
.mobile-header {
  display: none;
}

@media (max-width: 768px) {
  #app {
    flex-direction: column;
  }

  .mobile-header {
    order: 0;
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
    height: 48px;
    padding: 0 12px 0 calc(12px + env(safe-area-inset-left));
    padding-top: env(safe-area-inset-top);
    background: linear-gradient(90deg, #1a2340 0%, #212d52 100%);
    position: relative;
    z-index: 1200;
  }

  .mobile-logo img {
    width: 60px;
    height: 20px;
    display: block;
  }

  .hamburger {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    border-radius: 6px;
    cursor: pointer;
    margin-right: env(safe-area-inset-right);
  }

  .hamburger:active {
    background-color: rgba(255, 255, 255, 0.15);
  }

  /* 抽屉遮罩 */
  .sidebar-mask {
    position: fixed;
    inset: 0;
    background-color: rgba(0, 0, 0, 0.5);
    z-index: 1300;
  }

  /* 侧边栏：默认移出屏幕外，menu-open 时滑入 */
  .sidebar {
    order: 2;
    position: fixed;
    top: 0;
    bottom: 0;
    left: 0;
    width: 220px;
    padding: 16px 0 16px;
    transform: translateX(-100%);
    transition: transform 0.25s ease;
    z-index: 1400;
    box-shadow: 2px 0 12px rgba(0, 0, 0, 0.3);
    overflow-y: auto;
    -webkit-overflow-scrolling: touch;
  }

  #app.menu-open .sidebar {
    transform: translateX(0);
  }

  /* 抽屉内显示 logo 与菜单文字 */
  .logo-container {
    display: block;
    margin-bottom: 12px;
  }

  .menu {
    display: flex;
    flex-direction: column;
    padding: 0 12px;
    gap: 4px;
  }

  .menu-item {
    flex: none;
    display: flex;
    align-items: center;
    padding: 12px 10px;
    margin-bottom: 0;
    text-align: left;
  }

  .menu-icon {
    margin: 0 10px 0 0;
    flex: none;
  }

  /* 抽屉内退出按钮跟随菜单排列 */
  .logout-menu-item {
    position: static;
    margin-top: 12px;
  }

  .content-area {
    order: 1;
    flex: 1;
    min-height: 0;
    height: auto;
    padding: 12px;
  }
}

/* 桌面端隐藏移动端顶栏与遮罩 */
@media (min-width: 769px) {
  .mobile-header,
  .sidebar-mask {
    display: none;
  }
}

.menu {
  padding: 0 12px;
}

.menu-item {
  display: flex;
  align-items: center;
  padding: 11px 12px;
  border-radius: 9px;
  cursor: pointer;
  transition: background-color 0.2s, color 0.2s;
  margin-bottom: 6px;
  text-align: left;
  color: rgba(255, 255, 255, 0.72);
  border: 1px solid transparent;
}

.menu-item:hover {
  background-color: rgba(255, 255, 255, 0.08);
  color: #fff;
}

.menu-item.active {
  background-color: rgba(91, 125, 224, 0.22);
  border-color: rgba(122, 152, 238, 0.4);
  color: #a8c0f5;
  box-shadow: inset 3px 0 0 #7a98ee;
}

.menu-item.active .menu-icon,
.menu-item.active .menu-text {
  color: #a8c0f5;
}

.menu-icon {
  width: 20px;
  flex: none;
  margin-right: 10px;
  text-align: center;
  color: rgba(255, 255, 255, 0.72);
  transition: color 0.2s;
}

.menu-item:hover .menu-icon {
  color: #fff;
}

.menu-icon svg {
  width: 100%;
  height: 100%;
  fill: currentColor;
  vertical-align: middle;
}

.menu-text {
  font-size: 0.9rem;
  color: inherit;
  white-space: nowrap;
}

</style>
