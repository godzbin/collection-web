<template>
  <div class="cockpit-container">
    <div class="page-header">
      <h2 class="page-title">数据驾驶舱</h2>
      <div class="date-selector">
        <!-- 新增：负荷类型选择器 -->
        <el-select
            v-model="selectedLoadType"
            placeholder="请选择负荷类型"
            style="width: 160px; margin-right: 12px;"
            @change="handleLoadTypeChange"
        >
          <el-option
              v-for="item in loadTypes"
              :key="item.value"
              :label="item.name"
              :value="item.value"
          />
        </el-select>

        <el-date-picker
            v-model="selectedDate"
            type="date"
            placeholder="选择日期"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
            @change="handleDateChange"
        />
        <el-button type="primary" @click="loadAllData" :loading="loading" style="margin-left: 12px;">
          加载数据
        </el-button>
      </div>
    </div>

    <div class="charts-grid">
      <EchartsLine
          :option="dayAheadPriceOption"
          title="日前价格"
          height="350px"
          color="#0098d9"
      />
      <EchartsLine
          :option="realTimePriceOption"
          title="实时价格"
          height="350px"
          color="#e6b600"
      />
      <EchartsLine
          :option="actualLoadOption"
          title="实际负荷"
          height="350px"
          color="#339ca8"
      />
      <EchartsLine
          :option="forecastLoadOption"
          title="预测负荷"
          height="350px"
          color="#c12e34"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import dayjs from 'dayjs';
import EchartsLine from '../components/EchartsLine.vue';
import {
  getPubNodeAvgPrice,
  getPubLoadReality,
  getPubLoadPrediction,
  PubNodeAvgPrice,
  PubLoadReality,
  PubLoadPrediction
} from '../api/dataApi';

// --- 新增：定义负荷类型 (参考 spot-admin-web 中的 loadType) ---

const loadTypes = [
  { name: "统调", value: "统调负荷" },
  { name: "西电", value: "西电东送电力" },
  { name: "B类", value: "省内B类电源" },
  { name: "A类", value: "省内A类电源" },
  { name: "地方电", value: "地方电源出力" },
  { name: "粤港联络线", value: "粤港联络线" }
];

const selectedLoadType = ref<string>("统调负荷"); // 默认选中统调
// ---------------------------------------------------------

const selectedDate = ref<string>(dayjs().format('YYYY-MM-DD'));
const loading = ref(false);

// 时间标签 - 24点
const timeLabels24 = Array.from({ length: 24 }, (_, i) => `${String(i).padStart(2, '0')}:00`);

// 图表数据
const dayAheadPriceData = ref<number[]>([]);
const realTimePriceData = ref<number[]>([]);
const actualLoadData = ref<number[]>([]);
const forecastLoadData = ref<number[]>([]);

// 图表配置
const dayAheadPriceOption = ref<any>({});
const realTimePriceOption = ref<any>({});
const actualLoadOption = ref<any>({});
const forecastLoadOption = ref<any>({});

// 处理日期变化
const handleDateChange = () => {
  loadAllData();
};

// 新增：处理负荷类型变化
const handleLoadTypeChange = () => {
  loadAllData();
};

// 创建价格图表配置
const createPriceOption = (data: number[], title: string) => {
  return {
    title: {
      text: title,
      left: 'center',
      textStyle: {
        fontSize: 14
      }
    },
    tooltip: {
      trigger: 'axis',
      formatter: '{b}<br/>{a}: {c} 元/MWh'
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: timeLabels24
    },
    yAxis: {
      type: 'value',
      name: '价格(元/MWh)'
    },
    series: [
      {
        name: title,
        type: 'line',
        smooth: true,
        data: data,
        itemStyle: {
          color: '#409EFF'
        },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(64, 158, 255, 0.3)' },
              { offset: 1, color: 'rgba(64, 158, 255, 0.05)' }
            ]
          }
        }
      }
    ]
  };
};

// 创建负荷图表配置
const createLoadOption = (data: number[], title: string) => {
  return {
    title: {
      text: title,
      left: 'center',
      textStyle: {
        fontSize: 14
      }
    },
    tooltip: {
      trigger: 'axis',
      formatter: '{b}<br/>{a}: {c} MW'
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: timeLabels24
    },
    yAxis: {
      type: 'value',
      name: '负荷(MW)'
    },
    series: [
      {
        name: title,
        type: 'line',
        smooth: true,
        data: data,
        itemStyle: {
          color: '#67C23A'
        },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(103, 194, 58, 0.3)' },
              { offset: 1, color: 'rgba(103, 194, 58, 0.05)' }
            ]
          }
        }
      }
    ]
  };
};

// 从price/load对象中提取24个整点数据
const extract24HourData = (dataObj: any): number[] => {
  if (!dataObj) return [];

  const result: number[] = [];
  for (let i = 0; i < 24; i++) {
    const timeKey = `${String(i).padStart(2, '0')}:00`;
    const value = dataObj[timeKey];
    result.push(value !== undefined ? Number(value) : 0);
  }
  return result;
};

