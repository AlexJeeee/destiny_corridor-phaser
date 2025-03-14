import { 
  Battlefield, 
  HexCoord, 
  HexTile, 
  TerrainType,
  Character,
  Enemy
} from '../types'

// 创建六边形坐标
export const createHexCoord = (q: number, r: number): HexCoord => {
  const s = -q - r
  return { q, r, s }
}

// 检查两个坐标是否相等
export const hexCoordsEqual = (a: HexCoord, b: HexCoord): boolean => {
  return a.q === b.q && a.r === b.r && a.s === b.s
}

// 计算两个六边形之间的距离
export const hexDistance = (a: HexCoord, b: HexCoord): number => {
  return Math.max(
    Math.abs(a.q - b.q),
    Math.abs(a.r - b.r),
    Math.abs(a.s - b.s)
  )
}

// 获取六边形的邻居坐标
export const getHexNeighbors = (coord: HexCoord): HexCoord[] => {
  const directions = [
    { q: 1, r: 0, s: -1 },  // 右
    { q: 1, r: -1, s: 0 },  // 右上
    { q: 0, r: -1, s: 1 },  // 左上
    { q: -1, r: 0, s: 1 },  // 左
    { q: -1, r: 1, s: 0 },  // 左下
    { q: 0, r: 1, s: -1 }   // 右下
  ]
  
  return directions.map(dir => ({
    q: coord.q + dir.q,
    r: coord.r + dir.r,
    s: coord.s + dir.s
  }))
}

// 为了兼容性，提供 getNeighbors 函数别名
export const getNeighbors = getHexNeighbors;

// 生成初始战场
export const generateInitialBattlefield = (width: number, height: number): Battlefield => {
  const tiles: HexTile[][] = []
  
  // 创建基本的六边形网格
  for (let r = 0; r < height; r++) {
    const row: HexTile[] = []
    for (let q = 0; q < width; q++) {
      const coord = createHexCoord(q - Math.floor(r/2), r)
      
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
      } else if (rand < 0.22) {
        terrain = TerrainType.OBSTACLE
      }
      
      const tile: HexTile = {
        coord,
        terrain,
        effects: []
      }
      
      row.push(tile)
    }
    tiles.push(row)
  }
  
  return {
    tiles,
    entities: [],
    currentTurn: 1
  }
}

// 为了兼容性，提供 generateBattlefield 函数别名
export const generateBattlefield = generateInitialBattlefield;

// 在战场上放置实体（角色或敌人）
export const placeEntityOnBattlefield = (
  battlefield: Battlefield,
  entity: Character | Enemy,
  position: HexCoord
): Battlefield => {
  // 深拷贝战场
  const newBattlefield = JSON.parse(JSON.stringify(battlefield))
  
  // 查找对应的格子
  for (let r = 0; r < newBattlefield.tiles.length; r++) {
    for (let q = 0; q < newBattlefield.tiles[r].length; q++) {
      const tile = newBattlefield.tiles[r][q]
      
      if (hexCoordsEqual(tile.coord, position)) {
        // 确保该位置没有其他实体
        if (tile.entity) {
          console.warn('位置已被占用，无法放置实体')
          return battlefield
        }
        
        // 放置实体
        newBattlefield.tiles[r][q].entity = entity
        
        // 更新实体列表
        const entityIndex = newBattlefield.entities.findIndex(e => e.id === entity.id)
        if (entityIndex >= 0) {
          // 更新现有实体
          newBattlefield.entities[entityIndex] = {
            ...entity,
            position
          }
        } else {
          // 添加新实体
          newBattlefield.entities.push({
            ...entity,
            position
          })
        }
        
        return newBattlefield
      }
    }
  }
  
  console.warn('找不到指定位置，无法放置实体')
  return battlefield
}

