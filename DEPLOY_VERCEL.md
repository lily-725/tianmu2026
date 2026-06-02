# Vercel 部署指南

## 项目已准备就绪

我已经为您配置好了Vercel部署所需的所有文件：

1. **vite.config.ts** - 已修改为使用根路径 `/`（移除了GitHub Pages特定的子路径配置）
2. **vercel.json** - Vercel配置文件，包含构建命令和路由重写规则
3. **package.json** - 已有标准的 `npm run build` 构建脚本

## 通过Vercel网站部署（推荐）

### 步骤1：推送代码到GitHub
```bash
git add .
git commit -m "准备Vercel部署"
git push origin main
```

### 步骤2：通过Vercel网站部署

1. 访问 [vercel.com](https://vercel.com)
2. 使用GitHub账号登录
3. 点击 "New Project"
4. 导入您的GitHub仓库
5. Vercel会自动检测到Vite项目配置
6. 点击 "Deploy"

### 步骤3：配置环境变量（如果需要）

如果您的项目需要Gemini API密钥：
1. 在Vercel项目设置中，找到 "Environment Variables"
2. 添加 `GEMINI_API_KEY` 变量
3. 重新部署

## 通过Vercel CLI部署（备选）

如果您想使用命令行部署：

1. **安装Vercel CLI**（需要管理员权限）：
   ```bash
   npm install -g vercel
   ```

2. **登录Vercel**：
   ```bash
   vercel login
   ```

3. **部署到生产环境**：
   ```bash
   vercel --prod
   ```

## 项目配置说明

### 关键配置
- **构建命令**: `npm run build`
- **输出目录**: `dist/`
- **框架**: Vite
- **路由**: 所有路由都重写到 `index.html`（支持React Router）

### 路径处理
项目使用 `withBase()` 函数自动处理路径，在Vercel上会使用根路径 `/`。

## 验证部署

部署完成后：
1. 访问Vercel提供的URL（如 `https://your-project.vercel.app`）
2. 检查首页是否正常加载
3. 测试地图页面、收藏页面等功能
4. 确认所有图片都能正常显示

## 自定义域名

如果您想使用自定义域名：
1. 在Vercel项目设置中，找到 "Domains"
2. 添加您的域名
3. 按照指引配置DNS记录

## 自动部署

Vercel会自动监听GitHub仓库的推送，每次推送到 `main` 分支都会自动重新部署。

## 问题排查

如果部署后出现问题：

1. **检查构建日志**：在Vercel的部署详情中查看构建日志
2. **验证图片路径**：确保 `withBase()` 函数正常工作
3. **清除浏览器缓存**：使用 Ctrl+Shift+R（Windows）或 Cmd+Shift+R（Mac）

## 回滚到GitHub Pages

如果您想回退到GitHub Pages：
1. 恢复 `vite.config.ts` 中的GitHub Pages配置
2. 删除 `vercel.json` 文件
3. 使用 `npm run build:pages` 构建
4. 推送到GitHub触发GitHub Actions部署