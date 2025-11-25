import request from '@/utils/request'

// 查询部门列表
export function listDept(query) {
  return request({
    url: '/system/dept/list',
    method: 'get',
    params: query
  })
}
// 根据id查班级名称
export function listDepts(deptIds) {
  // 手动构建URL参数，将数组转换为多个同名参数：deptIds=1&deptIds=2&deptIds=3
  let url = '/system/teacher/deptName'
  if (Array.isArray(deptIds) && deptIds.length > 0) {
    // 确保ID是数字类型，转换为字符串后再编码
    const params = deptIds.map(id => {
      const numId = Number(id)
      return `deptIds=${encodeURIComponent(numId)}`
    }).join('&')
    url += '?' + params
  } else if (deptIds && typeof deptIds === 'object' && deptIds.deptId) {
    // 兼容对象格式：{ deptId: [1, 2, 3] } 或 { deptId: 1 }
    const ids = Array.isArray(deptIds.deptId) ? deptIds.deptId : [deptIds.deptId]
    if (ids.length > 0) {
      const params = ids.map(id => {
        const numId = Number(id)
        return `deptIds=${encodeURIComponent(numId)}`
      }).join('&')
      url += '?' + params
    }
  }

  return request({
    url: url,
    method: 'post', // 后端是 @PostMapping
    params: {} // 空对象，因为参数已经在URL中了
  })
}

// 查询部门列表（排除节点）
export function listDeptExcludeChild(deptId) {
  return request({
    url: '/system/dept/list/exclude/' + deptId,
    method: 'get'
  })
}

// 查询部门详细
export function getDept(deptId) {
  return request({
    url: '/system/dept/' + deptId,
    method: 'get'
  })
}

// 新增部门
export function addDept(data) {
  return request({
    url: '/system/dept',
    method: 'post',
    data: data
  })
}

// 修改部门
export function updateDept(data) {
  return request({
    url: '/system/dept',
    method: 'put',
    data: data
  })
}

// 删除部门
export function delDept(deptId) {
  return request({
    url: '/system/dept/' + deptId,
    method: 'delete'
  })
}

// 查看所在班级
export function getClassList() {
  return request({
    url: '/system/class/list',
    method: 'get'
  })
}

// 添加班级
export function addClass(data) {
  return request({
    url: '/system/class',
    method: 'post',
    data: data
  })
}

// 删除班级
export function removeClass(id) {
  return request({
    url: '/system/class/remove',
    method: 'delete',
    params: { id }
  })
}
