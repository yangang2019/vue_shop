<template>
    <div class="usersContainer">
        <!--面包屑导航信息-->
        <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>用户管理</el-breadcrumb-item>
            <el-breadcrumb-item>用户列表</el-breadcrumb-item>
        </el-breadcrumb>

        <!--用户信息列表-->
        <el-card>
            <!--栅格系统，gutter表示每列间距，span占有列数，共24列-->
            <!--搜素及添加用户按钮-->
            <el-row :gutter="20">
                <el-col :span="8">
                    <el-input placeholder="请输入内容" v-model="queryInfo.query" clearable @clear="getUsersInfo">
                        <el-button slot="append" icon="el-icon-search" @click="getUsersInfo"></el-button>
                    </el-input>
                </el-col>
                <el-col :span="6">
                    <el-button type="primary" @click="dialogVisible = true">添加用户</el-button>
                </el-col>
            </el-row>

            <!--用户信息列表-->
            <el-table :data="userList" style="width: 100%" border stripe>
                <el-table-column type="index" label="#"></el-table-column>
                <el-table-column prop="username" label="姓名"></el-table-column>
                <el-table-column prop="email" label="邮箱"></el-table-column>
                <el-table-column prop="mobile" label="电话"></el-table-column>
                <el-table-column prop="role_name" label="角色"></el-table-column>
                <el-table-column label="状态">
                    <template v-slot="scope">
                        <el-switch v-model="scope.row.mg_state" @change="updateStatus(scope.row)"></el-switch>
                    </template>
                </el-table-column>
                <el-table-column label="操作" width="180px">
                    <template v-slot="scope">
                        <el-button type="primary" icon="el-icon-edit" size="mini" @click="editUserInfo(scope.row.id)"></el-button>
                        <el-button type="danger" icon="el-icon-delete" size="mini" @click="removeUserById(scope.row.id)"></el-button>
                        <el-tooltip effect="dark" content="分配角色" placement="top" :enterable="false">
                            <el-button type="warning" icon="el-icon-share" size="mini" @click="showAssignRoles(scope.row)"></el-button>
                        </el-tooltip>
                    </template>
                </el-table-column>
            </el-table>

            <!--页面分页,handleSizeChange-当前每页显示条数，handleCurrentChange-页码改变事件，current-page-当前页，page-size-每页显示条数-->
            <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page="queryInfo.pagenum" :page-sizes="[1, 2, 5, 10]" :page-size="queryInfo.pagesize" layout="total, sizes, prev, pager, next, jumper" :total="total">
            </el-pagination>
        </el-card>

        <!--添加用户对话框-->
        <el-dialog title="添加用户" :visible.sync="dialogVisible" @close="resetUserInfo">
            <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="70px" class="demo-ruleForm">
                <el-form-item label="用户名" prop="username">
                    <el-input v-model="addForm.username"></el-input>
                </el-form-item>
                <el-form-item label="密码" prop="password">
                    <el-input v-model="addForm.password" show-password></el-input>
                </el-form-item>
                <el-form-item label="邮箱" prop="email">
                    <el-input v-model="addForm.email"></el-input>
                </el-form-item>
                <el-form-item label="手机" prop="mobile">
                    <el-input v-model="addForm.mobile"></el-input>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="dialogVisible = false">取 消</el-button>
                <el-button @click="resetUserInfo">重 置</el-button>
                <el-button type="primary" @click="addUser">确 定</el-button>
            </span>
        </el-dialog>

        <!--修改用户信息-->
        <el-dialog title="修改用户信息" :visible.sync="editDialogVisible" @close="editDialogclose">
            <el-form :model="editForm" :rules="editFormRules" ref="editForm" label-width="70px" class="demo-ruleForm">
                <el-form-item label="用户名">
                    <el-input v-model="editForm.username" disabled></el-input>
                </el-form-item>
                <el-form-item label="邮箱" prop="email">
                    <el-input v-model="editForm.email"></el-input>
                </el-form-item>
                <el-form-item label="手机" prop="mobile">
                    <el-input v-model="editForm.mobile"></el-input>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="editDialogVisible = false">取 消</el-button>
                <el-button @click="editDialogclose">重 置</el-button>
                <el-button type="primary" @click="editDialogConfirm">确 定</el-button>
            </span>
        </el-dialog>

        <!--分配角色-->
        <el-dialog title="分配角色" :visible.sync="assignRoleVisible">
            <div>
                <p>当前用户：{{ userInfo.username }}</p>
                <p>所属角色：{{ userInfo.role_name }}</p>
                <p>选择角色：
                    <el-select v-model="selectedRoleId" placeholder="请选择">
                    <el-option v-for="item in rolesList" :key="item.id" :label="item.roleName" :value="item.id">
                    </el-option>
                </el-select></p>
            </div>

            <span slot="footer" class="dialog-footer">
                <el-button @click="assignRoleVisible = false">取 消</el-button>
                <el-button type="primary" @click="assignRoles">确 定</el-button>
            </span>
        </el-dialog>
    </div>
