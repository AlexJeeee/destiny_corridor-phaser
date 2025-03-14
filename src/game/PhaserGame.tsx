import React, { useEffect, useRef } from 'react';
import Phaser from 'phaser';
import { gameConfig } from './config';
import { scenes } from './scenes';

interface PhaserGameProps {
  onGameReady?: () => void;
}

const PhaserGame: React.FC<PhaserGameProps> = ({ onGameReady }) => {
  const gameRef = useRef<Phaser.Game | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current && !gameRef.current) {
      // 创建配置
      const config: Phaser.Types.Core.GameConfig = {
        ...gameConfig,
        parent: containerRef.current,
        scene: scenes
      };

      // 创建游戏实例
      gameRef.current = new Phaser.Game(config);

      // 通知游戏已准备好
      if (onGameReady) {
        onGameReady();
      }

      // 清理函数
      return () => {
        if (gameRef.current) {
          gameRef.current.destroy(true);
          gameRef.current = null;
        }
      };
    }
  }, [onGameReady]);

  return <div ref={containerRef} id="game-container" className="w-full h-full" />;
};

export default PhaserGame;
