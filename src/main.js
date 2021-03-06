import Vue from "vue";
import Axios from "axios";
import App from "./App";
import router from "./router";
import Bus from "./assets/eventBus";

// 报错不给予页面提示.
Vue.config.productionTip = false;
Vue.prototype.$axios = Axios;
Vue.prototype.$axios.interceptors.request.use(
  config => {
    if (localStorage.userToken) {
      // 判断是否存在token，如果存在的话，则每个http header都加上token
      config.headers.AdminToken = `${localStorage.userToken}`;
    }
    return config;
  },
  err => {
    return Promise.reject(err);
  }
);
Vue.prototype.$axios.interceptors.response.use(
  response => {
    if (response.data.status == "404") {
      router.push("/login");
    }
    return response;
  },
  error => {
    return Promise.reject(error);
  }
);

router.beforeEach((to, from, next) => {
  if (to.matched.some(record => record.meta.requireAuth)) {
    if (localStorage.userToken) {
      next();
    } else {
      next({
        path: "/login"
      });
    }
  } else {
    next();
  }
});

const group = {
  commodity: {
    name: "商品管理",
    twigs: {
      list: {
        name: "商城商品"
      },
      add: {
        name: "添加商品"
      },
      sort: {
        name: "商品分类",
        twigs: {
          add: {
            name: "添加商品分类"
          }
        }
      },
      brand: {
        name: "商品品牌",
        twigs: {
          add: {
            name: "添加商品品牌"
          }
        }
      },
      extend: {
        name: "商品扩展属性"
      }
    }
  },
  order: {
    name: "订单管理"
  },
  member: {
    name: "会员管理"
  },
  supplier: {
    name: "供应商管理"
  }
};

function init(path) {
  let items = path.replace("/", "").split("/");
  let position = "主页";
  if (items[0] != "login" && items[0] != "error") {
    let position = "主页";
    if (items[0] != "") {
      position += " > " + group[items[0]].name;
      if (items[0] != "order") {
        if (items.length == 2) {
          position += " > " + group[items[0]].twigs[items[1]].name;
        }
        if (items.length == 3) {
          position += " > " + group[items[0]].twigs[items[1]].name;
          if (group[items[0]].twigs[items[1]].twigs) {
            position +=
              " > " + group[items[0]].twigs[items[1]].twigs[items[2]].name;
          }
        }
      }
    }
    if (items[0] == "personal") {
      position = "个人中心";
    }
    return Bus.$emit("changePosition", {
      item: items[0],
      twig: items[1],
      position: position
    });
  }
}

export default new Vue({
  el: "#app",
  router,
  render: h => h(App),
  watch: {
    $route(to, from) {
      init(to.path);
    }
  },
  mounted() {
    init(router.app.$route.path);
  }
});
