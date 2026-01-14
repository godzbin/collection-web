<template>
	<div class="glass-container">
		<slot></slot>
	</div>
</template>

<script setup lang="ts">

</script>

<style scoped>
.glass-container {
  position: relative;
  /* margin: 50px; */
  padding: 30px;
  background: rgba(255, 255, 255, 0.15); /* 半透明白色背景 */
  backdrop-filter: blur(12px); /* 毛玻璃效果 */
  -webkit-backdrop-filter: blur(12px); /* Safari 兼容 */
  border-radius: 10px; /* 圆角 */
  border: 1px solid rgba(0, 0, 0, 0.1); /* 边框 */
  box-shadow: 0 4px 4px 0 rgba(31, 38, 135, 0.37); /* 阴影 */
  color: #333; /* 文字颜色 */
  z-index: 10; /* 确保在背景之上 */
}
</style>