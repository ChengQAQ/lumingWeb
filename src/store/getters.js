const getters = {
  selectedQuestions: state => state.selectedQuestions || [],
  sidebar: state => state.app.sidebar,
  size: state => state.app.size,
  device: state => state.app.device,
  dict: state => state.dict.dict,
  visitedViews: state => state.tagsView.visitedViews,
  cachedViews: state => state.tagsView.cachedViews,
  token: state => state.user.token,
  avatar: state => state.user.avatar,
  id: state => state.user.id,
  name: state => state.user.name,
  nickName: state => state.user.nickName,
  introduction: state => state.user.introduction,
  roles: state => state.user.roles,
  permissions: state => state.user.permissions,
  permission_routes: state => state.permission.routes,
  topbarRouters: state => state.permission.topbarRouters,
  defaultRoutes: state => state.permission.defaultRoutes,
  sidebarRouters: state => state.permission.sidebarRouters,
  needRefresh: state => state.needRefresh,
  teacherInfo: state => state.teacherInfo,
  // 教师年级学科相关 getters
  teacherGrade: state => state.teacherGrade || '',
  teacherSubject: state => state.teacherSubject || '',
  teacherSubjectName: state => state.teacherSubjectName || ''
}
export default getters
