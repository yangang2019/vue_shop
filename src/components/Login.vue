<template>
    <div class="login_container">
        <div class="login_box">
            <div class="avator_box">
                <img src="../assets/logo.png" alt="">
            </div>
            <el-form label-width="0" class="login_form" :model="loginForm" :rules="loginFormRules" ref="loginFormRef">
                <el-form-item prop="username">
                    <el-input prefix-icon="el-icon-user-solid" v-model="loginForm.username"></el-input>
                </el-form-item>
                <el-form-item prop="password">
                    <el-input prefix-icon="el-icon-lock" v-model="loginForm.password" show-password></el-input>
                </el-form-item>
                <el-form-item class="btns">
                    <el-button type="primary" @click="login">登录</el-button>
                    <el-button type="info" @click="resetInfo">重置</el-button>
                </el-form-item>

            </el-form>
        </div>
    </div>
</template>

<script>
  export default {
    name: "Login",
    data(){
      return {
        loginForm: {
          username: 'admin',
          password: '123456'
        },
        loginFormRules: {
          username: [
            { required: true, message: '请输入用户名', trigger: 'blur' },
            { min: 3, max: 10, message: '长度在 3 到 10 个字符', trigger: 'blur' }
          ],
          password: [
            { required: true, message: '请输入用户名', trigger: 'blur' },
            { min: 6, max: 15, message: '长度在 6 到 15 个字符', trigger: 'blur' }
          ]
        }
      }
    },
    methods: {
      login(){
        //validate是elementUI提供的表单验证，如果表单内容通过，会返回一个true
        this.$refs.loginFormRef.validate(async validate => {
          if(!validate) return;
          //将返回值data结构重置为res
          const {data: res} = await this.$axios.post('login', this.loginForm);
          console.log(res)
          if(res.meta.status !== 200) return this.$message.error('登录失败！');
          this.$message.success('登录成功');
          window.sessionStorage.setItem('token',res.data.token);
          this.$router.push('/home');

        });
      },
      resetInfo(){
          this.$refs.loginFormRef.resetFields();
      }
    }
  }
</script>

<style scoped lang="less">
    .login_container {
        background-color: #2b4b6b;
        height: 100%;
        .login_box {
            width: 450px;
            height: 300px;
            background-color: #fff;
            -webkit-border-radius: 3px;
            -moz-border-radius: 3px;
            border-radius: 3px;
            position: absolute;
            left: 50%;
            top: 50%;
            -webkit-transform: translate(-50%,-50%);
            -moz-transform: translate(-50%,-50%);
            -ms-transform: translate(-50%,-50%);
            -o-transform: translate(-50%,-50%);
            transform: translate(-50%,-50%);
            .avator_box {
                width: 130px;
                height: 130px;
                background-color: #fff;
                -webkit-border-radius: 50%;
                -moz-border-radius: 50%;
                border-radius: 50%;
                padding: 10px;
                -webkit-box-shadow: 0 0 10px #ddd;
                -moz-box-shadow: 0 0 10px #ddd;
                box-shadow: 0 0 10px #ddd;
                position: absolute;
                left: 50%;
                -webkit-transform: translate(-50%,-50%);
                -moz-transform: translate(-50%,-50%);
                -ms-transform: translate(-50%,-50%);
                -o-transform: translate(-50%,-50%);
                transform: translate(-50%,-50%);
                border: 1px solid #eee;
                img {
                    width: 100%;
                    height: 100%;
                    -webkit-border-radius: 50%;
                    -moz-border-radius: 50%;
                    border-radius: 50%;
                    background-color: #eee;
                }
            }
        }
        .login_form {
            position: absolute;
            bottom: 0;
            width: 100%;
            padding:0 20px;
            -webkit-box-sizing: border-box;
            -moz-box-sizing: border-box;
            box-sizing: border-box;
            .btns {
                float: right;
            }
        }
    }
</style>
