import { 
  Battlefield, 
  GridCoord, 
  GridTile, 
  TerrainType,
  Character,
  Enemy
} from '../types'

// 创建网格坐标
export const createGridCoord = (x: number, y: number): GridCoord => {
  return { x, y }
}

// 检查两个坐标是否相等
export const gridCoordsEqual = (a: GridCoord, b: GridCoord): boolean => {
  return a.x === b.x && a.y === b.y
}

// 计算两个网格之间的距离（曼哈顿距离）
export const gridDistance = (a: GridCoord, b: GridCoord): number => {
  return Math.abs(a.x - b.x) + Math.abs(a.y - b.y)
}

// 获取网格的邻居坐标（上下左右四个方向）
export const getGridNeighbors = (coord: GridCoord): GridCoord[] => {
  const directions = [
    { x: 0, y: -1 },  // 上
    { x: 1, y: 0 },   // 右
    { x: 0, y: 1 },   // 下
    { x: -1, y: 0 }   // 左
  ]
  
  return directions.map(dir => ({
    x: coord.x + dir.x,
    y: coord.y + dir.y
  }))
}

// 为了兼容性，提供 getNeighbors 函数别名
export const getNeighbors = getGridNeighbors;

// 生成初始战场
export const generateInitialBattlefield = (width: number, height: number): Battlefield => {
  const tiles: GridTile[][] = []
  
  // 创建基本的正方形网格
  for (let y = 0; y < height; y++) {
    const row: GridTile[] = []
    for (let x = 0; x < width; x++) {
      const coord = createGridCoord(x, y)
      
      // 随机生成地形（简单示例）
      let terrain = TerrainType.NORMAL
      const rand = Math.random()
      
      if (rand < 0.05) {
        terrain = TerrainType.FIRE
      } else if (rand < 0.1) {
        terrain = TerrainType.ICE
      } else if (rand < 0.15) {
        terrain = TerrainType.POISON
      } else if (rand < 0.2) {
        terrain = TerrainType.ENERGY
      } else if (rand < 0.25) {
        terrain = TerrainType.VOID
      }
      
      row.push({
        coord,
        terrain,
        entity: null,
        effects: []
      })
    }
    tiles.push(row)
  }
  
  return {
    tiles,
    width,
    height
  }
}

// 为了兼容性，提供 generateBattlefield 函数别名
export const generateBattlefield = generateInitialBattlefield;

// 在战场上放置实体（角色或敌人）
export const placeEntityOnBattlefield = (
  battlefield: Battlefield,
  entity: Character | Enemy,
  position: GridCoord
): Battlefield => {
  // 深拷贝战场数据
  const newBattlefield = JSON.parse(JSON.stringify(battlefield))
  
  // 如果实体已经在战场上，先移除
  for (let y = 0; y < battlefield.height; y++) {
    for (let x = 0; x < battlefield.width; x++) {
      const tile = newBattlefield.tiles[y][x]
      if (tile.entity && 
          ((tile.entity as Character).id === (entity as Character).id || 
           (tile.entity as Enemy).id === (entity as Enemy).id)) {
        tile.entity = null
      }
    }
  }
  
  // 放置实体到新位置
  const { x, y } = position
  if (x >= 0 && x < battlefield.width && y >= 0 && y < battlefield.height) {
    newBattlefield.tiles[y][x].entity = entity
    
    // 更新实体位置
    entity.position = { ...position }
  }
  
  return newBattlefield
}

