import heapq
from typing import List, Tuple, Optional, Dict

Point = Tuple[int, int]


def heuristic(a: Point, b: Point) -> float:
    """曼哈顿距离"""
    return abs(a[0] - b[0]) + abs(a[1] - b[1])


def get_neighbors(point: Point, grid: List[List[int]]) -> List[Point]:
    """获取可行走的相邻点（4向移动）"""
    rows = len(grid)
    cols = len(grid[0]) if rows > 0 else 0
    r, c = point
    neighbors = []

    # 上下左右四个方向
    for dr, dc in [(-1, 0), (1, 0), (0, -1), (0, 1)]:
        nr, nc = r + dr, c + dc
        if 0 <= nr < rows and 0 <= nc < cols and grid[nr][nc] == 0:
            neighbors.append((nr, nc))

    return neighbors


def reconstruct_path(came_from: Dict[Point, Point], current: Point) -> List[Point]:
    """从起点到当前点重建路径"""
    path = [current]
    while current in came_from:
        current = came_from[current]
        path.append(current)
    return path[::-1]


def astar(
    grid: List[List[int]], start: Point, goal: Point
) -> Optional[List[Point]]:
    """
    A* 算法求最短路径
    
    Args:
        grid: 二维网格，0 表示空地，1 表示障碍
        start: 起点 (row, col)
        goal: 终点 (row, col)
    
    Returns:
        路径点列表，如果无法到达则返回 None
    """
    rows = len(grid)
    cols = len(grid[0]) if rows > 0 else 0

    # 验证起点和终点
    if not (0 <= start[0] < rows and 0 <= start[1] < cols):
        return None
    if not (0 <= goal[0] < rows and 0 <= goal[1] < cols):
        return None
    if grid[start[0]][start[1]] != 0 or grid[goal[0]][goal[1]] != 0:
        return None

    open_set = []
    heapq.heappush(
        open_set, (0 + heuristic(start, goal), 0, start)
    )
    came_from: Dict[Point, Point] = {}
    g_score = {start: 0}
    closed_set = set()

    while open_set:
        _, current_cost, current = heapq.heappop(open_set)

        if current in closed_set:
            continue

        if current == goal:
            return reconstruct_path(came_from, current)

        closed_set.add(current)

        for neighbor in get_neighbors(current, grid):
            if neighbor in closed_set:
                continue

            tentative_g_score = current_cost + 1

            if tentative_g_score < g_score.get(neighbor, float("inf")):
                came_from[neighbor] = current
                g_score[neighbor] = tentative_g_score
                f_score = tentative_g_score + heuristic(neighbor, goal)
                heapq.heappush(open_set, (f_score, tentative_g_score, neighbor))

    return None


def find_paths_for_robots(
    grid: List[List[int]], robots: List[Dict]
) -> List[Dict]:
    """
    为多个机器人规划路径

    Args:
        grid: 二维网格
        robots: 机器人列表，每个机器人包含 id, start, goal

    Returns:
        包含 id, path, distance 的列表
    """
    results = []
    for robot in robots:
        path = astar(grid, tuple(robot["start"]), tuple(robot["goal"]))
        results.append(
            {
                "id": robot["id"],
                "path": path if path else [],
                "distance": len(path) - 1 if path else -1,
                "found": path is not None,
            }
        )
    return results