// 加载所有数据
const loadAllData = async () => {
  if (!selectedDate.value) {
    return;
  }

  loading.value = true;

  try {
    // 并行加载四个数据源
    await Promise.all([
      loadDayAheadPrice(selectedDate.value),
      loadRealTimePrice(selectedDate.value),
      loadActualLoad(selectedDate.value, selectedLoadType.value), // 传入选中的类型
      loadForecastLoad(selectedDate.value, selectedLoadType.value) // 传入选中的类型
    ]);
  } catch (error) {
    console.error('加载数据失败:', error);
  } finally {
    loading.value = false;
  }
};

// 加载日前价格
const loadDayAheadPrice = async (date: string) => {
  try {
    const params: PubNodeAvgPrice = {
      day: date,
      type: 1,
      page: 1,
      pageSize: 1
    };

    const res = await getPubNodeAvgPrice(params);
    if (res && res.length > 0 && res[0].price) {
      const priceValues = extract24HourData(res[0].price);
      dayAheadPriceData.value = priceValues;
      dayAheadPriceOption.value = createPriceOption(priceValues, '日前价格');
    } else {
      dayAheadPriceData.value = [];
      dayAheadPriceOption.value = {};
    }
  } catch (error) {
    console.error('加载日前价格失败:', error);
    dayAheadPriceData.value = [];
    dayAheadPriceOption.value = {};
  }
};

// 加载实时价格
const loadRealTimePrice = async (date: string) => {
  try {
    const params: PubNodeAvgPrice = {
      day: date,
      type: 2,
      page: 1,
      pageSize: 1
    };

    const res = await getPubNodeAvgPrice(params);
    if (res && res.length > 0 && res[0].price) {
      const priceValues = extract24HourData(res[0].price);
      realTimePriceData.value = priceValues;
      realTimePriceOption.value = createPriceOption(priceValues, '实时价格');
    } else {
      realTimePriceData.value = [];
      realTimePriceOption.value = {};
    }
  } catch (error) {
    console.error('加载实时价格失败:', error);
    realTimePriceData.value = [];
    realTimePriceOption.value = {};
  }
};

// 修改：加载实际负荷，增加 name 参数
const loadActualLoad = async (date: string, loadName: string) => {
  try {
    const params: PubLoadReality = {
      day: date,
      name: loadName, // 使用动态传入的 name
      page: 1,
      pageSize: 1
    };

    const res = await getPubLoadReality(params);
    if (res && res.length > 0 && res[0].load) {
      const loadValues = extract24HourData(res[0].load);
      actualLoadData.value = loadValues;
      // 标题也可以动态化，例如：`${loadTypes.find(t=>t.value===loadName)?.name || ''}实际负荷`
      actualLoadOption.value = createLoadOption(loadValues, `${getLoadDisplayName(loadName)}实际负荷`);
    } else {
      actualLoadData.value = [];
      actualLoadOption.value = {};
    }
  } catch (error) {
    console.error('加载实际负荷失败:', error);
    actualLoadData.value = [];
    actualLoadOption.value = {};
  }
};

// 修改：加载预测负荷，增加 name 参数
const loadForecastLoad = async (date: string, loadName: string) => {
  try {
    const params: PubLoadPrediction = {
      day: date,
      name: loadName, // 使用动态传入的 name
      page: 1,
      pageSize: 1
    };

    const res = await getPubLoadPrediction(params);
    if (res && res.length > 0 && res[0].load) {
      const loadValues = extract24HourData(res[0].load);
      forecastLoadData.value = loadValues;
      forecastLoadOption.value = createLoadOption(loadValues, `${getLoadDisplayName(loadName)}预测负荷`);
    } else {
      forecastLoadData.value = [];
      forecastLoadOption.value = {};
    }
  } catch (error) {
    console.error('加载预测负荷失败:', error);
    forecastLoadData.value = [];
    forecastLoadOption.value = {};
  }
};

// 辅助函数：根据 value 获取显示名称
const getLoadDisplayName = (value: string) => {
  const type = loadTypes.find(t => t.value === value);
  return type ? type.name : '';
};

onMounted(() => {
  loadAllData();
});
</script>

<style scoped>
.cockpit-container {
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

.date-selector {
  display: flex;
  align-items: center;
}

.charts-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 24px;
}

.chart-card {
  min-height: 400px;
}

.card-header {
  display: flex;
  justify-content: center;
  align-items: center;
  font-weight: bold;
  font-size: 16px;
}

/* ========== H5 适配 ========== */
@media (max-width: 768px) {
  .page-title {
    font-size: 18px;
  }

  /* 头部筛选换行排列 */
  .page-header {
    flex-direction: column;
    align-items: stretch;
    gap: 12px;
  }

  .date-selector {
    flex-wrap: wrap;
    gap: 8px;
  }

  .date-selector :deep(.el-select),
  .date-selector :deep(.el-date-editor) {
    width: 100% !important;
    margin-right: 0 !important;
  }

  /* 图表单列 */
  .charts-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }

  .chart-card {
    min-height: 300px;
  }
}
</style>
