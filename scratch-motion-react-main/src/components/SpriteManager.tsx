
import React from "react";
import { useScratch } from "@/context/ScratchContext";
import { toast } from "sonner";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const SPRITE_IMAGES = [
  { name: "Cat", emoji: "🐱", color: "bg-orange-200" },
  { name: "Dog", emoji: "🐶", color: "bg-amber-200" },
  { name: "Rabbit", emoji: "🐰", color: "bg-gray-200" },
  { name: "Panda", emoji: "🐼", color: "bg-gray-100" },
  { name: "Fox", emoji: "🦊", color: "bg-amber-300" },
  { name: "Bear", emoji: "🐻", color: "bg-amber-700" },
  { name: "Frog", emoji: "🐸", color: "bg-green-300" },
  { name: "Monkey", emoji: "🐵", color: "bg-amber-400" },
  { name: "Tiger", emoji: "🐯", color: "bg-yellow-300" },
];

const SpriteManager = () => {
  const { state, dispatch } = useScratch();
  const { sprites, activeSprite } = state;

  const handleAddSprite = () => {
    const spriteImage = SPRITE_IMAGES[Math.floor(Math.random() * SPRITE_IMAGES.length)];
    const id = `sprite${sprites.length + 1}`;
    const newSprite = {
      id,
      name: `${spriteImage.name} ${sprites.length + 1}`,
      x: Math.random() * 100 - 50, // Random position between -50 and 50
      y: Math.random() * 100 - 50,
      direction: 90,
      costume: spriteImage.emoji,
      costumeBg: spriteImage.color,
      visible: true,
      width: 50,
      height: 50,
      blocks: [], // Initialize with empty blocks
    };
    
    dispatch({ type: "ADD_SPRITE", sprite: newSprite });
    toast(`Added ${newSprite.name}`);
  };

  const handleRemoveSprite = (id: string) => {
    if (sprites.length <= 1) {
      toast.error("Cannot remove the only sprite");
      return;
    }
    
    dispatch({ type: "REMOVE_SPRITE", id });
    toast("Sprite removed");
  };

  const handleSelectSprite = (id: string) => {
    dispatch({ type: "SET_ACTIVE_SPRITE", id });
  };

  return (
    <div className="bg-purple-700 text-white p-2">
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-bold">Sprites</h3>
        <button
          className="bg-purple-500 hover:bg-purple-600 text-white px-2 py-1 rounded text-xs flex items-center gap-1"
          onClick={handleAddSprite}
          disabled={state.isRunning}
        >
          <span className="text-lg">+</span> Add Sprite
        </button>
      </div>
      
      <div className="flex gap-2 overflow-x-auto py-2">
        {sprites.map(sprite => (
          <div 
            key={sprite.id}
            className={`flex flex-col items-center p-2 rounded cursor-pointer transition-colors min-w-[70px] ${
              activeSprite === sprite.id ? "bg-purple-500" : "hover:bg-purple-600"
            }`}
            onClick={() => handleSelectSprite(sprite.id)}
          >
            <div className={`relative w-12 h-12 ${sprite.costumeBg || "bg-amber-100"} rounded-full flex items-center justify-center shadow-md mb-1 overflow-hidden`}>
              <span className="text-3xl">{sprite.costume}</span>
            </div>
            <div className="text-xs font-medium truncate max-w-[60px] text-center">{sprite.name}</div>
            
            <div className="mt-1 flex flex-col items-center">
              <div className="text-[10px] opacity-70">{sprite.blocks.length} blocks</div>
              {sprites.length > 1 && (
                <button
                  className="mt-1 text-xs text-red-300 hover:text-red-100"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemoveSprite(sprite.id);
                  }}
                  disabled={state.isRunning}
                >
                  ✕ Remove
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SpriteManager;
