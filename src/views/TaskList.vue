<script setup lang="ts">
import { ref, reactive, onMounted, computed, onUnmounted, nextTick, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import EditTask from './components/EditTask.vue'
import { xxlLogin } from '../api/xxlJob.ts'
import {getXxlToken} from '../utils/xxlRequest.ts'
import {
  getJobGroupList,
  getTaskInfoList,
  JobGroupRes, TaskInfoParams,
  type TaskInfoRes,
  type TaskPageRes,
  triggerJob,
  startJob,
  stopJob
} from "../api/dataManagement.ts";
import dayjs from "dayjs";

const loading = ref(false)
const list = ref<TaskInfoRes[]>([])
const total = ref(0)
const xxlLoggedIn = ref(false)

let isUnmounted = false

const queryForm = reactive<TaskInfoParams>({
  jobGroup: '',
  jobDesc: '',
  start: 1,
  length: 10,
  executorHandler: '',
  author: '',
  triggerStatus: '',
})

const pagination = reactive({
  start: 0,
  length: 10,
  draw: 1,
})

const handleXxlLogin = async () => {
  if (isUnmounted) return

  try {
    loading.value = true
    await xxlLogin()
    await nextTick()
    if (!isUnmounted) {
      xxlLoggedIn.value = true
      init()
    }
  } catch (error: any) {
    if (!isUnmounted) {
      console.error('XXL-Job 登录失败:', error)
    }
  } finally {
    if (!isUnmounted) {
      loading.value = false
    }
  }
}

const checkXxlLoginStatus = () => {
  const cookie = getXxlToken()
  xxlLoggedIn.value = !!cookie
  return xxlLoggedIn.value
}

const getData = async () => {
  if (isUnmounted) return

  try {
    loading.value = true
    const res: TaskPageRes = await getTaskInfoList({
      start: pagination.start,
      length: pagination.length,
      jobGroup: queryForm.jobGroup,
      jobDesc: queryForm.jobDesc,
      executorHandler: queryForm.executorHandler,
      author: queryForm.author,
      triggerStatus: queryForm.triggerStatus || -1,
    })
    await nextTick()
    if (!isUnmounted) {
      list.value = res.data || []
      total.value = res.recordsFiltered || 0
    }
  } catch (error: any) {
    if (!isUnmounted) {
      console.error('获取任务列表失败:', error)
      if (error.response?.status === 401 || error.message?.includes('login')) {
        checkXxlLoginStatus()
        if (!xxlLoggedIn.value && !isUnmounted) {
          await handleXxlLogin()
        }
      }
    }
  } finally {
    if (!isUnmounted) {
      loading.value = false
    }
  }
}

const handleSearch = () => {
  pagination.start = 0
  pagination.draw = 1
  getData()
}

const handleSizeChange = (val: number) => {
  pagination.length = val
  pagination.start = 0
  pagination.draw = 1
  getData()
}

const handleCurrentChange = (val: number) => {
  pagination.start = (val - 1) * pagination.length
  pagination.draw = val
  getData()
}

const currentPage = computed(() => {
  return Math.floor(pagination.start / pagination.length) + 1
})

const parseCronExpression = (cron: string): string => {
  if (!cron || cron.trim() === '') return ''

  const parts = cron.trim().split(/\s+/)
  if (parts.length !== 6) return cron

  const [second, minute, hour, day, month, week] = parts

  const hasDay = day !== '?' && day !== '*'
  const hasWeek = week !== '?' && week !== '*'

  let descriptions: string[] = []

  if (month === '*') {
  } else if (/^\d+$/.test(month)) {
    descriptions.push(`${month}月`)
  } else if (/^\d+\/\d+$/.test(month)) {
    const [start, step] = month.split('/')
    descriptions.push(`从${start}月开始每${step}个月`)
  } else if (/^\d+-\d+$/.test(month)) {
    const [start, end] = month.split('-')
    descriptions.push(`${start}至${end}月`)
  } else if (month.includes(',')) {
    descriptions.push(`${month.replace(/,/g, ',')}月`)
  }

  if (hasDay && hasWeek) {
    if (day === 'L') {
      descriptions.push('每月最后一天')
    } else if (/^\d+$/.test(day)) {
      descriptions.push(`${day}号`)
    } else if (/^\d+\/\d+$/.test(day)) {
      const [start, step] = day.split('/')
      descriptions.push(`从${start}号开始每${step}天`)
    } else if (/^\d+-\d+$/.test(day)) {
      const [start, end] = day.split('-')
      descriptions.push(`${start}至${end}号`)
    } else if (day.includes(',')) {
      descriptions.push(`${day.replace(/,/g, ',')}号`)
    } else if (day.includes('W')) {
      const d = day.replace('W', '')
      descriptions.push(`${d}号最近的工作日`)
    } else if (day.includes('L')) {
      const d = day.replace('L', '')
      descriptions.push(`本月最后一个${d}号`)
    }
  } else if (hasDay) {
    if (day === 'L') {
      descriptions.push('每月最后一天')
    } else if (/^\d+$/.test(day)) {
      descriptions.push(`${day}号`)
    } else if (/^\d+\/\d+$/.test(day)) {
      const [start, step] = day.split('/')
      descriptions.push(`从${start}号开始每${step}天`)
    } else if (/^\d+-\d+$/.test(day)) {
      const [start, end] = day.split('-')
      descriptions.push(`${start}至${end}号`)
    } else if (day.includes(',')) {
      descriptions.push(`${day.replace(/,/g, ',')}号`)
    } else if (day.includes('W')) {
      const d = day.replace('W', '')
      descriptions.push(`${d}号最近的工作日`)
    } else if (day.includes('L')) {
      const d = day.replace('L', '')
      descriptions.push(`本月最后一个${d}号`)
    }
  } else if (hasWeek) {
    if (/^\d+$/.test(week)) {
      const weekMap: Record<string, string> = {
        '1': '周日', '2': '周一', '3': '周二', '4': '周三',
        '5': '周四', '6': '周五', '7': '周六'
      }
      descriptions.push(weekMap[week] || week)
    } else if (/^\d+\/\d+$/.test(week)) {
      const [start, step] = week.split('/')
      const weekMap: Record<string, string> = {
        '1': '周日', '2': '周一', '3': '周二', '4': '周三',
        '5': '周四', '6': '周五', '7': '周六'
      }
      descriptions.push(`从${weekMap[start] || start}开始每${step}天`)
    } else if (/^\d+-\d+$/.test(week)) {
      const [start, end] = week.split('-')
      const weekMap: Record<string, string> = {
        '1': '周日', '2': '周一', '3': '周二', '4': '周三',
        '5': '周四', '6': '周五', '7': '周六'
      }
      descriptions.push(`${weekMap[start] || start}至${weekMap[end] || end}`)
    } else if (week.includes(',')) {
      const weekMap: Record<string, string> = {
        '1': '周日', '2': '周一', '3': '周二', '4': '周三',
        '5': '周四', '6': '周五', '7': '周六'
      }
      const days = week.split(',').map(d => weekMap[d] || d).join(',')
      descriptions.push(days)
    } else if (week.includes('#')) {
      const [dayNum, weekNum] = week.split('#')
      const weekMap: Record<string, string> = {
        '1': '周日', '2': '周一', '3': '周二', '4': '周三',
        '5': '周四', '6': '周五', '7': '周六'
      }
      const ordinals: Record<string, string> = {
        '1': '第一个', '2': '第二个', '3': '第三个', '4': '第四个', '5': '第五个'
      }
      descriptions.push(`第${ordinals[weekNum] || weekNum}${weekMap[dayNum] || dayNum}`)
    } else if (week.includes('L')) {
      const dayNum = week.replace('L', '')
      const weekMap: Record<string, string> = {
        '1': '周日', '2': '周一', '3': '周二', '4': '周三',
        '5': '周四', '6': '周五', '7': '周六'
      }
      descriptions.push(`最后一个${weekMap[dayNum] || dayNum}`)
    }
  }

  if (hour === '*') {
  } else if (/^\d+$/.test(hour)) {
    descriptions.push(`${hour}点`)
  } else if (/^\*\/\d+$/.test(hour)) {
    const step = hour.split('/')[1]
    descriptions.push(`每${step}小时`)
  } else if (/^\d+\/\d+$/.test(hour)) {
    const [start, step] = hour.split('/')
    descriptions.push(`从${start}点开始每${step}小时`)
  } else if (/^\d+-\d+$/.test(hour)) {
    const [start, end] = hour.split('-')
    descriptions.push(`${start}至${end}点`)
  } else if (hour.includes(',')) {
    descriptions.push(`${hour.replace(/,/g, ',')}点`)
  }

  if (minute === '*') {
  } else if (/^\d+$/.test(minute)) {
    descriptions.push(`${minute}分`)
  } else if (/^0\/\d+$/.test(minute) || /^\*\/\d+$/.test(minute)) {
    const step = minute.split('/')[1]
    descriptions.push(`每${step}分钟`)
  } else if (/^\d+\/\d+$/.test(minute)) {
    const [start, step] = minute.split('/')
    descriptions.push(`从${start}分开始每${step}分钟`)
  } else if (/^\d+-\d+$/.test(minute)) {
    const [start, end] = minute.split('-')
    descriptions.push(`${start}至${end}分`)
  } else if (minute.includes(',')) {
    descriptions.push(`${minute.replace(/,/g, ',')}分`)
  }

  if (second === '*') {
  } else if (/^\d+$/.test(second)) {
    descriptions.push(`${second}秒`)
  } else if (/^\d+\/\d+$/.test(second)) {
    const [start, step] = second.split('/')
    descriptions.push(`从${start}秒开始每${step}秒`)
  } else if (/^\d+-\d+$/.test(second)) {
    const [start, end] = second.split('-')
    descriptions.push(`${start}至${end}秒`)
  } else if (second.includes(',')) {
    descriptions.push(`${second.replace(/,/g, ',')}秒`)
  }

  return descriptions.join(' ')
}

const getScheduleDescription = (row: any): string => {
  const typeMap: Record<string, string> = {
    'CRON': 'Cron定时',
    'FIX_RATE': '固定频率',
    'FIX_DELAY': '固定延迟'
  }

  const typeName = typeMap[row.scheduleType] || row.scheduleType

  if (row.scheduleType === 'CRON') {
    const cronDesc = parseCronExpression(row.scheduleConf)
    return `${typeName}: ${cronDesc}`
  } else if (row.scheduleType === 'FIX_RATE') {
    return `${typeName}: 每${row.scheduleConf}秒`
  } else if (row.scheduleType === 'FIX_DELAY') {
    return `${typeName}: 延迟${row.scheduleConf}秒`
  }

  return `${typeName}: ${row.scheduleConf}`
}

const getRunModeDescription = (row: any): string => {
  const glueTypeMap: Record<string, string> = {
    'BEAN': 'Java组件',
    'SCRIPT': '脚本任务',
    'GLUE_JAVA': 'Java代码',
    'GLUE_SHELL': 'Shell脚本',
    'GLUE_PYTHON': 'Python脚本',
    'GLUE_PHP': 'PHP脚本',
    'GLUE_NODEJS': 'Node.js脚本',
    'GLUE_POWERSHELL': 'PowerShell脚本'
  }

  const glueTypeName = glueTypeMap[row.glueType] || row.glueType || '未知'
  const handlerName = row.executorHandler || '未设置'

  return `${glueTypeName}：触发目标 ${handlerName}`
}

const jobGroupList = ref<JobGroupRes[]>([])

const init = async ()=> {
  const data = await getJobGroupList({
    start: 0,
    length: 100,
    appname: '',
    title: ''
  })
  jobGroupList.value = data.data ?? []
  queryForm.jobGroup = jobGroupList.value[0]?.id ?? ''
  getData()
}

const currentTask = ref<TaskInfoRes>()
const showEditDialog = ref(false)

const handleEdit = (row: TaskInfoRes) => {
  console.log('编辑任务:', row)
  showEditDialog.value = true
  currentTask.value = row
}

const handleSave = async (data: TaskInfoRes) => {
  console.log('保存的数据:', data)
  getData()
}

const handleToggleJob = async (row: TaskInfoRes) => {
  const isRunning = row.triggerStatus === 1
  const action = isRunning ? '停止' : '启动'

  try {
    await ElMessageBox.confirm(
        `确定要${action}任务 "${row.jobDesc}" 吗？`,
        `${action}任务`,
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: isRunning ? 'warning' : 'success',
        }
    )

    if (isRunning) {
      await stopJob(row.id!)
      ElMessage.success('任务已停止')
    } else {
      await startJob(row.id!)
      ElMessage.success('任务已启动')
    }

    getData()
  } catch (error: any) {
    if (error !== 'cancel') {
      console.error(`${action}任务失败:`, error)
      ElMessage.error(error.message || `${action}任务失败`)
    }
  }
}

