let defaultData = {
  title: 'PTE 英语突击课程表',
  times: [
    {
      time: '22:30 - 6:20',
      intro: '睡觉',
    },
  ],
  days: {
    Thu: [
      {
        content: '睡觉起床',
      },
    ],
    Sat: [
      {
        content: '睡觉起床',
      },
    ],
    Sun: [
      {
        content: '自由安排',
      },
    ],
    Fri: [
      {
        content: '睡觉起床',
      },
    ],
    Wen: [
      {
        content: '睡觉起床',
      },
    ],
    Tue: [
      {
        content: '睡觉起床',
      },
    ],
    Mon: [
      {
        content: '睡觉起床',
      },
    ],
  },
  week: ['Mon', 'Tue', 'Wen', 'Thu', 'Fri', 'Sat', 'Sun'],
  currentEditableCell: '',
};

// hack Vue 的 data 跟实际业务数据 + 一大堆内置对象偶合在一起了，用这个做个记录
let dataOfData = {};
// 枚举要存储的业务字段，方便下面 updateLocalData 做合并，真脏
function updateDataOfData(thisVue) {
  dataOfData = {
    ...dataOfData,
    title: thisVue.title,
    times: thisVue.times,
    days: thisVue.days,
    week: thisVue.week,
  };
}

// 本地存储
const localDataStr = window.localStorage.getItem('schedule') || '{}';
function getLocalData() {
  return JSON.parse(localDataStr);
}
function updateLocalData(data) {
  window.localStorage.setItem(
    'schedule',
    JSON.stringify({ ...dataOfData, ...data }),
  );
}

new Vue({
  el: '#app',
  data: function() {
    updateDataOfData({ ...defaultData, ...JSON.parse(localDataStr) });
    return { ...defaultData, ...JSON.parse(localDataStr) };
  },
  methods: {
    formatContent: function({ day, timeIndex }) {
      return (this.days[day][timeIndex] || {}).content || '空区间';
    },
    updateSchedule: function({ tempTimes: newTimes, tempTitle: newTitle }) {
      this.title = newTitle;
      this.times = newTimes;
      updateDataOfData(this);
      updateLocalData({
        title: newTitle,
        times: newTimes,
      });
    },
    editCell: function({ day, timeIndex }, event) {
      this.currentEditableCell = day + '|' + timeIndex;
      setTimeout(() => {
        event.target.focus();
      }, 0);
    },
    getEditableStatus: function({ day, timeIndex }) {
      if (
        this.currentEditableCell &&
        this.currentEditableCell === day + '|' + timeIndex
      ) {
        return 'plaintext-only';
      }
      return 'false';
    },
    lostEditableStatus: function({ day, timeIndex }, event) {
      this.currentEditableCell = '';
      const newScheduleText = event.target.innerHTML;
      this.days[day][timeIndex] = {
        content: newScheduleText,
      };
      updateDataOfData(this);
      updateLocalData({
        days: this.days,
      });
    },
  },
});
