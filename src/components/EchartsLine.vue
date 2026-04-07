<template>
  <div class="chart-container">
    <v-chart
        class="chart"
        :option="mergedOption"
        :style="{ width: '100%', height: typeof height === 'number' ? height + 'px' : height || '350px'}"
    />
<!--    <el-empty v-else></el-empty>-->
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
  option?: any;       // ECharts 配置项
  height?: number | string;  // 图表高度
  title?: string;     // 图表标题
  color?: string;     // 主题颜色
}

const props = withDefaults(defineProps<Props>(), {
  option: () => ({}),
  height: '350px',
  title: '',
  color: '#409EFF'
})

// 将 hex 或 rgb 颜色转换为 rgba
const hexToRgba = (hex: string, alpha: number): string => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

// 合并配置项，如果传入了 title 则添加到 option 中
const mergedOption = computed(() => {
  const baseOption = JSON.parse(JSON.stringify(props.option || {}));

  // 如果传入了 title 且 option 中没有 title，则添加 title
  if (props.title && !baseOption.title) {
    baseOption.title = {
      text: props.title,
      textStyle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1e293b'
      },
      left: 'center',
      top: 0
    };
  }

  // 如果传入了 color，更新 series 中的颜色
  if (props.color && baseOption.series && baseOption.series.length > 0) {
    baseOption.series.forEach((series: any) => {
      if (series.type === 'line') {
        // 设置线条颜色
        series.itemStyle = {
          ...series.itemStyle,
          color: props.color
        };

        // 设置渐变区域颜色
        if (series.areaStyle) {
          series.areaStyle.color = {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: hexToRgba(props.color, 0.3) },
              { offset: 1, color: hexToRgba(props.color, 0.05) }
            ]
          };
        }
      }
    });
  }

  return baseOption;
});
</script>

<style scoped>
.chart-container {
  /* background: white; 白色背景 */
  border-radius: 12px;
  background: #fff;
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
