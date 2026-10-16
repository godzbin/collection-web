<template>
  <div class="excel-import-page">
    <div class="page-header">
      <h2 class="page-title">Excel 导入</h2>
      <span class="page-subtitle">港华相关数据 Excel 手动导入</span>
    </div>

    <el-row :gutter="20">
      <!-- 左侧：导入表单 -->
      <el-col :xs="24" :md="12">
        <el-card class="import-card">
          <template #header>
            <div class="card-header">
              <span>导入配置</span>
            </div>
          </template>

          <el-form label-width="100px" label-position="left">
            <el-form-item label="导入类型">
              <el-select
                v-model="selectedUrl"
                placeholder="请选择导入类型"
                style="width: 100%"
                @change="handleTypeChange"
              >
                <el-option
                  v-for="item in importTypes"
                  :key="item.url"
                  :label="`${item.label}（${item.code}）`"
                  :value="item.url"
                />
              </el-select>
            </el-form-item>

            <el-form-item v-if="currentType" label="接口路径">
              <el-tag type="info" class="url-tag">POST {{ currentType.url }}</el-tag>
            </el-form-item>

            <el-form-item v-if="currentType" label="导入模版">
              <span class="template-text">{{ currentType.template }}</span>
            </el-form-item>

            <el-form-item label="业务日期">
              <el-date-picker
                v-model="day"
                type="date"
                placeholder="选择业务日期"
                value-format="YYYY-MM-DD"
                style="width: 100%"
              />
            </el-form-item>

            <!-- 日前交易结果：竖表/横表 -->
            <el-form-item v-if="currentType?.hasTypeParam" label="模版类型">
              <el-radio-group v-model="templateType">
                <el-radio :value="0">竖表</el-radio>
                <el-radio :value="1">横表</el-radio>
              </el-radio-group>
            </el-form-item>

            <el-form-item label="Excel 文件">
              <el-upload
                ref="uploadRef"
                :auto-upload="false"
                :limit="1"
                :on-change="handleFileChange"
                :on-remove="handleFileRemove"
                accept=".xlsx,.xls"
                drag
                class="upload-area"
              >
                <el-icon class="el-icon--upload"><UploadFilled /></el-icon>
                <div class="el-upload__text">拖拽文件到此处，或<em>点击选择</em></div>
                <template #tip>
                  <div class="el-upload__tip">仅支持 .xlsx / .xls 文件，一次一个</div>
                </template>
              </el-upload>
            </el-form-item>

            <el-form-item>
              <el-button
                type="primary"
                :loading="uploading"
                :disabled="!canSubmit"
                @click="handleImport"
              >
                {{ uploading ? '导入中…' : '开始导入' }}
              </el-button>
              <el-button :disabled="uploading" @click="handleReset">重置</el-button>
            </el-form-item>
          </el-form>
        </el-card>
      </el-col>

      <!-- 右侧：导入历史 -->
      <el-col :xs="24" :md="12">
        <el-card class="history-card">
          <template #header>
            <div class="card-header">
              <span>本次导入记录</span>
              <el-button
                v-if="history.length > 0"
                size="small"
                text
                type="danger"
                @click="history = []"
              >
                清空
              </el-button>
            </div>
          </template>

          <el-empty v-if="history.length === 0" description="暂无导入记录" :image-size="80" />

          <div v-else class="history-list">
            <div v-for="(item, index) in history" :key="index" class="history-item">
              <div class="history-row">
                <span class="history-name">{{ item.label }}</span>
                <el-tag :type="item.status === 'success' ? 'success' : 'danger'" size="small">
                  {{ item.status === 'success' ? '成功' : '失败' }}
                </el-tag>
              </div>
              <div class="history-meta">
                <span>文件：{{ item.fileName }}</span>
                <span>业务日期：{{ item.day }}</span>
                <span>时间：{{ item.time }}</span>
              </div>
              <div v-if="item.resultText" class="history-result" :class="{ error: item.status === 'fail' }">
                {{ item.resultText }}
              </div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { UploadFilled } from '@element-plus/icons-vue'
import dayjs from 'dayjs'
import type { UploadFile, UploadInstance } from 'element-plus'
import {
  IMPORT_TYPE_LIST,
  uploadExcel,
  type BatchImportBo,
  type ImportTypeInfo,
} from '../api/excelImport'

interface HistoryItem {
  label: string
  fileName: string
  day: string
  time: string
  status: 'success' | 'fail'
  resultText: string
}