const showBatchTriggerDialog = ref(false)
const batchTriggerTask = ref<TaskInfoRes | null>(null)
const dateRange = ref<[string, string] | null>(null)
const batchTriggerLoading = ref(false)
const triggerPreviewList = ref<Array<{date: string, param: string, isRun: boolean}>>([])

const handleTrigger = async (row: TaskInfoRes) => {
  batchTriggerTask.value = row
  dateRange.value = null
  triggerPreviewList.value = []
  showBatchTriggerDialog.value = true
}

const calculateTriggerPreview = () => {

  if (!batchTriggerTask.value || !dateRange.value || !Array.isArray(dateRange.value) || dateRange.value.length !== 2) {
    triggerPreviewList.value = []
    return
  }

  const [startDateStr, endDateStr] = dateRange.value
  const startDate = dayjs(startDateStr)
  const endDate = dayjs(endDateStr)

  let executorParam = batchTriggerTask.value.executorParam || ''
  // let rollDay = 0
  let paramObj = {}
  //
  if (executorParam) {
    try {
      paramObj = JSON.parse(executorParam)
    } catch (e) {
      console.warn('解析 executorParam 失败，使用默认 rollDay=1')
    }
  }


  const today = dayjs()

  const previewList: Array<{date: string, param: string, isRun: boolean}> = []

  const count = dayjs(endDate).diff(startDate, 'day')


  for (let i = 0; i <= count; i++) {
    const date = startDate.add(i, 'day')
    const rollDay = date.diff(today, 'day')
    previewList.push({
      date: date.format('YYYY-MM-DD'),
      isRun: false,
      param: JSON.stringify(Object.assign(paramObj, {
        rollDay: rollDay
      }))
    })
  }
  triggerPreviewList.value = previewList
}

