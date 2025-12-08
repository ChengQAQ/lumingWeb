import Vue from 'vue'
import Vuex from 'vuex'
import app from './modules/app'
import dict from './modules/dict'
import user from './modules/user'
import tagsView from './modules/tagsView'
import permission from './modules/permission'
import settings from './modules/settings'
import getters from './getters'

Vue.use(Vuex)

const store = new Vuex.Store({
  state: {
    needRefresh: false,
    teacherInfo: null,
    selectedQuestions: [], // 当前科目的已选题目列表
    selectedQuestionsBySubject: {}, // 按科目保存的题目列表 { subjectName: [questions] }
    currentSubject: '', // 当前选中的科目
    // 教师年级学科信息
    teacherGrade: '', // 教师年级（如"高中"）
    teacherSubject: '', // 教师学科（如"数学"）
    teacherSubjectName: '' // 教师年级+学科（如"高中数学"）
  },
  mutations: {
    setNeedRefresh(state, value) {
      state.needRefresh = value
    },
    setTeacherInfo(state, teacherInfo) {
      state.teacherInfo = teacherInfo
      // 根据 teacherInfo 自动计算年级、学科和年级+学科
      if (teacherInfo) {
        // 年级
        if (teacherInfo.grade) {
          state.teacherGrade = teacherInfo.grade
        }
        // 学科
        if (teacherInfo.subjectNames) {
          state.teacherSubject = teacherInfo.subjectNames
        }
        // 年级+学科拼接
        if (teacherInfo.grade && teacherInfo.subjectNames) {
          state.teacherSubjectName = teacherInfo.grade + teacherInfo.subjectNames
        } else if (teacherInfo.gradeAndSubject) {
          // 兼容旧的字段名
          state.teacherSubjectName = teacherInfo.gradeAndSubject
          // 尝试从 gradeAndSubject 中提取年级和学科
          const match = teacherInfo.gradeAndSubject.match(/^(高中|初中)(.+)$/)
          if (match) {
            state.teacherGrade = match[1]
            state.teacherSubject = match[2]
          }
        }
      } else {
        // 清空数据
        state.teacherGrade = ''
        state.teacherSubject = ''
        state.teacherSubjectName = ''
      }
    },
    // 设置当前科目
    setCurrentSubject(state, subject) {
      // 如果科目发生变化，先保存当前科目的题目列表
      if (state.currentSubject && state.currentSubject !== subject) {
        state.selectedQuestionsBySubject = {
          ...state.selectedQuestionsBySubject,
          [state.currentSubject]: [...(state.selectedQuestions || [])]
        }
      }
      
      // 设置新科目
      state.currentSubject = subject || ''
      
      // 加载新科目对应的题目列表
      if (subject && state.selectedQuestionsBySubject[subject]) {
        state.selectedQuestions = [...state.selectedQuestionsBySubject[subject]]
      } else {
        state.selectedQuestions = []
      }
    },
    setSelectedQuestions(state, questions) {
      state.selectedQuestions = questions || []
      // 同时保存到当前科目的题目列表
      if (state.currentSubject) {
        state.selectedQuestionsBySubject = {
          ...state.selectedQuestionsBySubject,
          [state.currentSubject]: [...(questions || [])]
        }
      }
    },
    addSelectedQuestion(state, question) {
      // 检查是否已存在
      const questionId = question.sid || question.SID || question.questionSid
      if (!questionId) {
        return
      }
      
      // 确保 selectedQuestions 是数组
      if (!Array.isArray(state.selectedQuestions)) {
        state.selectedQuestions = []
      }
      
      const exists = state.selectedQuestions.some(q => {
        const qId = q.sid || q.SID || q.questionSid
        return qId === questionId || String(qId) === String(questionId)
      })
      
      if (!exists) {
        // 使用 Vue.set 确保响应式
        state.selectedQuestions = [...state.selectedQuestions, question]
        
        // 同时保存到当前科目的题目列表
        if (state.currentSubject) {
          state.selectedQuestionsBySubject = {
            ...state.selectedQuestionsBySubject,
            [state.currentSubject]: [...state.selectedQuestions]
          }
        }
      }
    },
    removeSelectedQuestion(state, sid) {
      if (!sid) return
      
      const index = state.selectedQuestions.findIndex(q => {
        const qId = q.sid || q.SID || q.questionSid
        return qId === sid || String(qId) === String(sid)
      })
      
      if (index > -1) {
        // 使用数组展开确保响应式
        state.selectedQuestions = state.selectedQuestions.filter((q, i) => i !== index)
        
        // 同时更新当前科目的题目列表
        if (state.currentSubject) {
          state.selectedQuestionsBySubject = {
            ...state.selectedQuestionsBySubject,
            [state.currentSubject]: [...state.selectedQuestions]
          }
        }
      }
    },
    clearSelectedQuestions(state) {
      state.selectedQuestions = []
      // 同时清空当前科目的题目列表
      if (state.currentSubject) {
        state.selectedQuestionsBySubject = {
          ...state.selectedQuestionsBySubject,
          [state.currentSubject]: []
        }
      }
    }
  },
  modules: {
    app,
    dict,
    user,
    tagsView,
    permission,
    settings
  },
  getters
})

export default store
