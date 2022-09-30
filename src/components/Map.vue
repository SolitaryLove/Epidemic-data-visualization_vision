<template>
  <div class="com-container" @dblclick="reverMap">
    <div class="com-chart" ref="map_ref"></div>
  </div>
</template>

<script>
  import axios from 'axios';
  import {getProvinceMapInfo} from '../utils/map_utils';
  import {mapState} from 'vuex';
  export default{
    name:'Map',
    data(){
      return{
        echartInstance:null,
        allData:null,
        cacheMap:{},
        isChina:true,
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
    },
    methods:{
      async initChart(){
        this.echartInstance=this.$echarts.init(this.$refs.map_ref,this.theme);
        // 本地测试
        // const {data:mapJSON}=await axios.get('http://localhost:4001/static/map/china.json');
        // 服务器部署
        const {data:mapJSON}=await axios.get('http://47.103.216.204:8088/static/map/china.json');
        // 注册地图数据到全局 echarts 对象中
        this.$echarts.registerMap('china',mapJSON);
        const initOptions={
          title:{
            text:'▎ 疫情分布',
            left:20,
            top:20,
          },
          geo:{ // 地理坐标系组件，用于地图的绘制
            type:'map',
            map:'china', // 使用 registerMap 注册的地图名称
            top:'5%',
            bottom:'5%',
            itemStyle:{
              areaColor:'#8fd3f4',
              borderColor:'#333',
            },
          },
          legend:{
            left:'5%',
            bottom:'5%',
            orient:'vertical',
          },
        };
        this.echartInstance.setOption(initOptions);
        this.screenAdapter();
        this.echartInstance.on('click',async(arg)=>{
          // arg.name 就是所点击的省份名称
          if(this.isChina){
            this.isChina=false;
            const provinceInfo=getProvinceMapInfo(arg.name);
            if(!this.cacheMap[provinceInfo.key]){
              // const {data}=await axios.get(`http://localhost:4001${provinceInfo.path}`);
              const {data}=await axios.get(`http://47.103.216.204:8088${provinceInfo.path}`);
              this.cacheMap[provinceInfo.key]=data;
              this.$echarts.registerMap(provinceInfo.key,data);
            }
            const changeOptions={
              geo:{
                map:provinceInfo.key,
              },
              tooltip:{
                show:false,
              },
            };
            this.echartInstance.setOption(changeOptions);
          }
        });
      },
      async getData(){
        // const {data}=await axios.get('http://localhost:4000/api/areaTree');
        const {data}=await this.$axios.get('areaTree');
        this.allData=data.children;
        this.updateChart();
      },
      updateChart(){
        const nowConfirmDataArr=[];
        this.allData.forEach(item=>{
          const provinceName=item.name;
          const nowConfirm=item.total.nowConfirm;
          nowConfirmDataArr.push({name:provinceName,value:nowConfirm});
        })
        const dataOptions={
          tooltip:{
            show:true,
            trigger:'item',
            // formatter:'{b}现存确诊：{c}',
            formatter:(params)=>{
              const data=params.data;
              return `${data.name}现存确诊数：${data.value}`;
            }
          },
          series:[
            {
              data:nowConfirmDataArr,
              geoIndex:0,
              type:'map'
            },
          ],
          // 视觉映射组件，用于进行视觉编码
          visualMap:{
            min:0,
            max:1000,
            seriesIndex:[0],
            inRange:{
              color:['#f6e58d','#ffbe76','#ff7979','#badc58','#dff9fb'],
            },
            calculable:true,
          }
        }
        this.echartInstance.setOption(dataOptions);
      },
      screenAdapter(){
        const titleFontSize=this.$refs.map_ref.offsetWidth/100*3.6;
        const adapterOptions={
          title:{
            textStyle:{
              fontSize:titleFontSize,
            },
          },
          legend:{
            itemWidth:titleFontSize/2,
            itemHeight:titleFontSize/2,
            itemGap:titleFontSize/2,
            textStyle:{
              fontSize:titleFontSize/3,
            },
          },
        };
        this.echartInstance.setOption(adapterOptions);
        this.echartInstance.resize();
      },
      reverMap(){
        this.isChina=true;
        const reverOptions={
          geo:{
            map:'china',
          },
          tooltip:{
            show:true,
            trigger:'item',
            formatter:(params)=>{
              const data=params.data;
              return `${data.name}现存确诊数：${data.value}`;
            }
          },
        };
        this.echartInstance.setOption(reverOptions);
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