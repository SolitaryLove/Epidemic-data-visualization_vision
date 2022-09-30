<template>
  <div class="com-container">
    <div class="com-chart" ref="rank_ref"></div>
  </div>
</template>

<script>
  import {mapState} from 'vuex';
  // import axios from 'axios';
  export default{
    name:'Rank',
    data(){
      return{
        echartInstance:null,
        allData:null,
        timerID:null,
        startValue:0,
        endValue:9,
      }
    },
    computed:{
      ...mapState(['theme']),
    },
    watch:{
      theme(){
        this.echartInstance.dispose();
        this.initChart();
        this.screenAdapter();
        // this.updateChart();
        this.getData();
      }
    },
    mounted() {
      this.initChart();
      this.getData();
      window.addEventListener('resize',this.screenAdapter);
    },
    beforeDestroy() {
      window.removeEventListener('resize',this.screenAdapter);
      clearInterval(this.timerID);
      this.echartInstance.off('mouseover');
      this.echartInstance.off('mouseout');
    },
    methods:{
      initChart(){
        this.echartInstance=this.$echarts.init(this.$refs.rank_ref,this.theme);
        const initOptions={
          title:{
            text:'▎ 各省确诊排行',
            left:20,
            top:20,
          },
          grid:{
            top:'40%',
            left:'5%',
            right:'5%',
            bottom:'5%',
            containLabel:true,
          },
          tooltip:{
            show:true,
          },
          xAxis:{
            type:'category',
          },
          yAxis:{
            type:'value',
          },
          series:[
            {
              type:'bar',
            }
          ]
        };
        this.echartInstance.setOption(initOptions);
        this.echartInstance.on('mouseover',()=>{
          clearInterval(this.timerID);
        });
        this.echartInstance.on('mouseout',()=>{
          this.startInterval();
        })
        this.screenAdapter();
      },
      async getData(){
        // const {data}=await axios.get('http://localhost:4000/api/areaTree');
        const {data}=await this.$axios.get('areaTree');
        const dataArr=data.children;
        const nowConfirmDataArr=[];
        dataArr.forEach((item)=>{
          const provinceName=item.name;
          const nowConfirm=item.total.nowConfirm;
          nowConfirmDataArr.push({name:provinceName,value:nowConfirm});
        });
        this.allData=nowConfirmDataArr;
        this.allData.sort((a,b)=>{
          return a.value-b.value;
        });
        this.allData=this.allData.filter(item=>{
          return item.value!==0;
        });
        // console.log(this.allData);
        this.updateChart();
        this.startInterval();
      },
      updateChart(){
        const colorArr=[
            ['#ff9a9e','#fad0c4'],
            ['#a18cd1','#fbc2eb'],
            ['#84fab0','#8fd3f4'],
        ];
        const provinceArr=this.allData.map(item=>{
          return item.name;
        });
        const valueArr=this.allData.map(item=>{
          return item.value;
        });
        const dataOptions={
          xAxis:{
            data:provinceArr,
            axisLabel:{
              interval:0,
            },
          },
          // 实现平移动画
          dataZoom:{
            show:false,
            startValue:this.startValue,
            endValue:this.endValue,
          },
          series:[
            {
              data:valueArr,
              itemStyle:{
                color:(arg)=>{
                  let targetColorArr=null;
                  if(arg.value>300){
                    targetColorArr=colorArr[0];
                  }else if(arg.value>200){
                    targetColorArr=colorArr[1];
                  }else{
                    targetColorArr=colorArr[2];
                  }
                  return new this.$echarts.graphic.LinearGradient(0,0,0,1,[
                    {offset:0,color:targetColorArr[0]},
                    {offset:1,color:targetColorArr[1]},
                  ]);
                },
              },
            }
          ],
        };
        this.echartInstance.setOption(dataOptions);
      },
      screenAdapter(){
        const titleFontSize=this.$refs.rank_ref.offsetWidth/100*3.6;
        const adapterOptions={
          title:{
            textStyle:{
              fontSize:titleFontSize,
            },
          },
          series:[
            {
              barWidth:titleFontSize,
              itemStyle:{
                barBorderRadius:[titleFontSize/2,titleFontSize/2,0,0],
              }
            }
          ]
        };
        this.echartInstance.setOption(adapterOptions);
        this.echartInstance.resize();
      },
      startInterval(){
        if(this.timerID){
          clearInterval(this.timerID);
        }
        this.timerID=setInterval(()=>{
          this.startValue++;
          this.endValue++;
          if(this.endValue>this.allData.length-1){
            this.startValue=0;
            this.endValue=9;
          }
          this.updateChart();
        },3000)
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
    .title-icon{
      margin-left:10px;
      cursor:pointer;
    }
    .select_con{
      background-color:#222733;
    }
  }
</style>