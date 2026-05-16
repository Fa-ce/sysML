import { createApp } from "vue";
import { createPinia } from "pinia";
import Antd from "ant-design-vue";
import App from "./App.vue";
import router from "./router";
import { registerSysmlNodes } from "./components/Canvas/nodes";
import "ant-design-vue/dist/reset.css";
import "./styles/index.scss";
import "./components/Canvas/styles/sysml-nodes.scss";

registerSysmlNodes();

createApp(App).use(createPinia()).use(router).use(Antd).mount("#app");

