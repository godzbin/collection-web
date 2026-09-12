declare module 'element-plus/dist/locale/zh-cn.mjs' {
    import { Language } from 'element-plus';
    const zhCn: Language;
    export default zhCn;
}

declare module '*.vue' {
    import type { DefineComponent } from 'vue';
    const component: DefineComponent<{}, {}, any>;
    export default component;
}

// src/types/shims-vue.d.ts (或者你的全局声明文件)
declare module 'vue3-cron' {
    import { DefineComponent } from 'vue'
    const component: DefineComponent<{}, {}, any>
    export default component
}