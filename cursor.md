# Git工作流程指南

## 提交代码、打标签与推送流程

### 1. 检查当前状态
```bash
git status
```
用于查看当前工作区和暂存区的状态，确认哪些文件需要提交。

### 2. 查看历史标签
```bash
git tag -l
```
查看项目现有标签，确定新标签的版本号。

### 3. 查看最近提交历史
```bash
git log -n 3
```
查看最近的提交记录，了解项目最近的变更，帮助编写合适的提交信息。

### 4. 添加要提交的文件
```bash
git add <文件名>  # 添加特定文件
git add .        # 添加所有变更
```

### 5. 提交代码
```bash
git commit -m "类型: 详细的提交描述"
```
提交信息格式建议：
- feat: 新功能
- fix: 修复bug
- docs: 文档更新
- style: 代码格式调整
- refactor: 代码重构
- perf: 性能优化
- test: 测试相关
- build: 构建系统或外部依赖变更
- ci: CI配置文件和脚本的变更

### 6. 创建新标签
```bash
git tag -a v版本号 -m "标签描述信息"
```
例如：`git tag -a v1.0.8 -m "版本v1.0.8：添加开发环境配置文件，维护团队一致性"`

### 7. 推送提交到远程仓库
```bash
git push origin main  # 或其他分支名称
```

### 8. 推送标签到远程仓库
```bash
git push origin v版本号  # 推送特定标签
git push origin --tags  # 推送所有标签
```

## 实际案例

最近一次提交流程示例：

1. 添加cursor.md文件
2. 提交代码：`git commit -m "docs: 添加cursor.md文件用于开发环境配置记录 - 用于记录Cursor编辑器的配置信息和开发环境设置，有助于团队成员保持一致的开发体验，目前为空白文件，待后续完善"`
3. 创建标签：`git tag -a v1.0.8 -m "版本v1.0.8：添加开发环境配置文件，维护团队一致性"`
4. 推送提交：`git push origin main`
5. 推送标签：`git push origin v1.0.8`

## 版本命名规则

项目遵循语义化版本控制 [SemVer](https://semver.org/lang/zh-CN/)：

- 主版本号：不兼容的API变更
- 次版本号：向下兼容的功能性新增
- 修订号：向下兼容的问题修正

当前项目版本格式：v1.0.x，其中x为递增的修订号。
