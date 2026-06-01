# 内容维护指南（展览内容/文案/图片）

这份项目的目标是：你以后修改内容时尽量**只改内容文件**，不需要改页面代码。

## 1. 你最常改的内容在哪里？

### 1) 关于天穆
- 文件：`src/content/site/about.ts`
- 结构：`about.paragraphs: string[]`（一段一条）

### 2) 前言
- 文件：`src/content/site/preface.ts`
- 结构：`preface.paragraphs: string[]`（一段一条）

### 3) 策展团队 / 致谢 / 联系方式
- 文件：`src/content/site/team.ts`
- 字段：
  - `team.curators`（角色与姓名）
  - `team.acknowledgments`（致谢段落）
  - `team.contact`（邮箱）

### 4) 展品与展厅（展览内容）
目前项目仍在过渡期：
- **展品/展厅主数据仍在**：`src/data/generated-content.ts`
- 页面不会直接依赖它，而是通过 `src/content/exhibitions` 统一出口读取（减少耦合）

> 如果你希望把展品/展厅也彻底搬到 `src/content/exhibitions/*.ts`（不再依赖 generated-content.ts），我可以在下一步继续把数据拆出来并写成更易编辑的文件结构。

---

## 2. 图片如何添加/替换？

### 2.1 本地图片存放位置
- 目录：`public/import/`
- 引用方式：内容中写 `/import/xxx.png`

### 2.2 修改图片的步骤
1. 把图片文件放进 `public/import/`
2. 在内容文件里，把对应条目的 `imageUrls` 改成 `/import/你的文件名.png`
3. 运行校验命令（见第 4 节）

---

## 3. 多图条目（图1/图2）标题怎么写？

当同一条图说对应多张图片时：
- `imageUrls` 写成数组（或由导入脚本生成）
- `title` 推荐两种写法（系统可解析并用于“浏览展品”卡片按图匹配标题）

### 写法 A：编号式（推荐）
```
图1：漕船图示
图2：渔船图示
```

### 写法 B：多行式（每行一张图）
```
漕船图示
渔船图示
```

---

## 4. 改完内容后必须跑哪些命令？

在项目目录 `zhanlan-site/` 下运行：

```bash
# 类型检查
npm run lint

# 内容一致性校验（ID、引用、图片是否存在等）
npm run validate:content

# 构建检查（确保可上线）
npm run build
```

`validate:content` 如果出现 Warning（例如某条 title 为空）会提示你补齐；出现 Error（例如图片文件不存在、ID 重复）会直接失败，防止上线出错。

