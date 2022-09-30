<template>
  <div class="com-container">
    <div class="com-chart" ref="hot_ref"></div>
<!--    <span class="iconfont arr-left" @click="toLeft" :style="comStyle">&#xe6ef;</span>
    <span class="iconfont arr-right" @click="toRight" :style="comStyle">&#xe6ed;</span>-->
<!--    <span class="cat-name" :style="comStyle">{{catName}}</span>-->
  </div>
</template>

<script>
  import {mapState} from 'vuex';
  // import axios from 'axios';
  export default{
    name:'Hot',
    data(){
      return{
        echartInstance:null,
        allData:null,
        currentIndex:0,
        titleFontSize:0,
        fontSize:0,
      }
    },
    computed:{
      ...mapState(['theme']),
      catName(){
        if(!this.allData){
          return '';
        }else{
          // return this.allData[this.currentIndex].name;
          return '';
        }
      },
      comStyle(){
        const fontColor=this.theme==='chalk'?'white':'black';
        return {
          fontSize:this.titleFontSize*1.25+'px',
          color:fontColor,
        }
      }
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
        this.echartInstance=this.$echarts.init(this.$refs.hot_ref,this.theme);
        const initOptions={
          title:{
            text:'▎ 全球疫苗接种占比',
            left:20,
            top:20,
          },
          legend:{
            top:'15%',
            icon:'circle',
          },
          tooltip:{
            show:true,
            formatter(arg){
              let name=arg.data.name;
              let value=arg.data.value/100000000;
              value=value.toFixed(2);
              const retStr=`${name}接种约为${value}亿剂`;
              return retStr;
            }
          },
          series:[
            {
              type:'pie',
              label:{
                show:false,
              },
              // 高亮状态的扇区和标签样式
              emphasis:{
                label:{
                  show:true,
                },
                labelLine:{
                  show:false,
                },
              },
              color:['#1abc9c','#e67e22','#3498db','#8e44ad','#d35400','#40739e','#44bd32'],
            }
          ],
        };
        this.echartInstance.setOption(initOptions);
        this.screenAdapter();
      },
      async getData(){
        // const {data}=await axios.get('http://localhost:4000/api/vaccines');
        const {data}=await this.$axios.get('vaccines');
        this.allData=data;
        // console.log(this.allData)
        this.updateChart();
      },
      updateChart(){
        let showData=[];
        for(let key in this.allData){
          showData.push({name:key,value:this.allData[key].total_vaccinations});
        }
        const dataOptions={
          series:[
            {
              data:showData,
            }
          ],
        };
        this.echartInstance.setOption(dataOptions);
      },
      screenAdapter(){
        this.titleFontSize=this.$refs.hot_ref.offsetWidth/100*3.6;
        const adapterOptions={
          title:{
            textStyle:{
              fontSize:this.titleFontSize,
            },
          },
          legend:{
            itemWidth:this.titleFontSize*1.4,
            itemHeight:this.titleFontSize*1.4,
            itemGap:this.titleFontSize/1.5,
            textStyle:{
              fontSize:this.titleFontSize,
            },
          },
          series:[
            {
              radius:this.titleFontSize*4.8,
              center:['50%','60%'],
            }
          ],
        };
        this.echartInstance.setOption(adapterOptions);
        this.echartInstance.resize();
      },
      /*toLeft(){
        this.currentIndex--;
        if(this.currentIndex<0){
          this.currentIndex=this.allData.length-1;
        }
        this.updateChart();
      },
      toRight(){
        this.currentIndex++;
        if(this.currentIndex>this.allData.length-1){
          this.currentIndex=0;
        }
        this.updateChart();
      }*/
    },
  }
</script>

<style lang="less" scoped>
  .arr-left{
    position:absolute;
    left:10%;
    top:50%;
    transform:translateY(-50%);
    cursor:pointer;
    color:#fff;
  }
  .arr-right{
    position:absolute;
    right:10%;
    top:50%;
    transform:translateY(-50%);
    cursor:pointer;
    color:#fff;
  }
  .cat-name{
    position:absolute;
    left:80%;
    bottom:20px;
    color:#fff;
  }
</style>