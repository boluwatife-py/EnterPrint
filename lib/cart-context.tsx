"use client"

import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from "react"
import { mockOrders, type Order, type ProductionStage } from "@/lib/mock-account"

export type ArtworkInfo = {
  type: "upload" | "design" | "none"
  fileNames?: string[]
  brief?: string
}

export type CartItem = {
  id: string
  productSlug: string
  name: string
  image: string
  options: Record<string, string>
  optionLabels: { label: string; value: string }[]
  quantity: number
  unitPrice: number
  artwork: ArtworkInfo
}

type CartContextValue = {
  items: CartItem[]
  orders: Order[]
  addItem: (item: CartItem) => void
  removeItem: (id: string) => void
  updateQuantity: (id: string, quantity: number, unitPrice: number) => void
  clearCart: () => void
  placeOrder: (details: { address: string; delivery: number }) => Order
  reorder: (orderId: string) => number
  itemCount: number
  subtotal: number
}

const CartContext = createContext<CartContextValue | null>(null)

const CART_KEY = "enterprint-cart"
const ORDERS_KEY = "enterprint-orders"

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const [orders, setOrders] = useState<Order[]>(mockOrders)
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    try {
      const savedCart = localStorage.getItem(CART_KEY)
      if (savedCart) setItems(JSON.parse(savedCart))
      const savedOrders = localStorage.getItem(ORDERS_KEY)
      if (savedOrders) setOrders(JSON.parse(savedOrders))
    } catch {
      // ignore
    }
    setHydrated(true)
  }, [])

  useEffect(() => {
    if (hydrated) localStorage.setItem(CART_KEY, JSON.stringify(items))
  }, [items, hydrated])

  useEffect(() => {
    if (hydrated) localStorage.setItem(ORDERS_KEY, JSON.stringify(orders))
  }, [orders, hydrated])

  const addItem = useCallback((item: CartItem) => {
    setItems((prev) => [...prev, item])
  }, [])

  const removeItem = useCallback((id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id))
  }, [])

  const updateQuantity = useCallback((id: string, quantity: number, unitPrice: number) => {
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, quantity, unitPrice } : i)))
  }, [])

  const clearCart = useCallback(() => setItems([]), [])

  const placeOrder = useCallback(
    (details: { address: string; delivery: number }) => {
      const subtotal = items.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0)
      const orderId = "EP-" + Math.floor(10000 + Math.random() * 89999)
      const now = new Date()
      const est = new Date(now)
      est.setDate(est.getDate() + 8)
      const hasDesignRequest = items.some((i) => i.artwork.type === "design")
      const order: Order = {
        id: orderId,
        createdAt: now.toISOString().slice(0, 10),
        status: "Order Received" as ProductionStage,
        artworkStatus: hasDesignRequest ? "Design Requested" : "Uploaded",
        items: items.map((i) => ({
          productSlug: i.productSlug,
          name: i.name,
          image: i.image,
          options: i.options,
          quantity: i.quantity,
          unitPrice: i.unitPrice,
        })),
        subtotal,
        delivery: details.delivery,
        total: subtotal + details.delivery,
        deliveryAddress: details.address,
        estimatedDelivery: est.toISOString().slice(0, 10),
        tracking: [
          { label: "Order placed", location: "Online", date: now.toISOString().slice(0, 10), done: true },
          { label: "Payment confirmed", location: "Paystack", date: now.toISOString().slice(0, 10), done: true },
          { label: "Artwork review", location: "Design Studio", date: "", done: false },
          { label: "In production", location: "Lagos Facility", date: "", done: false },
          { label: "Dispatched", location: "", date: "", done: false },
          { label: "Delivered", location: "", date: "", done: false },
        ],
      }
      setOrders((prev) => [order, ...prev])
      setItems([])
      return order
    },
    [items],
  )

  const reorder = useCallback(
    (orderId: string) => {
      const order = orders.find((o) => o.id === orderId)
      if (!order) return 0
      const newItems: CartItem[] = order.items.map((i) => ({
        id: crypto.randomUUID(),
        productSlug: i.productSlug,
        name: i.name,
        image: i.image,
        options: i.options,
        optionLabels: Object.entries(i.options).map(([label, value]) => ({ label, value })),
        quantity: i.quantity,
        unitPrice: i.unitPrice,
        artwork: { type: "upload", fileNames: ["previous-artwork.pdf"] },
      }))
      setItems((prev) => [...prev, ...newItems])
      return newItems.length
    },
    [orders],
  )

  const itemCount = items.reduce((sum, i) => sum + 1, 0)
  const subtotal = items.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0)

  return (
    <CartContext.Provider
      value={{
        items,
        orders,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        placeOrder,
        reorder,
        itemCount,
        subtotal,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error("useCart must be used within CartProvider")
  return ctx
}
