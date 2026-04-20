<div align="center">

# 🤖 仓储机器人路径规划系统

![Python](https://img.shields.io/badge/Python-3.8%2B-blue?style=flat-square&logo=python)
![Flask](https://img.shields.io/badge/Flask-2.0%2B-green?style=flat-square&logo=flask)
![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=flat-square&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=flat-square&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=flat-square&logo=javascript&logoColor=black)
![License](https://img.shields.io/badge/License-MIT-yellow?style=flat-square)
![Algorithm](https://img.shields.io/badge/Algorithm-A*%20Pathfinding-orange?style=flat-square)

一个的二维仓库路径规划系统，使用 A* 算法计算最短路径，支持单机器人和多机器人场景，提供现代化的网页可视化界面。

</div>

---

## ✨ 核心特性

<div align="center">
<table>
  <tr>
    <td align="center"><b>🧠 智能路径规划</b></td>
    <td align="center"><b>🤖 多机器人支持</b></td>
    <td align="center"><b>🎨 现代化界面</b></td>
    <td align="center"><b>⚡ 高效性能</b></td>
  </tr>
  <tr>
    <td>• A* 算法保证最短路径<br>• 任意起点/终点支持<br>• 自动避障</td>
    <td>• 单机器人精确规划<br>• 多机器人并行规划<br>• 实时结果展示</td>
    <td>• 响应式设计<br>• 高级色彩方案<br>• 流畅交互体验<br>• 网格可视化</td>
    <td>• 快速路径计算<br>• 支持 50×50 大地图<br>• 10+ 机器人并行</td>
  </tr>
</table>
</div>

---

## 📁 项目结构# 

## 项目结构

```
warehouse_path_planning/
├── backend/
│   ├── app.py              # Flask 应用主入口
│   └── pathfinding.py      # A* 算法实现
├── frontend/
│   ├── index.html          # 主页面
│   ├── style.css           # 样式文件
│   └── script.js           # 交互逻辑
├── requirements.txt        # Python 依赖
└── README.md              # 项目说明
```

## 安装依赖

```bash
pip install -r requirements.txt
```

## 运行项目

### 方法 1：在项目目录下运行

```bash
cd /Users/fanyue/code
python backend/app.py
```

### 方法 2：直接指定 Flask 应用

```bash
export FLASK_APP=backend/app.py
flask run
```

然后在浏览器中打开：`http://localhost:5000`

## 使用指南

### 单机器人模式

1. **选择起点**：在地图上点击一个空闲单元格设置起点（绿色方块）
2. **选择终点**：再点击一个单元格设置终点（红色叉号）
3. **规划路径**：点击"开始规划"按钮
4. **查看结果**：青色线条显示最短路径，右侧显示路径长度

### 多机器人模式

1. **设置数量**：在"机器人数量"输入框中设置机器人个数（1-10）
2. **生成任务**：点击"生成随机任务"，系统将为每个机器人随机分配起点和终点
3. **规划路径**：点击"规划所有路径"，系统将为所有机器人规划最短路径
4. **查看结果**：  
   - 每个机器人的路径用不同颜色显示
   - 左侧面板显示每个机器人的规划结果
   - 统计信息显示总成功数和总步数

## 技术栈

- **后端**：Python Flask
- **前端**：HTML5 + CSS3 + JavaScript
- **算法**：A* 寻路算法
- **通信**：REST API

## API 文档

### GET /api/grid
获取默认的 50x50 地图

**响应**：
```json
{
  "grid": [[0, 1, 0, ...], ...],
  "rows": 50,
  "cols": 50
}
```

### POST /api/pathfind
规划单个机器人的路径

**请求体**：
```json
{
  "grid": [[0, 1, 0, ...], ...],
  "start": [0, 0],
  "goal": [49, 49]
}
```

**响应**：
```json
{
  "found": true,
  "path": [[0, 0], [0, 1], ..., [49, 49]],
  "distance": 98
}
```

### POST /api/pathfind-multiple
规划多个机器人的路径

**请求体**：
```json
{
  "grid": [[0, 1, 0, ...], ...],
  "robots": [
    {"id": 0, "start": [0, 0], "goal": [49, 49]},
    {"id": 1, "start": [10, 10], "goal": [40, 40]},
    ...
  ]
}
```

**响应**：
```json
{
  "results": [
    {
      "id": 0,
      "path": [[0, 0], ..., [49, 49]],
      "distance": 98,
      "found": true
    },
    ...
  ]
}
```

## 配置

在 `backend/app.py` 中可以修改地图参数：

```python
def generate_default_grid(rows: int = 50, cols: int = 50):
    # 修改默认地图大小
    pass
```

## 性能指标

- **地图大小**: 50 × 50 格子
- **规划速度**: < 100ms（单个机器人）
- **支持机器人数**: 1-10 个
- **最短路径保证**: ✅ A* 算法保证

## 扩展建议

- 添加机器人碰撞检测和避障
- 实现路径平滑算法
- 支持时空冲突消解
- 添加导出路径功能
- 集成实时动画展示

## 许可证

MIT

## 作者

Warehouse Path Planning Team

