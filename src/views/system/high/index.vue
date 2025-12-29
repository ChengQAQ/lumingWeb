<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" size="small" :inline="true" v-show="showSearch" label-width="100px">
      <!-- <el-form-item label="关联用户表的唯一标识" prop="userId" label-width="auto">
        <el-input
          v-model="queryParams.userId"
          placeholder="请输入关联用户表的唯一标识"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item> -->
      <el-form-item label="用户姓名" prop="userName" label-width="auto">
        <el-input
          v-model="queryParams.userName"
          placeholder="请输入用户姓名"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="物理能力评分" prop="physics2" label-width="auto" v-if="shouldShowSubject('物理')">
        <el-select v-model.number="queryParams.physics2" placeholder="请选择物理能力等级">
          <el-option label="四级" :value="0.25" />
          <el-option label="三级" :value="0.5" />
          <el-option label="二级" :value="0.7" />
          <el-option label="一级" :value="0.8" />
          <el-option label="特级宇航员" :value="0.9" />
        </el-select>
      </el-form-item>
      <el-form-item label="数学能力评分" prop="math2" label-width="auto" v-if="shouldShowSubject('数学')">
        <el-select v-model.number="queryParams.math2" placeholder="请选择数学能力等级">
          <el-option label="四级" :value="0.25" />
          <el-option label="三级" :value="0.5" />
          <el-option label="二级" :value="0.7" />
          <el-option label="一级" :value="0.8" />
          <el-option label="特级宇航员" :value="0.9" />
        </el-select>
      </el-form-item>
      <el-form-item label="化学能力评分" prop="chemistry2" label-width="auto" v-if="shouldShowSubject('化学')">
        <el-select v-model.number="queryParams.chemistry2" placeholder="请选择化学能力等级">
          <el-option label="四级" :value="0.25" />
          <el-option label="三级" :value="0.5" />
          <el-option label="二级" :value="0.7" />
          <el-option label="一级" :value="0.8" />
          <el-option label="特级宇航员" :value="0.9" />
        </el-select>
      </el-form-item>
      <el-form-item label="生物能力评分" prop="biology2" label-width="auto" v-if="shouldShowSubject('生物')">
        <el-select v-model.number="queryParams.biology2" placeholder="请选择生物能力等级">
          <el-option label="四级" :value="0.25" />
          <el-option label="三级" :value="0.5" />
          <el-option label="二级" :value="0.7" />
          <el-option label="一级" :value="0.8" />
          <el-option label="特级宇航员" :value="0.9" />
        </el-select>
      </el-form-item>
      <el-form-item label="语文能力评分" prop="chinese2" label-width="auto" v-if="shouldShowSubject('语文')">
        <el-select v-model.number="queryParams.chinese2" placeholder="请选择语文能力等级">
          <el-option label="四级" :value="0.25" />
          <el-option label="三级" :value="0.5" />
          <el-option label="二级" :value="0.7" />
          <el-option label="一级" :value="0.8" />
          <el-option label="特级宇航员" :value="0.9" />
        </el-select>
      </el-form-item>
      <el-form-item label="英语能力评分" prop="english2" label-width="auto" v-if="shouldShowSubject('英语')">
        <el-select v-model.number="queryParams.english2" placeholder="请选择英语能力等级">
          <el-option label="四级" :value="0.25" />
          <el-option label="三级" :value="0.5" />
          <el-option label="二级" :value="0.7" />
          <el-option label="一级" :value="0.8" />
          <el-option label="特级宇航员" :value="0.9" />
        </el-select>
      </el-form-item>
      <el-form-item label="通用" prop="tech1" label-width="auto" v-if="shouldShowSubject('通用')">
        <el-select v-model.number="queryParams.tech1" placeholder="请选择通用等级">
          <el-option label="四级" :value="0.25" />
          <el-option label="三级" :value="0.5" />
          <el-option label="二级" :value="0.7" />
          <el-option label="一级" :value="0.8" />
          <el-option label="特级宇航员" :value="0.9" />
        </el-select>
      </el-form-item>
      <el-form-item label="技术实践能力评分" prop="tech2" label-width="auto" v-if="shouldShowSubject('信息')">
        <el-select v-model.number="queryParams.tech2" placeholder="请选择技术实践能力等级">
          <el-option label="四级" :value="0.25" />
          <el-option label="三级" :value="0.5" />
          <el-option label="二级" :value="0.7" />
          <el-option label="一级" :value="0.8" />
          <el-option label="特级宇航员" :value="0.9" />
        </el-select>
      </el-form-item>
      <el-form-item label="历史能力评分" prop="history2" label-width="auto" v-if="shouldShowSubject('历史')">
        <el-select v-model.number="queryParams.history2" placeholder="请选择历史能力等级">
          <el-option label="四级" :value="0.25" />
          <el-option label="三级" :value="0.5" />
          <el-option label="二级" :value="0.7" />
          <el-option label="一级" :value="0.8" />
          <el-option label="特级宇航员" :value="0.9" />
        </el-select>
      </el-form-item>
      <el-form-item label="政治" prop="politics2" label-width="auto" v-if="shouldShowSubject('政治')">
        <el-select v-model.number="queryParams.politics2" placeholder="请选择政治等级">
          <el-option label="四级" :value="0.25" />
          <el-option label="三级" :value="0.5" />
          <el-option label="二级" :value="0.7" />
          <el-option label="一级" :value="0.8" />
          <el-option label="特级宇航员" :value="0.9" />
        </el-select>
      </el-form-item>
      <el-form-item label="地理能力评分" prop="geography2" label-width="auto" v-if="shouldShowSubject('地理')">
        <el-select v-model.number="queryParams.geography2" placeholder="请选择地理能力等级">
          <el-option label="四级" :value="0.25" />
          <el-option label="三级" :value="0.5" />
          <el-option label="二级" :value="0.7" />
          <el-option label="一级" :value="0.8" />
          <el-option label="特级宇航员" :value="0.9" />
        </el-select>
      </el-form-item>
      <el-form-item label="综合思维能力评分" prop="theta" label-width="auto" v-if="shouldShowSubject('综合')">
        <el-select v-model.number="queryParams.theta" placeholder="请选择综合思维能力等级">
          <el-option label="四级" :value="0.25" />
          <el-option label="三级" :value="0.5" />
          <el-option label="二级" :value="0.7" />
          <el-option label="一级" :value="0.8" />
          <el-option label="特级宇航员" :value="0.9" />
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
          v-hasPermi="['system:high:add']"
        >新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          plain
          icon="el-icon-edit"
          size="mini"
          :disabled="single"
          @click="handleUpdate"
          v-hasPermi="['system:high:edit']"
        >修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          plain
          icon="el-icon-delete"
          size="mini"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['system:high:remove']"
        >删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="el-icon-download"
          size="mini"
          @click="handleExport"
          v-hasPermi="['system:high:export']"
        >导出</el-button>
      </el-col>
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="highList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <!-- <el-table-column label="主键，自增唯一标识" align="center" prop="id" /> -->
      <!-- <el-table-column label="关联用户表的唯一标识" align="center" prop="userId" /> -->
      <el-table-column label="用户姓名" align="center" prop="userName" />
      <el-table-column label="物理能力评分" align="center" v-if="shouldShowSubject('物理')">
        <template slot-scope="scope">
          <el-tag v-if="scope.row.physics2" :type="getLevelTagType(getScoreLevel(scope.row.physics2))" size="mini">
            {{ getScoreLevel(scope.row.physics2) }}
          </el-tag>
          <span v-else>-</span>
        </template>
      </el-table-column>
      <el-table-column label="数学能力评分" align="center" v-if="shouldShowSubject('数学')">
        <template slot-scope="scope">
          <el-tag v-if="scope.row.math2" :type="getLevelTagType(getScoreLevel(scope.row.math2))" size="mini">
            {{ getScoreLevel(scope.row.math2) }}
          </el-tag>
          <span v-else>-</span>
        </template>
      </el-table-column>
      <el-table-column label="化学能力评分" align="center" v-if="shouldShowSubject('化学')">
        <template slot-scope="scope">
          <el-tag v-if="scope.row.chemistry2" :type="getLevelTagType(getScoreLevel(scope.row.chemistry2))" size="mini">
            {{ getScoreLevel(scope.row.chemistry2) }}
          </el-tag>
          <span v-else>-</span>
        </template>
      </el-table-column>
      <el-table-column label="生物能力评分" align="center" v-if="shouldShowSubject('生物')">
        <template slot-scope="scope">
          <el-tag v-if="scope.row.biology2" :type="getLevelTagType(getScoreLevel(scope.row.biology2))" size="mini">
            {{ getScoreLevel(scope.row.biology2) }}
          </el-tag>
          <span v-else>-</span>
        </template>
      </el-table-column>
      <el-table-column label="语文能力评分" align="center" v-if="shouldShowSubject('语文')">
        <template slot-scope="scope">
          <el-tag v-if="scope.row.chinese2" :type="getLevelTagType(getScoreLevel(scope.row.chinese2))" size="mini">
            {{ getScoreLevel(scope.row.chinese2) }}
          </el-tag>
          <span v-else>-</span>
        </template>
      </el-table-column>
      <el-table-column label="英语能力评分" align="center" v-if="shouldShowSubject('英语')">
        <template slot-scope="scope">
          <el-tag v-if="scope.row.english2" :type="getLevelTagType(getScoreLevel(scope.row.english2))" size="mini">
            {{ getScoreLevel(scope.row.english2) }}
          </el-tag>
          <span v-else>-</span>
        </template>
      </el-table-column>
      <el-table-column label="通用" align="center" v-if="shouldShowSubject('通用')">
        <template slot-scope="scope">
          <el-tag v-if="scope.row.tech1" :type="getLevelTagType(getScoreLevel(scope.row.tech1))" size="mini">
            {{ getScoreLevel(scope.row.tech1) }}
          </el-tag>
          <span v-else>-</span>
        </template>
      </el-table-column>
      <el-table-column label="技术实践能力评分" align="center" v-if="shouldShowSubject('技术实践')">
        <template slot-scope="scope">
          <el-tag v-if="scope.row.tech2" :type="getLevelTagType(getScoreLevel(scope.row.tech2))" size="mini">
            {{ getScoreLevel(scope.row.tech2) }}
          </el-tag>
          <span v-else>-</span>
        </template>
      </el-table-column>
      <el-table-column label="历史能力评分" align="center" v-if="shouldShowSubject('历史')">
        <template slot-scope="scope">
          <el-tag v-if="scope.row.history2" :type="getLevelTagType(getScoreLevel(scope.row.history2))" size="mini">
            {{ getScoreLevel(scope.row.history2) }}
          </el-tag>
          <span v-else>-</span>
        </template>
      </el-table-column>
      <el-table-column label="政治" align="center" v-if="shouldShowSubject('政治')">
        <template slot-scope="scope">
          <el-tag v-if="scope.row.politics2" :type="getLevelTagType(getScoreLevel(scope.row.politics2))" size="mini">
            {{ getScoreLevel(scope.row.politics2) }}
          </el-tag>
          <span v-else>-</span>
        </template>
      </el-table-column>
      <el-table-column label="地理能力评分" align="center" v-if="shouldShowSubject('地理')">
        <template slot-scope="scope">
          <el-tag v-if="scope.row.geography2" :type="getLevelTagType(getScoreLevel(scope.row.geography2))" size="mini">
            {{ getScoreLevel(scope.row.geography2) }}
          </el-tag>
          <span v-else>-</span>
        </template>
      </el-table-column>
      <el-table-column label="综合思维能力评分" align="center" v-if="shouldShowSubject('综合思维')">
        <template slot-scope="scope">
          <el-tag v-if="scope.row.theta" :type="getLevelTagType(getScoreLevel(scope.row.theta))" size="mini">
            {{ getScoreLevel(scope.row.theta) }}
          </el-tag>
          <span v-else>-</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button
            size="mini"
            type="text"
            icon="el-icon-edit"
            @click="handleUpdate(scope.row)"
            v-hasPermi="['system:high:edit']"
          >修改</el-button>
          <el-button
            size="mini"
            type="text"
            icon="el-icon-delete"
            @click="handleDelete(scope.row)"
            v-hasPermi="['system:high:remove']"
          >删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination
      v-show="total>0"
      :total="total"
      :page.sync="queryParams.pageNum"
      :limit.sync="queryParams.pageSize"
      @pagination="getList"
    />

    <!-- 添加高中学生能力评估对话框 -->
    <el-dialog title="添加高中学生能力评估" :visible.sync="addOpen" width="500px" append-to-body>
      <el-form ref="addForm" :model="addForm" :rules="addRules" label-width="120px">
        <el-form-item label="用户姓名" prop="userName">
          <el-input v-model="addForm.userName" placeholder="用户姓名" />
        </el-form-item>
        <el-form-item label="物理能力评分" prop="physics2" v-if="shouldShowSubject('物理')">
          <el-select v-model.number="addForm.physics2" placeholder="请选择物理能力等级">
            <el-option label="四级" :value="0.25" />
            <el-option label="三级" :value="0.5" />
            <el-option label="二级" :value="0.7" />
            <el-option label="一级" :value="0.8" />
            <el-option label="特级宇航员" :value="0.9" />
          </el-select>
        </el-form-item>
        <el-form-item label="数学能力评分" prop="math2" v-if="shouldShowSubject('数学')">
          <el-select v-model.number="addForm.math2" placeholder="请选择数学能力等级">
            <el-option label="四级" :value="0.25" />
            <el-option label="三级" :value="0.5" />
            <el-option label="二级" :value="0.7" />
            <el-option label="一级" :value="0.8" />
            <el-option label="特级宇航员" :value="0.9" />
          </el-select>
        </el-form-item>
        <el-form-item label="化学能力评分" prop="chemistry2" v-if="shouldShowSubject('化学')">
          <el-select v-model.number="addForm.chemistry2" placeholder="请选择化学能力等级">
            <el-option label="四级" :value="0.25" />
            <el-option label="三级" :value="0.5" />
            <el-option label="二级" :value="0.7" />
            <el-option label="一级" :value="0.8" />
            <el-option label="特级宇航员" :value="0.9" />
          </el-select>
        </el-form-item>
        <el-form-item label="生物能力评分" prop="biology2" v-if="shouldShowSubject('生物')">
          <el-select v-model.number="addForm.biology2" placeholder="请选择生物能力等级">
            <el-option label="四级" :value="0.25" />
            <el-option label="三级" :value="0.5" />
            <el-option label="二级" :value="0.7" />
            <el-option label="一级" :value="0.8" />
            <el-option label="特级宇航员" :value="0.9" />
          </el-select>
        </el-form-item>
        <el-form-item label="语文能力评分" prop="chinese2" v-if="shouldShowSubject('语文')">
          <el-select v-model.number="addForm.chinese2" placeholder="请选择语文能力等级">
            <el-option label="四级" :value="0.25" />
            <el-option label="三级" :value="0.5" />
            <el-option label="二级" :value="0.7" />
            <el-option label="一级" :value="0.8" />
            <el-option label="特级宇航员" :value="0.9" />
          </el-select>
        </el-form-item>
        <el-form-item label="英语能力评分" prop="english2" v-if="shouldShowSubject('英语')">
          <el-select v-model.number="addForm.english2" placeholder="请选择英语能力等级">
            <el-option label="四级" :value="0.25" />
            <el-option label="三级" :value="0.5" />
            <el-option label="二级" :value="0.7" />
            <el-option label="一级" :value="0.8" />
            <el-option label="特级宇航员" :value="0.9" />
          </el-select>
        </el-form-item>
        <el-form-item label="通用" prop="tech1" v-if="shouldShowSubject('通用')">
          <el-select v-model.number="addForm.tech1" placeholder="请选择通用等级">
            <el-option label="四级" :value="0.25" />
            <el-option label="三级" :value="0.5" />
            <el-option label="二级" :value="0.7" />
            <el-option label="一级" :value="0.8" />
            <el-option label="特级宇航员" :value="0.9" />
          </el-select>
        </el-form-item>
        <el-form-item label="技术实践能力评分" prop="tech2" v-if="shouldShowSubject('信息')">
          <el-select v-model.number="addForm.tech2" placeholder="请选择技术实践能力等级">
            <el-option label="四级" :value="0.25" />
            <el-option label="三级" :value="0.5" />
            <el-option label="二级" :value="0.7" />
            <el-option label="一级" :value="0.8" />
            <el-option label="特级宇航员" :value="0.9" />
          </el-select>
        </el-form-item>
        <el-form-item label="历史能力评分" prop="history2" v-if="shouldShowSubject('历史')">
          <el-select v-model.number="addForm.history2" placeholder="请选择历史能力等级">
            <el-option label="四级" :value="0.25" />
            <el-option label="三级" :value="0.5" />
            <el-option label="二级" :value="0.7" />
            <el-option label="一级" :value="0.8" />
            <el-option label="特级宇航员" :value="0.9" />
          </el-select>
        </el-form-item>
        <el-form-item label="政治" prop="politics2" v-if="shouldShowSubject('政治')">
          <el-select v-model.number="addForm.politics2" placeholder="请选择政治等级">
            <el-option label="四级" :value="0.25" />
            <el-option label="三级" :value="0.5" />
            <el-option label="二级" :value="0.7" />
            <el-option label="一级" :value="0.8" />
            <el-option label="特级宇航员" :value="0.9" />
          </el-select>
        </el-form-item>
        <el-form-item label="地理能力评分" prop="geography2" v-if="shouldShowSubject('地理')">
          <el-select v-model.number="addForm.geography2" placeholder="请选择地理能力等级">
            <el-option label="四级" :value="0.25" />
            <el-option label="三级" :value="0.5" />
            <el-option label="二级" :value="0.7" />
            <el-option label="一级" :value="0.8" />
            <el-option label="特级宇航员" :value="0.9" />
          </el-select>
        </el-form-item>
        <el-form-item label="综合思维能力评分" prop="theta" v-if="shouldShowSubject('综合')">
          <el-select v-model.number="addForm.theta" placeholder="请选择综合思维能力等级">
            <el-option label="四级" :value="0.25" />
            <el-option label="三级" :value="0.5" />
            <el-option label="二级" :value="0.7" />
            <el-option label="一级" :value="0.8" />
            <el-option label="特级宇航员" :value="0.9" />
          </el-select>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitAddForm">确 定</el-button>
        <el-button @click="cancelAdd">取 消</el-button>
      </div>
    </el-dialog>

    <!-- 修改高中学生能力评估对话框 -->
    <el-dialog title="修改高中学生能力评估" :visible.sync="editOpen" width="500px" append-to-body>
      <el-form ref="editForm" :model="editForm" :rules="editRules" label-width="120px">
        <el-form-item label="用户姓名" prop="userName">
          <el-input v-model="editForm.userName" placeholder="用户姓名" readonly disabled />
        </el-form-item>
        <el-form-item label="物理能力评分" prop="physics2" v-if="shouldShowSubject('物理')">
          <el-select v-model.number="editForm.physics2" placeholder="请选择物理能力等级">
            <el-option label="四级" :value="0.25" />
            <el-option label="三级" :value="0.5" />
            <el-option label="二级" :value="0.7" />
            <el-option label="一级" :value="0.8" />
            <el-option label="特级宇航员" :value="0.9" />
          </el-select>
        </el-form-item>
        <el-form-item label="数学能力评分" prop="math2" v-if="shouldShowSubject('数学')">
          <el-select v-model.number="editForm.math2" placeholder="请选择数学能力等级">
            <el-option label="四级" :value="0.25" />
            <el-option label="三级" :value="0.5" />
            <el-option label="二级" :value="0.7" />
            <el-option label="一级" :value="0.8" />
            <el-option label="特级宇航员" :value="0.9" />
          </el-select>
        </el-form-item>
        <el-form-item label="化学能力评分" prop="chemistry2" v-if="shouldShowSubject('化学')">
          <el-select v-model.number="editForm.chemistry2" placeholder="请选择化学能力等级">
            <el-option label="四级" :value="0.25" />
            <el-option label="三级" :value="0.5" />
            <el-option label="二级" :value="0.7" />
            <el-option label="一级" :value="0.8" />
            <el-option label="特级宇航员" :value="0.9" />
          </el-select>
        </el-form-item>
        <el-form-item label="生物能力评分" prop="biology2" v-if="shouldShowSubject('生物')">
          <el-select v-model.number="editForm.biology2" placeholder="请选择生物能力等级">
            <el-option label="四级" :value="0.25" />
            <el-option label="三级" :value="0.5" />
            <el-option label="二级" :value="0.7" />
            <el-option label="一级" :value="0.8" />
            <el-option label="特级宇航员" :value="0.9" />
          </el-select>
        </el-form-item>
        <el-form-item label="语文能力评分" prop="chinese2" v-if="shouldShowSubject('语文')">
          <el-select v-model.number="editForm.chinese2" placeholder="请选择语文能力等级">
            <el-option label="四级" :value="0.25" />
            <el-option label="三级" :value="0.5" />
            <el-option label="二级" :value="0.7" />
            <el-option label="一级" :value="0.8" />
            <el-option label="特级宇航员" :value="0.9" />
          </el-select>
        </el-form-item>
        <el-form-item label="英语能力评分" prop="english2" v-if="shouldShowSubject('英语')">
          <el-select v-model.number="editForm.english2" placeholder="请选择英语能力等级">
            <el-option label="四级" :value="0.25" />
            <el-option label="三级" :value="0.5" />
            <el-option label="二级" :value="0.7" />
            <el-option label="一级" :value="0.8" />
            <el-option label="特级宇航员" :value="0.9" />
          </el-select>
        </el-form-item>
        <el-form-item label="通用" prop="tech1" v-if="shouldShowSubject('通用')">
          <el-select v-model.number="editForm.tech1" placeholder="请选择通用等级">
            <el-option label="四级" :value="0.25" />
            <el-option label="三级" :value="0.5" />
            <el-option label="二级" :value="0.7" />
            <el-option label="一级" :value="0.8" />
            <el-option label="特级宇航员" :value="0.9" />
          </el-select>
        </el-form-item>
        <el-form-item label="技术实践能力评分" prop="tech2" v-if="shouldShowSubject('信息')">
          <el-select v-model.number="editForm.tech2" placeholder="请选择技术实践能力等级">
            <el-option label="四级" :value="0.25" />
            <el-option label="三级" :value="0.5" />
            <el-option label="二级" :value="0.7" />
            <el-option label="一级" :value="0.8" />
            <el-option label="特级宇航员" :value="0.9" />
          </el-select>
        </el-form-item>
        <el-form-item label="历史能力评分" prop="history2" v-if="shouldShowSubject('历史')">
          <el-select v-model.number="editForm.history2" placeholder="请选择历史能力等级">
            <el-option label="四级" :value="0.25" />
            <el-option label="三级" :value="0.5" />
            <el-option label="二级" :value="0.7" />
            <el-option label="一级" :value="0.8" />
            <el-option label="特级宇航员" :value="0.9" />
          </el-select>
        </el-form-item>
        <el-form-item label="政治" prop="politics2" v-if="shouldShowSubject('政治')">
          <el-select v-model.number="editForm.politics2" placeholder="请选择政治等级">
            <el-option label="四级" :value="0.25" />
            <el-option label="三级" :value="0.5" />
            <el-option label="二级" :value="0.7" />
            <el-option label="一级" :value="0.8" />
            <el-option label="特级宇航员" :value="0.9" />
          </el-select>
        </el-form-item>
        <el-form-item label="地理能力评分" prop="geography2" v-if="shouldShowSubject('地理')">
          <el-select v-model.number="editForm.geography2" placeholder="请选择地理能力等级">
            <el-option label="四级" :value="0.25" />
            <el-option label="三级" :value="0.5" />
            <el-option label="二级" :value="0.7" />
            <el-option label="一级" :value="0.8" />
            <el-option label="特级宇航员" :value="0.9" />
          </el-select>
        </el-form-item>
        <el-form-item label="综合思维能力评分" prop="theta" v-if="shouldShowSubject('综合')">
          <el-select v-model.number="editForm.theta" placeholder="请选择综合思维能力等级">
            <el-option label="四级" :value="0.25" />
            <el-option label="三级" :value="0.5" />
            <el-option label="二级" :value="0.7" />
            <el-option label="一级" :value="0.8" />
            <el-option label="特级宇航员" :value="0.9" />
          </el-select>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitEditForm">确 定</el-button>
        <el-button @click="cancelEdit">取 消</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { listHigh, getHigh, delHigh, addHigh, updateHigh } from "@/api/system/high"
