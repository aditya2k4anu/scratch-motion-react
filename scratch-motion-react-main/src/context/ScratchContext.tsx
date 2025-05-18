
import React, { createContext, useContext, useReducer, ReactNode } from "react";

// Define block types
export type BlockType = "move" | "turn" | "goto" | "repeat" | "say" | "think";

// Define block interfaces
export interface Block {
  id: string;
  type: BlockType;
  params: Record<string, number | string>;
}

export interface RepeatBlock extends Block {
  type: "repeat";
  params: { times: number };
  children: AnyBlock[];
}

export interface SayBlock extends Block {
  type: "say";
  params: { text: string; seconds: number };
}

export interface ThinkBlock extends Block {
  type: "think";
  params: { text: string; seconds: number };
}

export type AnyBlock = Block | RepeatBlock | SayBlock | ThinkBlock;

// Define sprite state
export interface SpriteState {
  id: string;
  name: string;
  x: number;
  y: number;
  direction: number;
  costume: string;
  costumeBg?: string;
  visible: boolean;
  width: number;
  height: number;
  message?: { type: "say" | "think"; text: string; until?: number };
  blocks: AnyBlock[]; // Each sprite has its own blocks
}

// Define context state
interface ScratchState {
  sprites: SpriteState[];
  activeSprite: string;
  isRunning: boolean;
  draggedBlock: AnyBlock | null;
}

// Define action types
type Action =
  | { type: "ADD_BLOCK"; block: AnyBlock; spriteId?: string }
  | { type: "REMOVE_BLOCK"; id: string; spriteId?: string }
  | { type: "UPDATE_BLOCK"; id: string; params: Record<string, number | string>; spriteId?: string }
  | { type: "ADD_TO_REPEAT"; parentId: string; block: AnyBlock; spriteId?: string }
  | { type: "CLEAR_BLOCKS"; spriteId?: string }
  | { type: "SET_RUNNING"; value: boolean }
  | { type: "UPDATE_SPRITE"; spriteId: string; sprite: Partial<SpriteState> }
  | { type: "RESET_SPRITES" }
  | { type: "ADD_SPRITE"; sprite: SpriteState }
  | { type: "REMOVE_SPRITE"; id: string }
  | { type: "SET_ACTIVE_SPRITE"; id: string }
  | { type: "SET_DRAGGED_BLOCK"; block: AnyBlock | null }
  | { type: "SWAP_ANIMATIONS"; spriteId1: string; spriteId2: string };

// Initial state
const initialState: ScratchState = {
  sprites: [
    {
      id: "sprite1",
      name: "Cat",
      x: 0,
      y: 0,
      direction: 90, // facing right
      costume: "🐱",
      costumeBg: "bg-orange-200",
      visible: true,
      width: 50,
      height: 50,
      blocks: [], // Initialize with empty blocks array
    },
  ],
  activeSprite: "sprite1",
  isRunning: false,
  draggedBlock: null,
};

// Create context
const ScratchContext = createContext<{
  state: ScratchState;
  dispatch: React.Dispatch<Action>;
}>({
  state: initialState,
  dispatch: () => null,
});

// Helper function to find block by id (including in nested children)
const findBlockById = (blocks: AnyBlock[], id: string): AnyBlock | undefined => {
  for (const block of blocks) {
    if (block.id === id) return block;
    if ("children" in block) {
      const found = findBlockById(block.children, id);
      if (found) return found;
    }
  }
  return undefined;
};

// Helper function to remove block by id (including from nested children)
const removeBlockById = (blocks: AnyBlock[], id: string): AnyBlock[] => {
  return blocks
    .filter((block) => block.id !== id)
    .map((block) => {
      if ("children" in block) {
        return {
          ...block,
          children: removeBlockById(block.children, id),
        };
      }
      return block;
    });
};

// Helper function to find all move blocks for a sprite
const findMoveBlocks = (blocks: AnyBlock[]): AnyBlock[] => {
  const moveBlocks: AnyBlock[] = [];
  
  for (const block of blocks) {
    if (block.type === "move") {
      moveBlocks.push(block);
    } else if ("children" in block) {
      moveBlocks.push(...findMoveBlocks(block.children));
    }
  }
  
  return moveBlocks;
};

