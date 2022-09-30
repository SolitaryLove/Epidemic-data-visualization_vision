<template>
  <div class="screen-container" :style="containerStyle">
    <header class="screen-header">
      <img :src="headerSrc" class="bottom-line">
      <span class="logo"><img src="/static/img/logo3.png" alt=""></span>
      <span class="title">新冠疫情实时监控视界</span>
      <div class="right-info">
        <svg key="sun" @click="handleChangeTheme" v-show="isShow" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#0b80f1" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M1 12h2M21 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4"/>
        </svg>
        <svg key="moon" @click="handleChangeTheme" v-show="!isShow" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#0b80f1" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
        </svg>
        <span class="datetime">{{nowDate||'2021-08-17 14:43:00'}}</span>
      </div>
    </header>
    <div class="screen-body">
      <section class="screen-body-left">
        <div id="left-top" :class="{fullscreen:fullScreenStatus.trend}">
          <Trend ref="trend"></Trend>
          <div class="resize">
            <span @click="changeSize('trend')" :class="['iconfont',fullScreenStatus.trend?'icon-compress-alt':'icon-expand-alt']"></span>
          </div>
        </div>
        <div id="left-bottom" :class="{fullscreen:fullScreenStatus.seller}">
          <Seller ref="seller"></Seller>
          <div class="resize">
            <span @click="changeSize('seller')" :class="['iconfont',fullScreenStatus.seller?'icon-compress-alt':'icon-expand-alt']"></span>
          </div>
        </div>
      </section>
      <section class="screen-body-middle">
        <div id="middle-top" :class="{fullscreen:fullScreenStatus.map}">
          <Map ref="map"></Map>
          <div class="resize">
            <span @click="changeSize('map')" :class="['iconfont',fullScreenStatus.map?'icon-compress-alt':'icon-expand-alt']"></span>
          </div>
        </div>
        <div id="middle-bottom" :class="{fullscreen:fullScreenStatus.rank}">
          <Rank ref="rank"></Rank>
          <div class="resize">
            <span @click="changeSize('rank')" :class="['iconfont',fullScreenStatus.rank?'icon-compress-alt':'icon-expand-alt']"></span>
          </div>
        </div>
      </section>
      <section class="screen-body-right">
        <div id="right-top" :class="{fullscreen:fullScreenStatus.hot}">
          <Hot ref="hot"></Hot>
          <div class="resize">
            <span @click="changeSize('hot')" :class="['iconfont',fullScreenStatus.hot?'icon-compress-alt':'icon-expand-alt']"></span>
          </div>
        </div>
        <div id="right-bottom" :class="{fullscreen:fullScreenStatus.stock}">
          <Stock ref="stock"></Stock>
          <div class="resize">
            <span @click="changeSize('stock')" :class="['iconfont',fullScreenStatus.stock?'icon-compress-alt':'icon-expand-alt']"></span>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script>
  import Seller from "../components/Seller";
  import Trend from "../components/Trend";
  import Map from "../components/Map";
  import Rank from "../components/Rank";
  import Hot from "../components/Hot";
  import Stock from "../components/Stock";
  import {getThemeValue} from "../utils/theme_utils";
  import {mapState} from "vuex";
  import day from 'dayjs';

  export default{
    name:'ScreenPage',
    components:{Seller,Trend,Map,Rank,Hot,Stock},
    data(){
      return{
        fullScreenStatus:{
          seller:false,
          trend:false,
          map:false,
          rank:false,
          hot:false,
          stock:false,
        },
        isShow:true,
        nowDate:null,
      }
    },
    computed:{
      ...mapState(['theme']),
      containerStyle(){
        return {
          background:getThemeValue(this.theme).background,
          color:getThemeValue(this.theme).titleColor,
        }
      },
      headerSrc(){
        return `/static/img/${getThemeValue(this.theme).headerBorderSrc}`;
      },
    },
    created(){
      this.$socket.registerCallBack('changeTheme',this.recvChangeTheme);
      this.startNowDate();
    },
    mounted() {
      const hour=new Date().getHours();
      if(hour>=19){
        this.showMode('vintage');
      }
      if(hour>=7){
        this.showMode('chalk');
      }
    },
    destroyed(){
      this.$socket.unRegisterCallBack('changeTheme');
    },
    methods:{
      changeSize(chartName){
        this.fullScreenStatus[chartName]=!this.fullScreenStatus[chartName];
        this.$nextTick(()=>{
          this.$refs[chartName].screenAdapter();
        })
      },
      handleChangeTheme(){
        this.$socket.send({
          action:'changeTheme',
          dataType:'changeTheme',
          chartName:'',
          actionValue:this.theme,
        });
        this.isShow=!this.isShow;
      },
      // 接收到切换主题动作后的处理
      recvChangeTheme(){
        this.$store.commit('changeTheme');
      },
      // 显示时间
      startNowDate(){
        setInterval(()=>{
          this.nowDate=day().format('YYYY-MM-DD HH:mm:ss');
          // 日间模式
          if(this.nowDate.substring(11,19)==='19:00:00'){
            this.showMode('vintage');
          }
          // 夜间模式
          if(this.nowDate.substring(11,19)==='07:00:00'){
            this.showMode('chalk');
          }
        },1000);
      },
      // 显示模式
      showMode(mode){
        if(this.theme===mode){
          this.$socket.send({
            action:'changeTheme',
            dataType:'changeTheme',
            chartName:'',
            actionValue:this.theme,
          });
          this.isShow=!this.isShow;
        }
      }
    }
  }
