<template>
  <div class="com-container">
    <div class="title" :style="comStyle">
      <span>{{'▍ '+showTitle}}</span>
      <span class="iconfont title-icon" @click="showChoice=!showChoice" :style="comStyle">&#xe6eb;</span>
      <div v-show="showChoice" :style="[comStyle,marginStyle]">
        <div class="select-item" v-for="item in selectTypes" :key="item.key" @click="handleSelect(item.key)">{{item.text}}</div>
      </div>
    </div>
    <div class="com-chart" ref="trend_ref"></div>
  </div>
</template>

<script>
  import {mapState} from 'vuex';
  // import axios from 'axios';
  export default{
    name:'Trend',
    data(){
      return{
        echartInstance:null,
        allData:null, // 如果定义为[],在computed中会引发渲染错误
        showChoice:false, // 控制可选面板的显示或隐藏
        choiceType:'chinaDayList',
        titleFontSize:0,
      }
    },
    computed:{
      ...mapState(['theme']),
      showTitle(){
        if(!this.allData){
          return '';
        }else{
          return this.allData[this.choiceType].title;
        }
        // return '国内疫情变化曲线';
      },
      selectTypes(){
        if(!this.allData){
          return [];
        }else{
          return this.allData.type.filter((item)=>{
            return item.key!==this.choiceType;
          });
        }
      },
      comStyle(){
        const fontColor=this.theme==='chalk'?'white':'black';
        const bgColor=this.theme==='chalk'?'':'white';
        return {
          fontSize:this.titleFontSize+'px',
          backgroundColor:bgColor,
          color:fontColor,
        }
      },
      marginStyle(){
        return {
          marginLeft:this.titleFontSize+'px',
        }
      },
    },
    watch:{
      theme(){
        this.echartInstance.dispose();
        this.initChart();
        this.screenAdapter();
        this.updateChart();
      }
    },
    mounted() {
      this.initChart();
      this.getData();
      window.addEventListener('resize',this.screenAdapter);
    },
    beforeDestroy() {
      window.removeEventListener('resize',this.screenAdapter);
    },
    methods:{
      initChart(){
        this.echartInstance=this.$echarts.init(this.$refs.trend_ref,this.theme);
        const initOptions={
          grid:{
            left:'3%',
            top:'35%',
            right:'4%',
            bottom:'1%',
            containLabel:true,
          },
          tooltip:{
            trigger:'axis',
          },
          legend:{
            left:20,
            top:'15%',
            icon:'circle',
          },
          xAxis:{
            type:'category',
            boundaryGap:false,
          },
          yAxis:{
            type:'value',
          }
        };
        this.echartInstance.setOption(initOptions);
        this.screenAdapter();
      },
      async getData(){
        // const {data}=await this.$axios.get('trend');
        // this.allData=data;
        // const {data}=await axios.get('http://localhost:4000/api/chinaDayAddList');
        // this.allData=data.children;
        // const {data}=await axios.get('http://localhost:4000/api/chinaList');
        const {data}=await this.$axios.get('chinaList');
        this.allData=data;
        this.updateChart();
      },
      updateChart(){
        /*const colorArr1=[
          'rgba(237, 85, 106, 0.5)',
          'rgba(44, 110, 255, 0.5)',
          'rgba(161, 140, 209, 0.5)',
          'rgba(217, 222, 216, 0.5)',
          'rgba(255, 154, 158, 0.5)',
        ];
        const colorArr2=[
          'rgba(237, 85, 106, 0)',
          'rgba(44, 110, 255, 0)',
          'rgba(161, 140, 209, 0)',
          'rgba(217, 222, 216, 0)',
          'rgba(255, 154, 158, 0)',
        ];*/
        const timeArr=this.allData[this.choiceType].data.map(item=>{
          return item.date;
        });
        const valueArr=this.allData[this.choiceType].data.map(item=>{
          return item.confirm;
        });
        // console.log(timeArr,valueArr);
        const dataOptions={
          xAxis:{
            type:'category',
            data:timeArr,
          },
          yAxis:{
            type:'value',
            scale:true,
          },
          series:[
            {
              type:'line',
              data:valueArr,
              smooth:true,
              areaStyle:{
                color:new this.$echarts.graphic.LinearGradient(0,0,0,1,[
                  {offset:0,color:'rgba(237, 85, 106, 0.5)'},
                  {offset:1,color:'rgba(237, 85, 106, 0.1)'},
                ]),
              },
              lineStyle:{
                color:'#e6dee9',
              },
            }
          ],

        };
        this.echartInstance.setOption(dataOptions);
      },
      screenAdapter(){
        this.titleFontSize=this.$refs.trend_ref.offsetWidth/100*3.6;
        const adapterOptions={
          legend:{
            itemWidth:this.titleFontSize,
            itemHeight:this.titleFontSize,
            itemGap:this.titleFontSize,
            textStyle:{
              fontSize:this.titleFontSize/2,
            },
          },
        };
        this.echartInstance.setOption(adapterOptions);
        this.echartInstance.resize();
      },
      handleSelect(currentType){
        this.choiceType=currentType;
        this.updateChart();
        this.showChoice=false;
      }
    },
  }
</script>

<style lang="less" scoped>
  .title{
    position:absolute;
    left:20px;
    top:20px;
    z-index:10;
    color:#fff;
    font-weight: bold;
    .title-icon{
      margin-left:10px;
      cursor:pointer;
    }
    .select_con{
      background-color:#222733;
    }
  }
</style>