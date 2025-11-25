/**
 * 题型映射配置
 * 包含初中和高中各学科的题型映射关系
 */

// 初中科学题型映射
const QUESTION_TYPE_SCIENCE = {
  "选择题": 1,
  "填空题": 2,
  "多选题": 3,
  "判断题": 4,
  "作图题": 5,
  "实验探究题": 6,
  "计算题": 7,
  "推断题": 8,
  "解答题": 9,
  "连线题": 10
}

// 初中数学题型映射
const QUESTION_TYPE_MATH = {
  "选择题": 1,
  "填空题": 2,
  "多选题": 3,
  "判断题": 4,
  "解答题": 9
}

// 初中语文题型映射
const QUESTION_TYPE_CHINESE = {
  "选择题": 1,
  "填空题": 2,
  "多选题": 3,
  "基础知识": 4,
  "语言运用": 5,
  "名著阅读": 6,
  "综合读写": 7,
  "默写": 8,
  "解答题": 9,
  "翻译": 10,
  "古诗词赏析": 11,
  "文言文阅读": 12,
  "现代文阅读": 13,
  "作文": 14,
  "汉字书写": 15,
  "综合性学习": 16
}

// 初中英语题型映射
const QUESTION_TYPE_ENGLISH = {
  "选择题": 1,
  "填空题": 2,
  "完形填空": 5,
  "阅读理解": 6,
  "书面表达": 7,
  "词汇应用": 8,
  "解答题": 9,
  "句型转换": 11,
  "补全对话": 12,
  "单句改错": 14,
  "听力题": 15,
  "语音题": 17,
  "用所给单词正确形式填空": 18,
  "根据汉语提示完成句子": 19,
  "翻译题": 20,
  "连词成句": 21,
  "语法填空": 22,
  "语法选择": 23,
  "短文还原": 24,
  "选词填空": 25,
  "短文填空": 26,
  "单词拼写": 27,
  "任务型阅读": 28,
  "阅读翻译": 29,
  "情景运用": 30,
  "句子排序": 31,
  "听力填空": 32,
  "听力匹配": 33,
  "听力判断": 34,
  "听力排序": 35,
  "短文改错": 36,
  "抄写题": 37,
  "单句选词": 38,
  "听说题": 39
}

// 初中政治题型映射
const QUESTION_TYPE_POLITICS = {
  "选择题": 1,
  "填空题": 2,
  "多选题": 3,
  "判断题": 4,
  "简答题": 5,
  "辨析题": 6,
  "评析题": 7,
  "阐述见解题": 8,
  "材料分析题": 9,
  "判断说理题": 10,
  "情境探究题": 11,
  "分析说明题": 12,
  "综合探究题": 13
}

// 初中历史题型映射
const QUESTION_TYPE_HISTORY = {
  "选择题": 1,
  "填空题": 2,
  "多选题": 3,
  "辨析题": 4,
  "材料题": 5,
  "解答题": 9,
  "判断题": 10,
  "论述题": 11
}

// 初中地理题型映射
const QUESTION_TYPE_GEOGRAPHY = {
  "选择题": 1,
  "填空题": 2,
  "多选题": 3,
  "判断题": 4,
  "连线题": 5,
  "解答题": 9
}

// 高中数学题型映射
const QUESTION_TYPE_MATH2 = {
  "选择题": 1,
  "填空题": 2,
  "多选题": 3,
  "判断题": 4,
  "解答题": 9
}

// 高中物理题型映射
const QUESTION_TYPE_PHYSICS2 = {
  "选择题": 1,
  "填空题": 2,
  "多选题": 3,
  "判断题": 4,
  "作图题": 5,
  "实验题": 6,
  "解答题": 9
}

// 高中化学题型映射
const QUESTION_TYPE_CHEMISTRY2 = {
  "选择题": 1,
  "填空题": 2,
  "多选题": 3,
  "判断题": 4,
  "实验题": 6,
  "计算题": 7,
  "推断题": 8,
  "解答题": 9,
  "工艺流程题": 10
}

// 高中生物题型映射
const QUESTION_TYPE_BIOLOGY2 = {
  "选择题": 1,
  "填空题": 2,
  "多选题": 3,
  "判断题": 4,
  "实验题": 6,
  "解答题": 9
}

// 高中地理题型映射
const QUESTION_TYPE_GEOGRAPHY2 = {
  "选择题": 1,
  "填空题": 2,
  "多选题": 3,
  "判断题": 4,
  "解答题": 9
}

// 高中语文题型映射
const QUESTION_TYPE_CHINESE2 = {
  "选择题": 1,
  "填空题": 2,
  "多选题": 3,
  "现代文阅读": 4,
  "文言文阅读": 5,
  "诗歌阅读": 6,
  "默写": 7,
  "语言表达": 8,
  "解答题": 9,
  "名著导读": 10,
  "作文": 11,
  "语言文字应用": 12,
  "判断题": 13
}

// 高中英语题型映射
const QUESTION_TYPE_ENGLISH2 = {
  "选择题": 1,
  "填空题": 2,
  "完形填空": 5,
  "阅读理解": 6,
  "书面表达": 7,
  "听力题": 8,
  "解答题": 9,
  "短文改错": 10,
  "信息匹配": 11,
  "词汇应用": 12,
  "语法填空": 13,
  "完成句子": 14,
  "句型转换": 15,
  "对话填空": 16,
  "选词填空": 17,
  "翻译题": 18,
  "短文填空": 19,
  "词性转换": 20,
  "单词拼写": 21,
  "其他阅读题型": 22,
  "句子改错": 23
}