import { listUser } from "@/api/system/user"
import { shouldShowSubject as checkShouldShowSubject } from "@/utils/subjectMapping"

export default {
  name: "High",
  data() {
    return {
      // 遮罩层
      loading: true,
      // 选中数组
      ids: [],
      // 非单个禁用
      single: true,
      // 非多个禁用
      multiple: true,
      // 显示搜索条件
      showSearch: true,
      // 总条数
      total: 0,
      // 高中学生能力评估表格数据
      highList: [],

      // 添加对话框显示状态
      addOpen: false,
      // 修改对话框显示状态
      editOpen: false,
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        userId: null,
        userName: null,
        physics2: null,
        math2: null,
        chemistry2: null,
        biology2: null,
        chinese2: null,
        english2: null,
        tech1: null,
        tech2: null,
        history2: null,
        politics2: null,
        geography2: null,
        theta: null,
      },

      // 添加表单参数
      addForm: {},
      // 修改表单参数
      editForm: {},
      // 学生选项
      studentOptions: [],
      // 学生加载状态
      studentLoading: false,

      // 添加表单验证规则
      addRules: {
        userId: [
          { required: true, message: "请选择学生", trigger: "change" }
        ],
        userName: [
          { required: true, message: "用户姓名不能为空", trigger: "blur" }
        ]
      },
      // 修改表单验证规则
      editRules: {
        userName: [
          { required: true, message: "用户姓名不能为空", trigger: "blur" }
        ]
      },
      // 评分等级映射表
      subjectMap: {
        "0.0-0.49": "四级",
        "0.5-0.69": "三级",
        "0.7-0.79": "二级",
        "0.8-0.89999999": "一级",
        "0.9-9999": "特级宇航员"
      }
    }
  },
  created() {
    this.getList()
  },
  computed: {
    // 获取教师信息
    teacherInfo() {
      return this.$store.getters.teacherInfo || {}
    },

    // 教师科目
    teacherSubject() {
      return this.teacherInfo.subjectNames || null
    }
  },
  methods: {
    /** 查询高中学生能力评估列表 */
    getList() {
      this.loading = true
      listHigh(this.queryParams).then(response => {
        console.log('高中学生能力分层API响应:', response)

        if (response.code === 200) {
          // 适配新的数据格式：{code: 200, msg: "查询成功", total: 52, rows: [...]}
          if (response.rows && Array.isArray(response.rows)) {
            this.highList = response.rows
            this.total = response.total || 0
          } else if (response.data && Array.isArray(response.data)) {
            // 兼容旧格式
            this.highList = response.data
            this.total = response.total || response.data.length
          } else {
            this.highList = []
            this.total = 0
          }
        } else {
          this.highList = []
          this.total = 0
          this.$message.error(response.msg || '获取数据失败')
        }

        this.loading = false
      }).catch(error => {
        console.error('获取高中学生能力分层数据失败:', error)
        this.highList = []
        this.total = 0
        this.loading = false
        this.$message.error('获取数据失败')
      })
    },

    /** 搜索按钮操作 */
    handleQuery() {
      this.queryParams.pageNum = 1
      this.getList()
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.resetForm("queryForm")
      this.handleQuery()
    },
    // 多选框选中数据
    handleSelectionChange(selection) {
      this.ids = selection.map(item => item.id)
      this.single = selection.length!==1
      this.multiple = !selection.length
    },
    /** 新增按钮操作 */
    handleAdd() {
      this.resetAddForm()
      this.addOpen = true
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.resetEditForm()
      const id = row.id || this.ids
      getHigh(id).then(response => {
        this.editForm = response.data
        this.editOpen = true
      })
    },

    /** 删除按钮操作 */
    handleDelete(row) {
      const ids = row.id || this.ids
      this.$modal.confirm('是否确认删除高中学生能力评估编号为"' + ids + '"的数据项？').then(function() {
        return delHigh(ids)
      }).then(() => {
        this.getList()
        this.$modal.msgSuccess("删除成功")
      }).catch(() => {})
    },
    /** 导出按钮操作 */
    handleExport() {
      this.download('system/high/export', {
        ...this.queryParams
      }, `high_${new Date().getTime()}.xlsx`)
    },
    /** 根据评分获取等级 */
    getScoreLevel(score) {
      if (!score || isNaN(score)) {
        return ""
      }
      const numScore = parseFloat(score)

      if (numScore >= 0.0 && numScore <= 0.49) {
        return this.subjectMap["0.0-0.49"]
      } else if (numScore >= 0.5 && numScore <= 0.69) {
        return this.subjectMap["0.5-0.69"]
      } else if (numScore >= 0.7 && numScore <= 0.79) {
        return this.subjectMap["0.7-0.79"]
      } else if (numScore >= 0.8 && numScore < 0.9) {
        return this.subjectMap["0.8-0.89999999"]
      } else if (numScore >= 0.9) {
        return this.subjectMap["0.9-9999"]
      }

      return ""
    },
    /** 根据等级获取标签类型 */
    getLevelTagType(level) {
      switch (level) {
        case "特级宇航员":
          return "danger"
        case "一级":
          return "warning"
        case "二级":
          return "success"
        case "三级":
          return "primary"
        case "四级":
          return "info"
        default:
          return ""
      }
    },

    /** 检查是否应该显示某个科目 */
    shouldShowSubject(subjectName) {
      return checkShouldShowSubject(subjectName, this.teacherSubject, 'high')
    },

    // 重置添加表单
    resetAddForm() {
      this.addForm = {
        id: null,
        userId: null,
        userName: null,
        physics2: null,
        math2: null,
        chemistry2: null,
        biology2: null,
        chinese2: null,
        english2: null,
        tech1: null,
        tech2: null,
        history2: null,
        politics2: null,
        geography2: null,
        theta: null,
        createTime: null,
        updateTime: null
      }
      this.resetForm("addForm")
    },

    // 重置修改表单
    resetEditForm() {
      this.editForm = {
        id: null,
        userId: null,
        userName: null,
        physics2: null,
        math2: null,
        chemistry2: null,
        biology2: null,
        chinese2: null,
        english2: null,
        tech1: null,
        tech2: null,
        history2: null,
        politics2: null,
        geography2: null,
        theta: null,
        createTime: null,
        updateTime: null
      }
      this.resetForm("editForm")
    },

    // 取消添加
    cancelAdd() {
      this.addOpen = false
      this.resetAddForm()
    },

    // 取消修改
    cancelEdit() {
      this.editOpen = false
      this.resetEditForm()
    },

    // 提交添加表单
    submitAddForm() {
      this.$refs["addForm"].validate(valid => {
        if (valid) {
          addHigh(this.addForm).then(response => {
            this.$modal.msgSuccess("新增成功")
            this.addOpen = false
            this.getList()
          })
        }
      })
    },

    // 提交修改表单
    submitEditForm() {
      this.$refs["editForm"].validate(valid => {
        if (valid) {
          updateHigh(this.editForm).then(response => {
            this.$modal.msgSuccess("修改成功")
            this.editOpen = false
            this.getList()
          })
        }
      })
    },

    // 搜索学生
    searchStudents(query) {
      if (query !== '') {
        this.studentLoading = true
        listUser({
          pageNum: 1,
          pageSize: 20,
          userName: query
        }).then(response => {
          this.studentOptions = response.rows || []
          this.studentLoading = false
        }).catch(() => {
          this.studentLoading = false
        })
      } else {
        this.studentOptions = []
      }
    },

    // 学生选择改变
    handleStudentChange(userId) {
      const student = this.studentOptions.find(s => s.userId === userId)
      if (student) {
        this.addForm.userName = student.nickName || student.userName
        this.addForm.userId = student.userId
      }
    }

  }
}
</script>

