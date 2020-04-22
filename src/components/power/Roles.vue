<template>
    <div class="rolesContainer">
        <!--面包屑导航信息-->
        <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>权限管理</el-breadcrumb-item>
            <el-breadcrumb-item>角色列表</el-breadcrumb-item>
        </el-breadcrumb>

        <!--卡片角色视图列表-->
        <el-card>
            <!--添加角色按钮-->
            <el-row>
                <el-col>
                    <el-button type="primary" @click="addRoleDialog = true">添加角色</el-button>
                </el-col>
            </el-row>

            <!--角色信息表-->
            <el-table :data="rolesList" border stripe>
                <el-table-column type="expand">
                    <template v-slot="scope">
                        <el-row :class="['borderBtm', i1 === 0 ? 'borderTop':'', 'vendor']" v-for="(item1,i1) in scope.row.children" :key="item1.id">
                            <!--一级分类-->
                            <el-col :span="5">
                                <el-tag closable @close="delRights(scope.row, item1.id)">{{ item1.authName }}</el-tag>
                                <i class="el-icon-caret-right"></i>
                            </el-col>
                            <!--二级和三级分类-->
                            <el-col :span="19">
                                <el-row :class="[i2 === 0 ? '':'borderTop', 'vendor']" v-for="(item2,i2) in item1.children" :key="item2.id">
                                    <el-col :span="6">
                                        <el-tag type="success" closable @close="delRights(scope.row, item2.id)">{{ item2.authName  }}</el-tag>
                                        <i class="el-icon-caret-right"></i>
                                    </el-col>
                                    <el-col :span="18">
                                        <el-tag type="warning" v-for="(item3,i3) in item2.children" :key="item3.id" closable @close="delRights(scope.row, item3.id)">{{ item3.authName }}</el-tag>
                                    </el-col>
                                </el-row>
                            </el-col>
                        </el-row>
                    </template>
                </el-table-column>
                <el-table-column type="index" label="#"></el-table-column>
                <el-table-column label="角色名称" prop="roleName"></el-table-column>
                <el-table-column label="角色描述" prop="roleDesc"></el-table-column>
                <el-table-column label="操作" width="300px">
                    <template v-slot="scope">
                        <el-button size="mini" type="primary" icon="el-icon-edit" @click="editRoleByRoleId(scope.row.id)">编辑</el-button>
                        <el-button size="mini" type="danger" icon="el-icon-delete" @click="delRolesById(scope.row.id)">删除</el-button>
                        <el-button size="mini" type="warning" icon="el-icon-setting" @click="showAssignRights(scope.row)">分配权限</el-button>
                    </template>
                </el-table-column>
            </el-table>
        </el-card>

        <!--添加角色-->
        <el-dialog title="添加角色" :visible.sync="addRoleDialog" @close="resetRoleFields">
            <el-form :model="addRole" :rules="addRoleRules" ref="addRoleRef" label-width="80px" class="demo-ruleForm">
                <el-form-item label="角色名称" prop="roleName">
                    <el-input v-model="addRole.roleName"></el-input>
                </el-form-item>
                <el-form-item label="角色描述">
                    <el-input v-model="addRole.roleDesc"></el-input>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="addRoleDialog = false">取 消</el-button>
                <el-button @click="resetRoleFields">重 置</el-button>
                <el-button type="primary" @click="addRolesConfirm">确 定</el-button>
            </span>
        </el-dialog>
        <!--编辑角色信息-->
        <el-dialog title="编辑角色" :visible.sync="editRoleDialog" @close="resetEditFields">
            <el-form :model="editRole" ref="editRoleRef" label-width="80px" class="demo-ruleForm">
                <el-form-item label="角色名称">
                    <el-input v-model="editRole.roleName" disabled></el-input>
                </el-form-item>
                <el-form-item label="角色描述">
                    <el-input v-model="editRole.roleDesc"></el-input>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="editRoleDialog = false">取 消</el-button>
                <el-button @click="resetEditFields">重 置</el-button>
                <el-button type="primary" @click="editRolesConfirm">确 定</el-button>
            </span>
        </el-dialog>
        <!--分配权限-->
        <el-dialog title="分配权限" :visible.sync="setRolesVisible">
            <el-tree :data="rightsList" :props="treeProps" show-checkbox default-expand-all node-key="id" :default-checked-keys="defRights" ref="rightsTree"></el-tree>
            <span slot="footer" class="dialog-footer">
            <el-button @click="setRolesVisible = false">取 消</el-button>
            <el-button type="primary" @click="assignRightsbtn">确 定</el-button>
  </span>
        </el-dialog>
    </div>
</template>

