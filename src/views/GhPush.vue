<template>
  <div class="gh-push-page">
    <div class="page-header">
      <h2 class="page-title">港华推送记录</h2>
    </div>

    <el-alert
        v-if="loadError"
        class="mg-b"
        type="warning"
        :closable="false"
        show-icon
        :title="loadError"
    />

    <el-card class="search-card">
      <el-form :inline="true" :model="queryForm" class="search-form" label-width="100px">
        <el-form-item label="推送元数据">
          <el-select
              v-model="queryForm.pushMetaId"
              placeholder="请选择推送元数据"
              style="width: 240px"
              @change="handleSearch"
          >
            <el-option
                v-for="item in metaList"
                :key="item.id"
                :label="item.modelName"
                :value="item.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="推送状态">
          <el-select
              v-model="queryForm.status"
              placeholder="全部"
              clearable
              style="width: 160px"
              @change="handleSearch"
          >
            <el-option label="已推送" value="1" />
            <el-option label="推送失败" value="0" />
          </el-select>
        </el-form-item>
        <el-form-item label="推送时间">
          <el-date-picker
              v-model="queryForm.timeRange"
              type="daterange"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              value-format="YYYY-MM-DD"
              style="width: 260px"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :loading="loading" @click="handleSearch">查询</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card class="table-card">
      <template #header>
        <div class="table-header">
          <el-space>
            <span>推送记录明细</span>
            <span class="tips">共 {{ filteredRows.length }} 条</span>
          </el-space>
          <el-button
              type="danger"
              size="small"
              :disabled="clearableSelectedCount === 0"
              :loading="clearLoading"
              @click="handleBatchClear"
          >
            批量清理缓存（{{ clearableSelectedCount }}）
          </el-button>
        </div>
      </template>

      <el-table
          :data="pagedRows"
          :loading="loading"
          border
          row-key="rowKey"
          style="width: 100%"
          @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="50" align="center" />
        <el-table-column prop="modelName" label="推送元数据" min-width="220" />
        <el-table-column prop="day" label="业务日期" width="130" align="center" />
        <el-table-column label="是否已推送" width="110" align="center">
          <template #default="{ row }">
            <el-tag v-if="row.pushed === true" type="success">是</el-tag>
            <el-tag v-else-if="row.pushed === false" type="danger">否</el-tag>
            <el-tag v-else type="info">未知</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="推送时间" width="170" align="center">
          <template #default="{ row }">{{ formatTime(row.createTime) }}</template>
        </el-table-column>
        <el-table-column prop="errorMsg" label="失败原因" min-width="180" show-overflow-tooltip />
        <el-table-column label="操作" width="120" align="center">
          <template #default="{ row }">
            <el-tooltip
                :disabled="row.clearable"
                content="该推送表不在可清理范围内"
                placement="top"
            >
              <span>
                <el-button
                    type="warning"
                    size="small"
                    :disabled="!row.clearable"
                    :loading="clearLoading && clearingRowKey === row.rowKey"
                    @click="handleClear(row)"
                >
                  清理缓存
                </el-button>
              </span>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination-container">
        <el-pagination
            v-model:current-page="pagination.page"
            :page-sizes="[20, 50, 100]"
            :page-size="pagination.size"
            layout="total, sizes, prev, pager, next, jumper"
            :total="filteredRows.length"
            @size-change="handleSizeChange"
            @current-change="handlePageChange"
        />
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import {computed, onMounted, reactive, ref, watch} from 'vue'
import {ElMessage, ElMessageBox} from 'element-plus'
import dayjs from 'dayjs'
import {
  clearGhPushCache,
  getGhPushHiPage,
  getGhPushMetaEnumList,
  getGhPushMetaList,
  type GhPushHi,
  type GhPushMeta,
  type GhPushMetaEnum,
} from '../api/dataManagement'

// 后端文档：交易日历任务会同步清理当日三个子任务的缓存，子任务不允许单独清理。
// 故前端统一以交易日历任务作为 tableMeta 发起清理。
const CLEAR_TABLE_META = 'PUB_TRADING_CALENDAR_TASKS'

