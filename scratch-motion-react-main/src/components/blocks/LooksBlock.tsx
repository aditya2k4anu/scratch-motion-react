
import React from "react";
import { useScratch, SayBlock, ThinkBlock } from "@/context/ScratchContext";

interface LooksBlockProps {
  block: SayBlock | ThinkBlock;
  spriteId: string;
}

const LooksBlock: React.FC<LooksBlockProps> = ({ block, spriteId }) => {
  const { dispatch, state } = useScratch();
  
  const handleTextChange = (value: string) => {
    dispatch({
      type: "UPDATE_BLOCK",
      id: block.id,
      params: { text: value },
      spriteId
    });
  };
  
  const handleTimeChange = (value: string) => {
    const numValue = Number(value);
    if (!isNaN(numValue) && numValue >= 0) {
      dispatch({
        type: "UPDATE_BLOCK",
        id: block.id,
        params: { seconds: numValue },
        spriteId
      });
    }
  };
  
  const handleRemoveBlock = () => {
    dispatch({ type: "REMOVE_BLOCK", id: block.id, spriteId });
  };

  const handleDragStart = (e: React.DragEvent) => {
    // Add block data to drag event
    e.dataTransfer.setData("blockId", block.id);
    e.dataTransfer.setData("spriteId", spriteId);
    e.dataTransfer.effectAllowed = "move";
  };
  
  return (
    <div 
      className="bg-purple-500 text-white p-2 rounded-lg flex items-center shadow-md"
      draggable={!state.isRunning}
      onDragStart={handleDragStart}
    >
      <div className="bg-black bg-opacity-10 p-1 rounded mr-2">
        <div className="w-3 h-3 rounded-full bg-white"></div>
      </div>
      
      <div className="flex-grow">
        {block.type === "say" ? "say" : "think"}
        <input
          type="text"
          value={block.params.text as string}
          onChange={(e) => handleTextChange(e.target.value)}
          className="mx-1 w-24 px-1 text-black rounded"
          placeholder="Hello!"
        />
        for
        <input
          type="number"
          min="0"
          step="0.1"
          value={block.params.seconds as number}
          onChange={(e) => handleTimeChange(e.target.value)}
          className="mx-1 w-14 px-1 text-black rounded"
        />
        seconds
      </div>
      
      <button
        onClick={handleRemoveBlock}
        className="ml-2 text-white hover:text-red-300 focus:outline-none"
        disabled={state.isRunning}
      >
        
      </button>
    </div>
  );
};

export default LooksBlock;
