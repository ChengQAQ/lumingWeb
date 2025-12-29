<!--保存初始页面=========================================================================-->
<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" size="small" :inline="true" v-show="showSearch">
      <el-form-item label="班级名称" prop="deptName">
        <el-input
          v-model="queryParams.deptName"
          placeholder="请输入班级名称"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-select v-model="queryParams.status" placeholder="班级状态" clearable>
          <el-option
            v-for="dict in dict.type.sys_normal_disable"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
          type="primary"
          plain
          icon="el-icon-plus"
          size="mini"
          @click="handleAdd"
          v-hasPermi="['system:dept:add']"
        >新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="info"
          plain
          icon="el-icon-sort"
          size="mini"
          @click="toggleExpandAll"
        >展开/折叠</el-button>
      </el-col>
<!--      <el-col :span="1.5">-->
<!--        <el-button-->
<!--          type="success"-->
<!--          plain-->
<!--          icon="el-icon-view"-->
<!--          size="mini"-->
<!--          @click="handleViewClass"-->
<!--        >查看所在班级</el-button>-->
<!--      </el-col>-->
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table
      v-if="refreshTable"
      v-loading="loading"
      :data="deptList"
      row-key="deptId"
      :default-expand-all="isExpandAll"
      :tree-props="{children: 'children', hasChildren: 'hasChildren'}"
    >
      <el-table-column prop="deptName" label="班级名称" width="260"></el-table-column>
      <el-table-column prop="orderNum" label="排序" width="200"></el-table-column>
      <el-table-column prop="status" label="状态" width="100">
        <template slot-scope="scope">
          <dict-tag :options="dict.type.sys_normal_disable" :value="scope.row.status"/>
        </template>
      </el-table-column>
      <el-table-column label="创建时间" align="center" prop="createTime" width="200">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.createTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button
            size="mini"
            type="text"
            icon="el-icon-edit"
            @click="handleUpdate(scope.row)"
            v-hasPermi="['system:dept:edit']"
          >修改</el-button>
          <el-button
            size="mini"
            type="text"
            icon="el-icon-plus"
            @click="handleAdd(scope.row)"
            v-hasPermi="['system:dept:add']"
          >新增</el-button>
          <el-button
            v-if="scope.row.parentId != 0"
            size="mini"
            type="text"
            icon="el-icon-delete"
            @click="handleDelete(scope.row)"
            v-hasPermi="['system:dept:remove']"
          >删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 添加或修改班级对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="600px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="80px">
        <el-row>
          <el-col :span="24" v-if="form.parentId !== 0">
            <el-form-item label="上级班级" prop="parentId">
              <treeselect v-model="form.parentId" :options="deptOptions" :normalizer="normalizer" placeholder="选择上级班级" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="班级名称" prop="deptName">
              <el-input v-model="form.deptName" placeholder="请输入班级名称" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="显示排序" prop="orderNum">
              <el-input-number v-model="form.orderNum" controls-position="right" :min="0" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item :label="isClassNode ? '班主任' : '负责人'" prop="leader">
              <el-select
                v-model="form.leader"
                :placeholder="isClassNode ? '请选择班主任' : '请选择负责人'"
                clearable
                filterable
                style="width: 100%"
              >
                <el-option
                  v-for="teacher in teacherList"
                  :key="teacher.userId"
                  :label="teacher.nickName"
                  :value="teacher.userId"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="联系电话" prop="phone">
              <el-input v-model="form.phone" placeholder="请输入联系电话" maxlength="11" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="邮箱" prop="email">
              <el-input v-model="form.email" placeholder="请输入邮箱" maxlength="50" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="班级状态">
              <el-radio-group v-model="form.status">
                <el-radio
                  v-for="dict in dict.type.sys_normal_disable"
                  :key="dict.value"
                  :label="dict.value"
                >{{dict.label}}</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="cancel">取 消</el-button>
      </div>
    </el-dialog>

    <!-- 查看所在班级对话框 -->
    <el-dialog
      title="所在班级信息"
      :visible.sync="classDialogVisible"
      width="600px"
      append-to-body
      custom-class="class-info-dialog"
      :close-on-click-modal="false"
    >
      <div class="class-info-content">
        <div class="class-count-info">
          <el-tag type="info" size="medium">
            <i class="el-icon-school"></i>
            共 {{ classList.length }} 个班级
          </el-tag>
        </div>

        <el-table
          v-loading="classLoading"
          :data="classList"
          style="width: 100%"
          class="class-table"
          :header-cell-style="{ background: '#f5f7fa', color: '#606266' }"
          :row-class-name="tableRowClassName"
        >
          <el-table-column prop="className" label="班级名称" min-width="200">
            <template slot-scope="scope">
              <div class="class-name-cell">
                <i class="el-icon-office-building"></i>
                <span class="class-name">{{ scope.row.className }}</span>
              </div>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="120" align="center">
            <template slot-scope="scope">
              <el-button
                size="mini"
                type="danger"
                icon="el-icon-delete"
                @click="handleRemoveClass(scope.row.id)"
                class="delete-btn"
                round
              >删除</el-button>
            </template>
          </el-table-column>
        </el-table>

        <div v-if="classList.length === 0 && !classLoading" class="empty-state">
          <i class="el-icon-folder-opened"></i>
          <p>暂无班级信息</p>
        </div>
      </div>

      <div slot="footer" class="dialog-footer">
        <el-button
          type="primary"
          icon="el-icon-plus"
          @click="handleAddClass"
          class="add-class-btn"
          size="medium"
        >添加班级</el-button>
        <el-button
          @click="classDialogVisible = false"
          size="medium"
        >关闭</el-button>
      </div>
    </el-dialog>

    <!-- 添加班级对话框 -->
    <el-dialog
      title="添加班级"
      :visible.sync="addClassDialogVisible"
      width="500px"
      append-to-body
      custom-class="add-class-dialog"
      :close-on-click-modal="false"
    >
      <div class="add-class-content">
        <div class="form-header">
          <i class="el-icon-plus"></i>
          <span>请选择要添加班级的部门</span>
        </div>

        <el-form ref="addClassForm" :model="addClassForm" :rules="addClassRules" label-width="80px">
          <el-form-item label="选择部门" prop="deptId">
            <el-select
              v-model="addClassForm.deptId"
              placeholder="请选择部门"
              clearable
              style="width: 100%"
              filterable
              class="dept-select"
            >
              <el-option
                v-for="dept in deptTreeList"
                :key="dept.deptId"
                :label="dept.deptName"
                :value="dept.deptId"
                :disabled="dept.hasChildren"
              />
            </el-select>
          </el-form-item>
        </el-form>
      </div>

      <div slot="footer" class="dialog-footer">
        <el-button
          type="primary"
          icon="el-icon-check"
          @click="submitAddClass"
          class="submit-btn"
          size="medium"
        >确 定</el-button>
        <el-button
          @click="cancelAddClass"
          size="medium"
        >取 消</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { listDept, getDept, delDept, addDept, updateDept, listDeptExcludeChild, getClassList, addClass, removeClass } from "@/api/system/dept"