interface PushRow {
  rowKey: string
  modelName: string
  day: string
  pushed: boolean | null
  /* 是否允许清理缓存（受前端限制范围约束） */
  clearable: boolean
  createTime?: string | number
  errorMsg?: string
}

const loading = ref(false)
const clearLoading = ref(false)
const clearingRowKey = ref('')
const loadError = ref('')

const metaList = ref<GhPushMeta[]>([])
const metaEnumList = ref<GhPushMetaEnum[]>([])
const rawRows = ref<PushRow[]>([])
const selectedRows = ref<PushRow[]>([])

// 前端限制可清理范围：只允许清理 /pub/gh/pushmeta/list 中登记的推送表。
// 若枚举接口不可用（列表为空）则放行，避免功能整体不可用。
const clearableTableNames = computed(
    () => new Set(metaEnumList.value.map((item) => item.tableName))
)

// 默认推送时间范围：最近一个月（含当天）
const getDefaultTimeRange = (): [string, string] => [
  dayjs().subtract(1, 'month').format('YYYY-MM-DD'),
  dayjs().format('YYYY-MM-DD'),
]

const queryForm = reactive<{
  pushMetaId: number | undefined
  status: string
  timeRange: [string, string] | null
}>({
  pushMetaId: undefined,
  status: '1',
  timeRange: getDefaultTimeRange(),
})

const pagination = reactive({page: 1, size: 20})

// 过滤条件变化后回到第一页，避免停留在越界页码导致表格看似无数据
watch(
    () => queryForm.timeRange,
    () => {
      pagination.page = 1
    }
)

// 推送时间区间为客户端过滤（服务端 /ghpushhi/page 不支持按时间过滤）
const filteredRows = computed(() => {
  if (!queryForm.timeRange || queryForm.timeRange.length !== 2) return rawRows.value
  const [start, end] = queryForm.timeRange
  const startTime = dayjs(start).startOf('day').valueOf()
  const endTime = dayjs(end).endOf('day').valueOf()
  return rawRows.value.filter((row) => {
    if (!row.createTime) return false
    const time = dayjs(row.createTime).valueOf()
    return time >= startTime && time <= endTime
  })
})

const pagedRows = computed(() => {
  const start = (pagination.page - 1) * pagination.size
  return filteredRows.value.slice(start, start + pagination.size)
})

const clearableSelectedCount = computed(
    () => selectedRows.value.filter((row) => row.clearable).length
)

const formatTime = (value?: string | number) => {
  return value ? dayjs(value).format('YYYY-MM-DD HH:mm:ss') : ''
}

// Records[].day 可能是 "2026-09-11" 或 "2024-09-10 00:00:00"，统一取日期部分
const normalizeDay = (day?: string) => {
  if (!day) return ''
  return day.trim().slice(0, 10)
}

const loadMeta = async () => {
  try {
    const [meta, enums] = await Promise.all([
      getGhPushMetaList(),
      getGhPushMetaEnumList(),
    ])
    metaList.value = meta || []
    metaEnumList.value = enums || []
  } catch (error) {
    console.error('获取推送元数据失败:', error)
  }
}

