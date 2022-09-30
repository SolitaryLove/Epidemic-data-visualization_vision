import Vue from 'vue';
import Vuex from 'vuex';
Vue.use(Vuex);

const state={
    theme:'vintage',
};
const actions={

};
const mutations={
    changeTheme(state){
        if(state.theme==='chalk'){
            state.theme='vintage';
        }else{
            state.theme='chalk';
        }
    },
};
export default new Vuex.Store({
    state,
    actions,
    mutations,
});
