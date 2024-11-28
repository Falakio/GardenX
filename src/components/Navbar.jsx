import { useState } from 'react'
import { Link as RouterLink, useNavigate } from 'react-router-dom'
import {
  AppBar,
  Badge,
  Box,
  Button,
  Container,
  IconButton,
  Menu,
  MenuItem,
  Toolbar,
  Typography,
} from '@mui/material'
import {
  ShoppingCart as ShoppingCartIcon,
  Menu as MenuIcon,
} from '@mui/icons-material'
import { useAuth } from '../contexts/AuthContext'
import { useCart } from '../contexts/CartContext'
import { signOut, isAdmin } from '../services/supabase'
import logo from '../assets/logo-red.png'

function Navbar() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { itemCount } = useCart()
  const [anchorElNav, setAnchorElNav] = useState(null)
  const [anchorElUser, setAnchorElUser] = useState(null)

  const handleOpenNavMenu = (event) => {
    setAnchorElNav(event.currentTarget)
  }

  const handleOpenUserMenu = (event) => {
    setAnchorElUser(event.currentTarget)
  }

  const handleCloseNavMenu = () => {
    setAnchorElNav(null)
  }

  const handleCloseUserMenu = () => {
    setAnchorElUser(null)
  }

  const handleSignOut = async () => {
    await signOut()
    navigate('/')
  }

  const pages = [
    { name: 'Shop', path: '/shop' },
  ]

  const authenticatedPages = [
    { name: 'Orders', path: '/orders' },
    { name: 'Profile', path: '/profile' },
  ]

  const adminPages = [
    { name: 'Dashboard', path: '/admin' },
    { name: 'Products', path: '/admin/products' },
    { name: 'Orders', path: '/admin/orders' },
  ]

  const isAdminUser = user && isAdmin(user)

  return (
    <AppBar 
      position="fixed" 
      sx={{ 
        zIndex: (theme) => theme.zIndex.drawer + 1,
      }}
      elevation={1}
    >
      <Container maxWidth="lg">
        <Toolbar disableGutters>
          {/* Desktop Logo */}
          <Box
            component="img"
            sx={{
              height: 40,
              width: 40,
              mr: 1,
              display: { xs: 'none', md: 'flex' }
            }}
            alt="OIS Organic Garden Logo"
            src={logo}
          />
          <Typography
            variant="h6"
            component={RouterLink}
            to="/"
            sx={{
              mr: 2,
              display: { xs: 'none', md: 'flex' },
              fontWeight: 700,
              color: 'inherit',
              textDecoration: 'none',
            }}
          >
            OIS Organic Garden
          </Typography>

          {/* Mobile Menu */}
          <Box sx={{ flexGrow: 1, display: { xs: 'flex', md: 'none' } }}>
            <IconButton
              size="large"
              aria-label="menu"
              aria-controls="menu-appbar"
              aria-haspopup="true"
              onClick={handleOpenNavMenu}
              color="inherit"
            >
              <MenuIcon />
            </IconButton>
            <Menu
              id="menu-appbar"
              anchorEl={anchorElNav}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'left',
              }}
              keepMounted
              transformOrigin={{
                vertical: 'top',
                horizontal: 'left',
              }}
              open={Boolean(anchorElNav)}
              onClose={handleCloseNavMenu}
              sx={{
                display: { xs: 'block', md: 'none' },
              }}
            >
              {!isAdminUser && (
                <>
                  {pages.map((page) => (
                    <MenuItem key={page.name} onClick={handleCloseNavMenu} component={RouterLink} to={page.path}>
                      <Typography textAlign="center">{page.name}</Typography>
                    </MenuItem>
                  ))}
                  {user && authenticatedPages.map((page) => (
                    <MenuItem key={page.name} onClick={handleCloseNavMenu} component={RouterLink} to={page.path}>
                      <Typography textAlign="center">{page.name}</Typography>
                    </MenuItem>
                  ))}
                </>
              )}
              {isAdminUser && adminPages.map((page) => (
                <MenuItem key={page.name} onClick={handleCloseNavMenu} component={RouterLink} to={page.path}>
                  <Typography textAlign="center">{page.name}</Typography>
                </MenuItem>
              ))}
            </Menu>
          </Box>

          {/* Mobile Logo */}
          <Box
            component="img"
            sx={{
              height: 35,
              width: 35,
              mr: 1,
              display: { xs: 'flex', md: 'none' }
            }}
            alt="OIS Organic Garden Logo"
            src={logo}
          />
          <Typography
            variant="h6"
            component={RouterLink}
            to="/"
            sx={{
              mr: 2,
              display: { xs: 'flex', md: 'none' },
              flexGrow: 1,
              fontWeight: 700,
              color: 'inherit',
              textDecoration: 'none',
            }}
          >
            OIS Organic Garden
          </Typography>

          {/* Desktop Menu */}
          <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' } }}>
            {!isAdminUser && (
              <>
                {pages.map((page) => (
                  <Button
                    key={page.name}
                    component={RouterLink}
                    to={page.path}
                    onClick={handleCloseNavMenu}
                    sx={{ my: 2, color: 'white', display: 'block' }}
                  >
                    {page.name}
                  </Button>
                ))}
                {user && authenticatedPages.map((page) => (
                  <Button
                    key={page.name}
                    component={RouterLink}
                    to={page.path}
                    onClick={handleCloseNavMenu}
                    sx={{ my: 2, color: 'white', display: 'block' }}
                  >
                    {page.name}
                  </Button>
                ))}
              </>
            )}
            {isAdminUser && adminPages.map((page) => (
              <Button
                key={page.name}
                component={RouterLink}
                to={page.path}
                onClick={handleCloseNavMenu}
                sx={{ my: 2, color: 'white', display: 'block' }}
              >
                {page.name}
              </Button>
            ))}
          </Box>

          {/* Right Side Menu */}
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            {(!user || (user && !isAdminUser)) && (
              <Box sx={{ display: { xs: 'none', md: 'flex' } }}>
                <IconButton
                  component={RouterLink}
                  to="/cart"
                  size="large"
                  aria-label="show cart items"
                  color="inherit"
                >
                  <Badge badgeContent={itemCount} color="error">
                    <ShoppingCartIcon />
                  </Badge>
                </IconButton>
              </Box>
            )}
            {user ? (
              <Button
                onClick={handleSignOut}
                color="inherit"
              >
                Sign Out
              </Button>
            ) : (
              <Button
                component={RouterLink}
                to="/login"
                color="inherit"
              >
                Sign In
              </Button>
            )}
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  )
}

export default Navbar