const uploadRef = ref<UploadInstance>()
const selectedUrl = ref('')
const day = ref(dayjs().format('YYYY-MM-DD'))
const templateType = ref<0 | 1>(0)
const selectedFile = ref<File | null>(null)
const uploading = ref(false)
const history = ref<HistoryItem[]>([])

const importTypes = IMPORT_TYPE_LIST

const currentType = computed<ImportTypeInfo | undefined>(
  () => importTypes.find((item) => item.url === selectedUrl.value)
)

const canSubmit = computed(() => Boolean(currentType.value && day.value && selectedFile.value))

const handleTypeChange = () => {
  // 切换类型时重置模版类型
  templateType.value = 0
}

const handleFileChange = (file: UploadFile) => {
  selectedFile.value = (file.raw as File) ?? null
}

const handleFileRemove = () => {
  selectedFile.value = null
}

const handleReset = () => {
  selectedUrl.value = ''
  day.value = dayjs().format('YYYY-MM-DD')
  templateType.value = 0
  selectedFile.value = null
  uploadRef.value?.clearFiles()
}

// BatchImportBo 常见字段兼容，取存在的统计字段拼装结果文案
const formatBatchResult = (res: BatchImportBo): string => {
  const parts: string[] = []
  if (res.total !== undefined) parts.push(`共 ${res.total} 条`)
  if (res.success !== undefined) parts.push(`成功 ${res.success} 条`)
  if (res.fail !== undefined) parts.push(`失败 ${res.fail} 条`)
  if (res.errorMsg) parts.push(res.errorMsg)
  return parts.join('，') || JSON.stringify(res)
}

const handleImport = async () => {
  const type = currentType.value
  if (!type || !selectedFile.value || !day.value) {
    ElMessage.warning('请先选择导入类型、业务日期并上传文件')
    return
  }

  uploading.value = true
  try {
    const res = await uploadExcel(type.url, {
      file: selectedFile.value,
      day: dayjs(day.value).startOf('day').valueOf(),
      ...(type.hasTypeParam ? { type: templateType.value } : {}),
    })

    const resultText =
      res && type.hasBatchResult ? formatBatchResult(res as BatchImportBo) : ''

    history.value.unshift({
      label: `${type.label}（${type.code}）`,
      fileName: selectedFile.value.name,
      day: day.value,
      time: dayjs().format('YYYY-MM-DD HH:mm:ss'),
      status: 'success',
      resultText: resultText || '导入成功',
    })
    ElMessage.success('导入成功')
  } catch (error: any) {
    const msg =
      error?.response?.data?.techMsg ||
      error?.response?.data?.errorMsg ||
      error?.message ||
      '未知错误'
    history.value.unshift({
      label: `${type.label}（${type.code}）`,
      fileName: selectedFile.value.name,
      day: day.value,
      time: dayjs().format('YYYY-MM-DD HH:mm:ss'),
      status: 'fail',
      resultText: msg,
    })
  } finally {
    uploading.value = false
  }
}
</script>

<style scoped>
.excel-import-page {
  min-height: 100%;
}

.page-header {
  display: flex;
  align-items: baseline;
  gap: 12px;
  margin-bottom: 20px;
}

.page-title {
  margin: 0;
  font-size: 24px;
  font-weight: 600;
  color: #333;
}

.page-subtitle {
  color: #909399;
  font-size: 13px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.url-tag {
  font-family: Menlo, Consolas, monospace;
}

.template-text {
  color: #606266;
  font-size: 13px;
  word-break: break-all;
}

.upload-area {
  width: 100%;
}

.upload-area :deep(.el-upload) {
  width: 100%;
}

.upload-area :deep(.el-upload-dragger) {
  padding: 20px;
}

.history-card {
  min-height: 400px;
}

.history-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-height: 60vh;
  overflow-y: auto;
}

.history-item {
  border: 1px solid #ebeef5;
  border-radius: 6px;
  padding: 12px;
}

.history-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.history-name {
  font-weight: 600;
  color: #303133;
}

.history-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  color: #909399;
  font-size: 12px;
}

.history-result {
  margin-top: 8px;
  padding: 8px;
  background: #f0f9eb;
  border-radius: 4px;
  color: #67c23a;
  font-size: 12px;
  word-break: break-all;
}

/* ========== H5 适配 ========== */
@media (max-width: 768px) {
  .page-title {
    font-size: 18px;
  }

  .excel-import-page :deep(.el-form-item__label) {
    word-break: break-all;
  }

  .history-card {
    min-height: auto;
    margin-top: 20px;
  }

  .history-list {
    max-height: 50vh;
  }
}

.history-result.error {
  background: #fef0f0;
  color: #f56c6c;
}
</style>