// Helper function to swap move animations between sprites
const swapMoveAnimations = (state: ScratchState, spriteId1: string, spriteId2: string): SpriteState[] => {
  // Clone the sprites to avoid mutating the state directly
  const updatedSprites = JSON.parse(JSON.stringify(state.sprites)) as SpriteState[];
  
  const sprite1 = updatedSprites.find(s => s.id === spriteId1);
  const sprite2 = updatedSprites.find(s => s.id === spriteId2);
  
  if (sprite1 && sprite2) {
    // Find move blocks for each sprite
    const sprite1Blocks = findMoveBlocks(sprite1.blocks);
    const sprite2Blocks = findMoveBlocks(sprite2.blocks);
    
    // Invert the steps of move blocks for both sprites
    for (const block of sprite1Blocks) {
      if (block.type === "move" && typeof block.params.steps === "number") {
        block.params.steps = -block.params.steps as number;
      }
    }
    
    for (const block of sprite2Blocks) {
      if (block.type === "move" && typeof block.params.steps === "number") {
        block.params.steps = -block.params.steps as number;
      }
    }
  }
  
  return updatedSprites;
};

// Reducer
const reducer = (state: ScratchState, action: Action): ScratchState => {
  switch (action.type) {
    case "ADD_BLOCK": {
      const spriteId = action.spriteId || state.activeSprite;
      const updatedSprites = state.sprites.map(sprite => 
        sprite.id === spriteId 
          ? { ...sprite, blocks: [...sprite.blocks, action.block] }
          : sprite
      );
      
      return {
        ...state,
        sprites: updatedSprites,
      };
    }

    case "REMOVE_BLOCK": {
      const spriteId = action.spriteId || state.activeSprite;
      const updatedSprites = state.sprites.map(sprite => 
        sprite.id === spriteId 
          ? { ...sprite, blocks: removeBlockById(sprite.blocks, action.id) }
          : sprite
      );
      
      return {
        ...state,
        sprites: updatedSprites,
      };
    }

    case "UPDATE_BLOCK": {
      const spriteId = action.spriteId || state.activeSprite;
      const updatedSprites = state.sprites.map(sprite => {
        if (sprite.id === spriteId) {
          const block = findBlockById(sprite.blocks, action.id);
          if (block) {
            block.params = { ...block.params, ...action.params };
          }
          return { ...sprite };
        }
        return sprite;
      });
      
      return {
        ...state,
        sprites: updatedSprites,
      };
    }

    case "ADD_TO_REPEAT": {
      const spriteId = action.spriteId || state.activeSprite;
      const updatedSprites = state.sprites.map(sprite => {
        if (sprite.id === spriteId) {
          const repeatBlock = findBlockById(sprite.blocks, action.parentId) as RepeatBlock | undefined;
          
          if (repeatBlock && "children" in repeatBlock) {
            repeatBlock.children = [...repeatBlock.children, action.block];
          }
          
          return { ...sprite };
        }
        return sprite;
      });
      
      return {
        ...state,
        sprites: updatedSprites,
      };
    }

    case "CLEAR_BLOCKS": {
      const spriteId = action.spriteId || state.activeSprite;
      const updatedSprites = state.sprites.map(sprite => 
        sprite.id === spriteId 
          ? { ...sprite, blocks: [] }
          : sprite
      );
      
      return {
        ...state,
        sprites: updatedSprites,
      };
    }

    case "SET_RUNNING":
      return {
        ...state,
        isRunning: action.value,
      };

    case "UPDATE_SPRITE": {
      const updatedSprites = state.sprites.map(sprite => 
        sprite.id === action.spriteId ? { ...sprite, ...action.sprite } : sprite
      );
      return {
        ...state,
        sprites: updatedSprites,
      };
    }

    case "RESET_SPRITES":
      return {
        ...state,
        sprites: state.sprites.map(sprite => ({
          ...sprite,
          x: 0,
          y: 0,
          direction: 90,
          message: undefined,
        })),
      };

    case "ADD_SPRITE": {
      return {
        ...state,
        sprites: [...state.sprites, action.sprite],
        activeSprite: action.sprite.id,
      };
    }

    case "REMOVE_SPRITE": {
      if (state.sprites.length <= 1) return state;
      
      const updatedSprites = state.sprites.filter(sprite => sprite.id !== action.id);
      return {
        ...state,
        sprites: updatedSprites,
        activeSprite: updatedSprites[0]?.id || "",
      };
    }

    case "SET_ACTIVE_SPRITE": {
      return {
        ...state,
        activeSprite: action.id,
      };
    }
    
    case "SET_DRAGGED_BLOCK": {
      return {
        ...state,
        draggedBlock: action.block,
      };
    }
    
    case "SWAP_ANIMATIONS": {
      return {
        ...state,
        sprites: swapMoveAnimations(state, action.spriteId1, action.spriteId2),
      };
    }

    default:
      return state;
  }
};

// Provider component
export const ScratchProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [state, dispatch] = useReducer(reducer, initialState);

  return (
    <ScratchContext.Provider value={{ state, dispatch }}>
      {children}
    </ScratchContext.Provider>
  );
};

// Custom hook
export const useScratch = () => useContext(ScratchContext);
