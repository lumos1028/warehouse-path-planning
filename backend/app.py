from flask import Flask, request, jsonify, render_template
from flask_cors import CORS
import json
from pathfinding import astar, find_paths_for_robots

app = Flask(__name__, static_folder="../frontend", static_url_path="/static", template_folder="../frontend")
CORS(app)

# 默认地图（50x50）
DEFAULT_GRID = None


def generate_default_grid(rows: int = 50, cols: int = 50) -> list:
    """生成默认地图，随机添加一些障碍"""
    import random

    grid = [[0 for _ in range(cols)] for _ in range(rows)]

    # 添加一些随机障碍和墙壁
    # 竖向墙
    for r in range(10, 40):
        if random.random() < 0.3:
            grid[r][15] = 1
            grid[r][35] = 1

    # 横向墙
    for c in range(5, 45):
        if random.random() < 0.25:
            grid[25][c] = 1

    # 小障碍群
    for _ in range(5):
        start_r = random.randint(5, 45)
        start_c = random.randint(5, 45)
        for dr in range(-2, 3):
            for dc in range(-2, 3):
                r, c = start_r + dr, start_c + dc
                if 0 <= r < rows and 0 <= c < cols:
                    grid[r][c] = 1

    return grid


@app.route("/")
def index():
    """主页"""
    return render_template("index.html")


@app.route("/api/grid", methods=["GET"])
def get_grid():
    """获取默认地图"""
    global DEFAULT_GRID
    if DEFAULT_GRID is None:
        DEFAULT_GRID = generate_default_grid(50, 50)
    return jsonify({"grid": DEFAULT_GRID, "rows": 50, "cols": 50})


@app.route("/api/pathfind", methods=["POST"])
def pathfind():
    """计算单个机器人的路径"""
    data = request.json
    grid = data.get("grid")
    start = tuple(data.get("start"))
    goal = tuple(data.get("goal"))

    if not grid or not start or not goal:
        return jsonify({"error": "缺少参数"}), 400

    path = astar(grid, start, goal)

    if path is None:
        return jsonify(
            {"found": False, "path": [], "distance": -1}
        )

    return jsonify(
        {"found": True, "path": path, "distance": len(path) - 1}
    )


@app.route("/api/pathfind-multiple", methods=["POST"])
def pathfind_multiple():
    """计算多个机器人的路径"""
    data = request.json
    grid = data.get("grid")
    robots = data.get("robots")

    if not grid or not robots:
        return jsonify({"error": "缺少参数"}), 400

    results = find_paths_for_robots(grid, robots)
    return jsonify({"results": results})


if __name__ == "__main__":
    app.run(debug=True, port=5000)
