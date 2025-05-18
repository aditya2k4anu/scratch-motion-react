
import React from "react";
import BlocksEditor from "@/components/BlocksEditor";
import StageArea from "@/components/StageArea";
import SpriteManager from "@/components/SpriteManager";
import { ScratchProvider } from "@/context/ScratchContext";

const Index = () => {
  return (
    <div className="flex flex-col h-screen bg-gray-100">
      <header className="bg-blue-600 text-white p-3 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="bg-blue-500 p-1 rounded-full">
            <svg 
              viewBox="0 0 100 100" 
              className="w-8 h-8"
              style={{ fill: "#FF9500" }}
            >
              <circle cx="50" cy="50" r="45" fill="#FF9500" stroke="#E67E00" strokeWidth="2" />
              <circle cx="30" cy="40" r="8" fill="white" />
              <circle cx="70" cy="40" r="8" fill="white" />
              <path d="M30,65 Q50,80 70,65" fill="none" stroke="white" strokeWidth="4" strokeLinecap="round" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold">Scratch Clone</h1>
        </div>
        <div className="text-sm">
          <span className="bg-green-500 px-2 py-1 rounded">Scratch App</span>
        </div>
      </header>
      
      <ScratchProvider>
        <div className="flex flex-col flex-1 overflow-hidden">
          <div className="bg-purple-800 text-white p-2 text-center text-sm font-medium">
          </div>
          <SpriteManager />
          <div className="flex flex-1 gap-4 p-4 overflow-hidden">
            <StageArea />
            <BlocksEditor />
          </div>
        </div>
      </ScratchProvider>
      
      <footer className="bg-gray-800 text-white text-center text-xs p-2">
      </footer>
    </div>
  );
};

export default Index;
