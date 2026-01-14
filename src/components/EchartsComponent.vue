<template>
  <div class="chart-container">
    <v-chart 
      class="chart" 
      :option="chartOption" 
      :style="{ width: width ? width + 'px' : '100%', height: height ? height + 'px' : '500px'}"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import VChart from 'vue-echarts'
import { use } from 'echarts/core'
import { LineChart } from 'echarts/charts'
import { 
  TitleComponent, 
  TooltipComponent, 
  GridComponent, 
  DatasetComponent 
} from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'

// 注册 ECharts 必需的组件
use([
  LineChart,
  TitleComponent,
  TooltipComponent,
  GridComponent,
  DatasetComponent,
  CanvasRenderer
])

interface Props {
  data: number[];     // 成功率数据数组
  labels: string[];   // X轴标签
  width?: number;     // 图表宽度
  height?: number;    // 图表高度
  title?: string;     // 图表标题
  lineColor?: string; // 折线颜色
}

const props = withDefaults(defineProps<Props>(), {
  // width: '100%',
  // height: '100%',
  title: '运行成功率',
  lineColor: '#10b981'
})

// 计算图表配置选项
const chartOption = computed(() => ({
  title: {
    text: props.title,
    textStyle: {
      fontSize: 16,
      fontWeight: 'bold',
      color: '#1e293b' // 深色标题
    },
    left: 'left',
    top: 0
  },
  tooltip: {
    trigger: 'axis',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderColor: '#e2e8f0',
    textStyle: {
      color: '#1e293b'
    },
    formatter: '{b}<br />{a}: {c}%'
  },
  grid: {
    left: '5%',
    right: '5%',
    bottom: '15%',
    top: '15%',
    containLabel: true
  },
  xAxis: {
    type: 'category',
    boundaryGap: false,
    data: props.labels,
    axisLine: {
      lineStyle: {
        color: '#cbd5e1' // 浅灰色坐标轴
      }
    },
    axisLabel: {
      color: '#64748b', // 深灰色标签
      fontSize: 12
    }
  },
  yAxis: {
    type: 'value',
    min: 0,
    max: 100,
    axisLine: {
      lineStyle: {
        color: '#cbd5e1' // 浅灰色坐标轴
      }
    },
    splitLine: {
      lineStyle: {
        color: '#e2e8f0' // 浅灰色分割线
      }
    },
    axisLabel: {
      color: '#64748b', // 深灰色标签
      fontSize: 12,
      formatter: '{value}%'
    }
  },
  series: [
    {
      name: '成功率',
      type: 'line',
      smooth: true,
      symbolSize: 8,
      itemStyle: {
        color: props.lineColor
      },
      lineStyle: {
        color: props.lineColor,
        width: 3
      },
      areaStyle: {
        color: {
          type: 'linear',
          x: 0,
          y: 0,
          x2: 0,
          y2: 1,
          colorStops: [
            {
              offset: 0,
              color: props.lineColor + '40' // 40 是透明度 (64 in hex = 40% alpha)
            },
            {
              offset: 1,
              color: props.lineColor + '00' // 00 是完全透明
            }
          ]
        }
      },
      data: props.data,
      emphasis: {
        focus: 'series'
      }
    }
  ],
  backgroundColor: 'transparent' // 透明背景
}))
</script>

<style scoped>
.chart-container {
  /* background: white; 白色背景 */
  border-radius: 12px;
  border: 1px solid #e2e8f0; /* 浅灰色边框 */
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05); /* 柔和阴影 */
  padding: 20px;
  /* display: flex; */
  align-items: center;
  justify-content: center;
  height: 100%;
	width: 100%;
}

.chart {
  width: 100%;
  height: 100%;
}
</style>