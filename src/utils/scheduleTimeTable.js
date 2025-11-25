/**
 * 作息时间表配置
 * 根据2024年12月2日冬季作息时间表(执行)制定
 */

// 作息时间表配置
export const scheduleTimeTable = {
  // 周一的时间安排
  monday: {
    1: { start: '07:30', end: '08:15' },
    2: { start: '08:25', end: '09:10' },
    3: { start: '09:50', end: '10:35' },
    4: { start: '10:45', end: '11:30' },
    5: { start: '13:10', end: '13:55' },
    6: { start: '14:05', end: '14:50' },
    7: { start: '15:00', end: '15:45' },
    8: { start: '15:55', end: '16:40' },
    9: { start: '18:05', end: '19:05' },
    10: { start: '19:20', end: '20:20' },
    11: { start: '20:30', end: '21:30' }
  },
  // 周二至周五的时间安排
  weekday: {
    1: { start: '07:40', end: '08:25' },
    2: { start: '08:35', end: '09:20' },
    3: { start: '09:50', end: '10:35' },
    4: { start: '10:45', end: '11:30' },
    5: { start: '13:10', end: '13:55' },
    6: { start: '14:05', end: '14:50' },
    7: { start: '15:00', end: '15:45' },
    8: { start: '15:55', end: '16:40' },
    9: { start: '18:05', end: '19:05' },
    10: { start: '19:20', end: '20:20' },
    11: { start: '20:30', end: '21:30' }
  },
  // 周六的时间安排（下午时间与工作日不同）
  saturday: {
    1: { start: '07:40', end: '08:25' },
    2: { start: '08:35', end: '09:20' },
    3: { start: '09:50', end: '10:35' },
    4: { start: '10:45', end: '11:30' },
    5: { start: '13:20', end: '14:05' },
    6: { start: '14:15', end: '15:00' },
    7: { start: '15:15', end: '16:00' },
    8: { start: '16:10', end: '16:55' },
    9: { start: '18:05', end: '19:05' },
    10: { start: '19:20', end: '20:20' },
    11: { start: '20:30', end: '21:30' }
  },
  // 周日的时间安排（下午时间与工作日不同）
  sunday: {
    1: { start: '07:40', end: '08:25' },
    2: { start: '08:35', end: '09:20' },
    3: { start: '09:50', end: '10:35' },
    4: { start: '10:45', end: '11:30' },
    5: { start: '13:20', end: '14:05' },
    6: { start: '14:15', end: '15:00' },
    7: { start: '15:15', end: '16:00' },
    8: { start: '16:10', end: '16:55' },
    9: { start: '18:05', end: '19:05' },
    10: { start: '19:20', end: '20:20' },
    11: { start: '20:30', end: '21:30' }
  }
}

/**
 * 获取指定日期和节数的实际课程时间
 * @param {string} date - 日期字符串 (YYYY-MM-DD)
 * @param {number} period - 节数 (1-11)
 * @returns {Object|null} 返回时间对象 {start: 'HH:mm', end: 'HH:mm'} 或 null
 */
export function getActualCourseTime(date, period) {
  const dateObj = new Date(date)
  const dayOfWeek = dateObj.getDay() // 0=周日, 1=周一, ..., 6=周六
  
  // 确定使用哪个时间表
  let scheduleKey
  if (dayOfWeek === 1) { // 周一
    scheduleKey = 'monday'
  } else if (dayOfWeek === 0) { // 周日
    scheduleKey = 'sunday'
  } else if (dayOfWeek === 6) { // 周六
    scheduleKey = 'saturday'
  } else { // 周二至周五
    scheduleKey = 'weekday'
  }
  
  return scheduleTimeTable[scheduleKey][period] || null
}

/**
 * 获取时间槽配置
 * @returns {Array} 时间槽配置数组
 */
export function getTimeSlots() {
  return [
    // 添加时间段标题
    { time: '07:00', display: '上午', period: 0, isSection: true },
    
    // 上午课程节数 - 使用动态时间
    { time: '07:30', display: '第一节', period: 1, isDynamic: true },
    { time: '08:25', display: '第二节', period: 2, isDynamic: true },
    { time: '09:50', display: '第三节', period: 3, isDynamic: true },
    { time: '10:45', display: '第四节', period: 4, isDynamic: true },
    
    { time: '12:00', display: '下午', period: 0, isSection: true },
    
    // 下午课程节数 - 使用动态时间
    { time: '13:10', display: '第一节', period: 5, isDynamic: true },
    { time: '14:05', display: '第二节', period: 6, isDynamic: true },
    { time: '15:00', display: '第三节', period: 7, isDynamic: true },
    { time: '15:55', display: '第四节', period: 8, isDynamic: true },
    
    { time: '17:00', display: '晚自习', period: 0, isSection: true },
    
    // 晚自习节数 - 使用动态时间
    { time: '18:05', display: '第一节', period: 9, isDynamic: true },
    { time: '19:20', display: '第二节', period: 10, isDynamic: true },
    { time: '20:30', display: '第三节', period: 11, isDynamic: true }
  ]
}

/**
 * 获取作息时间表的完整信息
 * @returns {Object} 作息时间表信息
 */
export function getScheduleInfo() {
  return {
    title: '2024年12月2日冬季作息时间表(执行)',
    description: '基于学校官方作息时间表制定',
    timeTable: scheduleTimeTable,
    lastUpdated: '2024-12-02'
  }
}