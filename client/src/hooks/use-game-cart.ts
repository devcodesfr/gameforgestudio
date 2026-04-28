import { useEffect, useState } from "react";
import type { Project } from "@shared/schema";

const GAME_CART_STORAGE_KEY = "gameforge-game-cart";
const GAME_CART_CHANGED_EVENT = "gameforge-game-cart-changed";

export interface GameCartItem {
  gameId: string;
  gameName: string;
  gameIcon: string;
  gameDescription?: string | null;
  price: number;
  coverImage?: string;
}

function readGameCart(): GameCartItem[] {
  if (typeof window === "undefined") return [];

  try {
    const savedCart = window.localStorage.getItem(GAME_CART_STORAGE_KEY);
    return savedCart ? JSON.parse(savedCart) as GameCartItem[] : [];
  } catch {
    return [];
  }
}

function writeGameCart(items: GameCartItem[]) {
  window.localStorage.setItem(GAME_CART_STORAGE_KEY, JSON.stringify(items));
  window.dispatchEvent(new Event(GAME_CART_CHANGED_EVENT));
}

export function getGamePrice(gameName: string): number {
  const hash = gameName.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const prices = [9.99, 14.99, 19.99, 24.99, 29.99, 39.99, 49.99];
  return prices[hash % prices.length];
}

export function getGameCover(game: Pick<Project, "icon" | "screenshots">): string | undefined {
  return game.screenshots?.[0] || (game.icon.startsWith("http") || game.icon.startsWith("/") ? game.icon : undefined);
}

export function toGameCartItem(game: Project): GameCartItem {
  return {
    gameId: game.id,
    gameName: game.name,
    gameIcon: game.icon,
    gameDescription: game.description,
    price: getGamePrice(game.name),
    coverImage: getGameCover(game),
  };
}

export function useGameCart() {
  const [items, setItems] = useState<GameCartItem[]>(() => readGameCart());

  useEffect(() => {
    const syncCart = () => setItems(readGameCart());
    window.addEventListener(GAME_CART_CHANGED_EVENT, syncCart);
    window.addEventListener("storage", syncCart);

    return () => {
      window.removeEventListener(GAME_CART_CHANGED_EVENT, syncCart);
      window.removeEventListener("storage", syncCart);
    };
  }, []);

  const addItem = (item: GameCartItem) => {
    const currentItems = readGameCart();
    if (currentItems.some((cartItem) => cartItem.gameId === item.gameId)) return false;

    writeGameCart([...currentItems, item]);
    return true;
  };

  const removeItem = (gameId: string) => {
    writeGameCart(readGameCart().filter((item) => item.gameId !== gameId));
  };

  const clearCart = () => {
    writeGameCart([]);
  };

  return {
    items,
    addItem,
    removeItem,
    clearCart,
    isInCart: (gameId: string) => items.some((item) => item.gameId === gameId),
    total: items.reduce((sum, item) => sum + item.price, 0),
  };
}
