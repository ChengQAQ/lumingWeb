<template>
  <div class="app-container card">
    <el-tree
      ref="tree"
      :data="treeData"
      :props="treeProps"
      node-key="value"
      highlight-current
      :default-expanded-keys="expandedKeys"
      style="width: 100%;"
      :render-content="renderContent"
      class="custom-tree"
    />
    <el-dialog :title="dialogTitle" :visible.sync="dialogVisible" width="1220px" class="custom-dialog dialog-center">
      <el-form :model="form" label-width="100px" class="custom-form">
        <el-form-item v-if="dialogType==='delete'" label="路径" class="wide-path-item">
          <el-cascader
            v-model="form.pathArr"
            :options="allOptions"
            :props="{ label: 'label', value: 'value', children: 'children', checkStrictly: true, disabled: true }"
            clearable
            placeholder="请选择路径"
            disabled
            class="wide-cascader"
          />
        </el-form-item>
        <el-form-item v-if="dialogType==='delete'" label="表名">
          <el-input v-model="form.table_name" placeholder="请输入表名" class="wide-cascader" />
        </el-form-item>
        <el-form-item v-if="dialogType!=='delete'" label="路径" class="wide-path-item">
          <el-cascader
            v-model="form.pathArr"
            :options="allOptions"
            :props="{ label: 'label', value: 'value', children: 'children', checkStrictly: true, disabled: true }"
            clearable
            placeholder="请选择路径"
            @change="handlePathChange"
            disabled
            class="wide-cascader"
          />
        </el-form-item>
        <el-form-item v-if="dialogType==='add'" label="是否叶子节点">
          <el-switch v-model="form.is_leaf" active-text="是" inactive-text="否" class="wide-cascader" />
        </el-form-item>
        <el-form-item v-if="dialogType!=='delete'" label="表名">
          <el-input v-model="form.table_name" placeholder="请输入表名" class="wide-cascader" />
        </el-form-item>
        <el-form-item v-if="dialogType==='edit'" label="新路径" class="wide-path-item">
          <el-cascader
            v-model="form.newPathArr"
            :options="allOptions"
            :props="{ label: 'label', value: 'value', children: 'children', checkStrictly: true }"
            clearable
            placeholder="请选择新路径"
            @change="handleNewPathChange"
            class="wide-cascader"
          />
        </el-form-item>
        <el-form-item v-if="dialogType!=='delete'" label="节点名称" prop="nodeName" required>
          <el-input v-model="form.nodeName" placeholder="请输入节点名称" class="wide-cascader" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer center-btns">
        <el-button @click="dialogVisible=false">取消</el-button>
        <el-button type="primary" @click="handleSubmit">确定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { chaptermap, addDirectoryToChaptermap, deleteDirectoryToChaptermap, updateDirectoryPathToChaptermap } from '@/api/system/tree'