watch(dateRange, () => {
  calculateTriggerPreview()
})

const confirmBatchTrigger = async () => {
  if (!batchTriggerTask.value || !dateRange.value || !Array.isArray(dateRange.value) || dateRange.value.length !== 2) {
    ElMessage.warning('请选择完整的日期范围')
    return
  }

  if (triggerPreviewList.value.length === 0) {
    ElMessage.warning('日期范围内没有需要触发的日期')
    return
  }

  try {
    await ElMessageBox.confirm(
        `将触发 ${triggerPreviewList.value.length} 次，是否继续？`,
        '确认触发',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
        }
    )
  } catch {
    return
  }

  batchTriggerLoading.value = true

  const row = batchTriggerTask.value
  let successCount = 0
  let failCount = 0
  const errors: string[] = []

  for (const item of triggerPreviewList.value) {
    try {
      await triggerJob({
        id: row.id!,
        executorParam: item.param,
        addressList: ''
      })
      successCount++
      item.isRun = true
    } catch (error: any) {
      failCount++
      errors.push(`日期 ${item.date}: ${error.message || '未知错误'}`)
    }
  }

  batchTriggerLoading.value = false

  let message = `批量触发完成！成功：${successCount}, 失败：${failCount}`
  if (errors.length > 0 && errors.length <= 10) {
    message += '\n\n失败详情:\n' + errors.join('\n')
  } else if (errors.length > 10) {
    message += '\n\n前10个失败详情:\n' + errors.slice(0, 10).join('\n') + '\n...'
  }

  if (failCount === 0) {
    ElMessage.success(message)
  } else {
    ElMessage.warning(message)
  }

  getData()

  await ElMessageBox.confirm(
      `已触发 ${triggerPreviewList.value.length} 次，是否继续设置？`,
      '确认触发',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }
  ).then(() => {
    triggerPreviewList.value = []
    dateRange.value = null
  }).catch(() => {
    showBatchTriggerDialog.value = false
  })
}

