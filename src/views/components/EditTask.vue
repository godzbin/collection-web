<template>
  <el-dialog
      v-model="dialogVisible"
      title="更新任务"
      :width="isMobile ? '94%' : '760px'"
      :close-on-click-modal="false"
      class="edit-task-dialog"
      @closed="handleClosed"
  >

    <el-form
        ref="formRef"
        :model="formData"
        :rules="formRules"
        :label-position="isMobile ? 'top' : 'right'"
        :label-width="isMobile ? 'auto' : '110px'"
    >
      <!-- 01 基础配置（锁定） -->
      <div class="section">
        <div class="section-head">
          <span class="section-num">01</span>
          <span class="section-name">基础配置</span>
          <span class="section-line"></span>
        </div>
        <div class="field-grid">
          <div class="field-view">
            <div class="fv-top"><span class="fv-label">执行器</span><LockIcon/></div>
            <div class="fv-value">{{ executorTitle }}</div>
          </div>
          <div class="field-view">
            <div class="fv-top"><span class="fv-label">任务描述</span><LockIcon/></div>
            <div class="fv-value">{{ orDash(formData.jobDesc) }}</div>
          </div>
          <div class="field-view">
            <div class="fv-top"><span class="fv-label">负责人</span><LockIcon/></div>
            <div class="fv-value">{{ orDash(formData.author) }}</div>
          </div>
          <div class="field-view">
            <div class="fv-top"><span class="fv-label">报警邮件</span><LockIcon/></div>
            <div class="fv-value">{{ orDash(formData.alarmEmail) }}</div>
          </div>
        </div>
      </div>

      <!-- 02 调度配置 -->
      <div class="section">
        <div class="section-head">
          <span class="section-num">02</span>
          <span class="section-name">调度配置</span>
          <span class="section-line"></span>
        </div>
        <div class="field-grid">
          <div class="field-view">
            <div class="fv-top"><span class="fv-label">调度类型</span><LockIcon/></div>
            <div class="fv-value">{{ scheduleTypeMap[formData.scheduleType ?? 'CRON'] }}</div>
          </div>
          <el-form-item label="Cron 表达式" prop="scheduleConf" class="fill">
            <el-input
                v-model="formData.scheduleConf"
                class="mono-input"
                placeholder="自动生成，无需手动输入"
                readonly
            >
              <template #append>
                <el-popover :visible="showCronEditor && dialogVisible" :width="isMobile ? '92%' : 600" trigger="click" popper-class="cron-editor-popper">
                  <XxlCronEditor v-model="formData.scheduleConf" @close="showCronEditor = !showCronEditor"/>
                  <template #reference>
                    <el-button :icon="Edit" @click="showCronEditor = !showCronEditor" title="可视化编辑" />
                  </template>
                </el-popover>
              </template>
            </el-input>
          </el-form-item>
        </div>
      </div>

      <!-- 03 任务配置 -->
      <div class="section">
        <div class="section-head">
          <span class="section-num">03</span>
          <span class="section-name">任务配置</span>
          <span class="section-line"></span>
        </div>
        <div class="field-grid">
          <div class="field-view">
            <div class="fv-top"><span class="fv-label">运行模式</span><LockIcon/></div>
            <div class="fv-value">{{ orDash(formData.glueType) }}</div>
          </div>
          <div class="field-view">
            <div class="fv-top"><span class="fv-label">JobHandler</span><LockIcon/></div>
            <div class="fv-value mono">{{ orDash(formData.executorHandler) }}</div>
          </div>
        </div>
        <el-form-item label="任务参数" prop="executorParam" class="param-item">
          <el-input
              v-model="formData.executorParam"
              class="mono-input"
              type="textarea"
              :rows="3"
              placeholder='例如：{"runday": 0}'
          />
        </el-form-item>
      </div>

      <!-- 04 高级配置（锁定） -->
      <div class="section">
        <div class="section-head">
          <span class="section-num">04</span>
          <span class="section-name">高级配置</span>
          <span class="section-line"></span>
        </div>
        <div class="field-grid">
          <div class="field-view">
            <div class="fv-top"><span class="fv-label">路由策略</span><LockIcon/></div>
            <div class="fv-value">{{ routeStrategyMap[formData.executorRouteStrategy ?? 'FIRST'] }}</div>
          </div>
          <div class="field-view">
            <div class="fv-top"><span class="fv-label">子任务 ID</span><LockIcon/></div>
            <div class="fv-value mono">{{ orDash(formData.childJobId) }}</div>
          </div>
          <div class="field-view">
            <div class="fv-top"><span class="fv-label">调度过期策略</span><LockIcon/></div>
            <div class="fv-value">{{ misfireMap[formData.misfireStrategy ?? 'DO_NOTHING'] }}</div>
          </div>
          <div class="field-view">
            <div class="fv-top"><span class="fv-label">阻塞处理策略</span><LockIcon/></div>
            <div class="fv-value">{{ blockMap[formData.executorBlockStrategy ?? 'SERIAL_EXECUTION'] }}</div>
          </div>
          <div class="field-view">
            <div class="fv-top"><span class="fv-label">任务超时时间</span><LockIcon/></div>
            <div class="fv-value">{{ formData.executorTimeout ?? 0 }} <span class="fv-unit">秒</span></div>
          </div>
          <div class="field-view">
            <div class="fv-top"><span class="fv-label">失败重试次数</span><LockIcon/></div>
            <div class="fv-value">{{ formData.executorFailRetryCount ?? 0 }} <span class="fv-unit">次</span></div>
          </div>
        </div>
      </div>
    </el-form>

    <template #footer>
      <div class="dialog-footer">
        <span class="footer-hint">
          <LockIcon/>
          锁定字段由平台统一管理，此处仅可调整调度表达式与任务参数
        </span>
        <div class="footer-actions">
          <el-button class="btn-ghost" @click="dialogVisible = false">取消</el-button>
          <el-button class="btn-primary" type="primary" @click="handleSave" :loading="loading">
            保存修改
          </el-button>
        </div>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch, onMounted, onUnmounted, defineComponent, h } from 'vue'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import { Edit } from '@element-plus/icons-vue'
