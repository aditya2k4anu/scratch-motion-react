
import React from "react";
import { useScratch, Block } from "@/context/ScratchContext";

interface MotionBlockProps {
  block: Block;
  spriteId: string;
}

const MotionBlock: React.FC<MotionBlockProps> = ({ block, spriteId }) => {
  const { dispatch, state } = useScratch();
  
  const handleParamChange = (paramName: string, value: string) => {
    const numValue = Number(value);
    if (!isNaN(numValue)) {
      dispatch({
        type: "UPDATE_BLOCK",
        id: block.id,
        params: { [paramName]: numValue },
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
  
  let blockContent;
  let blockColor;
  
  switch (block.type) {
    case "move":
      blockColor = "bg-blue-500";
      blockContent = (
        <>
          move
          <input
            type="number"
            value={block.params.steps}
            onChange={(e) => handleParamChange("steps", e.target.value)}
            className="mx-1 w-14 px-1 text-black rounded"
          />
          steps
        </>
      );
      break;
    
    case "turn":
      blockColor = "bg-blue-500";
      blockContent = (
        <>
          turn
          <input
            type="number"
            value={block.params.degrees}
            onChange={(e) => handleParamChange("degrees", e.target.value)}
            className="mx-1 w-14 px-1 text-black rounded"
          />
          degrees
        </>
      );
      break;
    
    case "goto":
      blockColor = "bg-blue-500";
      blockContent = (
        <>
          go to x:
          <input
            type="number"
            value={block.params.x}
            onChange={(e) => handleParamChange("x", e.target.value)}
            className="mx-1 w-14 px-1 text-black rounded"
          />
          y:
          <input
            type="number"
            value={block.params.y}
            onChange={(e) => handleParamChange("y", e.target.value)}
            className="mx-1 w-14 px-1 text-black rounded"
          />
        </>
      );
      break;
    
    default:
      blockColor = "bg-gray-500";
      blockContent = "Unknown block";
  }
  
  return (
    <div 
      className={`${blockColor} text-white p-2 rounded-lg flex items-center shadow-md ${!state.isRunning ? "cursor-grab" : ""}`}
      draggable={!state.isRunning}
      onDragStart={handleDragStart}
    >
      <div className="bg-black bg-opacity-10 p-1 rounded mr-2">
        <div className="w-3 h-3 rounded-full bg-white"></div>
      </div>
      
      <div className="flex-grow">{blockContent}</div>
      
      <button
        onClick={handleRemoveBlock}
        className="ml-2 text-white hover:text-red-300 focus:outline-none"
        disabled={state.isRunning}
      >
        ✕
      </button>
    </div>
  );
};

export default MotionBlock;