</template>

<script>
  export default {
    name: 'Users',
    data() {
      // 自定义邮箱和手机号验证规则,三个参数：验证规则、要验证的数据，回调函数
      const checkEmail = (rule,value,callback) => {
        var regEmail = /[0-9a-zA-Z_.-]+[@][0-9a-zA-Z_.-]+([.][a-zA-Z]+){1,2}/;
        if(regEmail.test(value)){
          return callback();
        }
        callback(new Error('请输入合法的邮箱'));
      }
      const checkMobile = (rule,value,callback) => {
        var regEmail = /^(0|86|17951)?(13[0-9]|15[012356789]|17[678]|18[0-9]|14[57])[0-9]{8}$/;
        if(regEmail.test(value)){
          return callback();
        }
        callback(new Error('请输入合法的手机号'));
      }
      return {
        queryInfo: {
          query: '',
          pagenum: 1,
          pagesize: 2
        },
        userList: [],
        total: 0,
        // 添加用户对话框显示与隐藏标志
        dialogVisible: false,
        // 修改用户对话框显示与隐藏标志
        editDialogVisible: false,
        addForm: {
          username: '',
          password: '',
          email: '',
          mobile: ''
        },
        addFormRules: {
          username: [
            { required: true, message: '请输入用户名', trigger: 'blur' },
            { min: 3, max: 10, message: '长度在 3 到 10 个字符', trigger: 'blur' }
          ],
          password: [
            { required: true, message: '请输入密码', trigger: 'blur' },
            { min: 6, max: 15, message: '长度在 6 到 15 个字符', trigger: 'blur' }
          ],
          email: [
            { required: true, message: '请输入邮箱', trigger: 'blur' },
            { validator: checkEmail, trigger: 'blur'}
          ],
          mobile: [
            { required: true, message: '请输入手机号', trigger: 'blur' },
            { validator: checkMobile, trigger: 'blur'}
          ]
        },
        editForm: {},
        editFormRules: {
          email: [
            { required: true, message: '请输入邮箱', trigger: 'blur' },
            { validator: checkEmail, trigger: 'blur'}
          ],
          mobile: [
            { required: true, message: '请输入手机号', trigger: 'blur' },
            { validator: checkMobile, trigger: 'blur'}
          ]
        },
        // 分配角色
        assignRoleVisible: false,
        userInfo: {},
        rolesList: [],
        selectedRoleId: ''
      }
    },
    created() {
      this.getUsersInfo()
    },
    methods: {
      // 获取用户列表信息
      async getUsersInfo() {
        const { data: res } = await this.$axios.get('users', { params: this.queryInfo })
        if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
        this.userList = res.data.users
        this.total = res.data.total
        console.log(res)
      },
      // 当前每页显示页数
      handleSizeChange(newSize) {
        // 修改每页显示条数
        this.queryInfo.pagesize = newSize
        this.getUsersInfo()
      },
      // 当前页码
      handleCurrentChange(newPage) {
        this.queryInfo.pagenum = newPage
        this.getUsersInfo()
      },
      // 更新用户状态
      async updateStatus(userInfo) {
        // console.log(userInfo);
        const { data: res } = await this.$axios.put(`users/${userInfo.id}/state/${userInfo.mg_state}`)
        if (res.meta.status !== 200) {
          userInfo.mg_state = !userInfo.mg_state
          return this.$message.error('用户状态更新失败！')
        }
        this.$message.success('用户状态更新成功！')
      },
      // 重新添加用户表单信息
      resetUserInfo(){
        this.$refs.addFormRef.resetFields();
      },
      // 验证并添加用户
      addUser(){
        this.$refs.addFormRef.validate( async valid => {
          console.log(valid)
          // 验证失败
          if(!valid) return;
          // 验证通过,添加用户
          const {data: res} = await this.$axios.post('users', this.addForm)
          if(res.meta.status !== 201){
            return this.$message.error('添加用户失败！');
          }
          this.$message.success('添加用户成功！');
          // 隐藏对话框
          this.dialogVisible = false;
          // 刷新用户信息
          this.getUsersInfo();
        });
      },
      // 修改用户信息
      async editUserInfo(id){
        this.editDialogVisible = true;
        // 获取用户基本信息
        const {data: res} = await this.$axios.get('users/'+id);
        if(res.meta.status !== 200) {
          return this.$message.error('未找到该用户信息');
        }
        // console.log(res);
        this.editForm = res.data;
      },
      // 修改用户对话框信息重置
      editDialogclose(){
        this.$refs.editForm.resetFields();
      },
      // 验证并修改用户信息
      editDialogConfirm(){
        this.$refs.editForm.validate(async valid => {
          if(!valid) return;
          const {data: res} = await this.$axios.put('users/'+this.editForm.id,{ email: this.editForm.email, mobile: this.editForm.mobile});
          if(res.meta.status !==200 ){
            return this.$message.error('用户信息修改失败！');
          }
          // 关闭对话框
          this.editDialogVisible = false;
          // 刷新用户列表
          this.getUsersInfo();
          // 提示修改成功
          this.$message.success('用户信息修改成功！');
        })
      },
      // 根据用户id删除用户
      async removeUserById(id){
        const resultsCft = await this.$confirm('此操作将永久删除该用户, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).catch(err => err)
        // 取消删除
        if(resultsCft !== 'confirm') {
          return this.$message.info('已取消删除操作！')
        }
        // 确认删除
        const {data: res} = await this.$axios.delete('users/'+id);
        if(res.meta.status !== 200){
          return this.$message.error('删除失败！');
        }
        this.$message.success('用户删除成功！');
        // 刷新用户列表
        this.getUsersInfo();
      },
      // 展示分配角色对话框
      async showAssignRoles(userInfo){
        // 保存用户信息
        this.userInfo = userInfo;
        // 获取角色列表
        const {data: res} = await this.$axios.get('roles');
        if(res.meta.status !== 200){
          return this.$message.error('获取角色列表失败');
        }
        this.rolesList = res.data;
        console.log(this.rolesList);
        this.assignRoleVisible = true;
      },
      // 分配角色确定按钮
      async assignRoles(){
        const {data: res} = await this.$axios.put(`users/${ this.userInfo.id }/role`, { rid: this.selectedRoleId });
        if(res.meta.status !== 200){
          return this.$message.error('分配角色失败');
        }
        this.$message.success('角色分配成功');
        this.getUsersInfo();
        this.selectedRoleId = '';
        this.userInfo = '';
        this.assignRoleVisible = false;
      }
    }
  }
</script>

<style scoped>

</style>