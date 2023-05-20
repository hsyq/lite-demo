<script setup>
import { ref } from 'vue';
import axios from 'axios'

const fileRef = ref()

const imgUrl = ref('')

// 获取上传签名
const getOssData = async () => {
  const res = await axios.get('http://kunwu.tech:3000/oss/signature')
  console.log('OSS 签名接口数据', res.data)
  return res.data
}

// 生成文件名，作为 key 使用
const generateFileName = (ossData, file) => {
  const suffix = file.name.slice(file.name.lastIndexOf('.'));
  const filename = Date.now() + suffix;
  return ossData.dir + filename;
}


// 使用Policy和签名上传图片到 OSS
const handleUpload = async () => {
  const file = fileRef.value.files[0]

  if(!file) {
    alert('请选择文件')
  }

  const ossData = await getOssData()

  const key = generateFileName(ossData, file)

  const formdata = new FormData()
 
  // 注意参数的顺序，key 必须是第一位，表示OSS存储文件的路径
  formdata.append('key', key)
  formdata.append('OSSAccessKeyId', ossData.accessId)
  formdata.append('policy', ossData.policy)
  formdata.append('signature', ossData.signature)
  // 设置回调信息
  formdata.append('callback', ossData.callback)
  // 文件上传成功默认返回 204 状态码，可根据需要修改为 200
  // formdata.append('success_action_status', '200')
  // file 必须放在最后一位
  formdata.append('file', file)
  
  const res = await axios.post(ossData.host, formdata);
  if(res.status === 200) {
    alert('文件上传成功')
    // 前端拼接文件地址
    imgUrl.value = ossData.host + '/' + key
  }
}

</script>

<template>
  <div>
    <input type="file" ref="fileRef">
    <br>
    <button @click="handleUpload">上传</button>
    <br>
    <img :src="imgUrl" v-if="imgUrl" style="width: 300px;">
  </div>
</template>

<style scoped>

</style>
