// 用来拼装时间段换算时间戳
const dateTemplate = dateFns.format(Date.now(), 'YYYY-MM-DD 🤠');
// 02:13 - 02:12
const timeREG = /(\s+)?([0-2][0-9]:[0-6][0-9])(\s)?-(\s)?([0-2][0-9]:[0-6][0-9])(\s+)/;
// 上面正则有 02:68 和 26:36 这样的漏洞
const badTimeREG = /2[5-9]:|:6[1-9]/;
const getTimeValue = (timeString) => {
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
          marginBottom: '20px',
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
      if (window.confirm('确认删除当前时间段？')) {
        let deletedTime = this.tempTimes.splice(index, 1);
        this.deletedTimes.push(deletedTime[0].time);
      }
    },
    confirm: function() {
      // times 校验和排序逻辑
      // 必须按照 xx:xx-xx:xx 的格式写且必须为正常时间
      const notATime = this.tempTimes.find((timeItem) => {
        return !timeREG.test(timeItem.time) && badTimeREG.test(timeItem.time);
      });
      if (notATime) {
        alert(
          '你填写的时间 ' +
            notATime.time +
            ' 不符合格式要求或者不是正常的时间，例如：06:50 - 07:10。',
        );
        return;
      }

      // 检查时间范围是否重叠
      // 时间段换算成时间戳区间并存储到数组，下一个时间存储时需要对已有区间进行判断
      let cachedTimeRanges = [];
      let hasInvalidTime = null;
      let invalidTimeItem = null;
      this.tempTimes.forEach((timeItem) => {
        const [start, end] = timeItem.time.split('-');
        const startValue = getTimeValue(start);
        const endValue = getTimeValue(end);
        // todo 区分 22:30 - 06:00 后者加一天的逻辑或者前者减一天的逻辑

        hasInvalidTime = cachedTimeRanges.some((timeRange) => {
          // start end 任何一个点不能在时间区间内
          if (
            (startValue > timeRange[0] && startValue < timeRange[1]) ||
            (endValue > timeRange[0] && endValue < timeRange[1])
          ) {
            return true;
          }

          // 或者 start end 包含当前时间区间，这里有可能 start 比 end 大或者 end 比 start 大（例如：22:30 - 次日 06:00）
          if (
            (startValue < timeRange[0] && endValue > timeRange[1]) ||
            (endValue < timeRange[0] && startValue > timeRange[1])
          ) {
            return true;
          }

          return false;
        });
        if (!hasInvalidTime) {
          cachedTimeRanges.push([startValue, endValue]);
        } else {
          invalidTimeItem = timeItem;
        }
      });
      if (hasInvalidTime) {
        alert(
          '你填写的时间 ' +
            invalidTimeItem.time +
            ' 跟其他时间有交集，请修改。',
        );
        return;
      }

      // 时间排序逻辑
      this.tempTimes.sort((a, b) => {
        const [start1, end1] = a.time.split('-');
        const [start2, end2] = b.time.split('-');

        const start1Value = getTimeValue(start1);
        const end1Value = getTimeValue(end1);
        const start2Value = getTimeValue(start2);
        const end2Value = getTimeValue(end2);
        // 避免出现这种顺序 13:30 - 14:10 | 15:00 - 15:30 | 14:20 - 15:00
        if (end1Value === start2Value) {
          return start1Value - end2Value;
        }
        return end1Value - start2Value;
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
          <i class="el-icon-setting" :style="styles.settingIcon" ></i> 设置
        </span>
      </div>
      <el-dialog title="时间段设置" :visible.sync="dialogVisible" >
        <div class="time-manager-form-wrapper">
          <el-row :style="styles.timeManagerFormItem">
            <el-col :span="3">
              <span>标题：</span>
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
              <span>时间：</span>
            </el-col>
            <el-col :span="9">
              <el-input
                placeholder="例如：12:00 - 13:00" 
                v-bind:value="time.time"
                v-model="time.time"
              ></el-input>
            </el-col>
            <el-col :span="3" :offset="1">
              <span>说明：</span>
            </el-col>
            <el-col :span="6">
              <el-input
                placeholder="比如：午饭"
                v-bind:value="time.intro"
                v-model="time.intro"
              ></el-input>
            </el-col>
            <el-col :span="1" :offset="1">
              <i
                title="删除当前时间" 
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
          <el-button @click="dialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="confirm">确 定</el-button>
        </div>
      </el-dialog>
    </div>
  `,
});