// 高中政治题型映射
const QUESTION_TYPE_POLITICS2 = {
  "选择题": 1,
  "填空题": 2,
  "多选题": 3,
  "辨析评析题": 4,
  "判断题": 5,
  "材料题": 6,
  "解答题": 9,
  "论述题": 10,
  "图表题": 11,
  "探究类试题": 12,
  "简答题": 13
}

// 高中历史题型映射
const QUESTION_TYPE_HISTORY2 = {
  "选择题": 1,
  "填空题": 2,
  "多选题": 3,
  "材料题": 4,
  "判断题": 5,
  "解答题": 9,
  "论述题": 10
}

// 高中信息技术题型映射
const QUESTION_TYPE_TECH1 = {
  "选择题": 1,
  "填空题": 2,
  "多选题": 3,
  "判断题": 4,
  "操作题": 7,
  "简答题": 9
}

// 高中通用技术题型映射
const QUESTION_TYPE_TECH2 = {
  "选择题": 1,
  "填空题": 2,
  "多选题": 3,
  "判断题": 4,
  "作图题": 5,
  "分析评价题": 6,
  "操作题": 7,
  "简答题": 9
}

// ==================== 题型映射汇总 ====================

// 学科到题型映射的总表
export const QUESTION_TYPE_MAPPINGS = {
  // 初中学科
  "初中科学": QUESTION_TYPE_SCIENCE,
  "初中数学": QUESTION_TYPE_MATH,
  "初中语文": QUESTION_TYPE_CHINESE,
  "初中英语": QUESTION_TYPE_ENGLISH,
  "初中政治": QUESTION_TYPE_POLITICS,
  "初中历史": QUESTION_TYPE_HISTORY,
  "初中地理": QUESTION_TYPE_GEOGRAPHY,
  // 高中学科
  "高中数学": QUESTION_TYPE_MATH2,
  "高中物理": QUESTION_TYPE_PHYSICS2,
  "高中化学": QUESTION_TYPE_CHEMISTRY2,
  "高中生物": QUESTION_TYPE_BIOLOGY2,
  "高中地理": QUESTION_TYPE_GEOGRAPHY2,
  "高中语文": QUESTION_TYPE_CHINESE2,
  "高中英语": QUESTION_TYPE_ENGLISH2,
  "高中政治": QUESTION_TYPE_POLITICS2,
  "高中历史": QUESTION_TYPE_HISTORY2,
  "高中信息": QUESTION_TYPE_TECH1,
  "高中通用": QUESTION_TYPE_TECH2
}

// 支持的学科列表
export const SUPPORTED_SUBJECTS = Object.keys(QUESTION_TYPE_MAPPINGS)

// 来源列表
export const SOURCE_LIST = ['菁优网', '麓鸣资源']

// ==================== 工具方法 ====================

/**
 * 获取指定学科的题型映射
 * @param {string} subject 学科名称
 * @returns {Object} 题型映射对象
 */
export function getQuestionTypes(subject) {
  return QUESTION_TYPE_MAPPINGS[subject] || {}
}

/**
 * 获取指定学科的题型代码
 * @param {string} subject 学科名称
 * @param {string} questionType 题型名称
 * @returns {number} 题型代码，如果未找到返回0
 */
export function getQuestionTypeCode(subject, questionType) {
  const typeMapping = getQuestionTypes(subject)
  return typeMapping[questionType] || 0
}

/**
 * 检查学科是否支持
 * @param {string} subject 学科名称
 * @returns {boolean} 是否支持
 */
export function isSubjectSupported(subject) {
  return SUPPORTED_SUBJECTS.includes(subject)
}

/**
 * 获取所有支持的学科
 * @returns {Array} 学科列表
 */
export function getSupportedSubjects() {
  return [...SUPPORTED_SUBJECTS]
}

/**
 * 格式化题型数据为选项格式
 * @param {string} subject 学科名称
 * @returns {Array} 格式化的选项数组
 */
export function formatQuestionTypeOptions(subject) {
  const typeMapping = getQuestionTypes(subject)
  return Object.entries(typeMapping).map(([name, id]) => ({
    label: name,
    value: name,
    id: id
  }))
}

/**
 * 根据学科和cate值获取对应的题型名称
 * @param {string} subject 学科名称
 * @param {number} cateCode cate代码
 * @returns {string} 题型名称，如果未找到返回空字符串
 */
export function getQuestionTypeByCode(subject, cateCode) {
  const typeMapping = getQuestionTypes(subject)
  const entry = Object.entries(typeMapping).find(([name, code]) => code === cateCode)
  return entry ? entry[0] : ''
}

export default {
  QUESTION_TYPE_MAPPINGS,
  SUPPORTED_SUBJECTS,
  SOURCE_LIST,
  getQuestionTypes,
  getQuestionTypeCode,
  isSubjectSupported,
  getSupportedSubjects,
  formatQuestionTypeOptions,
  getQuestionTypeByCode
}