import { updateTaskInfo, type TaskInfoRes, type TaskUpdateParams, getJobGroupList, type JobGroupRes } from '../../api/dataManagement'

import XxlCronEditor from '../../components/XxlCronEditor.vue'

// 锁定小图标（行内组件，避免重复内联 SVG）
const LockIcon = defineComponent({
  name: 'LockIcon',
  render() {
    return h('svg', {
      class: 'lock-icon',
      viewBox: '0 0 24 24',
      fill: 'none',
      stroke: 'currentColor',
      'stroke-width': 2,
      'stroke-linecap': 'round',
      'stroke-linejoin': 'round'
    }, [
      h('rect', { x: 3, y: 11, width: 18, height: 11, rx: 2 }),
      h('path', { d: 'M7 11V7a5 5 0 0 1 10 0v4' })
    ])
  }
})

// Props
interface Props {
  modelValue: boolean
  taskData?: TaskInfoRes
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: false,
  taskData: undefined
})

// Emits
const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'save': [data: TaskInfoRes]
}>()

// 移动端检测（<=768px 时单列布局）
const isMobile = ref(window.innerWidth <= 768)
const onResize = () => {
  isMobile.value = window.innerWidth <= 768
}
window.addEventListener('resize', onResize)
onUnmounted(() => {
  window.removeEventListener('resize', onResize)
})

// 状态
const dialogVisible = ref(false)
const loading = ref(false)
const formRef = ref<FormInstance>()
const showCronEditor = ref(false)
const jobGroupList = ref<JobGroupRes[]>([])

// 表单数据
const formData = reactive<TaskInfoRes>({
  id: undefined,
  jobGroup: undefined,
  jobDesc: '',
  author: '',
  alarmEmail: '',
  scheduleType: 'CRON',
  scheduleConf: '',
  glueType: 'BEAN',
  executorHandler: '',
  executorParam: '',
  executorRouteStrategy: 'FIRST',
  childJobId: '',
  misfireStrategy: 'DO_NOTHING',
  executorBlockStrategy: 'SERIAL_EXECUTION',
  executorTimeout: 0,
  executorFailRetryCount: 0
})

