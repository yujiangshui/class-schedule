let defaultData = {
  title: 'PTE 英语突击课程表',
  times: [
    {
      time: '22:30 - 6:20',
      intro: '睡觉',
    },
    {
      time: '6:20 - 6:30',
      intro: '洗漱',
    },
    {
      time: '6:30 - 7:10',
      intro: '早自习',
    },
    {
      time: '7:10 - 8:00',
      intro: '早餐',
    },
    {
      time: '8:00 - 8:40',
      intro: '第一节',
    },
    {
      time: '8:50 - 9:30',
      intro: '第二节',
    },
    {
      time: '9:30 - 10:00',
      intro: '课间操',
    },
    {
      time: '10:00 - 10:40',
      intro: '第三节',
    },
    {
      time: '10:50 - 11:30',
      intro: '第四节',
    },
    {
      time: '11:30 - 13:30',
      intro: '午饭',
    },
    {
      time: '13:30 - 14:10',
      intro: '第五节',
    },
    {
      time: '14:20 - 15:00',
      intro: '第六节',
    },
    {
      time: '15:00 - 15:30',
      intro: '课间操',
    },
    {
      time: '15:30 - 16:10',
      intro: '第七节',
    },
    {
      time: '16:20 - 17:00',
      intro: '第八节',
    },
    {
      time: '17:00 - 17:30',
      intro: '自由活动',
    },
    {
      time: '17:30 - 19:30',
      intro: '晚饭',
    },
    {
      time: '19:30 - 20:00',
      intro: '晚自习1',
    },
    {
      time: '20:10 - 20:50',
      intro: '晚自习2',
    },
    {
      time: '21:00 - 21:40',
      intro: '晚自习3',
    },
    {
      time: '21:50 - 22:30',
      intro: '洗漱睡觉',
    },
  ],
  days: {
    Thu: [],
    Sat: [],
    Sun: [],
    Fri: [],
    Wen: [],
    Tue: [],
    Mon: [],
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
  // todo develop mode
  // return { ...defaultData };
  return { ...defaultData, ...JSON.parse(localDataStr) };
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
    updateDataOfData(getLocalData());
    return getLocalData();
  },
  methods: {
    formatContent: function({ day, timeIndex }) {
      return (this.days[day][timeIndex] || {}).content || '暂无安排';
    },
    updateSchedule: function({
      tempTimes: newTimes,
      tempTitle: newTitle,
      deletedTimes,
    }) {
      // 删除时间后，需要将对应行的数据清理
      if (deletedTimes.length > 0) {
        let oldTime = deepcopy(this.times);
        let deletedTimeIndexs = [];
        let deletedTimesStr = deletedTimes.join(',');
        oldTime.forEach((time, timeIndex) => {
          if (deletedTimesStr.indexOf(time.time) > -1) {
            deletedTimeIndexs.push(timeIndex);
          }
        });
        deletedTimeIndexs
          .sort((a, b) => {
            return a - b;
          })
          // 取反是因为从前往后 splice index 错位了
          .reverse()
          .forEach((deletedTimeIndex) => {
            Object.keys(this.days).forEach((key) => {
              this.days[key].splice(deletedTimeIndex, 1);
            });
          });
      }

      this.title = newTitle;
      this.times = newTimes;
      updateDataOfData(this);
      updateLocalData({
        title: this.title,
        times: this.times,
        days: this.days,
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
