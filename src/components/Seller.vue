<template>
  <div class="com-container">
    <div class="com-chart" ref="seller_ref"></div>
  </div>
</template>

<script>
  import {mapState} from 'vuex';
  // import axios from "axios";
  export default{
    name:'Seller',
    data(){
      return{
        echartInstance:null, // echarts实例对象
        allData:null, // 服务器获取的所有数据
        currentPage:1, // 当前页数
        totalPage:1, // 总页数
        timerID:null, // 定时器标识
      }
    },
    computed:{
      ...mapState(['theme'])
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
      // 初始化 echarts 实例对象需要使用到 DOM 元素，因此必须放到 mounted 中
      this.initChart();
      this.getData();
      window.addEventListener('resize',this.screenAdapter);
    },
    beforeDestroy() {
      if(this.timerID){
        clearInterval(this.timerID);
      }
      this.echartInstance.off('mouseover');
      this.echartInstance.off('mouseout');
      window.removeEventListener('resize',this.screenAdapter);
    },
    methods:{
      initChart(){
        this.echartInstance=this.$echarts.init(this.$refs.seller_ref,this.theme);
        const initOptions={
          title:{
            text:'▍ 各省确诊统计',
            textStyle:{
              fontSize:66,
            },
            left:20,
            top:20,
          },
          grid:{
            top:'20%',
            left:'3%',
            right:'6%',
            bottom:'3%',
            containLabel:true,
          },
          xAxis:{
            type:'value',
          },
          yAxis:{
            type:'category',
          },
          tooltip:{
            trigger:'axis',
            axisPointer:{
              type:'line',
              z:0,
              lineStyle:{
                width:66,
                color:'#2d3443',
              },
            },
          },
          series:[
            {
              type:'bar',
              barWidth:66,
              label:{
                show:true,
                position:'right',
                textStyle:{
                  color:'white',
                },
              },
              itemStyle:{
                barBorderRadius:[0,33,33,0],
                color:new this.$echarts.graphic.LinearGradient(0,0,1,0,[
                  {offset:0,color:'#c71d6f'},
                  {offset:1,color:'#d09693'},
                ]),
              },
            }
          ],
        };
        this.echartInstance.setOption(initOptions);
        this.screenAdapter();
        this.echartInstance.on('mouseover',()=>{
          clearInterval(this.timerID);
        });
        this.echartInstance.on('mouseout',()=>{
          this.startInterval();
        });
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
        // 计算总页数
        this.totalPage=Math.ceil(this.allData.length/5);
        // 0-5 5-10 10- 15 15-20 20-25 25-30
        this.updateChart();
        this.startInterval();
      },
      updateChart(){
        const start=(this.currentPage-1)*5;
        const end=this.currentPage*5;
        const showData=this.allData.slice(start,end);
        // 处理数据并且更新界面图表
        const sellerNames=showData.map((item)=>{
          return item.name;
        });
        const sellerValues=showData.map((item)=>{
          return item.value;
        });
        const dataOptions={
          yAxis:{
            data:sellerNames,
          },
          series:[
            {
              data:sellerValues,
            },
          ],
        };
        this.echartInstance.setOption(dataOptions);
      },
      screenAdapter(){
        const titleFontSize=this.$refs.seller_ref.offsetWidth/100*3.6;
        const adapterOptions={
          title:{
            textStyle:{
              fontSize:titleFontSize,
            },
          },
          tooltip:{
            axisPointer:{
              lineStyle:{
                width:titleFontSize,
              },
            },
          },
          series:[
            {
              barWidth:titleFontSize,
              itemStyle:{
                barBorderRadius: [0,titleFontSize/2,titleFontSize/2,0],
              }
            }
          ],
        };
        this.echartInstance.setOption(adapterOptions);
        this.echartInstance.resize();
      },
      startInterval(){
        if(this.timerID){
          clearInterval(this.timerID);
        }
        this.timerID=setInterval(()=>{
          this.currentPage++;
          if(this.currentPage>this.totalPage){
            this.currentPage=1;
          }
          this.updateChart();
        },3000);
      },
    },
  }
</script>

<style lang="less" scoped>

</style>