// 寻找从起点到终点的路径（使用A*算法）
export const findPath = (
  battlefield: Battlefield,
  start: GridCoord,
  end: GridCoord
): GridCoord[] => {
  // 检查起点和终点是否有效
  if (start.x < 0 || start.x >= battlefield.width || 
      start.y < 0 || start.y >= battlefield.height ||
      end.x < 0 || end.x >= battlefield.width || 
      end.y < 0 || end.y >= battlefield.height) {
    return []
  }
  
  // 检查终点是否可通行
  if (battlefield.tiles[end.y][end.x].terrain === TerrainType.OBSTACLE ||
      battlefield.tiles[end.y][end.x].entity !== null) {
    return []
  }
  
  // A*算法实现
  const openSet: GridCoord[] = [start]
  const closedSet: GridCoord[] = []
  
  // 记录从起点到每个节点的最短路径
  const cameFrom: Record<string, GridCoord> = {}
  
  // 从起点到每个节点的成本
  const gScore: Record<string, number> = {}
  gScore[`${start.x},${start.y}`] = 0
  
  // 从每个节点到终点的估计成本
  const fScore: Record<string, number> = {}
  fScore[`${start.x},${start.y}`] = gridDistance(start, end)
  
  while (openSet.length > 0) {
    // 找到openSet中fScore最小的节点
    let current = openSet[0]
    let currentIndex = 0
    
    for (let i = 1; i < openSet.length; i++) {
      const node = openSet[i]
      const nodeKey = `${node.x},${node.y}`
      const currentKey = `${current.x},${current.y}`
      
      if (fScore[nodeKey] < fScore[currentKey]) {
        current = node
        currentIndex = i
      }
    }
    
    // 如果到达终点，重建路径并返回
    if (current.x === end.x && current.y === end.y) {
      const path: GridCoord[] = [current]
      let temp = current
      
      while (`${temp.x},${temp.y}` in cameFrom) {
        temp = cameFrom[`${temp.x},${temp.y}`]
        path.unshift(temp)
      }
      
      return path
    }
    
    // 从openSet中移除当前节点，加入closedSet
    openSet.splice(currentIndex, 1)
    closedSet.push(current)
    
    // 检查所有邻居
    const neighbors = getGridNeighbors(current)
    
    for (const neighbor of neighbors) {
      // 检查邻居是否有效
      if (neighbor.x < 0 || neighbor.x >= battlefield.width || 
          neighbor.y < 0 || neighbor.y >= battlefield.height) {
        continue
      }
      
      // 检查邻居是否可通行
      const neighborTile = battlefield.tiles[neighbor.y][neighbor.x]
      if (neighborTile.terrain === TerrainType.OBSTACLE || 
          (neighborTile.entity !== null && !(neighbor.x === end.x && neighbor.y === end.y))) {
        continue
      }
      
      // 检查邻居是否已在closedSet中
      if (closedSet.some(node => node.x === neighbor.x && node.y === neighbor.y)) {
        continue
      }
      
      const neighborKey = `${neighbor.x},${neighbor.y}`
      const currentKey = `${current.x},${current.y}`
      
      // 计算从起点经过当前节点到邻居的成本
      const tentativeGScore = gScore[currentKey] + 1
      
      // 检查邻居是否已在openSet中
      const isInOpenSet = openSet.some(node => node.x === neighbor.x && node.y === neighbor.y)
      
      if (!isInOpenSet || tentativeGScore < (gScore[neighborKey] || Infinity)) {
        // 更新路径和分数
        cameFrom[neighborKey] = current
        gScore[neighborKey] = tentativeGScore
        fScore[neighborKey] = tentativeGScore + gridDistance(neighbor, end)
        
        if (!isInOpenSet) {
          openSet.push(neighbor)
        }
      }
    }
  }
  
  // 没有找到路径
  return []
}

// 检测移动轨迹的模式
export const detectMovementPattern = (path: GridCoord[]): string => {
  if (path.length < 2) return '无模式'
  
  // 计算每一步的方向
  const directions: string[] = []
  
  for (let i = 1; i < path.length; i++) {
    const prev = path[i-1]
    const curr = path[i]
    
    if (curr.x > prev.x) {
      directions.push('右')
    } else if (curr.x < prev.x) {
      directions.push('左')
    } else if (curr.y > prev.y) {
      directions.push('下')
    } else if (curr.y < prev.y) {
      directions.push('上')
    }
  }
  
  // 检测直线模式
  if (directions.every(dir => dir === directions[0])) {
    return `直线-${directions[0]}`
  }
  
  // 检测之字形模式
  let isZigzag = true
  for (let i = 2; i < directions.length; i++) {
    if (directions[i] !== directions[i-2]) {
      isZigzag = false
      break
    }
  }
  
  if (isZigzag && directions.length >= 3) {
    return `之字形-${directions[0]}-${directions[1]}`
  }
  
  // 检测环形模式
  if (
    path.length >= 5 && 
    Math.abs(path[0].x - path[path.length-1].x) <= 1 && 
    Math.abs(path[0].y - path[path.length-1].y) <= 1
  ) {
    return '环形'
  }
  
  return '复杂模式'
}
