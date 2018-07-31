Vue.component('time-manager', {
  props: {
    times: {
      type: Array,
      default: [
        {
          time: '22:30 - 6:20',
          intro: '睡觉',
        },
      ],
    },
  },
  data: function() {
    return {
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
      },
    };
  },
  methods: {
    addTime: function() {
      this.times.push({
        time: '',
        intro: '',
      });
    },
    deleteTime: function(index) {
      if (window.confirm('确认删除当前时间段？')) {
        this.times.splice(index, 1);
      }
    },
  },
  template: `
    <div>
      <div class="time-manager-form-wrapper">
        <el-row
          :style="styles.timeManagerFormItem"
          v-for="(time, index) in times"
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
    </div>
  `,
});
