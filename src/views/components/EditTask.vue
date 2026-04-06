<template>
  <el-dialog
      v-model="dialogVisible"
      title="更新任务"
      width="800px"
      :close-on-click-modal="false"
      @closed="handleClosed"
  >
    <el-form
        ref="formRef"
        :model="formData"
        :rules="formRules"
        label-width="120px"
    >
      <!-- 基础配置 -->
      <el-divider content-position="left">基础配置</el-divider>

      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="执行器" prop="jobGroup">
            <el-select v-model="formData.jobGroup" placeholder="请选择执行器" style="width: 100%">
              <el-option
                  v-for="item in jobGroupList"
                  :key="item.id"
                  :label="item.title"
                  :value="item.id"
              />
            </el-select>
          </el-form-item>
        </el-col>

        <el-col :span="12">
          <el-form-item label="任务描述" prop="jobDesc">
            <el-input v-model="formData.jobDesc" placeholder="请输入任务描述" />
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="负责人" prop="author">
            <el-input v-model="formData.author" placeholder="请输入负责人" />
          </el-form-item>
        </el-col>

        <el-col :span="12">
          <el-form-item label="报警邮件" prop="alarmEmail">
            <el-input v-model="formData.alarmEmail" placeholder="请输入报警邮件" />
          </el-form-item>
        </el-col>
      </el-row>

      <!-- 调度配置 -->
      <el-divider content-position="left">调度配置</el-divider>

      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="调度类型" prop="scheduleType">
            <el-select v-model="formData.scheduleType" placeholder="请选择调度类型" style="width: 100%">
              <el-option label="CRON" value="CRON" />
              <el-option label="FIX_RATE" value="FIX_RATE" />
              <el-option label="FIX_DELAY" value="FIX_DELAY" />
            </el-select>
          </el-form-item>
        </el-col>

        <el-col :span="12">
          <el-form-item label="Cron" prop="scheduleConf">
            <el-input v-model="formData.scheduleConf" placeholder="请输入 Cron 表达式">
              <template #append>
                <el-button :icon="Edit" @click="showCronEditor = !showCronEditor" />
              </template>
            </el-input>
          </el-form-item>
        </el-col>
      </el-row>

      <!-- Cron 编辑器 -->
      <el-form-item v-if="showCronEditor" label="Cron 生成器">
        <el-input
            v-model="formData.scheduleConf"
            type="textarea"
            :rows="2"
            placeholder="0/1 0/1 0/1 * * ?"
        />
      </el-form-item>

      <!-- 任务配置 -->
      <el-divider content-position="left">任务配置</el-divider>

      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="运行模式" prop="glueType">
            <el-select v-model="formData.glueType" placeholder="请选择运行模式" style="width: 100%" disabled>
              <el-option label="BEAN" value="BEAN" />
            </el-select>
          </el-form-item>
        </el-col>

        <el-col :span="12">
          <el-form-item label="JobHandler" prop="executorHandler">
            <el-input v-model="formData.executorHandler" placeholder="请输入 JobHandler" />
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <el-col :span="24">
          <el-form-item label="任务参数" prop="executorParam">
            <el-input
                v-model="formData.executorParam"
                type="textarea"
                :rows="3"
                placeholder='例如：{"runday": 0}'
            />
          </el-form-item>
        </el-col>
      </el-row>

      <!-- 高级配置 -->
      <el-divider content-position="left">高级配置</el-divider>

      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="路由策略" prop="executorRouteStrategy">
            <el-select v-model="formData.executorRouteStrategy" placeholder="请选择路由策略" style="width: 100%">
              <el-option label="第一个" value="FIRST" />
              <el-option label="最后一个" value="LAST" />
              <el-option label="轮询" value="ROUND" />
              <el-option label="随机" value="RANDOM" />
              <el-option label="一致性 HASH" value="CONSISTENT_HASH" />
              <el-option label="最不活跃" value="LEAST_FREQUENTLY_USED" />
              <el-option label="最近最久未使用" value="LRU" />
              <el-option label="故障转移" value="FAILOVER" />
              <el-option label="忙碌转移" value="BUSYOVER" />
              <el-option label="分片广播" value="SHARDING_BROADCAST" />
            </el-select>
          </el-form-item>
        </el-col>

        <el-col :span="12">
          <el-form-item label="子任务 ID" prop="childJobId">
            <el-input v-model="formData.childJobId" placeholder="请输入子任务 ID" />
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="调度过期策略" prop="misfireStrategy">
            <el-select v-model="formData.misfireStrategy" placeholder="请选择调度过期策略" style="width: 100%">
              <el-option label="忽略" value="DO_NOTHING" />
              <el-option label="立即执行一次" value="FIRE_ONCE_NOW" />
            </el-select>
          </el-form-item>
        </el-col>

        <el-col :span="12">
          <el-form-item label="阻塞处理策略" prop="executorBlockStrategy">
            <el-select v-model="formData.executorBlockStrategy" placeholder="请选择阻塞处理策略" style="width: 100%">
              <el-option label="单机串行" value="SERIAL_EXECUTION" />
              <el-option label="丢弃后续调度" value="DISCARD_LATER" />
              <el-option label="覆盖之前调度" value="COVER_EARLY" />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="任务超时时间" prop="executorTimeout">
            <el-input-number v-model="formData.executorTimeout" :min="0" :max="99999" style="width: 100%" />
          </el-form-item>
        </el-col>

        <el-col :span="12">
          <el-form-item label="失败重试次数" prop="executorFailRetryCount">
            <el-input-number v-model="formData.executorFailRetryCount" :min="0" :max="20" style="width: 100%" />
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>

    <template #footer>
      <el-space>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSave" :loading="loading">
          保存
        </el-button>
      </el-space>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, watch, onMounted } from 'vue'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import { Edit } from '@element-plus/icons-vue'
