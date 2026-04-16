// 全局变量
let grid = [];
let rows = 50;
let cols = 50;
let startPoint = null;
let goalPoint = null;
let currentPath = [];
let currentMode = "single";
let robots = [];
let allRobotPaths = {};

// DOM 元素
const mapCanvas = document.getElementById("mapCanvas");
const startPointEl = document.getElementById("startPoint");
const goalPointEl = document.getElementById("goalPoint");
const planBtn = document.getElementById("planBtn");
const resetBtn = document.getElementById("resetBtn");
const statsEl = document.getElementById("stats");
const modeBtns = document.querySelectorAll(".mode-btn");
const singleModeDiv = document.getElementById("singleMode");
const multipleModeDiv = document.getElementById("multipleMode");
const generateRobotsBtn = document.getElementById("generateRobotsBtn");
const planMultipleBtn = document.getElementById("planMultipleBtn");
const resetMultipleBtn = document.getElementById("resetMultipleBtn");
const robotCountInput = document.getElementById("robotCount");
const robotsListDiv = document.getElementById("robotsList");

// 初始化
document.addEventListener("DOMContentLoaded", () => {
    loadGrid();
    setupEventListeners();
});

// 加载地图
async function loadGrid() {
    try {
        const response = await fetch("/api/grid");
        const data = await response.json();
        grid = data.grid;
        rows = data.rows;
        cols = data.cols;
        renderGrid();
    } catch (error) {
        console.error("加载地图失败:", error);
        statsEl.innerHTML = "<p style='color: red;'>加载地图失败，请刷新页面</p>";
    }
}

// 渲染地图网格
function renderGrid() {
    mapCanvas.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
    mapCanvas.innerHTML = "";

    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            const cell = document.createElement("div");
            cell.className = "cell";
            cell.dataset.r = r;
            cell.dataset.c = c;

            const isObstacle = grid[r][c] === 1;
            const isStart = startPoint && startPoint[0] === r && startPoint[1] === c;
            const isGoal = goalPoint && goalPoint[0] === r && goalPoint[1] === c;
            const isPath = currentPath.some((p) => p[0] === r && p[1] === c);

            if (isObstacle) {
                cell.classList.add("obstacle");
            } else if (isStart) {
                cell.classList.add("start");
                cell.textContent = "S";
            } else if (isGoal) {
                cell.classList.add("goal");
                cell.textContent = "G";
            } else if (isPath) {
                cell.classList.add("path");
            }

            cell.addEventListener("click", () => handleCellClick(r, c));
            mapCanvas.appendChild(cell);
        }
    }

    // 多机器人模式下显示所有路径
    if (currentMode === "multiple") {
        displayAllRobotPaths();
    }
}

// 处理单元格点击
function handleCellClick(r, c) {
    // 不能选择障碍
    if (grid[r][c] === 1) return;

    if (currentMode === "single") {
        // 单机器人模式：点击第一下设置起点，第二下设置终点
        if (!startPoint) {
            startPoint = [r, c];
            startPointEl.textContent = `(${r}, ${c})`;
        } else if (!goalPoint) {
            goalPoint = [r, c];
            goalPointEl.textContent = `(${r}, ${c})`;
        } else {
            // 重置
            startPoint = [r, c];
            goalPoint = null;
            startPointEl.textContent = `(${r}, ${c})`;
            goalPointEl.textContent = "未设置";
            currentPath = [];
        }
        renderGrid();
    }
}

// 规划单个机器人路径
async function planPath() {
    if (!startPoint || !goalPoint) {
        alert("请先选择起点和终点");
        return;
    }

    try {
        planBtn.disabled = true;
        statsEl.innerHTML = "<p>正在规划路径...</p>";

        const response = await fetch("/api/pathfind", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                grid: grid,
                start: startPoint,
                goal: goalPoint,
            }),
        });

        const data = await response.json();

        if (data.found) {
            currentPath = data.path;
            statsEl.innerHTML = `
                <p><strong>✅ 路径已找到</strong></p>
                <p>路径长度: ${data.distance} 步</p>
                <p>起点: (${startPoint[0]}, ${startPoint[1]})</p>
                <p>终点: (${goalPoint[0]}, ${goalPoint[1]})</p>
            `;
        } else {
            currentPath = [];
            statsEl.innerHTML = `
                <p><strong>❌ 无法到达</strong></p>
                <p>起点到终点没有可行路径</p>
            `;
        }

        renderGrid();
    } catch (error) {
        console.error("规划路径失败:", error);
        statsEl.innerHTML = "<p style='color: red;'>规划路径失败</p>";
    } finally {
        planBtn.disabled = false;
    }
}

// 重置单模式
function resetSingleMode() {
    startPoint = null;
    goalPoint = null;
    currentPath = [];
    startPointEl.textContent = "未设置";
    goalPointEl.textContent = "未设置";
    statsEl.innerHTML = "<p>等待规划...</p>";
    renderGrid();
}

// 生成随机机器人任务
function generateRobotTasks() {
    const count = parseInt(robotCountInput.value) || 1;
    robots = [];

    for (let i = 0; i < count; i++) {
        let start, goal;
        do {
            start = [Math.floor(Math.random() * rows), Math.floor(Math.random() * cols)];
        } while (grid[start[0]][start[1]] === 1);

        do {
            goal = [Math.floor(Math.random() * rows), Math.floor(Math.random() * cols)];
        } while (grid[goal[0]][goal[1]] === 1 || (start[0] === goal[0] && start[1] === goal[1]));

        robots.push({
            id: i,
            start: start,
            goal: goal,
        });
    }

    allRobotPaths = {};
    displayRobotsList();
    renderGrid();
}

