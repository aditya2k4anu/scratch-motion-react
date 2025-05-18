
import React from "react";
import { useScratch, BlockType, AnyBlock, RepeatBlock as RepeatBlockType, SayBlock, ThinkBlock } from "@/context/ScratchContext";
import MotionBlock from "./blocks/MotionBlock";
import RepeatBlock from "./blocks/RepeatBlock";
import LooksBlock from "./blocks/LooksBlock";
import { toast } from "sonner";

const BlocksEditor = () => {
  const { state, dispatch } = useScratch();
  const { activeSprite, sprites, isRunning } = state;
  const activeSpriteFull = sprites.find(s => s.id === activeSprite);
  
  // Get active sprite's blocks
  const blocks = activeSpriteFull?.blocks || [];

  const handleAddBlock = (type: BlockType) => {
    const id = Math.random().toString(36).substr(2, 9);
    
    let block: AnyBlock;
    switch (type) {
      case "move":
        block = { id, type, params: { steps: 10 } };
        break;
      case "turn":
        block = { id, type, params: { degrees: 15 } };
        break;
      case "goto":
        block = { id, type, params: { x: 0, y: 0 } };
        break;
      case "repeat":
        block = { id, type, params: { times: 10 }, children: [] };
        break;
      case "say":
        block = { id, type, params: { text: "Hello!", seconds: 2 } };
        break;
      case "think":
        block = { id, type, params: { text: "Hmm...", seconds: 2 } };
        break;
      default:
        return;
    }
    
    dispatch({ type: "ADD_BLOCK", block, spriteId: activeSprite });
    toast("Block added!");
  };

  const handleClearBlocks = () => {
    dispatch({ type: "CLEAR_BLOCKS", spriteId: activeSprite });
    toast("Blocks cleared for this sprite!");
  };

  const handleRunCode = async () => {
    if (!activeSpriteFull || activeSpriteFull.blocks.length === 0) {
      toast("No blocks to run!");
      return;
    }

    dispatch({ type: "SET_RUNNING", value: true });
    dispatch({ type: "RESET_SPRITES" });
    
    try {
      // Check for sprite collisions during execution
      const spritesWithMoveBlocks = sprites.filter(s => 
        s.blocks.some(block => block.type === "move" || 
                            (block.type === "repeat" && "children" in block && 
                             block.children.some(child => child.type === "move")))
      );
      
      if (spritesWithMoveBlocks.length >= 2) {
        // When multiple sprites with move blocks exist, check for potential collisions
        const collidableSprites = sprites.filter(s => s.visible);
        if (collidableSprites.length >= 2) {
          // Get a couple sprites to simulate collision for demo purposes
          const sprite1 = collidableSprites[0];
          const sprite2 = collidableSprites[1];
          if (sprite1 && sprite2) {
            dispatch({ type: "SWAP_ANIMATIONS", spriteId1: sprite1.id, spriteId2: sprite2.id });
            toast("Sprites collided! Animation directions swapped!");
          }
        }
      }
      
      // Execute for active sprite
      await executeBlocks(activeSpriteFull.blocks);
      toast("Animation complete!");
    } catch (error) {
      console.error("Animation error:", error);
      toast("Error running animation");
    } finally {
      dispatch({ type: "SET_RUNNING", value: false });
    }
  };

  const executeBlocks = async (blocks: AnyBlock[], parentTimes = 1) => {
    for (let i = 0; i < parentTimes; i++) {
      for (const block of blocks) {
        if (block.type === "move") {
          await moveSteps(block.params.steps as number);
        } else if (block.type === "turn") {
          await turnDegrees(block.params.degrees as number);
        } else if (block.type === "goto") {
          await goToXY(block.params.x as number, block.params.y as number);
        } else if (block.type === "repeat" && "children" in block) {
          await executeBlocks(block.children, block.params.times as number);
        } else if (block.type === "say") {
          await sayMessage(block.params.text as string, block.params.seconds as number);
        } else if (block.type === "think") {
          await thinkMessage(block.params.text as string, block.params.seconds as number);
        }
      }
    }
  };

  const moveSteps = async (steps: number) => {
    const sprite = sprites.find(s => s.id === activeSprite);
    if (!sprite) return;
    
    const radians = (sprite.direction * Math.PI) / 180;
    const newX = sprite.x + steps * Math.cos(radians);
    const newY = sprite.y + steps * Math.sin(radians);
    
    dispatch({
      type: "UPDATE_SPRITE",
      spriteId: activeSprite,
      sprite: { x: newX, y: newY },
    });
    
    await new Promise((resolve) => setTimeout(resolve, 100));
  };

  const turnDegrees = async (degrees: number) => {
    const sprite = sprites.find(s => s.id === activeSprite);
    if (!sprite) return;
    
    const newDirection = (sprite.direction + degrees) % 360;
    
    dispatch({
      type: "UPDATE_SPRITE",
      spriteId: activeSprite,
      sprite: { direction: newDirection },
    });
    
    await new Promise((resolve) => setTimeout(resolve, 100));
  };

  const goToXY = async (x: number, y: number) => {
    dispatch({
      type: "UPDATE_SPRITE",
      spriteId: activeSprite,
      sprite: { x, y },
    });
    
    await new Promise((resolve) => setTimeout(resolve, 100));
  };

  const sayMessage = async (text: string, seconds: number) => {
    dispatch({
      type: "UPDATE_SPRITE",
      spriteId: activeSprite,
      sprite: { message: { type: "say", text, until: Date.now() + seconds * 1000 } },
    });
    
    await new Promise((resolve) => setTimeout(resolve, seconds * 1000));
    
    dispatch({
      type: "UPDATE_SPRITE",
      spriteId: activeSprite, 
      sprite: { message: undefined },
    });
  };

  const thinkMessage = async (text: string, seconds: number) => {
    dispatch({
      type: "UPDATE_SPRITE",
      spriteId: activeSprite,
      sprite: { message: { type: "think", text, until: Date.now() + seconds * 1000 } },
    });
    
    await new Promise((resolve) => setTimeout(resolve, seconds * 1000));
    
    dispatch({
      type: "UPDATE_SPRITE",
      spriteId: activeSprite,
      sprite: { message: undefined },
    });
  };

  const handleDragStart = (e: React.DragEvent, type: BlockType) => {
    e.dataTransfer.setData("blockType", type);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const blockType = e.dataTransfer.getData("blockType") as BlockType;
    const blockId = e.dataTransfer.getData("blockId");
    
    // If this is a new block
    if (blockType && !blockId) {
      handleAddBlock(blockType);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const renderBlock = (block: AnyBlock) => {
    switch (block.type) {
      case "move":
      case "turn":
      case "goto":
        return <MotionBlock key={block.id} block={block} spriteId={activeSprite} />;
      case "say":
      case "think":
        return <LooksBlock key={block.id} block={(block as SayBlock | ThinkBlock)} spriteId={activeSprite} />;
      case "repeat":
        return <RepeatBlock key={block.id} block={(block as RepeatBlockType)} spriteId={activeSprite} />;
      default:
        return null;
    }
  };

  // Get active sprite info for display
  const activeSpriteInfo = sprites.find(s => s.id === activeSprite);

  return (
    <div className="w-1/2 bg-white rounded-lg shadow-md overflow-y-auto flex flex-col h-full">
      <div className="p-4 bg-purple-700 text-white flex justify-between items-center">
        <div className="font-bold">Code Blocks</div>
        {activeSpriteInfo && (
          <div className="text-sm flex items-center gap-2">
            <span className={`${activeSpriteInfo.costumeBg || "bg-amber-100"} w-6 h-6 rounded-full flex items-center justify-center`}>
              {activeSpriteInfo.costume}
            </span>
            <span>For: {activeSpriteInfo.name}</span>
          </div>
        )}
      </div>
      
      <div className="flex flex-wrap p-4 gap-2 bg-purple-100 border-b border-purple-200">
        {/* Motion Blocks */}
        <div className="flex flex-col gap-1">
          <div className="text-xs font-bold text-blue-800">Motion</div>
          <div className="flex gap-1">
            <button 
              className="bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded text-xs cursor-grab"
              draggable={!isRunning}
              onDragStart={(e) => handleDragStart(e, "move")}
              onClick={() => handleAddBlock("move")}
              disabled={isRunning}
            >
              + Move
            </button>
            
            <button 
              className="bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded text-xs cursor-grab"
              draggable={!isRunning}
              onDragStart={(e) => handleDragStart(e, "turn")}
              onClick={() => handleAddBlock("turn")}
              disabled={isRunning}
            >
              + Turn
            </button>
            
            <button 
              className="bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded text-xs cursor-grab"
              draggable={!isRunning}
              onDragStart={(e) => handleDragStart(e, "goto")}
              onClick={() => handleAddBlock("goto")}
              disabled={isRunning}
            >
              + Go to
            </button>
          </div>
        </div>
        
        {/* Looks Blocks */}
        <div className="flex flex-col gap-1">
          <div className="text-xs font-bold text-purple-800">Looks</div>
          <div className="flex gap-1">
            <button 
              className="bg-purple-500 hover:bg-purple-600 text-white px-2 py-1 rounded text-xs cursor-grab"
              draggable={!isRunning}
              onDragStart={(e) => handleDragStart(e, "say")}
              onClick={() => handleAddBlock("say")}
              disabled={isRunning}
            >
              + Say
            </button>
            
            <button 
              className="bg-purple-500 hover:bg-purple-600 text-white px-2 py-1 rounded text-xs cursor-grab"
              draggable={!isRunning}
              onDragStart={(e) => handleDragStart(e, "think")}
              onClick={() => handleAddBlock("think")}
              disabled={isRunning}
            >
              + Think
            </button>
          </div>
        </div>
        
        {/* Control Blocks */}
        <div className="flex flex-col gap-1">
          <div className="text-xs font-bold text-green-800">Control</div>
          <button 
            className="bg-green-500 hover:bg-green-600 text-white px-2 py-1 rounded text-xs cursor-grab"
            draggable={!isRunning}
            onDragStart={(e) => handleDragStart(e, "repeat")}
            onClick={() => handleAddBlock("repeat")}
            disabled={isRunning}
          >
            + Repeat
          </button>
        </div>
        
        <div className="flex-grow"></div>
        
        <div className="flex gap-2">
          <button 
            className="bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded text-xs"
            onClick={handleClearBlocks}
            disabled={isRunning}
          >
            Clear All
          </button>
          
          <button 
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded text-sm font-bold"
            onClick={handleRunCode}
            disabled={isRunning}
          >
            {isRunning ? "Running..." : "▶ Run"}
          </button>
        </div>
      </div>
      
      <div 
        className="p-4 flex-grow space-y-2"
        onDrop={handleDrop}
        onDragOver={handleDragOver}
      >
        {blocks.length === 0 ? (
          <div className="text-center text-gray-500 py-8 border-2 border-dashed border-gray-300 rounded-lg">
            Drag blocks from the toolbar above or click to add blocks for <strong>{activeSpriteInfo?.name}</strong>
          </div>
        ) : (
          blocks.map(block => renderBlock(block))
        )}
      </div>
    </div>
  );
};

export default BlocksEditor;
