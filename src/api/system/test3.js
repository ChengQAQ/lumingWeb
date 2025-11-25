import request from '@/utils/request'

// monkeyocr 文件上传（doc/docx/pdf）
export function uploadMonkeyOcr(formData) {
  return request({
    url: '/system/ocr/ocr01',
    method: 'post',
    data: formData,
    // 文件上传需指定Content-Type为multipart/form-data（request封装中若未默认配置，可在此单独设置）
    headers: { 'Content-Type': 'multipart/form-data' }
  })
}

// md2json 文件上传（md）
export function uploadMd2Json(formData) {
  return request({
    url: '/system/ocr/ocr02',
    method: 'post',
    data: formData,
    headers: { 'Content-Type': 'multipart/form-data' }
  })
}

// ocr2json 文件上传
export function uploadOcr2Json(formData) {
  return request({
    url: '/system/ocr/ocr03',
    method: 'post',
    data: formData,
    headers: { 'Content-Type': 'multipart/form-data' }
  })
}

// ocr05自动标注（doc/docx/pdf + subject_id）
export function uploadOcr05(formData) {
  return request({
    url: '/system/ocr/ocr05',
    method: 'post',
    data: formData,
    headers: { 'Content-Type': 'multipart/form-data' }
  })
}

// 上传json文件执行自动标注（json + subject_id）
export function uploadOcr04(formData) {
  return request({
    url: '/system/ocr/ocr04',
    method: 'post',
    data: formData,
    headers: { 'Content-Type': 'multipart/form-data' }
  })
}



