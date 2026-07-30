"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from "react";

import type { QuantityTier } from "@/lib/api/catalog-api";
import type { UploadedArtworkFile } from "@/lib/api/uploads-api";

export type { UploadedArtworkFile } from "@/lib/api/uploads-api";

export type ArtworkInfo = {
  type: "upload" | "design" | "none";
  /**
   * Successfully-uploaded files only (the picker keeps in-flight/failed
   * uploads in its own local state, not here) — these ids are what get
   * sent as `artwork.fileIds` on checkout.
   */
  files?: UploadedArtworkFile[];
  brief?: string;
};

export type CartItem = {
  id: string;
  productSlug: string;
  name: string;
  image: string;
  options: Record<string, string>;
  optionLabels: { label: string; value: string }[];
  quantity: number;
  unitPrice: number;
  quantityTiers: QuantityTier[];
  artwork: ArtworkInfo;
};

type CartContextValue = {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number, unitPrice: number) => void;
  clearCart: () => void;
  itemCount: number;
  subtotal: number;
};

const CartContext = createContext<CartContextValue | null>(null);

const CART_KEY = "enterprint-cart";

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(CART_KEY);

      if (saved) {
        setItems(JSON.parse(saved));
      }
    } catch {
      // ignore
    }

    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;

    localStorage.setItem(CART_KEY, JSON.stringify(items));
  }, [items, hydrated]);

  const addItem = useCallback((item: CartItem) => {
    setItems((prev) => [...prev, item]);
  }, []);

  const removeItem = useCallback((id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const updateQuantity = useCallback(
    (id: string, quantity: number, unitPrice: number) => {
      setItems((prev) =>
        prev.map((item) =>
          item.id === id
            ? {
                ...item,
                quantity,
                unitPrice,
              }
            : item,
        ),
      );
    },
    [],
  );

  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  const itemCount = items.length;

  const subtotal = items.reduce(
    (sum, item) => sum + item.quantity * item.unitPrice,
    0,
  );

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        itemCount,
        subtotal,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error("useCart must be used within CartProvider");
  }

  return context;
}
