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
