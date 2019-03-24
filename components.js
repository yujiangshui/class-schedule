// The regular expression matches something like 02:13 - 02:12
const timeREG = /(\s+)?([0-2][0-9]:[0-5][0-9])(\s)?-(\s)?([0-2][0-9]:[0-5][0-9])(\s+)?/;
// The regular expression matches something like 26:36
const badTimeREG = /2[4-9]:/;
// Meanwhile, don't support 'start time' equal 'end time' cases
const badEqualTimeREG = /(\s+)?([0-2][0-9]:[0-5][0-9])(\s)?-(\s)?(\2)(\s+)?/;

const getTimeValue = (timeString) => {
  const dateTemplate = dateFns.format(Date.now(), 'YYYY-MM-DD 🤠');
  return dateFns.getTime(dateTemplate.replace('🤠', timeString.trim()));
};

Vue.component('setting-dialog', {
  props: {
    title: String,
    times: {
      type: Array,
      default: function() {
        return [];
      },
    },
  },
  data: function() {
    return {
      tempTimes: deepcopy(this.times),
      tempTitle: this.title,
      deletedTimes: [],
      dialogVisible: false,
      styles: {
        timeManagerAddBtn: {
          fontSize: '24px',
          width: '100%',
          marginBottom: '10px',
        },
        deleteBtn: {
          fontSize: '24px',
          cursor: 'pointer',
        },
        timeManagerFormItem: {
          display: 'flex',
          alignItems: 'center',
          marginBottom: '10px',
        },
        toolBar: {
          marginLeft: '10px',
        },
        toolBarItem: {
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
        },
        settingIcon: {
          fontSize: '20px',
          marginRight: '2px',
        },
      },
    };
  },
  methods: {
    addTime: function() {
      this.tempTimes.push({
        time: '',
        intro: '',
      });
    },
    deleteTime: function(index) {
      if (window.confirm('Are you sure to delete this time row?')) {
        let deletedTime = this.tempTimes.splice(index, 1);
        this.deletedTimes.push(deletedTime[0].time);
      }
    },
    confirm: function() {
      // time check and sort logics
      // must type something like xx:xx-xx:xx and must be a valid time
      // and the left time cannot equal the right time
      const inValidTime = this.tempTimes.find((timeItem) => {
        return (
          !timeREG.test(timeItem.time) ||
          badTimeREG.test(timeItem.time) ||
          badEqualTimeREG.test(timeItem.time)
        );
      });
      if (inValidTime) {
        alert(
          'The time you typed ' +
            inValidTime.time +
            ' is not an expected time. This app expects you type something like 06:50 - 07:10.',
        );
        return;
      }

      // time periods overlap check logic
      // Convert time to timestamp and put them into the array, when put new time, check if this timestamp already included in the previous array items.
      let cachedTimeRanges = [];
      let invalidTimeItem = [];
      this.tempTimes.forEach((timeItem) => {
        const [start, end] = timeItem.time.split('-');
        const startValue = getTimeValue(start);
        let endValue = getTimeValue(end);

        if (startValue > endValue) {
          // 22:30 - 06:00 situation need add more day
          endValue = endValue + 1000 * 60 * 60 * 24;
        }

        let hasInvalidTime = cachedTimeRanges.some((timeRange) => {
          // if the start and end timestamp not included in any array item, then return valid
          if (
            (startValue > timeRange[0] && startValue < timeRange[1]) ||
            (endValue > timeRange[0] && endValue < timeRange[1])
          ) {
            return true;
          }

          if (startValue < timeRange[0] && endValue > timeRange[1]) {
            return true;
          }

          return false;
        });

        if (!hasInvalidTime) {
          cachedTimeRanges.push([startValue, endValue]);
        } else {
          invalidTimeItem.push(timeItem);
        }
      });
      if (invalidTimeItem.length) {
        alert(
          'The time you typed ' +
            invalidTimeItem.map((item) => item.time).join(',') +
            ' overlap with other time, please edit.',
        );
        return;
      }

      // time sort logic
      this.tempTimes.sort((a, b) => {
        const [start1, end1] = a.time.split('-');
        const [start2, end2] = b.time.split('-');

        const start1Value = getTimeValue(start1);
        let end1Value = getTimeValue(end1);
        if (start1Value > end1Value) {
          end1Value = end1Value + 1000 * 60 * 60 * 24;
        }
        const start2Value = getTimeValue(start2);
        let end2Value = getTimeValue(end2);
        if (start2Value > end2Value) {
          end2Value = end2Value + 1000 * 60 * 60 * 24;
        }

        return start1Value - start2Value;
      });

      this.$emit('confirm-times', {
        tempTitle: deepcopy(this.tempTitle),
        tempTimes: deepcopy(this.tempTimes),
        deletedTimes: deepcopy(this.deletedTimes),
      });
      this.dialogVisible = false;
      this.deletedTimes = [];
    },
  },
  template: `
    <div>
      <div :style="styles.toolBar">
        <span :style="styles.toolBarItem" @click="dialogVisible = true">
          <i class="el-icon-setting" :style="styles.settingIcon" ></i>
        </span>
      </div>
      <el-dialog title="Setting" :visible.sync="dialogVisible" >
        <div class="time-manager-form-wrapper">
          <el-row :style="styles.timeManagerFormItem">
            <el-col :span="3">
              <span>Title:</span>
            </el-col>
            <el-col :span="21">
              <el-input v-model="tempTitle" auto-complete="off"></el-input>
            </el-col>
          </el-row>
          <el-row
            :style="styles.timeManagerFormItem"
            v-for="(time, index) in tempTimes"
          >
            <el-col :span="3">
              <span>Time:</span>
            </el-col>
            <el-col :span="9">
              <el-input
                placeholder="like 12:00 - 13:00" 
                v-bind:value="time.time"
                v-model="time.time"
              ></el-input>
            </el-col>
            <el-col :span="3" :offset="1">
              <span>Description:</span>
            </el-col>
            <el-col :span="6">
              <el-input
                placeholder="like lunch"
                v-bind:value="time.intro"
                v-model="time.intro"
              ></el-input>
            </el-col>
            <el-col :span="1" :offset="1">
              <i
                title="delete this" 
                class="el-icon-close" 
                v-bind:style="styles.deleteBtn"
                @click="deleteTime(index)"
              ></i>
            </el-col>
          </el-row>
        </div>
        <el-button
          size="mini" 
          v-bind:style="styles.timeManagerAddBtn"
          @click="addTime"
        >+</el-button>

        <div slot="footer" class="dialog-footer">
          <el-button @click="dialogVisible = false">Cancel</el-button>
          <el-button type="primary" @click="confirm">Confirm</el-button>
        </div>
      </el-dialog>
    </div>
  `,
});
