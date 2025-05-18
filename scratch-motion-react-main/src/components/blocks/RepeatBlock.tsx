
import React from "react";
import { useScratch, RepeatBlock as RepeatBlockType, AnyBlock, SayBlock, ThinkBlock } from "@/context/ScratchContext";
import MotionBlock from "./MotionBlock";
import LooksBlock from "./LooksBlock";

interface RepeatBlockProps {
  block: RepeatBlockType;
}

const RepeatBlock: React.FC<RepeatBlockProps> = ({ block }) => {
  const { dispatch, state } = useScratch();
  
  const handleParamChange = (value: string) => {
    const numValue = Number(value);
    if (!isNaN(numValue) && numValue > 0) {
      dispatch({
        type: "UPDATE_BLOCK",
        id: block.id,
        params: { times: numValue }
      });
    }
  };
  
  const handleRemoveBlock = () => {
    dispatch({ type: "REMOVE_BLOCK", id: block.id });
  };

  const handleDragStart = (e: React.DragEvent) => {
    // Add block data to drag event
    e.dataTransfer.setData("blockId", block.id);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const blockType = e.dataTransfer.getData("blockType");
    if (blockType) {
      // Create a new block and add it to this repeat block
      const id = Math.random().toString(36).substr(2, 9);
      let newBlock: AnyBlock;
      
      switch (blockType) {
        case "move":
          newBlock = { id, type: "move", params: { steps: 10 } };
          break;
        case "turn":
          newBlock = { id, type: "turn", params: { degrees: 15 } };
          break;
        case "goto":
          newBlock = { id, type: "goto", params: { x: 0, y: 0 } };
          break;
        case "say":
          newBlock = { id, type: "say", params: { text: "Hello!", seconds: 2 } };
          break;
        case "think":
          newBlock = { id, type: "think", params: { text: "Hmm...", seconds: 2 } };
          break;
        case "repeat":
          newBlock = { id, type: "repeat", params: { times: 10 }, children: [] };
          break;
        default:
          return;
      }
      
      dispatch({
        type: "ADD_TO_REPEAT",
        parentId: block.id,
        block: newBlock,
      });
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const renderBlock = (childBlock: AnyBlock) => {
    switch (childBlock.type) {
      case "move":
      case "turn":
      case "goto":
        return <MotionBlock key={childBlock.id} block={childBlock} />;
      case "say":
      case "think":
        return <LooksBlock key={childBlock.id} block={childBlock as SayBlock | ThinkBlock} />;
      case "repeat":
        return <RepeatBlock key={childBlock.id} block={childBlock as RepeatBlockType} />;
      default:
        return null;
    }
  };
  
  return (
    <div 
      className="bg-green-500 rounded-lg overflow-hidden shadow-md"
      draggable={!state.isRunning}
      onDragStart={handleDragStart}
    >
      <div className="p-2 flex items-center text-white">
        <div className="bg-black bg-opacity-10 p-1 rounded mr-2">
          <div className="w-3 h-3 rounded-full bg-white"></div>
        </div>
        
        <div className="flex-grow">
          repeat
          <input
            type="number"
            min="1"
            value={block.params.times as number}
            onChange={(e) => handleParamChange(e.target.value)}
            className="mx-1 w-14 px-1 text-black rounded"
          />
          times
        </div>
        
        <button
          onClick={handleRemoveBlock}
          className="ml-2 text-white hover:text-red-300 focus:outline-none"
          disabled={state.isRunning}
        >
          ✕
        </button>
      </div>
      
      <div 
        className="bg-green-300 p-2 pl-6 space-y-2"
        onDrop={handleDrop}
        onDragOver={handleDragOver}
      >
        {block.children.length === 0 ? (
          <div className="text-green-800 italic text-sm border-2 border-dashed border-green-500 p-2 rounded text-center">
            Drag blocks here
          </div>
        ) : (
          block.children.map(childBlock => renderBlock(childBlock))
        )}
      </div>
    </div>
  );
};

export default RepeatBlock;
