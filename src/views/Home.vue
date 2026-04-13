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
    <el-card>
      <el-table  :data="list" :loading="loading" row-key="id" border default-expand-all>
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
    </el-card>
    <TaskConfig ref="taskConfigRef" @save="getData" />
  </div>
</template>

<script setup lang="ts">
import { Setting } from '@element-plus/icons-vue'
import TaskConfig from './components/TaskConfig.vue'
import { getDayLoadDataList } from '../api/dataManagement'
import {reactive, ref, onMounted, computed} from 'vue'
import  $dayjs  from 'dayjs'
const query = reactive<any>({
  date: new Date().getTime()
})
const loading = ref(false)
const list = ref<any[]>([])
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
  return list.value.flatMap((item: any) => item.children)
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
</style>
