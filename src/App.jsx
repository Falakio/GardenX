import { Routes, Route } from 'react-router-dom'
import { Container, Fab, Badge, Box } from '@mui/material'
import { ThemeProvider } from '@mui/material/styles'
import { ShoppingCart as ShoppingCartIcon } from '@mui/icons-material'
import { Link as RouterLink } from 'react-router-dom'
import theme from './theme'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import Shop from './pages/Shop'
import Login from './pages/Login'
import AdminDashboard from './pages/AdminDashboard'
import AdminProducts from './pages/AdminProducts'
import AdminOrders from './pages/AdminOrders'
import Checkout from './pages/Checkout'
import Orders from './pages/Orders'
import Profile from './pages/Profile'
import Cart from './pages/Cart'
import SignUp from './pages/SignUp'
import ProtectedRoute from './components/ProtectedRoute'
import { AuthProvider } from './contexts/AuthContext'
import { CartProvider, useCart } from './contexts/CartContext'

function MainContent() {
  const { itemCount } = useCart()
  
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />
      <Container 
        maxWidth="lg" 
        sx={{ 
          mt: { xs: 8, sm: 9 },
          mb: 4,
          flexGrow: 1,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />
          <Route 
            path="/cart" 
            element={
              <ProtectedRoute>
                <Cart />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/checkout" 
            element={
              <ProtectedRoute>
                <Checkout />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/orders" 
            element={
              <ProtectedRoute>
                <Orders />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/profile" 
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin" 
            element={
              <ProtectedRoute adminOnly>
                <AdminDashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin/products" 
            element={
              <ProtectedRoute adminOnly>
                <AdminProducts />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin/orders" 
            element={
              <ProtectedRoute adminOnly>
                <AdminOrders />
              </ProtectedRoute>
            } 
          />
        </Routes>
      </Container>
      <Box
        sx={{
          display: { xs: 'block', md: 'none' },
          position: 'fixed',
          bottom: 16,
          right: 16,
          zIndex: (theme) => theme.zIndex.drawer + 2,
        }}
      >
        <Fab
          component={RouterLink}
          to="/cart"
          color="primary"
          aria-label="cart"
          sx={{
            width: 64,
            height: 64,
          }}
        >
          <Badge badgeContent={itemCount} color="error">
            <ShoppingCartIcon sx={{ fontSize: 28 }} />
          </Badge>
        </Fab>
      </Box>
    </div>
  )
}

function App() {
  return (
    <ThemeProvider theme={theme}>
      <AuthProvider>
        <CartProvider>
          <MainContent />
        </CartProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App