const handleTriggerAll = async () => {
  if (list.value.length === 0) {
    ElMessage.warning('当前列表没有任务')
    return
  }

  try {
    await ElMessageBox.confirm(
        `确定要一键执行当前列表的所有 ${list.value.length} 个任务吗？`,
        '一键执行',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
        }
    )

    loading.value = true
    let successCount = 0
    let failCount = 0
    const errors: string[] = []

    for (const task of list.value) {
      try {
        await triggerJob({
          id: task.id!,
          executorParam: task.executorParam || '',
          addressList: ''
        })
        successCount++
      } catch (error: any) {
        failCount++
        errors.push(`任务 "${task.jobDesc}": ${error.message || '未知错误'}`)
      }
    }

    let message = `执行完成！成功：${successCount}, 失败：${failCount}`
    if (errors.length > 0) {
      message += '\n\n失败详情:\n' + errors.join('\n')
    }

    if (failCount === 0) {
      ElMessage.success(message)
    } else {
      ElMessage.warning(message)
    }

    getData()
  } catch (error: any) {
    if (error !== 'cancel') {
      console.error('一键执行任务失败:', error)
      ElMessage.error(error.message || '一键执行失败')
    }
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  checkXxlLoginStatus()

  await nextTick()
  if (xxlLoggedIn.value) {
    init()
  } else {
    handleXxlLogin()
  }
})

