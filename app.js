let data = {
  title: 'PTE 英语突击课程表',
  tempTitle: 'PTE 英语突击课程表',
  settingDialogVisible: false,
  times: [
    {
      time: '22:30 - 6:20',
      intro: '睡觉',
    },
  ],
  days: {
    Thu: [
      {
        type: 'rest',
        content: '睡觉起床',
      },
    ],
    Sat: [
      {
        type: 'rest',
        content: '睡觉起床',
      },
    ],
    Sun: [
      {
        type: 'rest',
        content: '自由安排',
      },
    ],
    Fri: [
      {
        type: 'rest',
        content: '睡觉起床',
      },
    ],
    Wen: [
      {
        type: 'rest',
        content: '睡觉起床',
      },
    ],
    Tue: [
      {
        type: 'rest',
        content: '睡觉起床',
      },
    ],
    Mon: [
      {
        type: 'rest',
        content: '睡觉起床',
      },
    ],
  },
  week: ['Mon', 'Tue', 'Wen', 'Thu', 'Fri', 'Sat', 'Sun'],
};

new Vue({
  el: '#app',
  data: function() {
    return data;
  },
  methods: {
    formatContent: function(day, index) {
      return (this.days[day][index] || {}).content || '空区间';
    },
    updateSchedule: function() {
      this.title = this.tempTitle;
      this.settingDialogVisible = false;
    },
  },
});
