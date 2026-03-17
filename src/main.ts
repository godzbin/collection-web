
import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import './style.css'

// 1. 引入 Element Plus 样式
import 'element-plus/dist/index.css';

// 2. 引入 Element Plus 组件库
import ElementPlus from 'element-plus';

// 3. 引入中文语言包 (关键步骤)
import zhCn from 'element-plus/dist/locale/zh-cn.mjs';

// 4. 引入所有图标并注册为全局组件
import * as ElementPlusIconsVue from '@element-plus/icons-vue';

const app = createApp(App);

app.use(router);

// 5. 全局注册 Element Plus 并配置语言
// 使用 locale 属性指定语言包
app.use(ElementPlus, {
    locale: zhCn,
});

// 6. 全局注册所有图标
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
    app.component(key, component);
}

app.mount("#app");