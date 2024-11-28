import { createContext, useContext, useState, useEffect } from 'react'
import { useAuth } from './AuthContext'
import { isAdmin } from '../services/supabase'

const CartContext = createContext()
const CART_STORAGE_KEY = 'gems_garden_cart'

export function useCart() {
  return useContext(CartContext)
}

export function CartProvider({ children }) {
  const [cart, setCart] = useState(() => {
    // Initialize cart from localStorage if available
    const savedCart = localStorage.getItem(CART_STORAGE_KEY)
    return savedCart ? JSON.parse(savedCart) : []
  })
  const { user } = useAuth()

  // Clear cart if user is admin
  useEffect(() => {
    if (isAdmin(user)) {
      setCart([])
      localStorage.removeItem(CART_STORAGE_KEY)
    }
  }, [user])

  // Persist cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart))
  }, [cart])

  const addToCart = (product, quantity = 1) => {
    if (isAdmin(user)) {
      console.warn('Admins cannot add items to cart')
      return
    }

    setCart(currentCart => {
      const existingItem = currentCart.find(item => item.id === product.id)
      
      if (existingItem) {
        return currentCart.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        )
      }
      
      return [...currentCart, { ...product, quantity }]
    })
  }

  const removeFromCart = (productId) => {
    if (isAdmin(user)) {
      console.warn('Admins cannot modify cart')
      return
    }

    setCart(currentCart => currentCart.filter(item => item.id !== productId))
  }

  const updateQuantity = (productId, quantity) => {
    if (isAdmin(user)) {
      console.warn('Admins cannot modify cart')
      return
    }

    if (quantity <= 0) {
      removeFromCart(productId)
      return
    }

    setCart(currentCart =>
      currentCart.map(item =>
        item.id === productId
          ? { ...item, quantity }
          : item
      )
    )
  }

  const clearCart = () => {
    setCart([])
    localStorage.removeItem(CART_STORAGE_KEY)
  }

  const total = cart.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  )

  const itemCount = cart.reduce(
    (count, item) => count + item.quantity,
    0
  )

  const value = {
    cart,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    total,
    itemCount,
  }

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  )
}
