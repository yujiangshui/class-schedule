const defaultData = {
  title: 'PTE 英语突击课程表',
  times: [
    {
      time: '22:30 - 06:20',
      intro: '睡觉',
    },
    {
      time: '06:20 - 06:30',
      intro: '洗漱',
    },
    {
      time: '06:30 - 07:10',
      intro: '早自习',
    },
    {
      time: '07:10 - 08:00',
      intro: '早餐',
    },
    {
      time: '08:00 - 08:40',
      intro: '第一节',
    },
    {
      time: '08:50 - 09:30',
      intro: '第二节',
    },
    {
      time: '09:30 - 10:00',
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
  tempTimeRangeArray: [],
  haveReportedTimeIndexs: {},
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

// 用来拼装时间段换算时间戳
const todayDate = dateFns.format(Date.now(), 'YYYY-MM-DD 🤠');
const getTimeStamp = (timeString) => {
  return dateFns.getTime(todayDate.replace('🤠', timeString.trim()));
};

new Vue({
  el: '#app',
  mounted: function() {
    this.updateTimeRangeArray();

    // 检测时间进行报时操作
    function checkAndReportTask() {
      const currentTime = Date.now();
      const timeRanges = this.tempTimeRangeArray;
      let needReportTimeIndex = '';
      timeRanges.some((timeRange, timeIndex) => {
        if (currentTime < timeRange[1] && !needReportTimeIndex) {
          needReportTimeIndex = timeIndex;
          return true;
        }
        return false;
      });

      if (
        needReportTimeIndex &&
        !this.haveReportedTimeIndexs[needReportTimeIndex]
      ) {
        const weekNo = dateFns.getISODay(Date.now());
        this.haveReportedTimeIndexs[needReportTimeIndex] = true;
        const reportInfo =
          (this.days[this.week[weekNo - 1]][needReportTimeIndex] || {})
            .content || '当前时段暂无安排';
        responsiveVoice.speak(reportInfo, 'Chinese Female');
      }
    }

    setInterval(() => {
      checkAndReportTask.bind(this)();
    }, 1000);
  },
  data: function() {
    updateDataOfData(getLocalData());
    return getLocalData();
  },
  methods: {
    updateTimeRangeArray: function() {
      const times = this.times;
      times
        .filter((timeItem) => {
          // 不按照时间格式写的先略过吧，后面再加个添加时间的格式校验
          return timeItem.time.indexOf('-') > -1;
        })
        .forEach((timeItem) => {
          const [timeStart, timeEnd] = timeItem.time.split('-');
          const timeStartValue = getTimeStamp(timeStart);
          const timeEndValue = getTimeStamp(timeEnd);
          // 兼容 23:00 - 06:00 这种情况
          if (timeStartValue > timeEndValue) {
            this.tempTimeRangeArray.push([0, timeEndValue]);
          } else {
            this.tempTimeRangeArray.push([timeStartValue, timeEndValue]);
          }
        });
    },
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
      this.updateTimeRangeArray();
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
      // 如果修改的是周一，默认把每天这个时间段没设置的设置一下
      if (day === 'Mon') {
        for (let weekNo = 1; weekNo < 7; weekNo++) {
          const currentDay = this.week[weekNo];
          if (!this.days[currentDay][timeIndex]) {
            this.days[currentDay][timeIndex] = {
              content: newScheduleText,
            };
          }
        }
      }
      updateDataOfData(this);
      updateLocalData({
        days: this.days,
      });
    },
  },
});
