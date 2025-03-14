import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PhaserGame from '../game/PhaserGame';

const PhaserGamePage: React.FC = () => {
  const navigate = useNavigate();
  const [gameReady, setGameReady] = useState(false);

  const handleGameReady = () => {
    setGameReady(true);
    console.log('Phaser游戏已准备就绪');
  };

  return (
    <div className="w-full h-screen flex flex-col">
      <div className="flex-1 relative">
        <div className="absolute inset-0">
          <PhaserGame onGameReady={handleGameReady} />
        </div>
      </div>
      
      {!gameReady && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-70">
          <div className="text-white text-2xl">加载中...</div>
        </div>
      )}
    </div>
  );
};

export default PhaserGamePage;