</script>

<style lang="less" scoped>
  .screen-container{
    width: 100%;
    height: 100%;
    padding:0 20px;
    color:#fff;
    box-sizing:border-box;
    //background-color: #525252;
    background-color:#3e3d3d;
  }

  .screen-header{
    width:100%;
    height:64px;
    font-size:20px;
    position:relative;
    .bottom-line{
      display:inline-block;
      width:100%;
      position:absolute;
      bottom:0;
    }
    .title{
      position:absolute;
      left:50%;
      top:50%;
      font-size:20px;
      transform:translate(-50%,-50%);
    }
    .right-info{
      display:flex;
      align-items:center;
      position:absolute;
      right:0;
      top:50%;
      transform:translateY(-50%);
    }
    .datetime{
      font-size:15px;
      margin-left:10px;
    }
    .logo{
      position:absolute;
      left:0;
      top:50%;
      transform:translateY(-50%);
      img{
        width:128px;
        height:40px;
      }
    }
  }

  .screen-body{
    width: 100%;
    height: 100%;
    display:flex;
    margin-top:10px;
    .screen-body-left{
      width:27.6%;
      height:100%;
      #left-top{
        height:53%;
        position:relative;
      }
      #left-bottom{
        height:31%;
        margin-top:25px;
        position:relative;
      }
    }
    .screen-body-middle{
      width: 41.5%;
      height: 100%;
      margin-left:1.6%;
      margin-right:1.6%;
      #middle-top{
        width: 100%;
        height: 56%;
        position:relative;
      }
      #middle-bottom{
        width: 100%;
        height: 28%;
        margin-top:25px;
        position:relative;
      }
    }
    .screen-body-right{
      width: 27.6%;
      height: 100%;
      #right-top{
        height: 46%;
        position:relative;
      }
      #right-bottom{
        height: 38%;
        margin-top:25px;
        position:relative;
      }
    }
  }

  .fullscreen{
    position:fixed!important;
    top:0!important;
    left:0!important;
    width: 100% !important;
    height: 100% !important;
    margin: 0!important;
    z-index:100;
  }
  .resize{
    position:absolute;
    right:20px;
    top:20px;
    cursor:pointer;
  }
</style>