
import React, { useEffect, useRef } from "react";
import { useScratch } from "@/context/ScratchContext";
import { toast } from "sonner";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const StageArea = () => {
  const { state, dispatch } = useScratch();
  const { sprites, activeSprite, isRunning } = state;
  const collisionsChecked = useRef<Set<string>>(new Set());
  
  // Stage dimensions
  const stageWidth = 480;
  const stageHeight = 360;
  
  // Check for collisions between sprites
  useEffect(() => {
    if (!isRunning || sprites.length < 2) return;
    
    const checkCollisions = () => {
      if (!sprites) return;
      
      for (let i = 0; i < sprites.length; i++) {
        for (let j = i + 1; j < sprites.length; j++) {
          const sprite1 = sprites[i];
          const sprite2 = sprites[j];
          const collisionKey = `${sprite1.id}-${sprite2.id}`;
          
          // Calculate collision
          const dx = sprite1.x - sprite2.x;
          const dy = sprite1.y - sprite2.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          const sumRadii = (sprite1.width + sprite2.width) / 2;
          
          if (distance < sumRadii && !collisionsChecked.current.has(collisionKey)) {
            // Collision detected! Swap animations
            dispatch({ type: "SWAP_ANIMATIONS", spriteId1: sprite1.id, spriteId2: sprite2.id });
            collisionsChecked.current.add(collisionKey);
            toast(`${sprite1.name} collided with ${sprite2.name}! Animations swapped!`);
            break;
          }
        }
      }
    };
    
    const collisionInterval = setInterval(checkCollisions, 100);
    return () => clearInterval(collisionInterval);
  }, [sprites, isRunning, dispatch]);
  
  // Reset collision tracking when animation stops
  useEffect(() => {
    if (!isRunning) {
      collisionsChecked.current.clear();
    }
  }, [isRunning]);
  
  return (
    <div className="w-1/2">
      <div className="bg-white p-4 rounded-lg shadow-md h-full flex flex-col">
        <div className="bg-green-700 text-white p-2 font-bold rounded-t-lg">
          Stage
        </div>
        
        <div className="relative flex-grow bg-white border-2 border-gray-300 rounded-b-lg overflow-hidden">
          {/* Stage coordinate system display */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-1/2 left-0 right-0 border-b border-gray-200"></div>
            <div className="absolute bottom-0 top-0 left-1/2 border-l border-gray-200"></div>
          </div>
          
          {/* Stage background */}
          <div className="absolute inset-0 bg-blue-50"></div>
          
          {/* Sprites */}
          {sprites && sprites.map(sprite => {
            const leftPos = (stageWidth / 2) + sprite.x - (sprite.width / 2);
            const topPos = (stageHeight / 2) - sprite.y - (sprite.height / 2);
            
            return (
              <div
                key={sprite.id}
                className={`absolute transition-all duration-100 ${
                  activeSprite === sprite.id ? "ring-2 ring-green-500" : ""
                }`}
                style={{
                  left: `${leftPos}px`,
                  top: `${topPos}px`,
                  transform: `rotate(${90 - sprite.direction}deg)`,
                  display: sprite.visible ? "block" : "none",
                }}
              >
                {sprite.message && (
                  <div className={`absolute ${
                    sprite.message.type === "say" 
                      ? "bg-white border-2 border-black rounded-lg p-2" 
                      : "bg-white border-2 border-black rounded-full p-2"
                  } text-xs min-w-[80px] text-center whitespace-pre-wrap bottom-full left-1/2 -translate-x-1/2 mb-2`}>
                    {sprite.message.text}
                    <div className={`absolute ${
                      sprite.message.type === "say"
                        ? "w-3 h-3 bg-white border-r-2 border-b-2 border-black rotate-45"
                        : "w-3 h-3 bg-white border-r-2 border-b-2 border-black rotate-45"
                    } left-1/2 -translate-x-1/2 -bottom-[6px]`}></div>
                  </div>
                )}
                
                <Avatar className={`w-${sprite.width / 4} h-${sprite.height / 4} ${sprite.costumeBg || "bg-amber-100"}`}>
                  <AvatarFallback className="text-3xl">{sprite.costume}</AvatarFallback>
                </Avatar>
              </div>
            );
          })}
          
          {/* Coordinate display */}
          <div className="absolute bottom-2 right-2 bg-white/80 px-2 py-1 text-xs rounded">
            {sprites && sprites.find(s => s.id === activeSprite) ? (
              <>x: {Math.round(sprites.find(s => s.id === activeSprite)!.x)}, y: {Math.round(sprites.find(s => s.id === activeSprite)!.y)}</>
            ) : (
              <>x: 0, y: 0</>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StageArea;