import { getTeacherList } from "@/api/system/knowledge"
import Treeselect from "@riophae/vue-treeselect"
import "@riophae/vue-treeselect/dist/vue-treeselect.css"

export default {
  name: "Dept",
  dicts: ['sys_normal_disable'],
  components: { Treeselect },
  data() {
    return {
      // 遮罩层
      loading: true,
      // 显示搜索条件
      showSearch: true,
      // 表格树数据
      deptList: [],
      // 班级树选项
      deptOptions: [],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 是否展开，默认全部展开
      isExpandAll: true,
      // 重新渲染表格状态
      refreshTable: true,
      // 查询参数
      queryParams: {
        deptName: undefined,
        status: undefined
      },
      // 表单参数
      form: {},
      // 表单校验
      rules: {
        parentId: [
          { required: true, message: "上级班级不能为空", trigger: "blur" }
        ],
        deptName: [
          { required: true, message: "班级名称不能为空", trigger: "blur" }
        ],
        orderNum: [
          { required: true, message: "显示排序不能为空", trigger: "blur" }
        ],
        email: [
          {
            type: "email",
            message: "请输入正确的邮箱地址",
            trigger: ["blur", "change"]
          }
        ],
        phone: [
          {
            pattern: /^1[3|4|5|6|7|8|9][0-9]\d{8}$/,
            message: "请输入正确的手机号码",
            trigger: "blur"
          }
        ]
      },
      // 班级对话框相关
      classDialogVisible: false,
      classLoading: false,
      classList: [],
      // 添加班级对话框相关
      addClassDialogVisible: false,
      addClassForm: {
        deptId: undefined
      },
      addClassRules: {
        deptId: [
          { required: true, message: "部门不能为空", trigger: "change" }
        ]
      },
      deptTreeList: [], // 用于添加班级对话框的部门树数据
      teacherList: [], // 老师列表
      isClassNode: false // 是否为班级节点
    }
  },
  created() {
    this.getList()
  },
  methods: {
    /** 查询班级列表 */
    getList() {
      this.loading = true
      listDept(this.queryParams).then(response => {
        this.deptList = this.handleTree(response.data, "deptId")
        this.loading = false
      })
    },
    /** 转换班级数据结构 */
    normalizer(node) {
      if (node.children && !node.children.length) {
        delete node.children
      }
      return {
        id: node.deptId,
        label: node.deptName,
        children: node.children
      }
    },
    // 取消按钮
    cancel() {
      this.open = false
      this.reset()
    },
    // 表单重置
    reset() {
      this.form = {
        deptId: undefined,
        parentId: undefined,
        deptName: undefined,
        orderNum: undefined,
        leader: undefined,
        phone: undefined,
        email: undefined,
        status: "0"
      }
      this.isClassNode = false
      this.resetForm("form")
    },
    /** 搜索按钮操作 */
    handleQuery() {
      this.getList()
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.resetForm("queryForm")
      this.handleQuery()
    },
    /** 新增按钮操作 */
    handleAdd(row) {
      this.reset()
      if (row != undefined) {
        this.form.parentId = row.deptId
        // 判断新增的节点是否为班级：如果父节点是年级节点，则新增的应该是班级
        this.isClassNode = this.checkIsGradeNode(row)
      } else {
        this.isClassNode = false
      }
      this.open = true
      this.title = "添加班级"
      listDept().then(response => {
        this.deptOptions = this.handleTree(response.data, "deptId")
      })
      // 加载老师列表（所有节点都使用下拉框选择）
      this.loadTeacherList()
    },
    /** 展开/折叠操作 */
    toggleExpandAll() {
      this.refreshTable = false
      this.isExpandAll = !this.isExpandAll
      this.$nextTick(() => {
        this.refreshTable = true
      })
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset()
      // 判断是否为班级节点
      this.isClassNode = this.checkIsClassNode(row)
      getDept(row.deptId).then(response => {
        this.form = response.data
        this.open = true
        this.title = "修改班级"
        listDeptExcludeChild(row.deptId).then(response => {
          this.deptOptions = this.handleTree(response.data, "deptId")
          if (this.deptOptions.length == 0) {
            const noResultsOptions = { deptId: this.form.parentId, deptName: this.form.parentName, children: [] }
            this.deptOptions.push(noResultsOptions)
          }
        })
        // 加载老师列表（所有节点都使用下拉框选择）
        this.loadTeacherList().then(() => {
          // 处理 leader 字段：确保是 userId 类型，并且能正确匹配下拉框
          if (this.form.leader && this.teacherList.length > 0) {
            // 先尝试通过 nickName 查找（如果 leader 是 nickName）
            let teacher = this.teacherList.find(t => t.nickName === this.form.leader)
            if (teacher) {
              // 如果找到，说明 leader 是 nickName，转换为 userId
              this.form.leader = teacher.userId
            } else {
              // 如果找不到，说明 leader 可能是 userId
              // 尝试将字符串类型的 userId 转换为数字类型，确保类型匹配
              const leaderNum = Number(this.form.leader)
              if (!isNaN(leaderNum)) {
                // 验证这个 userId 是否在老师列表中
                teacher = this.teacherList.find(t => t.userId === leaderNum || t.userId === this.form.leader)
                if (teacher) {
                  // 确保使用数字类型的 userId，以便 el-select 能正确匹配
                  this.form.leader = teacher.userId
                }
              }
            }
          }
        })
      })
    },
    /** 提交按钮 */
    submitForm: function() {
      this.$refs["form"].validate(valid => {
        if (valid) {
          if (this.form.deptId != undefined) {
            updateDept(this.form).then(response => {
              this.$modal.msgSuccess("修改成功")
              this.open = false
              this.getList()
            })
          } else {
            addDept(this.form).then(response => {
              this.$modal.msgSuccess("新增成功")
              this.open = false
              this.getList()
            })
          }
        }
      })
    },
    /** 删除按钮操作 */
    handleDelete(row) {
      this.$modal.confirm('是否确认删除名称为"' + row.deptName + '"的数据项？').then(function() {
        return delDept(row.deptId)
      }).then(() => {
        this.getList()
        this.$modal.msgSuccess("删除成功")
      }).catch(() => {})
    },
    /** 查看所在班级操作 */
    handleViewClass() {
      this.classDialogVisible = true
      this.getClassList()
    },
    /** 获取班级列表 */
    getClassList() {
      this.classLoading = true
      getClassList().then(response => {
        // 根据API响应结构，数据在response.data中，格式为{"0":"高一（1）班","4":"高二（1）班"}
        const classMap = response.data || {}
        // 将对象转换为数组格式，便于表格渲染
        this.classList = Object.entries(classMap).map(([id, className]) => ({
          id: parseInt(id),
          className: className
        }))
        this.classLoading = false
      }).catch(error => {
        this.classLoading = false
        this.$modal.msgError("获取班级列表失败：" + (error.message || error))
      })
    },
    /** 添加班级操作 */
    handleAddClass() {
      this.addClassDialogVisible = true
      this.addClassForm.deptId = undefined // 清空选择
      this.getDeptTreeList() // 获取部门树数据
    },
    /** 获取部门树数据 */
    getDeptTreeList() {
      listDept().then(response => {
        this.deptTreeList = this.buildDeptTree(response.data || [])
      })
    },
    /** 构建部门树形结构 */
    buildDeptTree(deptList) {
      const map = {};
      const tree = [];

      // 首先创建映射
      deptList.forEach(dept => {
        map[dept.deptId] = { ...dept, children: [] };
      });

      // 构建树形结构
      deptList.forEach(dept => {
        if (!dept.parentId || dept.parentId === 0 || dept.parentId === '0') {
          // 根节点
          tree.push(map[dept.deptId]);
        } else {
          // 子节点
          const parent = map[dept.parentId];
          if (parent) {
            parent.children.push(map[dept.deptId]);
          }
        }
      });

      // 递归处理子节点，将树形结构扁平化为选择列表
      const flattenDeptList = [];
      const flattenDept = (depts, level = 0) => {
        depts.forEach(dept => {
          const prefix = '　'.repeat(level); // 使用全角空格作为缩进
          const hasChildren = dept.children && dept.children.length > 0;
          flattenDeptList.push({
            ...dept,
            deptName: prefix + dept.deptName,
            level: level,
            hasChildren: hasChildren
          });
          if (hasChildren) {
            flattenDept(dept.children, level + 1);
          }
        });
      };

      flattenDept(tree);
      return flattenDeptList;
    },
         /** 提交添加班级 */
     submitAddClass() {
       this.$refs["addClassForm"].validate(valid => {
         if (valid) {
           addClass(this.addClassForm).then(response => {
             this.$modal.msgSuccess("添加班级成功")
             this.addClassDialogVisible = false
             this.getClassList() // 刷新班级列表
             this.resetAddClassForm()
           }).catch(error => {
             this.$modal.msgError("添加班级失败：" + (error.message || error))
           })
         }
       })
     },
    /** 取消添加班级 */
    cancelAddClass() {
      this.addClassDialogVisible = false
      this.resetAddClassForm()
    },
    /** 重置添加班级表单 */
    resetAddClassForm() {
      this.addClassForm = {
        deptId: undefined
      }
      this.resetForm("addClassForm")
    },
    /** 删除班级操作 */
    handleRemoveClass(id) {
      this.$modal.confirm('是否确认删除该班级？').then(function() {
        return removeClass(id)
      }).then(() => {
        this.getClassList() // 刷新班级列表
        this.$modal.msgSuccess("删除成功")
      }).catch(() => {})
    },
    /** 表格行样式 */
    tableRowClassName({ row, rowIndex }) {
      if (row.level === 0) { // 根节点
        return 'el-table-row-root';
      }
      return '';
    },
    /** 判断是否为班级节点 */
    checkIsClassNode(row) {
      if (!row) {
        return false;
      }
      // 方法1: 检查节点名称是否包含"班"字（最直接的判断方式）
      if (row.deptName && row.deptName.includes('班')) {
        return true;
      }
      // 方法2: 检查是否是叶子节点（没有子节点或children为空）
      if (!row.children || (Array.isArray(row.children) && row.children.length === 0)) {
        // 再检查ancestors层级，班级通常有更深的层级（至少5层：学校->中学->学校->年级->班级）
        if (row.ancestors) {
          const ancestorLevels = row.ancestors.split(',').length;
          // 如果ancestors层级>=5，且没有子节点，可能是班级
          if (ancestorLevels >= 5) {
            return true;
          }
        }
      }
      return false;
    },
    /** 判断父节点是否为年级节点（用于新增时判断） */
    checkIsGradeNode(row) {
      if (!row) {
        return false;
      }
      // 检查是否是年级节点：名称是"初一"、"初二"、"初三"、"高一"、"高二"、"高三"
      if (row.deptName) {
        const gradeNames = ['初一', '初二', '初三', '高一', '高二', '高三'];
        return gradeNames.includes(row.deptName);
      }
      return false;
    },
    /** 加载老师列表 */
    loadTeacherList() {
      return getTeacherList().then(response => {
        if (response.code === 200) {
          this.teacherList = response.data || [];
          return Promise.resolve();
        } else {
          this.$modal.msgError('获取老师列表失败：' + (response.msg || '未知错误'));
          this.teacherList = [];
          return Promise.resolve();
        }
      }).catch(error => {
        this.$modal.msgError('获取老师列表失败：' + (error.message || error));
        this.teacherList = [];
        return Promise.resolve();
      });
    }
  }
}
</script>

