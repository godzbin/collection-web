<template>
  <div class="xxl-cron-editor">
    <el-tabs v-model="activeTab" type="border-card" class="cron-tabs">
      <el-tab-pane v-for="tab in tabsConfig" :key="tab.key" :label="tab.label" :name="tab.key">
        <div class="field-config">
          <el-radio-group v-model="cronData[tab.key].type" size="small">
            <el-radio label="every">每{{ tab.label }}</el-radio>
            <el-radio v-if="tab.allowNone" label="none">不指定 (?)</el-radio>
            <el-radio label="cycle">周期</el-radio>
            <el-radio label="interval">循环</el-radio>
            <el-radio label="specific">指定</el-radio>
          </el-radio-group>

          <div class="config-content">
            <!-- 周期 -->
            <div v-if="cronData[tab.key].type === 'cycle'" class="row">
              <span>从</span>
              <el-input-number v-model="cronData[tab.key].range[0]" :min="tab.min" :max="tab.max" size="small" controls-position="right" />
              <span>到</span>
              <el-input-number v-model="cronData[tab.key].range[1]" :min="tab.min" :max="tab.max" size="small" controls-position="right" />
              <span>{{ tab.label }}</span>
            </div>

            <!-- 循环 -->
            <div v-if="cronData[tab.key].type === 'interval'" class="row">
              <span>从</span>
              <el-input-number v-model="cronData[tab.key].start" :min="tab.min" :max="tab.max" size="small" controls-position="right" />
              <span>{{ tab.label }}开始，每</span>
              <el-input-number v-model="cronData[tab.key].step" :min="1" size="small" controls-position="right" />
              <span>{{ tab.label }}执行一次</span>
            </div>

            <!-- 指定 -->
            <div v-if="cronData[tab.key].type === 'specific'" class="specific-grid">
              <el-checkbox-group v-model="cronData[tab.key].values">
                <el-checkbox v-for="n in getOptions(tab.min, tab.max)" :key="n" :label="n">
                  {{ tab.labels ? tab.labels[n - tab.min] : String(n).padStart(2, '0') }}
                </el-checkbox>
              </el-checkbox-group>
            </div>
          </div>
        </div>
      </el-tab-pane>
    </el-tabs>

    <div class="cron-footer">
      <el-tag type="info" effect="plain">预览: {{ generatedCron }}</el-tag>
      <el-button type="primary" size="small" @click="handleConfirm">确定</el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch } from 'vue'

const props = defineProps<{ modelValue?: string }>()
const emit = defineEmits<{ 'update:modelValue': [value: string], close: [] }>()
// 1. 定义严格的字段键名类型
type CronField = 'second' | 'minute' | 'hour' | 'day' | 'month' | 'week'
const activeTab = ref('second')
const weekLabels = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']

interface FieldConfigData {
  type: 'every' | 'cycle' | 'interval' | 'specific' | 'none'
  range: [number, number]
  start: number
  step: number
  values: number[]
}

const initField = (): FieldConfigData => ({
  type: 'every',
  range: [0, 1],
  start: 0,
  step: 1,
  values: []
})

const cronData = reactive<Record<CronField, FieldConfigData>>({
  second: initField(),
  minute: initField(),
  hour: initField(),
  day: { ...initField(), type: 'every' },
  month: initField(),
  week: { ...initField(), type: 'none' }
})

interface TabConfig {
  key: CronField
  label: string
  min: number
  max: number
  allowNone?: boolean
  labels?: string[]
}

const tabsConfig: TabConfig[] = [
  { key: 'second', label: '秒', min: 0, max: 59 },
  { key: 'minute', label: '分', min: 0, max: 59 },
  { key: 'hour', label: '时', min: 0, max: 23 },
  { key: 'day', label: '日', min: 1, max: 31, allowNone: true },
  { key: 'month', label: '月', min: 1, max: 12 },
  { key: 'week', label: '周', min: 1, max: 7, allowNone: true, labels: weekLabels }
]

const getOptions = (min: number, max: number) => Array.from({ length: max - min + 1 }, (_, i) => i + min)

const generatedCron = computed(() => {
  const formatField = (field: FieldConfigData): string => {
    switch (field.type) {
      case 'every': return '*'
      case 'none': return '?'
      case 'cycle': return `${field.range[0]}-${field.range[1]}`
      case 'interval': return `${field.start}/${field.step}`
      case 'specific':
        if (!field.values.length) return '*'
        return field.values.sort((a, b) => a - b).join(',')
      default: return '*'
    }
  }
  return [
    formatField(cronData.second),
    formatField(cronData.minute),
    formatField(cronData.hour),
    formatField(cronData.day),
    formatField(cronData.month),
    formatField(cronData.week)
  ].join(' ')
})

const handleConfirm = () => {
  emit('update:modelValue', generatedCron.value)
  emit('close')
}

const handleDayChange = () => {
  if (cronData.day.type !== 'none') cronData.week.type = 'none'
}

const handleWeekChange = () => {
  if (cronData.week.type !== 'none') cronData.day.type = 'none'
}

// 绑定 change 事件处理互斥
watch(() => cronData.day.type, handleDayChange)
watch(() => cronData.week.type, handleWeekChange)

const parseCron = (cron: string) => {
  if (!cron || cron.trim() === '') return
  const parts = cron.trim().split(/\s+/)
  if (parts.length !== 6) return

  const [s, m, h, D, M, W] = parts

  const parseField = (val: string, min: number): Partial<FieldConfigData> => {
    if (val === '*') return { type: 'every' }
    if (val === '?') return { type: 'none' }
    if (val.includes('/')) {
      const [start, step] = val.split('/').map(Number)
      return { type: 'interval', start: start ?? min, step: step ?? 1 }
    }
    if (val.includes('-')) {
      const [start, end] = val.split('-').map(Number)
      return { type: 'cycle', range: [start, end] }
    }
    if (val.includes(',')) {
      return { type: 'specific', values: val.split(',').map(Number) }
    }
    const num = parseInt(val)
    if (!isNaN(num)) return { type: 'specific', values: [num] }
    return { type: 'every' }
  }

  Object.assign(cronData.second, parseField(s, 0))
  Object.assign(cronData.minute, parseField(m, 0))
  Object.assign(cronData.hour, parseField(h, 0))
  Object.assign(cronData.day, parseField(D, 1))
  Object.assign(cronData.month, parseField(M, 1))
  Object.assign(cronData.week, parseField(W, 1))
}

watch(() => props.modelValue, (val) => {
  if (val) parseCron(val)
}, { immediate: true })
</script>

<style scoped>
.xxl-cron-editor { padding: 10px; }
.field-config { display: flex; flex-direction: column; gap: 12px; }
.config-content { padding-left: 20px; }
.row { display: flex; align-items: center; gap: 8px; margin-bottom: 8px; }
.specific-grid { max-height: 200px; overflow-y: auto; border: 1px solid #eee; padding: 8px; border-radius: 4px; display: grid; grid-template-columns: repeat(10, 1fr); gap: 4px; }
.cron-footer { display: flex; justify-content: space-between; align-items: center; margin-top: 12px; }
:deep(.el-checkbox) { margin-right: 0; height: 24px; }
:deep(.el-radio-group) { display: flex; flex-wrap: wrap; gap: 12px; }
</style>