export default {
  name: 'ChaptermapTree',
  data() {
    return {
      treeData: [],
      treeProps: {
        label: 'label',
        children: 'children'
      },
      allOptions: [],
      expandedKeys: [],
      dialogVisible: false,
      dialogType: '',
      dialogTitle: '',
      form: {
        path: '',
        pathArr: [],
        is_leaf: false,
        table_name: 'chapter_map',
        new_path: '',
        nodeName: ''
      },
      currentNode: null
    }
  },
  created() {
    this.loadTreeData()
    this.loadAllOptions()
  },
  methods: {
    // 保存当前展开的节点
    saveExpandedKeys() {
      if (this.$refs.tree) {
        this.expandedKeys = this.$refs.tree.store.getCheckedKeys()
          .concat(this.$refs.tree.store.halfCheckedKeys || [])
        // 获取所有展开的节点
        const expandedNodes = []
        const traverse = (node) => {
          if (node.expanded) {
            expandedNodes.push(node.key)
          }
          if (node.childNodes && node.childNodes.length > 0) {
            node.childNodes.forEach(child => traverse(child))
          }
        }
        if (this.$refs.tree.store && this.$refs.tree.store.root) {
          this.$refs.tree.store.root.childNodes.forEach(node => traverse(node))
        }
        this.expandedKeys = expandedNodes
      }
    },
    loadTreeData() {
      // 保存当前展开状态
      this.saveExpandedKeys()
      chaptermap({}).then(res => {
        this.treeData = res.data
      })
    },
    loadAllOptions() {
      chaptermap({}).then(res => {
        // 转换树结构为 el-cascader 可用格式
        this.allOptions = this.transformTreeToCascader(res.data)
      })
    },
    transformTreeToCascader(tree) {
      // 递归转换树结构，保证 value 为单层字符串，children 为数组
      return (tree || []).map(node => {
        const item = {
          label: node.label,
          value: node.value && typeof node.value === 'string' ? node.value.split('/').pop() : node.label,
          children: node.children ? this.transformTreeToCascader(node.children) : undefined
        }
        if (!item.children || item.children.length === 0) {
          delete item.children
        }
        return item
      })
    },
    handlePathChange(val) {
      this.form.path = val.join('/')
    },
    handleNewPathChange(val) {
      this.form.newPathArr = val
      this.form.new_path = val.join('/')
    },
    renderContent(h, { node, data }) {
      // 判断层级，所有层级都显示操作按钮
      const level = (data.value || '').split('/').length
      return h('span', {
        style: {
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          width: '100%'
        }
      }, [
        h('span', data.label),
        h('span', {
          style: {
            display: 'flex',
            alignItems: 'center',
            gap: '2px',
            marginLeft: 'auto'
          }
        }, [
          h('el-tooltip', { props: { content: '新增', placement: 'top' } }, [
            h('el-button', {
              props: { type: 'primary', icon: 'el-icon-plus', size: 'mini' },
              class: 'op-btn add-btn',
              style: { borderRadius: '4px', padding: '2px 4px', minWidth: '24px', height: '24px' },
              on: {
                click: (event) => { event.stopPropagation(); this.openDialog('add', data) }
              }
            })
          ]),
          h('el-tooltip', { props: { content: '修改', placement: 'top' } }, [
            h('el-button', {
              props: { type: 'warning', icon: 'el-icon-edit', size: 'mini' },
              class: 'op-btn edit-btn',
              style: { borderRadius: '4px', padding: '2px 4px', minWidth: '24px', height: '24px' },
              on: {
                click: (event) => { event.stopPropagation(); this.openDialog('edit', data) }
              }
            })
          ]),
          h('el-tooltip', { props: { content: '删除', placement: 'top' } }, [
            h('el-button', {
              props: { type: 'danger', icon: 'el-icon-delete', size: 'mini' },
              class: 'op-btn delete-btn',
              style: { borderRadius: '4px', padding: '2px 4px', minWidth: '24px', height: '24px' },
              on: {
                click: (event) => { event.stopPropagation(); this.openDialog('delete', data) }
              }
            })
          ])
        ])
      ])
    },
    openDialog(type, data) {
      this.dialogType = type
      this.dialogVisible = true
      this.currentNode = data
      let pathArr = []
      if (data.value) {
        pathArr = String(data.value).split('/')
      }
      
      // 根据层级判断节点类型
      const level = (data.value || '').split('/').length
      let nodeType = ''
      if (level === 1) {
        nodeType = '学科'
      } else if (level === 2) {
        nodeType = '章节'
      } else {
        nodeType = '子章节'
      }
      
      this.form = {
        path: data.value || '',
        pathArr: pathArr,
        is_leaf: false,
        table_name: 'chapter_map',
        new_path: '',
        newPathArr: pathArr,
        nodeName: ''
      }
      
      if (type === 'add') {
        this.dialogTitle = `新增${nodeType}`
        this.form.path = data.value || ''
        this.form.pathArr = pathArr
      } else if (type === 'edit') {
        this.dialogTitle = `修改${nodeType}`
        this.form.old_path = data.value || ''
        this.form.pathArr = pathArr
        this.form.newPathArr = pathArr
      } else if (type === 'delete') {
        this.dialogTitle = `删除${nodeType}`
        this.form.pathArr = pathArr
        this.form.path = data.value || ''
        this.form.table_name = 'chapter_map'
      }
    },
    handleSubmit() {
      if (this.dialogType === 'add') {
        // 新增时路径和节点名称拼接
        const fullPath = this.form.path ? this.form.path + '/' + this.form.nodeName : this.form.nodeName
        addDirectoryToChaptermap({
          path: fullPath,
          is_leaf: this.form.is_leaf,
          table_name: this.form.table_name
        }).then(() => {
          this.$message.success('新增成功')
          this.dialogVisible = false
          this.loadTreeData()
        })
      } else if (this.dialogType === 'edit') {
        // 修改时新路径和节点名称拼接
        const newFullPath = this.form.new_path ? this.form.new_path + '/' + this.form.nodeName : this.form.nodeName
        updateDirectoryPathToChaptermap({
          old_path: this.form.path,
          new_path: newFullPath,
          table_name: this.form.table_name
        }).then(() => {
          this.$message.success('修改成功')
          this.dialogVisible = false
          this.loadTreeData()
        })
      } else if (this.dialogType === 'delete') {
        // 按后端要求，path_or_id作为query参数传递
        deleteDirectoryToChaptermap({
          path_or_id: this.form.path,
          table_name: this.form.table_name
        }).then(() => {
          this.$message.success('删除成功')
          this.dialogVisible = false
          this.loadTreeData()
        })
      }
    }
  }
}
</script>

