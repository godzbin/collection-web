<script setup lang="ts">
import { ref, reactive, onMounted, computed, onUnmounted, nextTick } from 'vue'
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

const loading = ref(false)
const list = ref<TaskInfoRes[]>([])
const total = ref(0)
const xxlLoggedIn = ref(false)

// 用于清理异步操作的标志
let isUnmounted = false

const queryForm = reactive<TaskInfoParams>({
  jobGroup: '', // 执行器 ID，根据实际修改，默认为 5
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

// XXL-Job 登录
const handleXxlLogin = async () => {
  if (isUnmounted) return

  try {
    loading.value = true
    await xxlLogin()
    await nextTick()
    if (!isUnmounted) {
      xxlLoggedIn.value = true
      // ElMessage.success('XXL-Job 登录成功')
      init()
    }
  } catch (error: any) {
    if (!isUnmounted) {
      console.error('XXL-Job 登录失败:', error)
      // ElMessage.error(error.message || 'XXL-Job 登录失败')
    }
  } finally {
    if (!isUnmounted) {
      loading.value = false
    }
  }
}

// 检查登录状态
const checkXxlLoginStatus = () => {
  const cookie = getXxlToken()
  xxlLoggedIn.value = !!cookie
  return xxlLoggedIn.value
}

// 获取任务列表
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
//     jobGroup=5&triggerStatus=-1&jobDesc=&executorHandler=&author=&start=0&length=1

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
        // ElMessage.warning('XXL-Job 未登录，请先登录')
        checkXxlLoginStatus()
        if (!xxlLoggedIn.value && !isUnmounted) {
          await handleXxlLogin()
        }
      } else {
        // ElMessage.error('获取任务列表失败')
      }
    }
  } finally {
    if (!isUnmounted) {
      loading.value = false
    }
  }
}

// 搜索
const handleSearch = () => {
  pagination.start = 0
  pagination.draw = 1
  getData()
}

// 分页变化 - 每页条数
const handleSizeChange = (val: number) => {
  pagination.length = val
  pagination.start = 0
  pagination.draw = 1
  getData()
}

// 分页变化 - 页码
const handleCurrentChange = (val: number) => {
  pagination.start = (val - 1) * pagination.length
  pagination.draw = val
  getData()
}

// 计算当前页码
const currentPage = computed(() => {
  return Math.floor(pagination.start / pagination.length) + 1
})

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

// 启动/停止任务
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

    // 刷新列表
    getData()
  } catch (error: any) {
    if (error !== 'cancel') {
      console.error(`${action}任务失败:`, error)
      ElMessage.error(error.message || `${action}任务失败`)
    }
  }
}

// 手动触发单个任务
const handleTrigger = async (row: TaskInfoRes) => {
  try {
    await ElMessageBox.confirm(
        `确定要手动触发任务 "${row.jobDesc}" 吗？`,
        '手动触发',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
        }
    )

    await triggerJob({
      id: row.id!,
      executorParam: row.executorParam || '',
      addressList: ''
    })

    ElMessage.success('任务触发成功')
  } catch (error: any) {
    if (error !== 'cancel') {
      console.error('手动触发任务失败:', error)
      ElMessage.error(error.message || '任务触发失败')
    }
  }
}

// 一键执行当前列表所有任务
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

    // 依次执行所有任务
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

    // 刷新列表
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
    // 自动尝试登录
    handleXxlLogin()
  }
})

// 组件卸载时清理
onUnmounted(() => {
  isUnmounted = true
  // 清理可能还在进行的异步操作
  loading.value = false
})
</script>

<template>
  <div class="task-page">
    <div class="page-header">
      <h2 class="page-title">任务管理</h2>
<!--      <div class="login-status">-->
<!--        <el-tag :type="xxlLoggedIn ? 'success' : 'danger'">-->
<!--          {{ xxlLoggedIn ? 'XXL-Job 已登录' : 'XXL-Job 未登录' }}-->
<!--        </el-tag>-->
<!--        <el-button-->
<!--            v-if="!xxlLoggedIn"-->
<!--            type="primary"-->
<!--            size="small"-->
<!--            @click="handleXxlLogin"-->
<!--            :loading="loading"-->
<!--            style="margin-left: 10px"-->
<!--        >-->
<!--          登录 XXL-Job-->
<!--        </el-button>-->
<!--      </div>-->
    </div>

    <!-- 搜索栏 -->
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

    <!-- 表格 -->
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
            {{ scope.row.scheduleType }}: {{ scope.row.scheduleConf}}
          </template>
        </el-table-column>
        <el-table-column prop="executorRouteStrategy" label="运行模式" >
          <template #default="scope">
            {{ scope.row.glueType }}：{{ scope.row.executorHandler}}
          </template>
        </el-table-column>
        <el-table-column prop="author" label="负责人" width="100" />
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
                执行一次
              </el-button>
            </el-space>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
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
  </div>
</template>

<style scoped>
.task-page {
  //padding: 20px;
  //background-color: #f0f2f5;
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

.login-status {
  display: flex;
  align-items: center;
  gap: 10px;
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
</style>
