import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { Item, CartItem, Modifier } from '../types';

export type OrderType = 'dine-in' | 'takeout' | 'pickup' | 'delivery' | null;

interface CartState {
  items: CartItem[];
  orderType: OrderType;
}

type CartAction = 
  | { type: 'ADD_ITEM'; item: Item; modifiers?: Modifier[] }
  | { type: 'REMOVE_ITEM'; itemId: string }
  | { type: 'UPDATE_QUANTITY'; itemId: string; quantity: number }
  | { type: 'SET_ORDER_TYPE'; orderType: OrderType }
  | { type: 'CLEAR_CART' };

const initialState: CartState = {
  items: [],
  orderType: null,
};

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'ADD_ITEM': {
      // Check if item already exists in cart (same id and same modifiers)
      const existingIndex = state.items.findIndex(ci => {
        if (ci.item.id !== action.item.id) return false;
        
        // Compare modifiers
        const existingModifierIds = (ci.modifiers || []).map(m => m.id).sort().join(',');
        const newModifierIds = (action.modifiers || []).map(m => m.id).sort().join(',');
        return existingModifierIds === newModifierIds;
      });

      if (existingIndex !== -1) {
        // Item exists, increase quantity
        return {
          ...state,
          items: state.items.map((ci, index) =>
            index === existingIndex
              ? { ...ci, quantity: ci.quantity + 1 }
              : ci
          ),
        };
      }
      
      // New item, add to cart
      return {
        ...state,
        items: [...state.items, { item: action.item, quantity: 1, modifiers: action.modifiers }],
      };
    }
    case 'REMOVE_ITEM':
      return {
        ...state,
        items: state.items.filter(ci => ci.item.id !== action.itemId),
      };
    case 'UPDATE_QUANTITY':
      return {
        ...state,
        items: state.items.map(ci =>
          ci.item.id === action.itemId
            ? { ...ci, quantity: action.quantity }
            : ci
        ),
      };
    case 'CLEAR_CART':
      return initialState;
    case 'SET_ORDER_TYPE':
      return {
        ...state,
        orderType: action.orderType,
      };
    default:
      return state;
  }
}

export interface CartContextType {
  items: CartItem[];
  orderType: OrderType;
  addItem: (item: Item, modifiers?: Modifier[]) => void;
  removeItem: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  setOrderType: (orderType: OrderType) => void;
  clearCart: () => void;
}

export const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within a CartProvider');
  return context;
};

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(cartReducer, initialState);

  const addItem = (item: Item, modifiers?: Modifier[]) => {
    dispatch({ type: 'ADD_ITEM', item, modifiers });
  };
  const removeItem = (itemId: string) => {
    dispatch({ type: 'REMOVE_ITEM', itemId });
  };
  const updateQuantity = (itemId: string, quantity: number) => {
    dispatch({ type: 'UPDATE_QUANTITY', itemId, quantity });
  };
  const clearCart = () => {
    dispatch({ type: 'CLEAR_CART' });
  };
  const setOrderType = (orderType: OrderType) => {
    dispatch({ type: 'SET_ORDER_TYPE', orderType });
  };

  return (
    <CartContext.Provider value={{ items: state.items, orderType: state.orderType, addItem, removeItem, updateQuantity, setOrderType, clearCart }}>
      {children}
    </CartContext.Provider>
  );
};