// 只读字段枚举映射
const scheduleTypeMap: Record<string, string> = {
  CRON: 'CRON 表达式',
  FIX_RATE: '固定速度',
  FIX_DELAY: '固定延迟'
}
const routeStrategyMap: Record<string, string> = {
  FIRST: '第一个',
  LAST: '最后一个',
  ROUND: '轮询',
  RANDOM: '随机',
  CONSISTENT_HASH: '一致性 HASH',
  LEAST_FREQUENTLY_USED: '最不活跃',
  LRU: '最近最久未使用',
  FAILOVER: '故障转移',
  BUSYOVER: '忙碌转移',
  SHARDING_BROADCAST: '分片广播'
}
const misfireMap: Record<string, string> = {
  DO_NOTHING: '忽略',
  FIRE_ONCE_NOW: '立即执行一次'
}
const blockMap: Record<string, string> = {
  SERIAL_EXECUTION: '单机串行',
  DISCARD_LATER: '丢弃后续调度',
  COVER_EARLY: '覆盖之前调度'
}

const executorTitle = computed(() =>
    jobGroupList.value.find(g => g.id === formData.jobGroup)?.title ?? '—'
)

const orDash = (v: unknown) => (v === undefined || v === null || v === '') ? '—' : String(v)

// 表单验证规则（仅校验可编辑字段）
const formRules: FormRules = {
  scheduleConf: [
    { required: true, message: '请输入 Cron 表达式', trigger: 'blur' }
  ],
  executorParam: [
    { required: true, message: '请输入任务参数', trigger: 'blur' }
  ]
}

// 监听 dialog 显示状态
watch(() => props.modelValue, (val) => {
  dialogVisible.value = val
  if (val && props.taskData) {
    Object.assign(formData, props.taskData)
  }
})

// 监听 dialogVisible 变化
watch(dialogVisible, (val) => {
  emit('update:modelValue', val)
})

// 获取执行器列表
const loadJobGroups = async () => {
  try {
    const res = await getJobGroupList({appname: "", title: "", start: 0, length: 100 })
    jobGroupList.value = res.data || []
  } catch (error: any) {
    console.error('获取执行器列表失败:', error)
  }
}

// 保存
const handleSave = async () => {
  if (!formRef.value) return

  await formRef.value.validate(async (valid) => {
    if (!valid) return

    loading.value = true
    try {
      const updateParams: TaskUpdateParams = {
        id: formData.id!,
        jobGroup: formData.jobGroup!,
        jobDesc: formData.jobDesc,
        author: formData.author,
        alarmEmail: formData.alarmEmail,
        scheduleType: formData.scheduleType,
        scheduleConf: formData.scheduleConf,
        cronGen_display: formData.scheduleConf,
        schedule_conf_CRON: formData.scheduleType === 'CRON' ? formData.scheduleConf : '',
        schedule_conf_FIX_RATE: formData.scheduleType === 'FIX_RATE' ? formData.scheduleConf : '',
        schedule_conf_FIX_DELAY: formData.scheduleType === 'FIX_DELAY' ? formData.scheduleConf : '',
        executorHandler: formData.executorHandler,
        executorParam: formData.executorParam,
        executorRouteStrategy: formData.executorRouteStrategy,
        childJobId: formData.childJobId,
        misfireStrategy: formData.misfireStrategy,
        executorBlockStrategy: formData.executorBlockStrategy,
        executorTimeout: formData.executorTimeout,
        executorFailRetryCount: formData.executorFailRetryCount
      }

      await updateTaskInfo(updateParams)
      ElMessage.success('更新成功')
      emit('save', { ...formData })
      dialogVisible.value = false
    } catch (error: any) {
      console.error('更新任务失败:', error)
      ElMessage.error(error.message || '更新失败')
    } finally {
      loading.value = false
    }
  })
}

// 关闭后重置
const handleClosed = () => {
  formRef.value?.resetFields()
}

// 组件挂载时加载执行器列表
onMounted(() => {
  loadJobGroups()
})
</script>

