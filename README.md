### 论坛的服务器
    主要技术： express jwt 验证 bcryptjs 密码加密算法
    数据库 ：mongoDB


    服务器端模块化较为完善(部分方法没有封装)：
        routes: 路由模块
        model: 数据模型
        public: 静态文件开放文件
        mongoDB: 数据库链接
        app: 项目入口文件
        uploads: 文件上传目录
        util: 工具文件
        test.http: vscode 测试项目接口
    启用：
        node app.js