<template>
  <div class="chart-container">
    <canvas ref="chartCanvas" :width="width" :height="height"></canvas>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'

interface Props {
  data: number[]; // 成功率数据数组
  labels: string[]; // X轴标签
  width?: number;
  height?: number;
  title?: string;
}

const props = withDefaults(defineProps<Props>(), {
  width: 400,
  height: 200,
  title: '运行成功率'
})

const chartCanvas = ref<HTMLCanvasElement>()
let chart: any = null

// 初始化图表
const initChart = () => {
  if (!chartCanvas.value) return
  
  const ctx = chartCanvas.value.getContext('2d')
  if (!ctx) return

  // 清空画布
  ctx.clearRect(0, 0, props.width, props.height)
  
  // 绘制标题
  ctx.fillStyle = '#333'
  ctx.font = '14px Arial'
  ctx.fillText(props.title, 10, 20)
  
  // 绘制网格
  drawGrid(ctx)
  
  // 绘制数据线
  drawLine(ctx)
  
  // 绘制数据点
  drawPoints(ctx)
}

// 绘制网格
const drawGrid = (ctx: CanvasRenderingContext2D) => {
  ctx.strokeStyle = '#e2e8f0'
  ctx.lineWidth = 1
  
  // 水平线
  for (let i = 0; i <= 5; i++) {
    const y = 40 + i * 30
    ctx.beginPath()
    ctx.moveTo(40, y)
    ctx.lineTo(props.width - 20, y)
    ctx.stroke()
    
    // 标签
    ctx.fillStyle = '#64748b'
    ctx.font = '12px Arial'
    ctx.textAlign = 'right'
    ctx.fillText(`${100 - i * 20}%`, 35, y + 4)
  }
  
  // 垂直线
  const step = (props.width - 60) / (props.data.length - 1)
  for (let i = 0; i < props.data.length; i++) {
    const x = 40 + i * step
    ctx.beginPath()
    ctx.moveTo(x, 40)
    ctx.lineTo(x, props.height - 20)
    ctx.stroke()
    
    // X轴标签
    ctx.fillStyle = '#64748b'
    ctx.font = '12px Arial'
    ctx.textAlign = 'center'
    ctx.fillText(props.labels[i] || '', x, props.height - 5)
  }
}

// 绘制数据线
const drawLine = (ctx: CanvasRenderingContext2D) => {
  if (props.data.length < 2) return
  
  ctx.strokeStyle = '#10b981'
  ctx.lineWidth = 2
  ctx.beginPath()
  
  const step = (props.width - 60) / (props.data.length - 1)
  
  for (let i = 0; i < props.data.length; i++) {
    const x = 40 + i * step
    const y = 40 + (100 - props.data[i]) * 0.3 // 0-100% 映射到 40-190px
    
    if (i === 0) {
      ctx.moveTo(x, y)
    } else {
      ctx.lineTo(x, y)
    }
  }
  
  ctx.stroke()
}

// 绘制数据点
const drawPoints = (ctx: CanvasRenderingContext2D) => {
  const step = (props.width - 60) / (props.data.length - 1)
  
  for (let i = 0; i < props.data.length; i++) {
    const x = 40 + i * step
    const y = 40 + (100 - props.data[i]) * 0.3
    
    // 绘制圆点
    ctx.fillStyle = '#10b981'
    ctx.beginPath()
    ctx.arc(x, y, 4, 0, 2 * Math.PI)
    ctx.fill()
    
    // 显示数值
    ctx.fillStyle = '#333'
    ctx.font = '12px Arial'
    ctx.textAlign = 'center'
    ctx.fillText(`${props.data[i]}%`, x, y - 10)
  }
}

// 监听数据变化
watch(() => props.data, () => {
  initChart()
}, { deep: true })

onMounted(() => {
  initChart()
})

onUnmounted(() => {
  if (chart) {
    chart.destroy()
  }
})
</script>

<style scoped>
.chart-container {
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.18);
  box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.37);
  padding: 20px;
	width: 100%;
  color: #333;
}

.chart-container canvas {
  display: block;
}
</style>