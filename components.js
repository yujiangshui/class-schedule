// 下面正则匹配 02:13 - 02:12 这类的格式
const timeREG = /(\s+)?([0-2][0-9]:[0-5][0-9])(\s)?-(\s)?([0-2][0-9]:[0-5][0-9])(\s+)?/;
// 上面正则有 26:36 这样的漏洞，需要加逻辑
const badTimeREG = /2[4-9]:/;
// 而且也不支持起止时间相同
const badEqualTimeREG = /(\s+)?([0-2][0-9]:[0-5][0-9])(\s)?-(\s)?(\2)(\s+)?/;

const getTimeValue = (timeString) => {
  // 用来拼装时间段换算时间戳
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
      if (window.confirm('确认删除当前时间段？')) {
        let deletedTime = this.tempTimes.splice(index, 1);
        this.deletedTimes.push(deletedTime[0].time);
      }
    },
    confirm: function() {
      // times 校验和排序逻辑
      // 必须按照 xx:xx-xx:xx 的格式写且必须为正常时间
      // 而且前后不能相同
      const inValidTime = this.tempTimes.find((timeItem) => {
        return (
          !timeREG.test(timeItem.time) ||
          badTimeREG.test(timeItem.time) ||
          badEqualTimeREG.test(timeItem.time)
        );
      });
      if (inValidTime) {
        alert(
          '你填写的时间 ' +
            inValidTime.time +
            ' 不符合格式要求或者不是正常的时间，例如：06:50 - 07:10。',
        );
        return;
      }

      // 检查时间范围是否重叠
      // 时间段换算成时间戳区间并存储到数组，下一个时间存储时需要对已有区间进行判断
      let cachedTimeRanges = [];
      let invalidTimeItem = [];
      this.tempTimes.forEach((timeItem) => {
        const [start, end] = timeItem.time.split('-');
        const startValue = getTimeValue(start);
        let endValue = getTimeValue(end);

        if (startValue > endValue) {
          // 22:30 - 06:00 这样的情况需要将后者加一天运算
          endValue = endValue + 1000 * 60 * 60 * 24;
        }

        let hasInvalidTime = cachedTimeRanges.some((timeRange) => {
          // start end 任何一个点不能在时间区间内
          if (
            (startValue > timeRange[0] && startValue < timeRange[1]) ||
            (endValue > timeRange[0] && endValue < timeRange[1])
          ) {
            return true;
          }

          // 或者 start end 包含当前时间区间
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
          '你填写的时间 ' +
            invalidTimeItem.map((item) => item.time).join('、') +
            ' 跟其他时间有交集，请修改。',
        );
        return;
      }

      // 时间排序逻辑
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

        return end2Value <= start2Value;
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
      <el-dialog title="课程表设置" :visible.sync="dialogVisible" >
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
