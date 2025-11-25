// 菜单配置
import { getCurrentEnvConfig } from './env'
import store from '@/store'

export const menuConfig = {
  // 需要隐藏的菜单项（支持部分匹配）
  hiddenMenus: [
    // '测试',
    // '系统监控',
    // '树',


  ],

  // 需要隐藏的菜单路径（精确匹配）
  hiddenPaths: [
    // '/monitor',
    // '/tool',
    // '/system'
  ],

  // 是否启用菜单隐藏功能
  enableMenuHide: true,

  // 只有老师角色才能看到的菜单项（老师登录时隐藏）
  // 您可以根据需要添加或移除菜单项
  teacherOnlyMenus: [
    '文件管理',      // 文件管理模块
    '系统监控',      // 系统监控模块
    '系统工具',      // 系统工具模块,
    '系统管理',
    '教研备课组成员',
    '测试',
    // 可以继续添加其他菜单项
    // '用户管理',
    // '角色管理',
    // '部门管理'
    '班级信息管理',
    // 'AI生成中心'
  ],

  // 老师角色标识符（支持多种格式）
  teacherRoleIdentifiers: [
    '老师',           // 中文角色名
    'teacher',        // 英文角色名
    'ROLE_TEACHER'    // 角色键值
  ],

  // 高中学生能力评估菜单项
  highSchoolAssessmentMenus: [
    '高中学生分层'
  ],

  // 初中学生能力评估菜单项
  middleSchoolAssessmentMenus: [
    '初中学生分层'
  ],

  // 章节题相关菜单项（语文/英语老师不显示）
  chapterQuestionMenus: [
    '章节题',
    // '章节题组',
    // '试题中心'
  ],

  // 需要隐藏章节题功能的科目
  subjectsToHideChapterQuestions: [
    '语文',
    '英语',
    '初中语文',
    '初中英语',
    '高中语文',
    '高中英语'
  ],

  // 老师角色需要隐藏的菜单项（作业/组卷等，但保留麓鸣题库和我的题库）
  teacherHiddenMenus: [
    '作业',
    '组卷',
    '章节题',
    '自定义题库',
    '搜索题目',
    '学习时长'
  ],

  // 老师角色需要保留的菜单项（即使在其他隐藏列表中也要显示）
  teacherVisibleMenus: [
    '麓鸣题库',
    '我的题库'
  ]
}

// 检查用户是否为老师角色
function isTeacherRole() {
  const roles = store.getters && store.getters.roles
  if (!roles || roles.length === 0) {
    return false
  }

  // 检查角色名称是否匹配老师角色标识符
  return roles.some(role => {
    // 支持多种角色名称格式
    const roleName = typeof role === 'string' ? role : role.roleName || role.roleKey || ''
    return menuConfig.teacherRoleIdentifiers.some(identifier =>
      roleName.includes(identifier)
    )
  })
}

// 获取教师信息
function getTeacherInfo() {
  // 从store中获取教师信息，如果没有则从localStorage获取
  const teacherInfo = store.getters.teacherInfo || JSON.parse(localStorage.getItem('teacherInfo') || '{}')
  return teacherInfo
}

// 检查是否应该显示高中学生能力评估
function shouldShowHighSchoolAssessment() {
  const teacherInfo = getTeacherInfo()

  // 如果没有教师信息，默认显示
  if (!teacherInfo || !teacherInfo.grade) {
    return true
  }

  // 只有高中教师才能看到高中学生能力评估
  return teacherInfo.grade === '高中'
}

// 检查是否应该显示初中学生能力评估
function shouldShowMiddleSchoolAssessment() {
  const teacherInfo = getTeacherInfo()

  // 如果没有教师信息，默认显示
  if (!teacherInfo || !teacherInfo.grade) {
    return true
  }

  // 只有初中教师才能看到初中学生能力评估
  return teacherInfo.grade === '初中'
}

// 检查是否应该隐藏章节题功能（语文/英语老师隐藏）
function shouldHideChapterQuestions() {
  const teacherInfo = getTeacherInfo()

  // 如果没有教师信息，默认不隐藏
  if (!teacherInfo) {
    console.log('章节题隐藏检查：没有教师信息')
    return false
  }

  // 优先使用 subjectNames 字段，如果没有则使用 subject 字段
  const teacherSubject = teacherInfo.subjectNames || teacherInfo.subject

  if (!teacherSubject) {
    console.log('章节题隐藏检查：没有科目信息', teacherInfo)
    return false
  }

  // 检查老师科目是否在需要隐藏章节题功能的科目列表中
  const shouldHide = menuConfig.subjectsToHideChapterQuestions.some(subject =>
    teacherSubject.includes(subject) || subject.includes(teacherSubject)
  )

  console.log('章节题隐藏检查：', {
    teacherSubject: teacherSubject,
    subjectsToHide: menuConfig.subjectsToHideChapterQuestions,
    shouldHide: shouldHide
  })

  return shouldHide
}

// 检查菜单是否应该被隐藏
export function shouldHideMenu(route) {
  if (!menuConfig.enableMenuHide) {
    return false
  }

  const envConfig = getCurrentEnvConfig()

  // 检查菜单标题
  if (route.meta && route.meta.title) {
    const title = route.meta.title

    // 根据环境配置和菜单标题判断是否隐藏
    if (title.includes('测试') && !envConfig.showTestMenu) {
      return true
    }
    if (title.includes('监控') && !envConfig.showMonitorMenu) {
      return true
    }
    if (title.includes('系统') && !envConfig.showSystemMenu) {
      return true
    }
    if (title.includes('工具') && !envConfig.showToolMenu) {
      return true
    }

    // 检查高中学生能力评估菜单
    if (menuConfig.highSchoolAssessmentMenus.some(menu => title.includes(menu))) {
      return !shouldShowHighSchoolAssessment()
    }

    // 检查初中学生能力评估菜单
    if (menuConfig.middleSchoolAssessmentMenus.some(menu => title.includes(menu))) {
      return !shouldShowMiddleSchoolAssessment()
    }

    // 检查章节题相关菜单（语文/英语老师隐藏）
    if (menuConfig.chapterQuestionMenus.some(menu => title.includes(menu))) {
      return shouldHideChapterQuestions()
    }

    // 检查老师专用菜单（只有老师登录时才隐藏）
    if (isTeacherRole()) {
      if (menuConfig.teacherOnlyMenus.some(menu => title.includes(menu))) {
        return true
      }

      // 检查老师角色需要隐藏的菜单项（作业/组卷等）
      // 但排除需要保留的菜单项（麓鸣题库、我的题库）
      const isVisibleMenu = menuConfig.teacherVisibleMenus.some(menu => title.includes(menu))
      if (!isVisibleMenu && menuConfig.teacherHiddenMenus.some(menu => title.includes(menu))) {
        return true
      }
    }

    // 检查其他需要隐藏的菜单
    if (menuConfig.hiddenMenus.some(menu => title.includes(menu))) {
      return true
    }
  }

  // 检查菜单路径
  if (route.path) {
    if (menuConfig.hiddenPaths.some(path => route.path.startsWith(path))) {
      return true
    }
  }

  return false
}
