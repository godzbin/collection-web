<template>
  <div class="page">

    <div class="page-bg"></div>
    <!-- 左侧：运行时长和图表 -->
    <div class="left-panel">
      <h2 class="mg-b" style="margin-bottom: 20px;">欢迎你，{{ userInfo.username }}</h2>
    </div>
    <h3 class="mg-b">当前任务执行情况</h3>
    <el-card class="top mg-b" header="">
      <el-row>
        <el-col :span="20">
          <el-form :mode="query" inline class="only-one">
            <el-form-item label="任务日期">
              <el-date-picker
                  v-model="query.date"
                  type="date"
                  placeholder="请选择日期"
                  @change="getData"
              />
            </el-form-item>
            <el-form-item label="">
              <span class="tips"> 本日剩余未导入数据项 {{ onloadCount }} 项 </span>
            </el-form-item>
          </el-form>
        </el-col>
<!--        <el-col :span="4" style="text-align: right">-->
<!--          <el-space direction="vertical">-->
<!--            <el-button type="primary" :icon="Setting" @click="handleShowTaskConfig"-->
<!--            >-->
<!--              任务设置-->
<!--            </el-button>-->
<!--            &lt;!&ndash; <el-button type="primary" :icon="Upload">批量导入</el-button> &ndash;&gt;-->
<!--          </el-space>-->
<!--        </el-col>-->
      </el-row>
    </el-card>
    <el-card>
      <el-table  :data="list" :loading="loading" row-key="id" border default-expand-all>
<!--        <el-table-column prop="dataType" label="数据类型" width="300"></el-table-column>-->
<!--        <el-table-column prop="day" label="数据日期">-->
<!--          <template #default="scope">-->
<!--            {{ scope.row.importUri ? getDDay(scope.row.day) : '' }}-->
<!--          </template>-->
<!--        </el-table-column>-->
        <el-table-column prop="taskId" label="任务ID">
        </el-table-column>
        <el-table-column prop="dataType" label="数据日期">
          <template #default="scope">
            {{ scope.row.importDay ? getDDay(scope.row.importDay) : '' }}
          </template>
        </el-table-column>
        <el-table-column prop="size" label="数据数量"></el-table-column>
        <el-table-column prop="status" label="数据状态">
          <template #default="scope">
            <el-tag :size="'small'" :type="scope.row.size ? 'success' : 'warning'">{{
                (scope.row.size ? '已采集' : '未采集')
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
  </div>
</template>

<script setup lang="ts">
import {ref, onUnmounted, onMounted, reactive} from 'vue'
import {getCurrentUser} from "../api/login.ts";
import $dayjs from 'dayjs'
import {DayLoadRes, getDayLoadDataList} from "../api/dataManagement.ts";

const list = ref<DayLoadRes[]>([])
const loading = ref(false)
const query = reactive({
  date: new Date().getTime(),
  status: 'all',
})

const getData = async () => {
  try {
    loading.value = true
    list.value = await getDayLoadDataList({importDay: $dayjs(query.date).valueOf()})
    // list.value.push({
    //   id: -1,
    //   "taskId": 0,
    //   "importDay": new Date().getTime(),
    //   "size": 0,
    //   createTime: new Date().getTime()
    // })
    console.log(list.value, 'list.value')
  } catch (error) {}
  loading.value = false
}


const onloadCount = ref(0)

const userInfo = ref<any>({})


// 计算D-day日时间
const getDDay = (day: number) => {
  return day
      ? $dayjs(day).format('YYYY-MM-DD')
      : ''
}

// const getDDayValue = (day: number) => {
//   return day
//       ? $dayjs(query.date).subtract(day, 'day').valueOf()
//       : $dayjs(query.date).valueOf()
// }
const getTime = (date: number | Date) => {
  return date ? $dayjs(date).format('YYYY-MM-DD HH:mm') : ''
}



onMounted(async () => {
  const info = await getCurrentUser()
  userInfo.value = info
  getData()
})

// 组件卸载时清理定时器
onUnmounted(() => {

})
</script>

<style scoped>
.page {
  position: relative;
  width: 100%;
  //height: 100vh;
  box-sizing: border-box;
}

.page-bg {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(255, 255, 255, 0.1);
  background-size: 100% 100%;
  background-repeat: no-repeat;
  opacity: 0.6;
  filter: blur(22px);
  z-index: -1;
}

.left-panel {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.right-panel {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.runtime-display {
  min-height: 120px;
}

.chart-display {
  /* flex: 1; */
}

.runtime-card {
  background: white;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  padding: 20px;
  width: 100%;
  height: 100%;
  color: #333;
}

.runtime-card h3 {
  margin: 0 0 10px 0;
  font-size: 1.2em;
  color: #16a34a;
  font-weight: 600;
}

.runtime-value {
  font-size: 1.5em;
  font-weight: bold;
  color: #0f172a;
  margin: 0;
}

.control-buttons {
  display: flex;
  flex-direction: column;
  gap: 15px;
  width: 100%;
  max-width: 200px;
  margin-top: 45%;
}

.btn-launch, .btn-stop {
  padding: 15px 20px;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  text-align: center;
}

.btn-launch {
  background-color: #10b981;
  color: white;
}

.btn-stop {
  background-color: #ef4444;
  color: white;
}

.btn-launch:hover:not(.disabled), 
.btn-stop:hover:not(.disabled) {
  opacity: 0.9;
  transform: translateY(-2px);
}

.btn-launch.disabled, 
.btn-stop.disabled {
  background-color: #94a3b8;
  cursor: not-allowed;
  opacity: 0.7;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .page {
    grid-template-columns: 1fr;
    grid-template-rows: auto auto;
  }
  
  .left-panel {
    order: 1;
  }
  
  .right-panel {
    order: 2;
    margin-top: 20px;
  }
}
</style>