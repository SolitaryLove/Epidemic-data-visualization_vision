<template>
  <div class="com-container">
    <div class="com-chart" ref="stock_ref"></div>
  </div>
</template>

<script>
  import {mapState} from 'vuex';
  // import axios from "axios";
  export default{
    name:'Stock',
    data(){
      return{
        echartInstance:null,
        allData:null,
        currentIndex:1,
        totalPage:1,
        timerID:null,
        chinaNowConfirm:0,
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
      if(this.timerID){
        clearInterval(this.timerID);
      }
      window.removeEventListener('resize',this.screenAdapter);
    },
    methods:{
      initChart(){
        this.echartInstance=this.$echarts.init(this.$refs.stock_ref,this.theme);
        const initOptions={
          // animationDurationUpdate:1000,
          title:{
            text:'▎ 各省疫情占比分析',
            left:20,
            top:20,
          },
        };
        this.echartInstance.setOption(initOptions);
        this.echartInstance.on('mouseover',()=>{
          clearInterval(this.timerID);
        });
        this.echartInstance.on('mouseout',()=>{
          this.startInterval();
        });
        this.screenAdapter();
      },
      async getData(){
        // const {data}=await axios.get('http://localhost:4000/api/areaTree');
        // const resData=await axios.get('http://localhost:4000/api/chinaList');
        const {data}=await this.$axios.get('areaTree');
        const resData=await this.$axios.get('chinaList');
        this.chinaNowConfirm=resData.data.chinaDayList.data.slice(-1)[0].confirm;
        const dataArr=data.children;
        const nowConfirmDataArr=[];
        dataArr.forEach((item)=>{
          const provinceName=item.name;
          const nowConfirm=item.total.nowConfirm;
          nowConfirmDataArr.push({name:provinceName,value:nowConfirm});
        });
        this.allData=nowConfirmDataArr;
        this.allData=this.allData.filter(item=>{
          return item.value!==0;
        });
        this.totalPage=Math.ceil(this.allData.length/5);
        this.updateChart();
        this.startInterval();
      },
      updateChart(){
        const centerArr=[
          ['18%', '40%'],
          ['50%', '40%'],
          ['82%', '40%'],
          ['34%', '75%'],
          ['66%', '75%']
        ];
        const colorArr=[
          ['#ffbe76', '#ff7979'],
          ['#686de0', '#e056fd'],
          ['#c7ecee', '#7ed6df'],
          ['#C4E538', '#B53471'],
          ['#EE5A24', '#F79F1F']
        ];
        const start=(this.currentIndex-1)*5;
        const end=this.currentIndex*5;
        const showData=this.allData.slice(start,end);
        const seriesArr=showData.map((item,index)=>{
          return {
            type:'pie',
            center:centerArr[index],
            hoverAnimation:false,
            labelLine:{
              show:false,
            },
            label:{
              position:'center',
              color:colorArr[index][0],
            },
            data:[
              {
                name:`${item.name}省\n\n${item.value}例`,
                value:item.value,
                itemStyle:{
                  color:new this.$echarts.graphic.LinearGradient(0,1,0,0,[
                    {offset:0,color:colorArr[index][0]},
                    {offset:1,color:colorArr[index][1]},
                  ]),
                },
              },
              {
                value:this.chinaNowConfirm,
                itemStyle:{
                  color:'#333843',
                }
              },
            ],
          }
        });
        const dataOptions={
          series:seriesArr,
        };
        this.echartInstance.setOption(dataOptions);
      },
      screenAdapter(){
        const titleFontSize=this.$refs.stock_ref.offsetWidth/100*3.6;
        const innerRadius=titleFontSize*2;
        const outerRadius=innerRadius*1.125;
        const adapterOptions={
          title:{
            textStyle:{
              fontSize:titleFontSize,
            },
          },
          series:[
            {type:'pie',radius:[outerRadius*1.15,innerRadius*1.5],label:{fontSize:titleFontSize/1.5}},
            {type:'pie',radius:[outerRadius*1.15,innerRadius*1.5],label:{fontSize:titleFontSize/1.5}},
            {type:'pie',radius:[outerRadius*1.15,innerRadius*1.5],label:{fontSize:titleFontSize/1.5}},
            {type:'pie',radius:[outerRadius*1.15,innerRadius*1.5],label:{fontSize:titleFontSize/1.5}},
            {type:'pie',radius:[outerRadius*1.15,innerRadius*1.5],label:{fontSize:titleFontSize/1.5}},
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
          this.currentIndex++;
          if(this.currentIndex>this.totalPage){
            this.currentIndex=1;
          }
          this.updateChart();
        },3000);
      },
    },
  }
</script>

<style lang="less" scoped>

</style>