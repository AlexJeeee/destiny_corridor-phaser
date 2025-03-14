import React from 'react'
import { useNavigate } from 'react-router-dom'

const NotFound: React.FC = () => {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-4">
      <h1 className="text-4xl font-bold mb-4">404</h1>
      <p className="text-xl mb-8">页面未找到</p>
      <p className="text-gray-400 mb-8">你正在寻找的页面不存在或已被移动</p>
      
      <button 
        className="bg-blue-700 hover:bg-blue-600 px-6 py-3 rounded-lg text-lg"
        onClick={() => navigate('/')}
      >
        返回主菜单
      </button>
    </div>
  )
}

export default NotFound