// 寻找从起点到终点的路径（使用A*算法）
export const findPath = (
  battlefield: Battlefield,
  start: HexCoord,
  end: HexCoord
): HexCoord[] => {
  // A*算法实现
  // 这里是简化版，实际游戏中需要考虑障碍物和地形成本
  
  // 如果起点和终点相同，返回空路径
  if (hexCoordsEqual(start, end)) {
    return []
  }
  
  const openSet: HexCoord[] = [start]
  const closedSet: HexCoord[] = []
  
  // 记录从起点到每个节点的成本
  const gScore: Record<string, number> = {}
  gScore[`${start.q},${start.r},${start.s}`] = 0
  
  // 记录从起点经过每个节点到终点的估计总成本
  const fScore: Record<string, number> = {}
  fScore[`${start.q},${start.r},${start.s}`] = hexDistance(start, end)
  
  // 记录每个节点的前一个节点
  const cameFrom: Record<string, HexCoord> = {}
  
  while (openSet.length > 0) {
    // 找到openSet中fScore最小的节点
    let current: HexCoord | null = null
    let lowestFScore = Infinity
    
    for (const node of openSet) {
      const key = `${node.q},${node.r},${node.s}`
      if (fScore[key] < lowestFScore) {
        lowestFScore = fScore[key]
        current = node
      }
    }
    
    if (!current) break
    
    // 如果当前节点是终点，重建路径并返回
    if (hexCoordsEqual(current, end)) {
      const path: HexCoord[] = [current]
      let key = `${current.q},${current.r},${current.s}`
      
      while (cameFrom[key]) {
        current = cameFrom[key]
        path.unshift(current)
        key = `${current.q},${current.r},${current.s}`
      }
      
      return path
    }
    
    // 从openSet中移除当前节点，并添加到closedSet
    openSet.splice(openSet.findIndex(node => 
      node.q === current.q && node.r === current.r && node.s === current.s
    ), 1)
    closedSet.push(current)
    
    // 检查所有邻居
    const neighbors = getHexNeighbors(current)
    
    for (const neighbor of neighbors) {
      // 检查邻居是否在closedSet中
      if (closedSet.some(node => 
        node.q === neighbor.q && node.r === neighbor.r && node.s === neighbor.s
      )) {
        continue
      }
      
      // 检查邻居是否是有效的格子（在战场范围内且不是障碍物）
      let isValid = false
      let isTileObstacle = false
      
      for (const row of battlefield.tiles) {
        for (const tile of row) {
          if (hexCoordsEqual(tile.coord, neighbor)) {
            isValid = true
            isTileObstacle = tile.terrain === TerrainType.OBSTACLE
            break
          }
        }
        if (isValid) break
      }
      
      if (!isValid || isTileObstacle) {
        continue
      }
      
      // 计算从起点经过当前节点到邻居的成本
      const tentativeGScore = gScore[`${current.q},${current.r},${current.s}`] + 1
      
      // 检查邻居是否在openSet中
      const isInOpenSet = openSet.some(node => 
        node.q === neighbor.q && node.r === neighbor.r && node.s === neighbor.s
      )
      
      if (!isInOpenSet) {
        openSet.push(neighbor)
      } else if (tentativeGScore >= (gScore[`${neighbor.q},${neighbor.r},${neighbor.s}`] || Infinity)) {
        continue
      }
      
      // 这是目前找到的最佳路径，记录它
      cameFrom[`${neighbor.q},${neighbor.r},${neighbor.s}`] = current
      gScore[`${neighbor.q},${neighbor.r},${neighbor.s}`] = tentativeGScore
      fScore[`${neighbor.q},${neighbor.r},${neighbor.s}`] = tentativeGScore + hexDistance(neighbor, end)
    }
  }
  
  // 如果没有找到路径，返回空数组
  return []
}

// 检测移动轨迹的模式
export const detectMovementPattern = (path: HexCoord[]): string => {
  if (path.length <= 1) {
    return 'static'
  }
  
  if (path.length === 2) {
    return 'linear'
  }
  
  // 检测是否是直线
  let isLinear = true
  for (let i = 2; i < path.length; i++) {
    const vector1 = {
      q: path[1].q - path[0].q,
      r: path[1].r - path[0].r,
      s: path[1].s - path[0].s
    }
    
    const vector2 = {
      q: path[i].q - path[i-1].q,
      r: path[i].r - path[i-1].r,
      s: path[i].s - path[i-1].s
    }
    
    // 检查两个向量是否平行
    if (vector1.q * vector2.r !== vector1.r * vector2.q ||
        vector1.r * vector2.s !== vector1.s * vector2.r ||
        vector1.s * vector2.q !== vector1.q * vector2.s) {
      isLinear = false
      break
    }
  }
  
  if (isLinear) {
    return 'linear'
  }
  
  // 检测是否是环形
  // 简化版：如果起点和终点相同，且路径长度大于2，认为是环形
  if (hexCoordsEqual(path[0], path[path.length - 1]) && path.length > 2) {
    return 'circular'
  }
  
  // 默认为锯齿形
  return 'zigzag'
}