<style scoped>
/* 班级信息对话框样式 */
.class-info-dialog {
  border-radius: 8px;
}

.class-info-dialog ::v-deep .el-dialog__header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 8px 8px 0 0;
  padding: 20px;
}

.class-info-dialog ::v-deep .el-dialog__title {
  color: white;
  font-size: 18px;
  font-weight: 600;
}

.class-info-dialog ::v-deep .el-dialog__headerbtn .el-dialog__close {
  color: white;
  font-size: 18px;
}

.class-info-dialog ::v-deep .el-dialog__body {
  padding: 20px;
}

.class-info-content {
  min-height: 200px;
}

.class-count-info {
  margin-bottom: 20px;
  text-align: center;
}

.class-count-info .el-tag {
  padding: 8px 16px;
  font-size: 14px;
  border-radius: 20px;
}

.class-count-info .el-icon-school {
  margin-right: 6px;
  font-size: 16px;
}

.class-table {
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.class-table ::v-deep .el-table__header-wrapper {
  background: #f5f7fa;
}

.class-table ::v-deep .el-table__header th {
  background: #f5f7fa !important;
  color: #606266;
  font-weight: 600;
  padding: 12px 0;
}

.class-table ::v-deep .el-table__body tr:hover > td {
  background-color: #f0f9ff !important;
}

.class-name-cell {
  display: flex;
  align-items: center;
  padding: 8px 0;
}

.class-name-cell .el-icon-office-building {
  color: #409eff;
  margin-right: 8px;
  font-size: 16px;
}

.class-name {
  font-weight: 500;
  color: #303133;
}

.delete-btn {
  padding: 6px 12px;
  font-size: 12px;
  border-radius: 15px;
  transition: all 0.3s ease;
}

.delete-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(245, 108, 108, 0.4);
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: #909399;
}