<script>
  export default {
    name: 'Roles',
    data(){
      return {
        rolesList: [],
        addRoleDialog: false,
        editRoleDialog: false,
        addRole: {
          roleName: '',
          roleDesc: ''
        },
        addRoleRules: {
          roleName: [
            { required: true, message: '请输入角色名称', trigger: 'blur' },
          ]
        },
        editRole:{},
        // 分配权限显示与隐藏
        setRolesVisible: false,
        // 权限tree列表
        rightsList: [],
        // tree组件父子关系属性
        treeProps: {
          children: 'children',
          label: 'authName'
        },
        // 默认勾选选的权限
        defRights: [],
        roleId: ''
      }
    },
    created(){
      this.getRolesList();
    },
    methods: {
      // 获取角色列表
      async getRolesList(){
        const {data: res} = await this.$axios.get('roles');
        if(res.meta.status !== 200){
          return this.$message.error('获取角色列表失败！');
        }
        this.rolesList = res.data;
        console.log(res.data);
      },
      // 重置添加角色文本域
      resetRoleFields(){
        this.$refs.addRoleRef.resetFields();
      },
      // 重置编辑角色文本域
      resetEditFields(){
        this.$refs.editRoleRef.resetFields();
      },
      addRolesConfirm(){
        // 表单验证
        this.$refs.addRoleRef.validate(async valid => {
          // 验证不通过
          if(!valid) return;
          const {data: res} = await this.$axios.post('roles', this.addRole);
          if(res.meta.status !== 201) {
            return this.$message.error('添加角色失败！');
          }

          this.$message.success('添加角色成功！');
          this.getRolesList();
          this.addRoleDialog = false;
        })
      },
      // 编辑角色信息
      async editRolesConfirm(){
        const {data: res} = await this.$axios.put('roles/'+this.editRole.roleId, {roleName: this.editRole.roleName, roleDesc: this.editRole.roleDesc});
        if(res.meta.status !== 200){
          return this.$message.error('编辑角色信息失败！');
        }
        // 关闭对话框
        this.editRoleDialog = false;
        this.$message.success('修改角色信息成功');
        this.getRolesList();
      },
      // 编辑按钮
      async editRoleByRoleId(roleId){
        this.editRoleDialog = true;
        // console.log(roleId);
        // 根据角色ID获取角色信息
        const {data: res} = await this.$axios.get('roles/'+roleId);
        if(res.meta.status !== 200){
          return this.$message.error('获取角色信息失败！');
        }
        this.editRole = res.data;
      },
      // 删除角色
      async delRolesById(roleId){
        const resultDel = await this.$confirm('此操作将永久删除该角色，是否继续','提示',{
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).catch(err => err)
        if(resultDel !== 'confirm'){
          return this.$message.info('取消删除操作');
        }
        const {data: res} = await this.$axios.delete("roles/"+roleId);
        if(res.meta.status !== 200){
          return this.$message.error('删除角色失败！');
        }
        this.$message.success('角色删除成功！');
        this.getRolesList();
      },
      // 删除权限
      async delRights(role,rightId){
        const resultDel = await this.$confirm('此操作将永久删除该权限，是否继续','提示',{
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).catch(err => err)
        if(resultDel !== 'confirm'){
          return this.$message.info('取消删除');
        }
        const {data: res} = await this.$axios.delete(`roles/${ role.id }/rights/${ rightId }`);
        if(res.meta.status !== 200){
          return this.$message.error('删除权限失败！')
        }
        this.$message.success('权限删除成功！');
        // 重新复制角色全新，不要直接获取素有rolelist（会刷新页面）
        role.children = res.data;
      },
      // 分配权限
      async showAssignRights(role){
        // 获取权限列表tree
        const {data: res} = await this.$axios.get('rights/tree');
        if(res.meta.status !== 200){
          return this.$message.error('获取权限列表树失败！');
        }
        this.rightsList = res.data;
        console.log(this.rightsList);
        // 现将数组置空，防止重复加载
        this.defRights = [];
        this.getAllRights(role,this.defRights);
        // 角色id
        this.roleId = role.id;
        this.setRolesVisible = true;
      },
      // 获取所有默认权限
      getAllRights(role,arr){
        if(!role.children){
          // 不包含children属性的为三级权限
          return arr.push(role.id);
        }
        // 否则递归查询
        role.children.forEach(item => {
          this.getAllRights(item,arr);
        })
      },
      // 确定分配权限
      async assignRightsbtn(){
        // 所有选中的权限及半选中的权限id数组
        const selectedIds = [...this.$refs.rightsTree.getCheckedKeys(),...this.$refs.rightsTree.getHalfCheckedKeys()];
        // console.log(selectedIds);
        const keysStr = selectedIds.join(',');
        // console.log(keysStr);
        const {data: res} = await this.$axios.post(`roles/${ this.roleId }/rights`,{ rids: keysStr});
        if(res.meta.status !== 200) {
          return this.$message.error('分配权限失败');
        }
        this.$message.success('分配权限成功');
        this.getRolesList();
        this.setRolesVisible = false;
      }
    }
  }
</script>

<style scoped lang="less">
    .el-tag {
        margin: 7px;
    }
    .borderTop {
        border-top: 1px solid #ccc;
    }
    .borderBtm {
        border-bottom: 1px solid #ccc;
    }
    // 垂直居中
    .vendor {
        display: flex;
        align-items: center;
    }
</style>