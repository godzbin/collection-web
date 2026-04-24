<template>
  <div class="log-view">
    <div class="view-header">
      <h2>系统日志</h2>
      <div class="header-actions">
        <span class="log-count">共 {{ logs.length }} 条日志</span>
        <el-button @click="loadMoreLogs" :disabled="!hasMore || loading" v-if="hasMore">
          {{ loading ? '加载中...' : '加载更多' }}
        </el-button>
        <el-date-picker
            v-model="selectedDate"
            type="date"
            placeholder="选择日期"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
            @change="handleDateChange"
        />
        <el-radio-group v-model="logType" @change="handleTypeChange">
          <el-radio-button label="info">Info</el-radio-button>
          <el-radio-button label="error">Error</el-radio-button>
        </el-radio-group>
      </div>
    </div>
    <LogDisplay
        :logs="logs"
        :max-logs="maxLogs"
        @clear="handleClearLogs"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElButton, ElDatePicker, ElRadioGroup, ElRadioButton, ElMessage } from 'element-plus'
import LogDisplay from '../components/LogDisplay.vue'
import { getLoadLog} from "../api/dataApi.ts";

interface LogEntry {
  timestamp: Date | string;
  level: string | 'info' | 'warn' | 'error' | 'debug';
  message: string;
}

const logs = ref<LogEntry[]>([])
const maxLogs = ref(1000)
const logType = ref('info')
const selectedDate = ref<string>(new Date().toISOString().split('T')[0])
const cursor = ref<string>('')
const nextCursor = ref<string>('')
const hasMore = ref(false)
const loading = ref(false)
const filePath = ref('')

const parseLogLine = (line: string): LogEntry | null => {
  if (!line.trim()) return null;
  const [date, timestamp, level, ...rest] = line.split(/\s+/);
  if (!timestamp || !level) return null;

  return {
    timestamp: date + ' ' + timestamp,
    level: level,
    message: rest.join(' ')
  };
};

const loadLogs = async (isLoadMore = false) => {
  try {
    loading.value = true;

    const params: any = {
      type: logType.value,
      date: selectedDate.value,
    };

    if (isLoadMore && nextCursor.value) {
      params.cursor = nextCursor.value;
    }

    const result = await getLoadLog(params);

    if (result.lines && result.lines.length > 0) {
      const newLogs = result.lines
          .map((line: any) => parseLogLine(line))
          .filter((log: LogEntry | null): log is LogEntry => log !== null);

      if (isLoadMore) {
        logs.value = [...logs.value, ...newLogs];
      } else {
        logs.value = newLogs;
      }

      if (logs.value.length > maxLogs.value) {
        logs.value = logs.value.slice(-maxLogs.value);
      }

      nextCursor.value = result.nextCursor || '';
      hasMore.value = result.hasMore || false;
      filePath.value = result.filePath || '';

      console.log(`加载了 ${newLogs.length} 条日志`, {
        cursor: result.cursor,
        nextCursor: result.nextCursor,
        hasMore: result.hasMore
      });
    } else {
      if (!isLoadMore) {
        logs.value = [];
      }
      hasMore.value = false;
      ElMessage.info('没有更多日志');
    }
  } catch (error) {
    console.error('加载日志失败:', error);
    ElMessage.error('加载日志失败');
  } finally {
    loading.value = false;
  }
};

const loadMoreLogs = () => {
  if (hasMore.value && !loading.value) {
    loadLogs(true);
  }
};

const handleDateChange = () => {
  cursor.value = '';
  nextCursor.value = '';
  loadLogs(false);
};

const handleTypeChange = () => {
  cursor.value = '';
  nextCursor.value = '';
  loadLogs(false);
};

const handleClearLogs = () => {
  logs.value = [];
};

onMounted(() => {
  loadLogs(false);
});
</script>

<style scoped>
.log-view {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.view-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 8px;
  border-bottom: 1px solid #e2e8f0;
}

.view-header h2 {
  color: #1e293b;
  margin: 0;
  font-size: 1.5rem;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.log-count {
  color: #64748b;
  font-size: 0.9rem;
}
</style>
