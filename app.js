const defaultData = {
  title: 'My Class Schedule',
  times: [
    {
      time: '06:20 - 06:30',
      intro: 'Morning Washing',
    },
    {
      time: '06:30 - 07:10',
      intro: 'Morning Studies',
    },
    {
      time: '07:10 - 08:00',
      intro: 'Breakfast',
    },
    {
      time: '08:00 - 08:40',
      intro: 'Class',
    },
    {
      time: '08:50 - 09:30',
      intro: 'Class',
    },
    {
      time: '09:30 - 10:00',
      intro: 'Break',
    },
    {
      time: '10:00 - 10:40',
      intro: 'Class',
    },
    {
      time: '10:50 - 11:30',
      intro: 'Class',
    },
    {
      time: '11:30 - 13:30',
      intro: 'Lunch',
    },
    {
      time: '13:30 - 14:10',
      intro: 'Class',
    },
    {
      time: '14:20 - 15:00',
      intro: 'Class',
    },
    {
      time: '15:00 - 15:30',
      intro: 'Break',
    },
    {
      time: '15:30 - 16:10',
      intro: 'Class',
    },
    {
      time: '16:20 - 17:00',
      intro: 'Class',
    },
    {
      time: '17:00 - 17:30',
      intro: 'Exercise',
    },
    {
      time: '17:30 - 19:30',
      intro: 'Dinner',
    },
    {
      time: '19:30 - 20:00',
      intro: 'Evening Studies',
    },
    {
      time: '20:10 - 20:50',
      intro: 'Evening Studies',
    },
    {
      time: '21:00 - 21:40',
      intro: 'Evening Studies',
    },
    {
      time: '21:50 - 22:30',
      intro: 'Prepare for Sleep',
    },
    {
      time: '22:30 - 06:20',
      intro: 'Sleep',
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
  currentHightlightCell: '',
  tempTimeRangeArray: [],
};

// hack. The data in Vue mixed with a bunch of internal objects, so use this to record external objects.
let dataOfData = {};
// List the business keys which used by updateLocalData function.
function updateDataOfData(thisVue) {
  dataOfData = {
    ...dataOfData,
    title: thisVue.title,
    times: thisVue.times,
    days: thisVue.days,
    week: thisVue.week,
  };
}

// record data by localStorage
const localDataStr = window.localStorage.getItem('schedule') || '{}';
function getLocalData() {
  return { ...defaultData, ...JSON.parse(localDataStr) };
}
function updateLocalData(data) {
  window.localStorage.setItem(
    'schedule',
    JSON.stringify({ ...dataOfData, ...data }),
  );
}

// hack. Because I don't create a Scope for this app.js, there has been a conflict between app.js and components.js if I use the same name getTimeStamp, so I changed the name. The better way is to use Vue cli to generate projects and coding, but this project is experimental.
const getTimeStamp = (timeString) => {
  const dateTemplate = dateFns.format(Date.now(), 'YYYY-MM-DD 🤠');
  return dateFns.getTime(dateTemplate.replace('🤠', timeString.trim()));
};

new Vue({
  el: '#app',
  mounted: function() {
    this.updateTimeRangeArray();

    // check the time and report
    function checkAndReportTask() {
      const currentTime = Date.now();
      const weekNo = dateFns.getISODay(Date.now());
      let needReportTimeIndexs = [];
      this.tempTimeRangeArray.forEach((timeRange, timeIndex) => {
        const [start, end] = timeRange;
        if (Math.abs(currentTime - start) < 1000) {
          needReportTimeIndexs.push(`${timeIndex}|start`);
        }
        if (Math.abs(currentTime - end) < 1000) {
          needReportTimeIndexs.push(`${timeIndex}|end`);
        }

        if (currentTime > start && currentTime < end) {
          this.currentHightlightCell = `${this.week[weekNo - 1]}|${timeIndex}`;
        }
      });

      let speakMessages = [];
      needReportTimeIndexs.forEach((indexItem) => {
        const [timeIndex, reportType] = indexItem.split('|');
        const reportInfo = (this.days[this.week[weekNo - 1]][timeIndex] || {})
          .content;
        const reportTime = this.times[timeIndex].time;
        const [startTime, endTime] = reportTime.split('-');
        if (reportType === 'start') {
          if (speakMessages.length > 0) {
            speakMessages.push(
              `${
                reportInfo
                  ? reportInfo + ' has started'
                  : 'A new mission has started'
              }`,
            );
          } else {
            speakMessages.push(
              `Now is ${startTime} ${
                reportInfo
                  ? reportInfo + ' has started'
                  : 'A new mission has started'
              }`,
            );
          }
        } else {
          if (speakMessages.length > 0) {
            speakMessages.push(
              `${
                reportInfo
                  ? reportInfo + ' has finished'
                  : 'The current mission has finished.'
              }`,
            );
          } else {
            speakMessages.push(
              `Now is ${endTime} ${
                reportInfo
                  ? reportInfo + ' has finished'
                  : 'The current mission has finished.'
              }`,
            );
          }
        }
      });

      if (speakMessages.length) {
        responsiveVoice.speak(
          speakMessages.join(' Meanwhile '),
          'US English Female',
        );
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
      this.tempTimeRangeArray = [];
      times.forEach((timeItem) => {
        const [timeStart, timeEnd] = timeItem.time.split('-');
        const timeStartValue = getTimeStamp(timeStart);
        const timeEndValue = getTimeStamp(timeEnd);
        // For 23:00 - 06:00 situation. Treat 06:00 as the next day.
        if (timeStartValue > timeEndValue) {
          this.tempTimeRangeArray.push([
            timeStartValue,
            timeEndValue + 1000 * 60 * 60 * 24,
          ]);
        } else {
          this.tempTimeRangeArray.push([timeStartValue, timeEndValue]);
        }
      });
    },
    formatContent: function({ day, timeIndex }) {
      return (this.days[day][timeIndex] || {}).content || 'None';
    },
    updateSchedule: function({
      tempTimes: newTimes,
      tempTitle: newTitle,
      deletedTimes,
    }) {
      // Need to delete the related data when deleting the time.
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
          // use reverse because use splice will changing the index
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
      const targetElement = event.target;
      const targetChildNodes = targetElement.childNodes;
      const newScheduleText = targetElement.innerText;
      this.days[day][timeIndex] = {
        content: newScheduleText,
      };
      // if a user modifies the cell of Monday and if other cells in one row are 'None', then change together.
      if (day === 'Mon') {
        for (let weekNo = 1; weekNo < 7; weekNo++) {
          const currentDay = this.week[weekNo];
          if (!this.days[currentDay][timeIndex]) {
            this.days[currentDay][timeIndex] = {
              content: newScheduleText,
            };
          }
          for (let i = 1; i < targetChildNodes.length; i++) {
            targetElement.removeChild(targetChildNodes[i]);
          }
        }
      }
      updateDataOfData(this);
      updateLocalData({
        days: this.days,
      });
    },
    getHighlightClass: function({ day, timeIndex }) {
      if (this.currentHightlightCell === `${day}|${timeIndex}`) {
        return 'cell-highlight';
      } else {
        return '';
      }
    },
  },
});