// 显示机器人列表
function displayRobotsList() {
    robotsListDiv.innerHTML = "";

    robots.forEach((robot) => {
        const item = document.createElement("div");
        item.className = "robot-item";
        item.innerHTML = `
            <strong>🤖 机器人 ${robot.id}</strong><br>
            起: (${robot.start[0]}, ${robot.start[1]})<br>
            终: (${robot.goal[0]}, ${robot.goal[1]})
        `;

        if (allRobotPaths[robot.id]) {
            const pathInfo = allRobotPaths[robot.id];
            if (pathInfo.found) {
                item.classList.add("found");
                item.innerHTML += `<br><span style="color: green;">✅ 距离: ${pathInfo.distance}</span>`;
            } else {
                item.classList.add("error");
                item.innerHTML += `<br><span style="color: red;">❌ 无路径</span>`;
            }
        }

        robotsListDiv.appendChild(item);
    });
}

// 规划多个机器人路径
async function planMultipleRobots() {
    if (robots.length === 0) {
        alert("请先生成机器人任务");
        return;
    }

    try {
        planMultipleBtn.disabled = true;
        statsEl.innerHTML = "<p>正在规划所有机器人的路径...</p>";

        const response = await fetch("/api/pathfind-multiple", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                grid: grid,
                robots: robots,
            }),
        });

        const data = await response.json();

        // 保存结果
        data.results.forEach((result) => {
            allRobotPaths[result.id] = {
                path: result.path,
                distance: result.distance,
                found: result.found,
            };
        });

        // 统计信息
        const found = data.results.filter((r) => r.found).length;
        const totalDistance = data.results
            .filter((r) => r.found)
            .reduce((sum, r) => sum + r.distance, 0);

        statsEl.innerHTML = `
            <p><strong>✅ 规划完成</strong></p>
            <p>成功规划: ${found} / ${robots.length}</p>
            <p>总步数: ${totalDistance}</p>
        `;

        displayRobotsList();
        renderGrid();
    } catch (error) {
        console.error("规划多个机器人失败:", error);
        statsEl.innerHTML = "<p style='color: red;'>规划失败</p>";
    } finally {
        planMultipleBtn.disabled = false;
    }
}

// 显示所有机器人路径
function displayAllRobotPaths() {
    // 清除之前的路径标记
    document.querySelectorAll(".cell.path").forEach(cell => {
        cell.classList.remove("path");
    });

    let robotIndex = 0;
    Object.entries(allRobotPaths).forEach(([id, pathInfo]) => {
        if (pathInfo.found && pathInfo.path) {
            pathInfo.path.forEach((point) => {
                const cells = document.querySelectorAll(
                    `.cell[data-r="${point[0]}"][data-c="${point[1]}"]`
                );
                cells.forEach((cell) => {
                    if (!cell.classList.contains("start") && !cell.classList.contains("goal")) {
                        cell.classList.add("path");
                    }
                });
            });
        }

        // 显示机器人起点样式
        const startCell = document.querySelector(
            `.cell[data-r="${robots[robotIndex].start[0]}"][data-c="${robots[robotIndex].start[1]}"]`
        );
        if (startCell) {
            startCell.classList.add("start");
            startCell.textContent = robotIndex;
        }

        // 显示机器人终点样式
        const goalCell = document.querySelector(
            `.cell[data-r="${robots[robotIndex].goal[0]}"][data-c="${robots[robotIndex].goal[1]}"]`
        );
        if (goalCell) {
            goalCell.classList.add("goal");
            goalCell.textContent = robotIndex;
        }

        robotIndex++;
    });
}

// 重置多模式
function resetMultipleMode() {
    robots = [];
    allRobotPaths = {};
    robotsListDiv.innerHTML = "";
    statsEl.innerHTML = "<p>等待规划...</p>";
    renderGrid();
}

// 切换模式
function switchMode(mode) {
    currentMode = mode;
    if (mode === "single") {
        singleModeDiv.style.display = "block";
        multipleModeDiv.style.display = "none";
        resetSingleMode();
    } else {
        singleModeDiv.style.display = "none";
        multipleModeDiv.style.display = "block";
        robots = [];
        allRobotPaths = {};
        robotsListDiv.innerHTML = "";
        statsEl.innerHTML = "<p>等待规划...</p>";
        renderGrid();
    }
}

// 设置事件监听
function setupEventListeners() {
    planBtn.addEventListener("click", planPath);
    resetBtn.addEventListener("click", resetSingleMode);
    generateRobotsBtn.addEventListener("click", generateRobotTasks);
    planMultipleBtn.addEventListener("click", planMultipleRobots);
    resetMultipleBtn.addEventListener("click", resetMultipleMode);

    modeBtns.forEach((btn) => {
        btn.addEventListener("click", (e) => {
            modeBtns.forEach((b) => b.classList.remove("active"));
            e.target.classList.add("active");
            switchMode(e.target.dataset.mode);
        });
    });
}
