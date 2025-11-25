/**
 * 学科代码映射工具
 * 提供学科名称与代码之间的双向映射
 */

// 学科代码映射（新版本，主要使用）
const SUBJECT_DICT_NEW = {
  // 高中学科
  '高中数学': 'math2',
  '高中物理': 'physics2',
  '高中化学': 'chemistry2',
  '高中生物': 'biology2',
  '高中地理': 'geography2',
  '高中语文': 'chinese2',
  '高中英语': 'english2',
  '高中政治': 'politics2',
  '高中历史': 'history2',
  '高中信息': 'tech1',
  '高中通用': 'tech2',
  // 初中学科
  '初中科学': 'science',
  '初中数学': 'math',
  '初中语文': 'chinese',
  '初中英语': 'english',
  '初中python': 'python',
  '初中历史': 'history',
  '初中地理': 'geography',
  '初中政治': 'politics'
}

// 学科代码反向映射（代码 -> 名称）
const SUBJECT_CODE_TO_NAME = {
  // 高中学科
  'math2': '高中数学',
  'physics2': '高中物理',
  'chemistry2': '高中化学',
  'biology2': '高中生物',
  'bio2': '高中生物', // 兼容旧版本
  'geography2': '高中地理',
  'chinese2': '高中语文',
  'english2': '高中英语',
  'politics2': '高中政治',
  'history2': '高中历史',
  'tech1': '高中信息',
  'tech2': '高中通用',
  // 初中学科
  'science': '初中科学',
  'math': '初中数学',
  'chinese': '初中语文',
  'english': '初中英语',
  'python': '初中python',
  'history': '初中历史',
  'geography': '初中地理',
  'politics': '初中政治'
}

// 学科代码映射（旧版本，保持向后兼容）
const SUBJECT_DICT_OLD = {
  // 高中学科
  '高中数学': 'math2',
  '高中物理': 'physics2', 
  '高中化学': 'chemistry2',
  '高中生物': 'bio2',  // 注意：旧版本使用 bio2
  '高中地理': 'geography2',
  '高中语文': 'chinese2',
  '高中英语': 'english2',
  '高中政治': 'politics2',
  '高中历史': 'history2',
  '高中信息': 'tech1',
  '高中通用': 'tech2',
  // 初中学科
  '初中科学': 'science',
  '初中数学': 'math',
  '初中语文': 'chinese',
  '初中英语': 'english',
  '初中python': 'python',
  '初中历史': 'history',
  '初中地理': 'geography',
  '初中政治': 'politics'
}

/**
 * 根据学科代码获取学科名称
 * @param {string} subjectCode - 学科代码
 * @param {boolean} useOldMapping - 是否使用旧版本映射，默认false
 * @returns {string} 学科名称
 */
export function getSubjectNameFromCode(subjectCode, useOldMapping = false) {
  if (!subjectCode) return '未知学科'
  
  // 直接使用预定义的反向映射，支持bio2等兼容代码
  return SUBJECT_CODE_TO_NAME[subjectCode] || '未知学科'
}

/**
 * 根据学科名称获取学科代码
 * @param {string} subjectName - 学科名称
 * @param {boolean} useOldMapping - 是否使用旧版本映射，默认false
 * @returns {string} 学科代码
 */
export function getSubjectCodeFromName(subjectName, useOldMapping = false) {
  if (!subjectName) return ''
  
  const mapping = useOldMapping ? SUBJECT_DICT_OLD : SUBJECT_DICT_NEW
  
  return mapping[subjectName] || ''
}

/**
 * 获取所有学科名称列表
 * @param {boolean} useOldMapping - 是否使用旧版本映射，默认false
 * @returns {Array<string>} 学科名称数组
 */
export function getAllSubjectNames(useOldMapping = false) {
  const mapping = useOldMapping ? SUBJECT_DICT_OLD : SUBJECT_DICT_NEW
  return Object.keys(mapping)
}

/**
 * 获取所有学科代码列表
 * @param {boolean} useOldMapping - 是否使用旧版本映射，默认false
 * @returns {Array<string>} 学科代码数组
 */
export function getAllSubjectCodes(useOldMapping = false) {
  const mapping = useOldMapping ? SUBJECT_DICT_OLD : SUBJECT_DICT_NEW
  return Object.values(mapping)
}

/**
 * 检查学科代码是否存在
 * @param {string} subjectCode - 学科代码
 * @param {boolean} useOldMapping - 是否使用旧版本映射，默认false
 * @returns {boolean} 是否存在
 */
export function isValidSubjectCode(subjectCode, useOldMapping = false) {
  const mapping = useOldMapping ? SUBJECT_DICT_OLD : SUBJECT_DICT_NEW
  return Object.values(mapping).includes(subjectCode)
}

/**
 * 检查学科名称是否存在
 * @param {string} subjectName - 学科名称
 * @param {boolean} useOldMapping - 是否使用旧版本映射，默认false
 * @returns {boolean} 是否存在
 */
export function isValidSubjectName(subjectName, useOldMapping = false) {
  const mapping = useOldMapping ? SUBJECT_DICT_OLD : SUBJECT_DICT_NEW
  return Object.keys(mapping).includes(subjectName)
}

/**
 * 获取学科映射对象
 * @param {boolean} useOldMapping - 是否使用旧版本映射，默认false
 * @returns {Object} 学科映射对象
 */
export function getSubjectMapping(useOldMapping = false) {
  return useOldMapping ? SUBJECT_DICT_OLD : SUBJECT_DICT_NEW
}

/**
 * 检查是否应该显示某个科目
 * @param {string} subjectName - 科目名称
 * @param {string} teacherSubject - 教师科目
 * @param {string} level - 学段级别 ('high' 或 'middle')
 * @returns {boolean} 是否应该显示
 */
export function shouldShowSubject(subjectName, teacherSubject, level = 'high') {
  // 如果没有教师科目信息，默认显示所有科目
  if (!teacherSubject) {
    return true
  }

  // 检查教师科目字符串是否包含当前科目名称
  // 例如：如果 teacherSubject 是 "高中数学高中物理"，而 subjectName 是 "数学"，则返回 true
  // 例如：如果 teacherSubject 是 "高中数学"，而 subjectName 是 "物理"，则返回 false
  return teacherSubject.includes(subjectName)
}

// 默认导出新版本映射
export default {
  getSubjectNameFromCode,
  getSubjectCodeFromName,
  getAllSubjectNames,
  getAllSubjectCodes,
  isValidSubjectCode,
  isValidSubjectName,
  getSubjectMapping,
  shouldShowSubject,
  SUBJECT_DICT_NEW,
  SUBJECT_DICT_OLD,
  SUBJECT_CODE_TO_NAME
}