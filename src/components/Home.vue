<template>
    <el-container class="home_container">
        <!--顶部菜单-->
        <el-header>
            <div>
                <img src="../assets/heima.png" alt="黑马教程">
                <span>电商后台管理系统</span>
            </div>
            <el-button type="info" @click="logout">退出</el-button>
        </el-header>
        <!--主题区域-->
        <el-container>
            <!--左侧导航-->
            <el-aside :width="isCollapse ? '64px':'200px'">
                <!--侧边栏导航组件-->
                <div class="toggle-icon" @click="toggleCollapse">|||</div>
                <el-menu background-color="#333744" text-color="#fff" active-text-color="#409EFF" unique-opened :collapse="isCollapse" :collapse-transition="false" router :default-active="activePath">
                    <el-submenu :index="item.id.toString()" v-for="item in menuList" :key="item.id">
                        <template slot="title">
                            <i :class="iconItem[item.id]"></i>
                            <span>{{ item.authName }}</span>
                        </template>
                        <el-menu-item :index="subitem.path" v-for="subitem in item.children" :key="subitem.id" @click="getActivPath(subitem.path)">
                            <template slot="title">
                                <i class="el-icon-menu"></i>
                                <span>{{ subitem.authName }}</span>
                            </template>
                        </el-menu-item>
                    </el-submenu>
                </el-menu>
            </el-aside>
            <!--右侧内容-->
            <el-main>
                <router-view></router-view>
            </el-main>
        </el-container>
    </el-container>
</template>

<script>
  export default {
    name: 'Home',
    data(){
      return {
        menuList: [],
        // 导航列表图标
        iconItem: {
          '125': 'el-icon-s-custom',
          '103': 'el-icon-s-management',
          '101': 'el-icon-s-goods',
          '102': 'el-icon-s-order',
          '145': 'el-icon-s-marketing',
        },
        // 列表折叠与展示标识
        isCollapse: false,
        // 当前活动导航
        activePath: ''
      }
    },
    created(){
        this.getMenuList();
        // 获取到活动状态的导航栏
        this.activePath = window.sessionStorage.getItem('activePath');
    },
    methods: {
      // 退出
      logout(){
        window.sessionStorage.clear();
        this.$router.push('/login');
      },
      async getMenuList(){
        // 获取左侧菜单列表
        const {data: res} = await this.$axios.get('menus');
        if(res.meta.status !== 200) return this.$message.error(res.meta.msg);
        this.menuList = res.data;
        console.log(res);
      },
      // 导航栏折叠与真实
      toggleCollapse(){
        this.isCollapse = !this.isCollapse;
      },
      // 获取当前活动导航
      getActivPath(activePt){
        // 将路径保存到本地并赋值给activePath变量
        window.sessionStorage.setItem('activePath', activePt);
        this.activePath = activePt;
      }
    }
  }
</script>

<style scoped lang="less">
    .home_container {
        height: 100%;
        .el-header {
            background-color: #373d41;
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding-left: 0;
            color: #fff;
            > div {
                display: flex;
                align-items: center;
                img {
                    background-color: #ddd;
                    -webkit-border-radius: 50%;
                    -moz-border-radius: 50%;
                    border-radius: 50%;
                }
                span {
                    margin-left: 12px;
                }
            }
        }
        .el-aside {
            background-color: #333744;
        }
        .el-main {
            background-color: #eaedf1;
        }
        .el-menu {
            border-right: none;
        }
        .toggle-icon {
            background-color: #4a5064;
            color: #fff;
            font-size: 16px;
            text-align: center;
            letter-spacing: 2px;
            cursor: pointer;
        }
    }

</style>