.empty-state .el-icon-folder-opened {
  font-size: 48px;
  margin-bottom: 16px;
  color: #c0c4cc;
}

.empty-state p {
  margin: 0;
  font-size: 14px;
}

.dialog-footer {
  text-align: center;
  padding: 20px 0 0 0;
  border-top: 1px solid #ebeef5;
}

.add-class-btn {
  padding: 10px 20px;
  font-size: 14px;
  border-radius: 6px;
  transition: all 0.3s ease;
}

.add-class-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.4);
}

/* 添加班级对话框样式 */
.add-class-dialog {
  border-radius: 8px;
}

.add-class-dialog ::v-deep .el-dialog__header {
  background: linear-gradient(135deg, #409eff 0%, #667eea 100%);
  color: white;
  border-radius: 8px 8px 0 0;
  padding: 20px;
}

.add-class-dialog ::v-deep .el-dialog__title {
  color: white;
  font-size: 18px;
  font-weight: 600;
}

.add-class-dialog ::v-deep .el-dialog__headerbtn .el-dialog__close {
  color: white;
  font-size: 18px;
}

.add-class-dialog ::v-deep .el-dialog__body {
  padding: 20px;
}

.add-class-content {
  min-height: 200px;
}

.form-header {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
  color: #303133;
  font-size: 16px;
  font-weight: 500;
}

.form-header .el-icon-plus {
  margin-right: 8px;
  font-size: 20px;
  color: #409eff;
}

.dept-select {
  width: 100%;
}

.submit-btn {
  padding: 10px 20px;
  font-size: 14px;
  border-radius: 6px;
  transition: all 0.3s ease;
}

.submit-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.4);
}

/* 表格行样式 */
.el-table-row-root {
  background-color: #fafafa;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .class-info-dialog ::v-deep .el-dialog {
    width: 90% !important;
    margin: 5vh auto;
  }

  .class-name-cell .el-icon-office-building {
    font-size: 14px;
    margin-right: 6px;
  }

  .delete-btn {
    padding: 4px 8px;
    font-size: 11px;
  }
}
</style>
