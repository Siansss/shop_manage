<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>编辑商品</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图区域 -->
    <el-card>
      <!-- 提示区域 -->
      <el-alert
        title="编辑商品信息"
        type="info"
        center
        show-icon
        :closable="false"
      >
      </el-alert>
      <!-- 步骤条区域 -->
      <el-steps
        :space="200"
        :active="activeIndex - 0"
        finish-status="success"
        align-center
      >
        <el-step title="基本信息"></el-step>
        <el-step title="商品参数"></el-step>
        <el-step title="商品属性"></el-step>
        <el-step title="商品图片"></el-step>
        <el-step title="商品内容"></el-step>
        <el-step title="完成"></el-step>
      </el-steps>

      <!-- tab栏区域 -->
      <el-form
        :model="goodsInfo"
        :rules="goodsInfoRules"
        ref="goodsInfoRef"
        label-width="100px"
        label-position="top"
      >
        <el-tabs
          v-model="activeIndex"
          :tab-position="'left'"
          :before-leave="beforeTabLeave"
          @tab-click="tabClicked"
        >
          <el-tab-pane label="基本信息" name="0">
            <el-form-item label="商品名称" prop="goods_name">
              <el-input v-model="goodsInfo.goods_name"></el-input>
            </el-form-item>
            <el-form-item label="商品价格" prop="goods_price">
              <el-input
                v-model="goodsInfo.goods_price"
                type="number"
              ></el-input>
            </el-form-item>
            <el-form-item label="商品重量" prop="goods_weight">
              <el-input
                v-model="goodsInfo.goods_weight"
                type="number"
              ></el-input>
            </el-form-item>
            <el-form-item label="商品数量" prop="goods_number">
              <el-input
                v-model="goodsInfo.goods_number"
                type="number"
              ></el-input>
            </el-form-item>
            <el-form-item label="商品分类" prop="goods_cat">
              <el-cascader
                v-model="goodsInfo.goods_cat"
                :options="catelist"
                :props="cateProps"
                @change="handleChange"
                disabled
              ></el-cascader>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品参数" name="1">
            <!-- 渲染表单的item项 -->
            <el-form-item
              :label="item.attr_name"
              v-for="item in manyTableData"
              :key="item.attr_id"
            >
              <!-- 复选框组 -->
              <el-checkbox-group v-model="item.attr_vals">
                <el-checkbox
                  :label="cb"
                  v-for="(cb, i) in item.attr_vals"
                  :key="i"
                  border
                ></el-checkbox>
              </el-checkbox-group>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品属性" name="2">
            <el-form-item
              :label="item.attr_name"
              v-for="item in onlyTableData"
              :key="item.attr_id"
            >
              <el-input v-model="item.attr_vals"></el-input>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品图片" name="3">
            <!-- action 表示图片要上传到的后台API地址 -->
            <el-upload
              :action="uploadURL"
              :on-preview="handlePreview"
              :on-remove="handleRemove"
              list-type="picture"
              :headers="headerObj"
              :on-success="handleSuccess"
              :file-list="fileList"
            >
              <el-button size="small" type="primary">点击上传</el-button>
            </el-upload>
          </el-tab-pane>
          <el-tab-pane label="商品内容" name="4">
            <!-- 富文本编辑器组件 -->
            <quill-editor v-model="goodsInfo.goods_introduce"></quill-editor>
            <!-- 添加商品的按钮 -->
            <el-button type="primary" class="btnAdd" @click="add"
              >添加商品</el-button
            >
          </el-tab-pane>
        </el-tabs>
      </el-form>
    </el-card>

    <!-- 图片预览 -->
    <el-dialog title="图片预览" :visible.sync="previewVisible" width="50%">
      <img :src="previewPath" alt="" class="previewImg" />
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'Edit',
  data() {
    return {
      // 用来控制当前的激活步骤
      activeIndex: '0',
      // 根据 id 查询到的商品信息
      goodsInfo: {},
      // 添加商品的表单验证规则
      goodsInfoRules: {
        goods_name: [
          { required: true, message: '请输入商品名称', trigger: 'blur' }
        ],
        goods_price: [
          { required: true, message: '请输入商品价格', trigger: 'blur' }
        ],
        goods_weight: [
          { required: true, message: '请输入商品重量', trigger: 'blur' }
        ],
        goods_number: [
          { required: true, message: '请输入商品数量', trigger: 'blur' }
        ],
        goods_cat: [
          { required: true, message: '请选择商品分类', trigger: 'blur' }
        ]
      },
      // 商品分类列表
      catelist: [],
      // 级联选择器的 props 配置
      cateProps: {
        expandTrigger: 'hover',
        label: 'cat_name',
        value: 'cat_id',
        children: 'children'
      },
      // 动态参数列表数据
      manyTableData: [],
      // 静态属性列表数据
      onlyTableData: [],
      // 上传图片的URL地址
      uploadURL: 'http://127.0.0.1:8888/api/private/v1/upload',
      // 图片上传组件的 headers 请求头对象
      headerObj: {
        Authorization: window.sessionStorage.getItem('token')
      },
      // 图片的路径地址
      previewPath: '',
      // 控制图片预览框的显示与隐藏
      previewVisible: false,
      // 提交数据对象
      editForm: {
        goods_name: '',
        goods_price: 0,
        goods_weight: 0,
        goods_number: 0,
        // 图片的数组
        pics: [],
        // 商品的详情描述
        goods_introduce: '',
        attrs: [],
        // 商品所属的分类数组
        goods_cat: []
      },
      // 图片数据
      fileList: []
    }
  },
  methods: {
    // 获取所有商品分类数据
    async getCateList() {
      const { data: res } = await this.$http.get('categories')
      if (res.meta.status !== 200) {
        return this.$message.error('获取商品分类数据失败！')
      }
      this.catelist = res.data
      // console.log(this.catelist)
    },
    // 根据 id 查询商品的信息
    async getGoodsInfo() {
      const id = window.sessionStorage.getItem('id')
      console.log(id)
      const { data: res } = await this.$http.get(`goods/${id}`)
      if (res.meta.status !== 200) {
        return this.$message.error('查询商品信息失败！')
      }
      // console.log(res.data)
      this.goodsInfo = res.data

      // 因为级联选择器绑定收集到的id值需要用数组保存吗，所有需要把 goodsInfo 里面的 goods_cat 转换为数组
      this.goodsInfo.goods_cat = this.goodsInfo.goods_cat.split(',')
      this.goodsInfo.goods_cat.forEach((item, index) => {
        this.goodsInfo.goods_cat[index] = parseInt(
          this.goodsInfo.goods_cat[index]
        )
      })
      console.log(this.goodsInfo)
    },
    // 级联选择器选中项发生变化，会触发这个函数
    handleChange() {
      console.log(this.goodsInfo.goods_cat)
      // if (this.goodsInfo.goods_cat.length !== 3) {
      //   this.goodsInfo.goods_cat = []
      // }
    },
    // 切换标签页是执行这个函数进行判断 activeName：要去的标签页名字  oldActiveName：要离开的标签页名字
    beforeTabLeave(activeName, oldActiveName) {
      if (oldActiveName === '0' && this.goodsInfo.goods_cat.length !== 3) {
        this.$message.error('请先选择商品分类！')
        return false
      }
    },
    // 标签页被选中时会执行
    async tabClicked() {
      // console.log(this.cateId)
      // console.log(this.activeIndex)
      // 证明访问的是动态参数面板
      if (this.activeIndex === '1') {
        const { data: res } = await this.$http.get(
          `categories/${this.cateId}/attributes`,
          {
            params: {
              sel: 'many'
            }
          }
        )
        if (res.meta.status !== 200) {
          return this.$message.error('获取动态参数列表失败！')
        }
        // console.log(res.data)
        res.data.forEach((item) => {
          item.attr_vals =
            item.attr_vals.length === 0 ? [] : item.attr_vals.split(' ')
        })
        this.manyTableData = res.data
        console.log(this.manyTableData)
      } else if (this.activeIndex === '2') {
        const { data: res } = await this.$http.get(
          `categories/${this.cateId}/attributes`,
          {
            params: {
              sel: 'only'
            }
          }
        )
        if (res.meta.status !== 200) {
          return this.$message.error('获取静态属性失败！')
        }
        // console.log(res.data)
        this.onlyTableData = res.data
      } else if (this.activeIndex === '3') {
        this.goodsInfo.pics.forEach((item) => {
          const picInfo = {
            name: item.pics_id,
            url: item.pics_sma_url
          }
          this.fileList.push(picInfo)
        })
        console.log(this.goodsInfo.pics)
      }
      // console.log('many:', this.manyTableData, 'only:', this.onlyTableData)
    },
    // 处理图片预览效果
    handlePreview(file) {
      // console.log(file)
      this.previewPath = file.response.data.url
      this.previewVisible = true
    },
    // 处理移除图片的操作
    handleRemove(file) {
      // console.log(file)
      // 1.获取将要删除的图片的临时路径
      const filePath = file.response.data.tmp_path
      // 2.从 pics 数组中，找到这个图片对应的索引值
      const i = this.goodsInfo.pics.findIndex((x) => {
        x.pic === filePath
      })
      // 3.调用数组的splice方法，把图片信息对象，从 pics 中移除
      this.goodsInfo.pics.splice(i, 1)
      // console.log(this.goodsInfo)
    },
    // 监听图片上传成功的事件
    handleSuccess(response) {
      console.log(response)
      // 1.拼接得到一个图片信息对象
      const picInfo = { pic: response.data.tmp_path }
      // 2.将图片信息对象，push 到 pics 数组中
      this.editForm.pics.push(picInfo)
      // console.log(this.editForm)
    },
    // 添加商品
    add() {
      this.$refs.goodsInfoRef.validate(async (valid) => {
        if (!valid) {
          return this.$message.error('请填写必要的表单项！')
        }

        this.editForm.goods_cat = this.goodsInfo.goods_cat.join(',')
        // 处理动态参数
        this.manyTableData.forEach((item) => {
          const newInfo = {
            attr_id: item.attr_id,
            attr_value: item.attr_vals.join(' ')
          }
          this.editForm.attrs.push(newInfo)
        })
        // 处理静态属性
        this.onlyTableData.forEach((item) => {
          const newInfo = {
            attr_id: item.attr_id,
            attr_value: item.attr_vals
          }
          this.editForm.attrs.push(newInfo)
        })
        this.editForm.goods_name = this.goodsInfo.goods_name
        this.editForm.goods_price = this.goodsInfo.goods_price
        this.editForm.goods_weight = this.goodsInfo.goods_weight
        this.editForm.goods_number = this.goodsInfo.goods_number
        this.editForm.goods_introduce = this.goodsInfo.goods_introduce

        console.log(this.editForm)

        // 发起请求添加商品
        // 商品的名称必须是唯一的
        const id = window.sessionStorage.getItem('id')
        console.log(id)
        const { data: res } = await this.$http.put(`goods/${id}`, this.editForm)
        console.log(res)
        if (res.meta.status !== 200) {
          return this.$message.error('添加商品失败！')
        }
        this.$message.success('添加商品成功！')
        this.$router.push('/goods')
      })
    }
  },
  computed: {
    // 获取分类 id
    cateId() {
      if (this.goodsInfo.goods_cat.length === 3) {
        return this.goodsInfo.goods_cat[2]
      }
      return null
    }
  },
  created() {
    this.getGoodsInfo()
    this.getCateList()
  }
}
</script>

<style lang="less" scoped>
.el-checkbox {
  margin: 0 10px 0 0 !important;
}
.previewImg {
  width: 100%;
}
.btnAdd {
  margin-top: 15px;
}
</style>