const loadRecords = async () => {
  if (!queryForm.pushMetaId) {
    rawRows.value = []
    ElMessage.warning('请先选择推送元数据')
    return
  }

  loading.value = true
  loadError.value = ''

  // 未选择状态时分别查询成功与失败记录；成功记录较多时服务端可能报错，需容错
  const statuses = queryForm.status ? [queryForm.status] : ['1', '0']
  const errors: string[] = []
  const rows: PushRow[] = []
  const meta = metaList.value.find((item) => item.id === queryForm.pushMetaId)
  const metaName = meta?.modelName || ''
  const clearable =
      clearableTableNames.value.size === 0 || clearableTableNames.value.has(meta?.tableName)

  await Promise.all(
      statuses.map(async (status) => {
        try {
          const res = await getGhPushHiPage({
            pushMetaId: queryForm.pushMetaId,
            status,
          })
          const records: GhPushHi[] = res?.data || []
          records.forEach((record) => {
            const days = Array.from(
                new Set(
                    (record.requestParam?.Records || [])
                        .map((item) => normalizeDay(item?.day))
                        .filter(Boolean)
                )
            )
            days.forEach((day) => {
              rows.push({
                rowKey: `${record.id}-${day}`,
                modelName: metaName,
                day,
                pushed: status === '1' ? true : false,
                clearable,
                createTime: record.createTime,
                errorMsg: record.errorMsg,
              })
            })
          })
        } catch (error: any) {
          const techMsg =
              error?.response?.data?.techMsg ||
              error?.response?.data?.errorMsg ||
              error?.message ||
              '未知错误'
          errors.push(`${status === '1' ? '已推送' : '推送失败'}记录查询失败：${techMsg}`)
          console.error('获取推送记录失败:', status, error)
        }
      })
  )

  rows.sort((a, b) => (a.day < b.day ? 1 : a.day > b.day ? -1 : 0))
  rawRows.value = rows
  pagination.page = 1

  if (errors.length > 0) {
    loadError.value = `${errors.join('；')}。列表可能不完整，已推送状态无法完全确认（显示为「未知」）。`
  }

  loading.value = false
}

const handleSearch = () => {
  loadRecords()
}

const handleReset = () => {
  queryForm.status = '1'
  queryForm.timeRange = getDefaultTimeRange()
  pagination.page = 1
  loadRecords()
}

const handleSizeChange = (size: number) => {
  pagination.size = size
  pagination.page = 1
}

const handlePageChange = (page: number) => {
  pagination.page = page
}

const handleSelectionChange = (rows: PushRow[]) => {
  selectedRows.value = rows
}

const doClear = async (rows: PushRow[]) => {
  clearLoading.value = true
  let successCount = 0
  const errors: string[] = []
  for (const row of rows) {
    try {
      await clearGhPushCache(CLEAR_TABLE_META, row.day)
      successCount++
    } catch (error: any) {
      const msg =
          error?.response?.data?.techMsg ||
          error?.response?.data?.errorMsg ||
          error?.message ||
          '未知错误'
      errors.push(`${row.day}: ${msg}`)
    }
  }
  clearLoading.value = false
  clearingRowKey.value = ''

  if (errors.length === 0) {
    ElMessage.success(`清理成功：${successCount} 条`)
  } else {
    ElMessage.warning(`清理完成，成功 ${successCount} 条，失败 ${errors.length} 条：${errors.join('；')}`)
  }
}

const handleClear = async (row: PushRow) => {
  try {
    await ElMessageBox.confirm(
        `确定清理「${row.modelName}」${row.day} 的港华重复推送缓存吗？`,
        '清理缓存',
        {confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning'}
    )
  } catch {
    return
  }
  clearingRowKey.value = row.rowKey
  await doClear([row])
}

const handleBatchClear = async () => {
  const days = Array.from(
      new Set(selectedRows.value.filter((row) => row.clearable).map((row) => row.day))
  )
  try {
    await ElMessageBox.confirm(
        `确定清理选中的 ${days.length} 个业务日期的港华重复推送缓存吗？`,
        '批量清理缓存',
        {confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning'}
    )
  } catch {
    return
  }
  const rows = days.map((day) => ({
    rowKey: day,
    modelName: '',
    day,
    pushed: null,
    clearable: true,
  } as PushRow))
  await doClear(rows)
}

onMounted(async () => {
  await loadMeta()
  if (metaList.value.length > 0) {
    queryForm.pushMetaId = metaList.value[0].id
    loadRecords()
  }
})
</script>

<style scoped>
.gh-push-page {
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

.mg-b {
  margin-bottom: 20px;
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

.tips {
  color: #909399;
  font-size: 13px;
}

.pagination-container {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
}

:deep(.el-table th) {
  font-weight: 600;
}
</style>
