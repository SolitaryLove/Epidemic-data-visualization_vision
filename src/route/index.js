import VueRouter from 'vue-router';

import SellerPage   from "../view/SellerPage";
import TrendPage    from "../view/TrendPage";
import MapPage      from "../view/MapPage";
import RankPage     from "../view/RankPage";
import HotPage      from "../view/HotPage";
import StockPage    from "../view/StockPage";
import ScreenPage   from "../view/ScreenPage";

export default new VueRouter({
    routes:[
        {
          path:'/',
          redirect:'/screenPage',
        },
        {
          path:'/screenPage',
          component:ScreenPage,
        },
        {
            path:'/sellerPage',
            component:SellerPage,
        },
        {
            path:'/trendPage',
            component:TrendPage,
        },
        {
            path:'/mapPage',
            component:MapPage,
        },
        {
            path:'/rankPage',
            component:RankPage,
        },
        {
            path:'/hotPage',
            component:HotPage,
        },
        {
            path:'/stockPage',
            component:StockPage,
        },
    ]
})