<style scoped>
.app-container.card {
  padding: 32px;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.08);
  max-width: 900px;
  margin: 32px auto;
}
.custom-tree {
  font-size: 16px;
}
.custom-tree .el-tree-node__content {
  border-radius: 6px;
  transition: background 0.2s;
  padding: 4px 8px;
}
.custom-tree .el-tree-node__content:hover {
  background: #f5f7fa;
}
.custom-tree .el-button {
  margin-left: 4px;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 13px;
  transition: box-shadow 0.2s;
}
.custom-dialog >>> .el-dialog__header {
  background: #f5f7fa;
  border-radius: 12px 12px 0 0;
}
.custom-dialog >>> .el-dialog__body {
  padding: 24px 16px 8px 16px;
}
.custom-form .el-form-item {
  margin-bottom: 18px;
}
.custom-form .el-form-item .wide-cascader {
  width: 420px !important;
  max-width: 100%;
}
.wide-path-item .wide-cascader,
.custom-form .wide-cascader {
  width: 1070px !important;
  min-width: 1070px !important;
  max-width: 100%;
  box-sizing: border-box;
}
.dialog-center {
  top: 50% !important;
  left: 50% !important;
  transform: translate(-50%, -50%) !important;
  margin: 0 !important;
}
.custom-dialog {
  width: 1220px !important;
}
.center-btns {
  text-align: center;
  padding-bottom: 8px;
}
.dialog-footer .el-button {
  min-width: 80px;
}
.op-btn {
  margin-left: 2px;
  box-shadow: none;
  transition: box-shadow 0.2s, background 0.2s;
  border-radius: 4px !important;
  min-width: 24px !important;
  height: 24px !important;
  padding: 2px 4px !important;
}
.add-btn {
  background: #ecf5ff;
  color: #409eff;
}
.add-btn:hover {
  background: #409eff;
  color: #fff;
  box-shadow: 0 2px 8px rgba(64,158,255,0.15);
}
.edit-btn {
  background: #fff7e6;
  color: #e6a23c;
}
.edit-btn:hover {
  background: #e6a23c;
  color: #fff;
  box-shadow: 0 2px 8px rgba(230,162,60,0.15);
}
.delete-btn {
  background: #fef0f0;
  color: #f56c6c;
}
.delete-btn:hover {
  background: #f56c6c;
  color: #fff;
  box-shadow: 0 2px 8px rgba(245,108,108,0.15);
}
</style>