onUnmounted(() => {
  isUnmounted = true
  loading.value = false
})
</script>

<template>
  <div class="task-page">
    <div class="page-header">
      <h2 class="page-title">任务管理</h2>
    </div>

    <el-card class="search-card">
      <el-form :inline="true" :model="queryForm" class="search-form" label-width="80px">
        <el-form-item label="执行器">
          <el-select v-model="queryForm.jobGroup" placeholder="请选择执行器" style="width: 180px">
            <el-option v-for="item in jobGroupList" :label="item.title" :value="item.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="任务状态">
          <el-select v-model="queryForm.triggerStatus" clearable placeholder="请选择任务状态" style="width: 180px">
            <el-option label="运行中" :value="1" />
            <el-option label="停止" :value="0" />
          </el-select>
        </el-form-item>
        <el-form-item label="任务描述">
          <el-input
              v-model="queryForm.jobDesc"
              placeholder="请输入任务描述"
              style="width: 180px"
              clearable
              @keyup.enter="handleSearch"
          />
        </el-form-item>

        <el-form-item label="JobHandler">
          <el-input
              v-model="queryForm.executorHandler"
              placeholder="请输入 JobHandler"
              style="width: 180px"
              clearable
              @keyup.enter="handleSearch"
          />
        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="handleSearch" :loading="loading">查询</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card class="table-card">
      <template #header>
        <div class="table-header">
          <el-space>
            <span>任务列表</span>
            <el-button
                type="primary"
                size="small"
                @click="handleTriggerAll"
                :loading="loading"
            >
              一键执行当前列表
            </el-button>
          </el-space>
        </div>
      </template>

      <el-table
          :data="list"
          :loading="loading"
          border
          style="width: 100%"
      >
        <el-table-column prop="id" label="ID" width="60" align="center" />
        <el-table-column prop="jobDesc" label="任务描述" />
        <el-table-column prop="scheduleType" label="调度类型" width="180">
          <template #default="scope">
            {{ getScheduleDescription(scope.row) }}
          </template>
        </el-table-column>
        <el-table-column prop="executorRouteStrategy" label="运行模式" >
          <template #default="scope">
            {{ getRunModeDescription(scope.row) }}
          </template>
        </el-table-column>
        <el-table-column prop="triggerStatus" label="状态" width="120">
          <template #default="scope">
            <el-tag :type="scope.row.triggerStatus === 1 ? 'success' : 'danger'">
              {{ scope.row.triggerStatus === 1 ? '运行中' : '停止' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="220" fixed="right">
          <template #default="scope">
            <el-space wrap>
              <el-button
                  type="primary"
                  size="small"
                  @click="handleEdit(scope.row)"
              >
                编辑
              </el-button>
              <el-button
                  :type="scope.row.triggerStatus === 1 ? 'danger' : 'success'"
                  size="small"
                  @click="handleToggleJob(scope.row)"
              >
                {{ scope.row.triggerStatus === 1 ? '停止' : '启动' }}
              </el-button>
              <el-button
                  type="warning"
                  size="small"
                  @click="handleTrigger(scope.row)"
              >
                执行多次
              </el-button>
            </el-space>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination-container">
        <el-pagination
            v-model:current-page="currentPage"
            :page-sizes="[10, 20, 50, 100]"
            :page-size="pagination.length"
            layout="total, sizes, prev, pager, next, jumper"
            :total="total"
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
        />
      </div>
    </el-card>

    <EditTask
        v-model="showEditDialog"
        :task-data="currentTask"
        @save="handleSave"
    />

    <el-dialog
        v-model="showBatchTriggerDialog"
        title="批量触发任务"
        width="700px"
        :close-on-click-modal="false"
    >
      <div v-if="batchTriggerTask" style="padding: 20px 0">
        <el-form label-width="100px">
          <el-form-item label="任务描述">
            <span>{{ batchTriggerTask.jobDesc }}</span>
          </el-form-item>
          <el-form-item label="日期范围">
            <el-date-picker
                v-model="dateRange"
                type="daterange"
                range-separator="至"
                start-placeholder="开始日期"
                end-placeholder="结束日期"
                value-format="YYYY-MM-DD"
                style="width: 100%"
            />
          </el-form-item>
        </el-form>

        <div v-if="triggerPreviewList.length > 0" style="margin-top: 20px">
          <div style="margin-bottom: 10px; font-weight: bold; color: #606266;">
            触发预览 (共 {{ triggerPreviewList.length }} 次)：
          </div>
          <el-table
              :data="triggerPreviewList"
              border
              max-height="400"
              style="width: 100%"
          >
            <el-table-column prop="date" label="日期" width="150" align="center" />
            <el-table-column label="执行参数">
              <template #default="{ row }">
                <el-tooltip :content="row.param" placement="top">
                  <span style="word-break: break-all; font-size: 12px;">{{ row.param }}</span>
                </el-tooltip>
              </template>
            </el-table-column>
            <el-table-column prop="isRun" label="是否执行" width="80" align="center">
              <template #default="{ row }">
                <el-tag v-if="row.isRun" type="success">是</el-tag>
                <el-tag v-else type="danger">否</el-tag>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </div>
      <template #footer>
        <el-button @click="showBatchTriggerDialog = false">取消</el-button>
        <el-button
            type="primary"
            @click="confirmBatchTrigger"
            :disabled="triggerPreviewList.length === 0"
            :loading="batchTriggerLoading"
        >
          确定
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
.task-page {
  min-height: 100vh;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.page-title {
  margin: 0;
  font-size: 24px;
  font-weight: 600;
  color: #333;
}

.search-card {
  margin-bottom: 20px;
}

.search-form {
  display: flex;
  flex-wrap: wrap;
}

.search-form :deep(.el-form-item) {
  margin-bottom: 10px;
  margin-right: 15px;
}

.table-card {
  margin-bottom: 20px;
}

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.pagination-container {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
}

:deep(.el-table th) {
  font-weight: 600;
}

:deep(.el-button--small) {
  padding: 5px 10px;
}

/* ========== H5 适配 ========== */
@media (max-width: 768px) {
  .task-page {
    min-height: 100%;
  }

  .page-title {
    font-size: 18px;
  }

  /* 搜索表单项纵向铺满 */
  .search-form :deep(.el-form-item) {
    width: 100%;
    margin-right: 0;
  }

  .search-form :deep(.el-select),
  .search-form :deep(.el-input) {
    width: 100% !important;
  }

  /* 表格横向滚动 */
  .table-card :deep(.el-table) {
    width: max-content;
    min-width: 100%;
  }

  .pagination-container {
    justify-content: center;
  }

  .pagination-container :deep(.el-pagination) {
    flex-wrap: wrap;
    justify-content: center;
    row-gap: 8px;
  }
}
</style>