<style scoped>
/* ========== 主题变量：靛蓝商务风（与系统主色一致） ========== */
.edit-task-dialog {
  --et-accent: #3b62d6;
  --et-accent-strong: #2f4fb0;
  --et-accent-soft: rgba(59, 98, 214, 0.08);
  --et-ink: #1a2340;
  --et-ink-2: #33415e;
  --et-ink-3: #64748b;
  --et-ink-4: #94a3b8;
  --et-line: #e5e9f0;
  --et-canvas: #eef1f8;
  --et-card: #ffffff;
  --et-lock-bg: #f6f7fb;
  --et-mono: 'JetBrains Mono', 'SF Mono', Menlo, Consolas, monospace;
}

/* 弹窗容器：圆角 + 大投影 + 限高滚动 */
.edit-task-dialog :deep(.el-dialog) {
  border-radius: 14px;
  overflow: hidden;
  box-shadow: 0 24px 64px rgba(15, 23, 42, 0.32), 0 4px 16px rgba(15, 23, 42, 0.14);
  max-height: 86vh;
  display: flex;
  flex-direction: column;
  margin-top: 7vh !important;
}

/* 默认头部：加粗标题 + 底部实线 */
.edit-task-dialog :deep(.el-dialog__header) {
  margin: 0;
  padding: 18px 24px 14px;
  border-bottom: 1px solid var(--et-line);
  background: #fff;
}
.edit-task-dialog :deep(.el-dialog__title) {
  font-size: 17px;
  font-weight: 700;
  color: var(--et-ink);
  letter-spacing: 1px;
}

.edit-task-dialog :deep(.el-dialog__body) {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding: 20px 24px 24px;
  background: var(--et-canvas);
  -webkit-overflow-scrolling: touch;
}
.edit-task-dialog :deep(.el-dialog__footer) {
  padding: 0;
  border-top: 1px solid var(--et-line);
  background: #fff;
}

/* ========== 分区：白底卡片 ========== */
.section {
  background: var(--et-card);
  border: 1px solid var(--et-line);
  border-radius: 11px;
  padding: 16px 18px 18px;
  margin-top: 16px;
  box-shadow: 0 1px 3px rgba(15, 23, 42, 0.05);
}
.section:first-of-type {
  margin-top: 0;
}

.section-head {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 14px;
}
.section-num {
  font-family: var(--et-mono);
  font-size: 11px;
  font-weight: 700;
  color: var(--et-accent);
  background: var(--et-accent-soft);
  border: 1px solid rgba(59, 98, 214, 0.28);
  border-radius: 6px;
  padding: 2px 7px;
  line-height: 1.4;
}
.section-name {
  font-size: 14px;
  font-weight: 700;
  color: var(--et-ink);
  letter-spacing: 1.5px;
}
.section-line {
  flex: 1;
  height: 1px;
  background: linear-gradient(90deg, var(--et-line), transparent);
}

/* ========== 锁定字段：灰底内嵌（明显弱于可编辑字段） ========== */
.field-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
}

.field-view {
  background: var(--et-lock-bg);
  border: 1px solid #e6e9f2;
  border-radius: 9px;
  padding: 9px 12px 10px;
  display: flex;
  flex-direction: column;
  gap: 3px;
  min-width: 0;
}

.fv-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.fv-label {
  font-size: 11.5px;
  color: var(--et-ink-4);
  letter-spacing: 0.5px;
  font-weight: 500;
}
.lock-icon {
  width: 11px;
  height: 11px;
  color: #c4ccd6;
  flex: none;
}

.fv-value {
  font-size: 13.5px;
  font-weight: 500;
  color: var(--et-ink-2);
  word-break: break-all;
  line-height: 1.45;
}
.fv-value.mono {
  font-family: var(--et-mono);
  font-size: 12.5px;
}
.fv-unit {
  font-size: 11px;
  color: var(--et-ink-4);
  font-weight: 400;
  margin-left: 2px;
}

/* ========== 可编辑字段：突出显示 ========== */
.field-grid :deep(.el-form-item) {
  margin-bottom: 0;
  align-items: stretch;
}
.field-grid :deep(.el-form-item .el-input) {
  height: 100%;
}
.field-grid :deep(.el-form-item__label),
.param-item :deep(.el-form-item__label) {
  font-size: 11.5px;
  color: var(--et-ink-3);
  letter-spacing: 0.5px;
  font-weight: 600;
  line-height: 1.2;
  padding-top: 12px;
}

