import Phaser from 'phaser';
import { GridCoord } from '@/types';
import { generateBattlefield } from '@/utils/battlefieldUtils';

export class BattlefieldManager {
  private scene: Phaser.Scene;
  private gridTiles: Phaser.GameObjects.Container[] = [];
  private tileSize: number = 60;
  private grid: any[][] = [];
  private validMoves: GridCoord[] = [];

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  createBattlefield(): void {
    // 生成战场数据
    const battlefield = generateBattlefield(5, 5);
    
    // 计算正方形网格的起始位置
    const startX = this.scene.cameras.main.width / 2 - (5 * this.tileSize) / 2;
    const startY = this.scene.cameras.main.height / 2 - (5 * this.tileSize) / 2;
    
    // 创建正方形网格
    for (let row = 0; row < battlefield.tiles.length; row++) {
      this.grid[row] = [];
      for (let col = 0; col < battlefield.tiles[row].length; col++) {
        const tile = battlefield.tiles[row][col];
        const pixelX = startX + col * this.tileSize;
        const pixelY = startY + row * this.tileSize;
        
        // 创建正方形容器
        const gridContainer = this.scene.add.container(pixelX, pixelY);
        
        // 创建正方形图像或形状
        let gridTile;
        if (this.scene.textures.exists('grid-tile')) {
          gridTile = this.scene.add.image(0, 0, 'grid-tile');
        } else {
          // 如果没有加载到网格图像，则使用矩形替代
          gridTile = this.scene.add.rectangle(0, 0, this.tileSize, this.tileSize, 0x0f3460) as Phaser.GameObjects.Rectangle & {
            setTint: (tint: number) => Phaser.GameObjects.Rectangle;
            clearTint: () => Phaser.GameObjects.Rectangle;
          };
          
          // 为矩形添加自定义的setTint和clearTint方法
          gridTile.setTint = function(tint) {
            this.setFillStyle(tint);
            return this;
          };
          
          gridTile.clearTint = function() {
            this.setFillStyle(0x0f3460); // 恢复默认颜色
            return this;
          };
        }
        
        // 添加交互
        gridTile.setInteractive(new Phaser.Geom.Rectangle(0, 0, this.tileSize, this.tileSize), Phaser.Geom.Rectangle.Contains)
          .on('pointerover', () => {
            if (gridTile instanceof Phaser.GameObjects.Rectangle) {
              ((gridTile as any) as { setTint: (tint: number) => void }).setTint(0x5a4ba6);
            } else if (gridTile instanceof Phaser.GameObjects.Image) {
              gridTile.setTint(0x5a4ba6);
            }
          })
          .on('pointerout', () => {
            if (gridTile instanceof Phaser.GameObjects.Rectangle) {
              ((gridTile as any) as { clearTint: () => void }).clearTint();
            } else if (gridTile instanceof Phaser.GameObjects.Image) {
              gridTile.clearTint();
            }
          });
        
        // 添加坐标文本（调试用）
        const coordText = this.scene.add.text(0, 0, `${tile.coord.x},${tile.coord.y}`, {
          fontFamily: 'Arial',
          fontSize: '10px',
          color: '#ffffff',
        }).setOrigin(0.5);
        
        // 将元素添加到容器
        gridContainer.add([gridTile, coordText]);
        
        // 保存引用
        this.gridTiles.push(gridContainer);
        this.grid[row][col] = {
          container: gridContainer,
          tile: tile,
          pixelX: pixelX,
          pixelY: pixelY
        };
      }
    }
  }

  findGridCellByCoord(coord: GridCoord): any {
    // 遍历正方形网格查找对应坐标的格子
    for (let row = 0; row < this.grid.length; row++) {
      for (let col = 0; col < this.grid[row].length; col++) {
        const cell = this.grid[row][col];
        if (
          cell.tile.coord.x === coord.x &&
          cell.tile.coord.y === coord.y
        ) {
          return cell;
        }
      }
    }
    return null;
  }

  showValidMoves(validMoves: GridCoord[]): void {
    this.validMoves = validMoves;
    
    // 高亮显示有效移动位置
    this.validMoves.forEach(move => {
      const gridCell = this.findGridCellByCoord(move);
      if (gridCell) {
        const gridTile = gridCell.container.getAt(0);
        // 检查是否为多边形对象
        if (gridTile instanceof Phaser.GameObjects.Rectangle) {
          ((gridTile as any) as { setTint: (tint: number) => void }).setTint(0x00ff00);
        } else if (gridTile instanceof Phaser.GameObjects.Image) {
          gridTile.setTint(0x00ff00);
        }
      }
    });
  }

