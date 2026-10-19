<template>
  <div :class="'page'" >
    <div class="page-header">
      <h2 class="page-title">任务入库情况</h2>
    </div>
      <el-card class="top mg-b" :show-title="false">
        <el-row>
          <el-col :span="20">
            <el-form :mode="query" inline class="only-one">
              <el-form-item label="任务日期">
                <el-date-picker
                    v-model="query.date"
                    type="date"
                    value-format="x"
                    placeholder="请选择日期"
                    @change="getData"
                />
              </el-form-item>
              <el-form-item label="">
                <span class="tips"> 本日剩余未入库数据项 {{ onloadCount.length }}/{{allCount.length}} 项 </span>
              </el-form-item>
            </el-form>
          </el-col>
          <el-col :span="4" style="text-align: right">
            <el-space direction="vertical">
              <el-button type="primary" :icon="Setting" @click="handleShowTaskConfig"
              >
                任务设置
              </el-button>
              <!-- <el-button type="primary" :icon="Upload">批量导入</el-button> -->
            </el-space>
          </el-col>
        </el-row>
      </el-card>
    <el-card class="table-card">
      <el-table v-if="!isMobile" :data="list" :loading="loading" row-key="id" border default-expand-all>
        <!-- <el-table-column prop="code" label="数据类型"></el-table-column> -->
        <el-table-column prop="dataType" label="数据类型" width="300"></el-table-column>
        <el-table-column prop="day" label="数据日期">
          <template #default="scope">
            {{ scope.row.importUri ? getDDay(scope.row.day) : '' }}
          </template>
        </el-table-column>
        <el-table-column prop="size" label="数据数量"></el-table-column>
        <el-table-column prop="status" label="数据状态">
          <template #default="scope">
            <el-tag v-if="scope.row.importUri && scope.row.pid" :size="'small'" :type="scope.row.size ? 'success' : 'warning'">{{
                scope.row.importUri ? (scope.row.size ? '已入库' : '未入库') : ''
              }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="modifyTime" label="更新时间">
          <template #default="scope">
            {{
              scope.row.modifyTime
                  ? getTime(scope.row.modifyTime)
                  : getTime(scope.row.createTime)
            }}
          </template>
        </el-table-column>
      </el-table>

      <!-- 移动端卡片列表（树形数据扁平化） -->
      <div v-else class="card-list" v-loading="loading">
        <div v-if="flatList.length === 0 && !loading" class="card-empty">暂无数据</div>
        <div
            v-for="item in flatList"
            :key="item.id"
            class="data-card"
            :class="{ 'is-child': !!item.isChild }"
        >
          <div class="card-head">
            <span class="card-title">{{ item.dataType }}</span>
            <el-tag
                v-if="item.importUri && item.pid"
                :size="'small'"
                :type="item.size ? 'success' : 'warning'"
            >
              {{ item.size ? '已入库' : '未入库' }}
            </el-tag>
          </div>
          <div class="card-row">
            <span class="card-label">数据日期</span>
            <span>{{ item.importUri ? getDDay(item.day) : '' }}</span>
          </div>
          <div class="card-row">
            <span class="card-label">数据数量</span>
            <span>{{ item.size }}</span>
          </div>
          <div class="card-row">
            <span class="card-label">更新时间</span>
            <span>{{ item.modifyTime ? getTime(item.modifyTime) : getTime(item.createTime) }}</span>
          </div>
        </div>
      </div>
    </el-card>
    <TaskConfig ref="taskConfigRef" @save="getData" />
  </div>
</template>

<script setup lang="ts">
import { Setting } from '@element-plus/icons-vue'
import TaskConfig from './components/TaskConfig.vue'
import { getDayLoadDataList } from '../api/dataManagement'
import {reactive, ref, onMounted, onUnmounted, computed} from 'vue'
import  $dayjs  from 'dayjs'
const query = reactive<any>({
  date: new Date().getTime()
})
const loading = ref(false)
const list = ref<any[]>([])

// 移动端检测（<=768px 时使用卡片列表）
const isMobile = ref(false)
const checkIsMobile = () => {
  isMobile.value = window.innerWidth <= 768
}
checkIsMobile()
window.addEventListener('resize', checkIsMobile)
onUnmounted(() => {
  window.removeEventListener('resize', checkIsMobile)
})

// 树形数据扁平化，子项带 isChild 标记
const flatList = computed(() => {
  const result: any[] = []
  list.value.forEach((item: any) => {
    result.push(item)
    item.children?.forEach((child: any) => {
      result.push({ ...child, isChild: true })
    })
  })
  return result
})
const taskConfigRef = ref<any>(null)
const handleShowTaskConfig = () => {
  if (taskConfigRef.value) {
    taskConfigRef.value.show()
  }
}

const getData = async () => {
  try {
    loading.value = true
    list.value = await getDayLoadDataList({day: query.date})
  } catch (error) {}
  loading.value = false
}


// 计算D-day日时间
const getDDay = (day: number) => {
  return day
      ? $dayjs(query.date).subtract(day, 'day').format('YYYY-MM-DD')
      : $dayjs(query.date).format('YYYY-MM-DD')
}

const getTime = (date: number | Date) => {
  return date ? $dayjs(date).format('YYYY-MM-DD HH:mm') : ''
}
onMounted(() => {
  getData()
})

const allCount = computed(() => {
  return list.value.flatMap((item: any) => item.children || []).filter((child: any) => !!child)
})
const onloadCount = computed(() => {
  return allCount.value.filter((item: any) => !item.size)
})

</script>

<style scoped>
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

.tips {
  color: red;
}

/* ========== 移动端卡片列表 ========== */
.card-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.card-empty {
  text-align: center;
  color: #909399;
  padding: 24px 0;
  font-size: 13px;
}

.data-card {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  padding: 12px;
}

.data-card.is-child {
  background: #fbfdff;
  border-style: dashed;
  margin-left: 16px;
}

.card-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.card-title {
  font-weight: 600;
  color: #1e293b;
  font-size: 14px;
  word-break: break-all;
}

.card-row {
  display: flex;
  gap: 8px;
  font-size: 13px;
  color: #475569;
  padding: 3px 0;
  word-break: break-all;
}

.card-label {
  flex: none;
  color: #94a3b8;
  min-width: 56px;
}

/* ========== H5 适配 ========== */
@media (max-width: 768px) {
  .page-title {
    font-size: 18px;
  }

  /* 顶部筛选卡片纵向排列 */
  .top :deep(.el-col) {
    max-width: 100%;
    flex: 0 0 100%;
    text-align: left !important;
  }

  .top :deep(.el-form-item),
  .top :deep(.el-date-editor) {
    width: 100% !important;
    margin-right: 0;
  }

  /* 隐藏桌面表格（由 v-if 控制，此处兜底；仅限列表卡片，避免影响弹窗内表格） */
  .table-card :deep(.el-table) {
    display: none;
  }

  :deep(.el-dialog) {
    width: 94% !important;
  }
}
</style>