import { updateTaskInfo, type TaskInfoRes, type TaskUpdateParams, getJobGroupList, type JobGroupRes } from '../../api/dataManagement'

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

// 表单验证规则
const formRules: FormRules = {
  jobGroup: [
    { required: true, message: '请选择执行器', trigger: 'change' }
  ],
  jobDesc: [
    { required: true, message: '请输入任务描述', trigger: 'blur' }
  ],
  author: [
    { required: true, message: '请输入负责人', trigger: 'blur' }
  ],
  alarmEmail: [
    { required: true, message: '请输入报警邮件', trigger: 'blur' }
  ],
  scheduleType: [
    { required: true, message: '请选择调度类型', trigger: 'change' }
  ],
  scheduleConf: [
    { required: true, message: '请输入 Cron 表达式', trigger: 'blur' }
  ],
  executorHandler: [
    { required: true, message: '请输入 JobHandler', trigger: 'blur' }
  ],
  executorParam: [
    { required: true, message: '请输入任务参数', trigger: 'blur' }
  ],
  executorRouteStrategy: [
    { required: true, message: '请选择路由策略', trigger: 'change' }
  ],
  misfireStrategy: [
    { required: true, message: '请选择调度过期策略', trigger: 'change' }
  ],
  executorBlockStrategy: [
    { required: true, message: '请选择阻塞处理策略', trigger: 'change' }
  ]
}

// 监听 dialog 显示状态
watch(() => props.modelValue, (val) => {
  dialogVisible.value = val
  if (val && props.taskData) {
    // 填充表单数据
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
      // 构造符合 XXL-Job 要求的参数
      const updateParams: TaskUpdateParams = {
        id: formData.id!,
        jobGroup: formData.jobGroup!,
        jobDesc: formData.jobDesc,
        author: formData.author,
        alarmEmail: formData.alarmEmail,
        scheduleType: formData.scheduleType,
        scheduleConf: formData.scheduleConf,
        // 添加 XXL-Job 需要的额外参数
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
:deep(.el-divider__text) {
  font-weight: bold;
  color: var(--el-text-color-primary);
}

:deep(.el-form-item__label) {
  font-weight: 500;
}
</style>