  showAttackableEnemies(enemyPositions: GridCoord[]): void {
    // 显示可攻击的敌人位置
    enemyPositions.forEach(pos => {
      const gridCell = this.findGridCellByCoord(pos);
      if (gridCell) {
        const gridTile = gridCell.container.getAt(0);
        // 检查是否为多边形对象
        if (gridTile instanceof Phaser.GameObjects.Rectangle) {
          ((gridTile as any) as { setTint: (tint: number) => void }).setTint(0xff0000);
        } else if (gridTile instanceof Phaser.GameObjects.Image) {
          gridTile.setTint(0xff0000);
        }
      }
    });
  }

  showSelfTargetable(positions: GridCoord[]): void {
    // 显示可以被自身卡牌效果（如防御、治疗）影响的位置
    positions.forEach(pos => {
      const gridCell = this.findGridCellByCoord(pos);
      if (gridCell) {
        const gridTile = gridCell.container.getAt(0);
        // 检查是否为多边形对象
        if (gridTile instanceof Phaser.GameObjects.Rectangle) {
          ((gridTile as any) as { setTint: (tint: number) => void }).setTint(0x00ffff); // 使用青色表示自身可选择
        } else if (gridTile instanceof Phaser.GameObjects.Image) {
          gridTile.setTint(0x00ffff); // 使用青色表示自身可选择
        }
      }
    });
  }

  clearValidMoves(): void {
    // 清除所有高亮显示
    this.validMoves.forEach(pos => {
      const gridCell = this.findGridCellByCoord(pos);
      if (gridCell) {
        const gridTile = gridCell.container.getAt(0);
        // 检查是否为多边形对象
        if (gridTile instanceof Phaser.GameObjects.Rectangle) {
          ((gridTile as any) as { clearTint: () => void }).clearTint();
        } else if (gridTile instanceof Phaser.GameObjects.Image) {
          gridTile.clearTint();
        }
      }
    });
    this.validMoves = [];
  }

  getValidMoves(startPos: GridCoord, range: number, occupiedPositions: GridCoord[]): GridCoord[] {
    // 实现获取有效移动位置的逻辑
    const result: GridCoord[] = [];
    
    // 对于正方形网格，只允许上下左右移动，不允许对角线移动
    const directions = [
      { x: 0, y: -1 }, // 上
      { x: 1, y: 0 },  // 右
      { x: 0, y: 1 },  // 下
      { x: -1, y: 0 }  // 左
    ];
    
    // 使用广度优先搜索(BFS)找出所有可到达的格子
    const queue: { pos: GridCoord, steps: number }[] = [{ pos: startPos, steps: 0 }];
    const visited: Set<string> = new Set([`${startPos.x},${startPos.y}`]);
    
    while (queue.length > 0) {
      const current = queue.shift()!;
      
      // 如果不是起始位置且步数在范围内，添加到结果中
      if (current.steps > 0 && current.steps <= range) {
        result.push(current.pos);
      }
      
      // 如果已经达到最大步数，不再继续搜索
      if (current.steps >= range) continue;
      
      // 检查四个方向
      for (const dir of directions) {
        const nextPos = { x: current.pos.x + dir.x, y: current.pos.y + dir.y };
        const key = `${nextPos.x},${nextPos.y}`;
        
        // 如果该位置有效、未被访问过且未被占用
        if (
          this.isValidGrid(nextPos) && 
          !visited.has(key) && 
          !this.isGridOccupied(nextPos, occupiedPositions)
        ) {
          visited.add(key);
          queue.push({ pos: nextPos, steps: current.steps + 1 });
        }
      }
    }
    
    return result;
  }

  isValidGrid(coord: GridCoord): boolean {
    // 检查坐标是否在战场内
    return this.findGridCellByCoord(coord) !== null;
  }

  isGridOccupied(coord: GridCoord, occupiedPositions: GridCoord[]): boolean {
    // 检查是否有单位在此格子
    return occupiedPositions.some(pos => 
      pos.x === coord.x && pos.y === coord.y
    );
  }

  getGridDistance(a: GridCoord, b: GridCoord): number {
    // 计算两个正方形坐标之间的曼哈顿距离（上下左右移动的最短距离）
    return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
  }

  clearBattlefield(): void {
    // 清除正方形网格
    this.gridTiles.forEach(tile => tile.destroy());
    this.gridTiles = [];
    this.grid = [];
  }

  getGrid(): any[][] {
    return this.grid;
  }

  getGridTiles(): Phaser.GameObjects.Container[] {
    return this.gridTiles;
  }

  getTileSize(): number {
    return this.tileSize;
  }
}
