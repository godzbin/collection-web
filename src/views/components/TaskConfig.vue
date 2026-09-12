<template>
  <el-dialog title="任务配置" v-model="showVisible" width="700px" @close="handleClose">
    <el-table :data="list" row-key="id" border default-expand-all :height="400">
      <el-table-column prop="dataType" label="数据类型"></el-table-column>
      <el-table-column prop="day" label="需导入日期（D为当天）">
        <template #default="scope">
          <div v-if="scope.row.importUri">
            <el-input v-model.number="scope.row.day" style="width: 160px">
              <template #prepend>D -</template>
              <template #append>日</template>
            </el-input>
          </div>
          <div v-else></div>
        </template>
      </el-table-column>
    </el-table>
    <template #footer>
      <div>
        <el-button :loading="saveLoading" type="primary" @click="handleSave"
        >
          保存
        </el-button>
        <el-button @click="handleClose">关闭</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import {getDayLoadConfigList, saveDayLoadConfig} from '../../api/dataManagement'
import {ElMessage} from 'element-plus'
import {ref} from 'vue'
const showVisible = ref(false)
const emit = defineEmits(['close', 'save'])
const list = ref<any[]>([])
const saveLoading = ref(false)
const show = () => {
  showVisible.value = true
  getData()
}
const getData = async () => {
  list.value = await getDayLoadConfigList()
}
defineExpose({
  show
})
const handleClose = () => {
  showVisible.value = false
  emit('close')
}
const handleSave = async () => {
  saveLoading.value = true
  try {
    const data = list.value.reduce((acc: any, cur: any) => {
      if (cur.importUri) {
        acc.push({
          ...cur
        })
      }
      cur.children?.forEach((item: any) => {
        if (item.importUri) {
          acc.push({
            ...item
          })
        }
      })
      return acc
    }, [])
    await saveDayLoadConfig(data)
    handleClose()
    ElMessage.success('保存成功')
    emit('save')
  } catch (error) {
  }
  saveLoading.value = false
}
</script>

<style scoped></style>