/* 输入框：白底 + 明确边框 + 聚焦青碧 */
.edit-task-dialog :deep(.el-input__wrapper),
.edit-task-dialog :deep(.el-textarea__inner) {
  border-radius: 9px;
  box-shadow: 0 0 0 1px #cbd5e1 inset;
  background: #fff;
  transition: box-shadow 0.2s;
}
.edit-task-dialog :deep(.el-input__wrapper.is-focus),
.edit-task-dialog :deep(.el-textarea__inner:focus) {
  box-shadow: 0 0 0 1px var(--et-accent) inset, 0 0 0 3px rgba(59, 98, 214, 0.12);
}
.mono-input :deep(.el-input__inner),
.mono-input :deep(.el-textarea__inner) {
  font-family: var(--et-mono);
  font-size: 12.5px;
  color: var(--et-ink);
  font-weight: 500;
}

/* Cron 附加按钮 */
.mono-input :deep(.el-input-group__append) {
  background: var(--et-accent);
  border: none;
  border-radius: 0 9px 9px 0;
  box-shadow: none;
  padding: 0 12px;
}
.mono-input :deep(.el-input-group__append .el-button) {
  color: #fff;
}
.mono-input :deep(.el-input-group__append .el-button:hover) {
  color: rgba(255, 255, 255, 0.8);
}

.param-item {
  margin-top: 12px;
}
.param-item :deep(.el-form-item__label) {
  padding-top: 0;
  line-height: 2.2;
}

/* ========== 底部操作栏 ========== */
.dialog-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 13px 24px;
}

.footer-hint {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: var(--et-ink-3);
}
.footer-hint .lock-icon {
  width: 12px;
  height: 12px;
}

.footer-actions {
  display: flex;
  gap: 10px;
  flex: none;
}

.edit-task-dialog :deep(.footer-actions .el-button) {
  border-radius: 9px;
  padding: 9px 20px;
  font-weight: 600;
}

/* 主按钮：靛蓝实心 */
.edit-task-dialog :deep(.footer-actions .el-button--primary) {
  background: var(--et-accent);
  border-color: var(--et-accent);
  box-shadow: 0 4px 12px rgba(59, 98, 214, 0.32);
  transition: background 0.2s, box-shadow 0.2s;
}
.edit-task-dialog :deep(.footer-actions .el-button--primary:hover) {
  background: var(--et-accent-strong);
  border-color: var(--et-accent-strong);
  box-shadow: 0 6px 16px rgba(59, 98, 214, 0.42);
}

/* 幽灵取消按钮 */
.edit-task-dialog :deep(.footer-actions .btn-ghost) {
  border-color: #cbd5e1;
  color: var(--et-ink-2);
}
.edit-task-dialog :deep(.footer-actions .btn-ghost:hover) {
  border-color: var(--et-ink-3);
  color: var(--et-ink);
  background: #fff;
}

/* ========== 移动端（<=768px） ========== */
@media (max-width: 768px) {
  .edit-task-dialog :deep(.el-dialog__body) {
    padding: 14px 14px 16px;
  }
  .edit-task-dialog :deep(.el-dialog__header) {
    padding: 15px 16px 12px;
  }

  .section {
    padding: 13px 13px 14px;
    border-radius: 10px;
  }

  .field-grid {
    grid-template-columns: 1fr;
  }

  .field-grid :deep(.el-form-item__label) {
    padding-top: 0;
    margin-bottom: 4px;
  }

  .dialog-footer {
    flex-direction: column;
    align-items: stretch;
    gap: 10px;
    padding: 12px 16px;
  }
  .footer-hint {
    justify-content: center;
    text-align: center;
  }
  .footer-actions {
    justify-content: stretch;
  }
  .footer-actions :deep(.el-button) {
    flex: 1;
    margin-left: 0 !important;
  }
}
</style>

<style>
/* Cron 编辑器弹层适配小屏（teleport 到 body，需全局样式） */
@media (max-width: 768px) {
  .cron-editor-popper {
    max-width: 94vw !important;
    overflow-x: auto;
  }
}
</style>
