//引入Vue核心库
import Vue from 'vue'
//引入Vuex
import Vuex from 'vuex'
//引用Vuex
Vue.use(Vuex)

const actions = {

}

const mutations = {
  // 保存 id 值
  putId(state,value){
    state.id = value
  }
}

//初始化数据
const state = {
   id:0
}

//创建并暴露store
export default new Vuex.Store({
	actions,
	mutations,
	state,
})