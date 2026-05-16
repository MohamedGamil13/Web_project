import { useState } from "react";
import { Link as RouterLink, NavLink } from "react-router-dom";
import {
  AppBar,
  Badge,
  Box,
  Button,
  Container,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Menu,
  MenuItem,
  Stack,
  Toolbar,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import NotificationsNoneOutlinedIcon from "@mui/icons-material/NotificationsNoneOutlined";
import { useAuth } from "@/hooks/useAuth";
import { useUnreadNotificationsCount } from "@/features/notifications/hooks";
import { UserAvatar } from "./UserAvatar";
import { isStaff } from "@/lib/access";

const PUBLIC_LINKS = [{ to: "/hotels", label: "Hotels" }];
const USER_LINKS = [{ to: "/reservations", label: "My Reservations" }];

function NavLinkItem({ to, label, end }) {
  return (
    <NavLink to={to} end={end} style={{ textDecoration: "none" }}>
      {({ isActive }) => (
        <Typography
          component="span"
          variant="body2"
          sx={{
            color: isActive ? "text.primary" : "text.secondary",
            fontWeight: isActive ? 600 : 400,
            transition: "color 120ms",
            "&:hover": { color: "text.primary" },
          }}
        >
          {label}
        </Typography>
      )}
    </NavLink>
  );
}

export function Navbar() {
  const { isAuthenticated, user, logout } = useAuth();
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up("md"));
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [accountAnchor, setAccountAnchor] = useState(null);
  const accountOpen = Boolean(accountAnchor);

  const adminLinks =
    isStaff(user?.role)
      ? [
        { to: "/admin/reservations", label: "Reservations" },
        { to: "/admin/insights", label: "Insights" },
        { to: "/admin/users", label: "Users" },
      ]
      : [];
  const memberLinks = isStaff(user?.role) ? [] : USER_LINKS;
  const allLinks = isAuthenticated
    ? [...PUBLIC_LINKS, ...memberLinks, ...adminLinks]
    : PUBLIC_LINKS;
  const unreadCount = useUnreadNotificationsCount(isAuthenticated);

  function closeAccount() {
    setAccountAnchor(null);
  }

  async function handleLogout() {
    closeAccount();
    setDrawerOpen(false);
    await logout();
  }

  return (
    <AppBar
      position="sticky"
      color="default"
      elevation={0}
      sx={{
        bgcolor: "background.default",
        borderBottom: 1,
        borderColor: "divider",
      }}
    >
      <Container maxWidth="xl">
        <Toolbar
          disableGutters
          sx={{ gap: { xs: 1, md: 3 }, minHeight: { xs: 56, md: 64 } }}
        >
          {!isDesktop && (
            <IconButton
              edge="start"
              aria-label="open navigation"
              onClick={() => setDrawerOpen(true)}
            >
              <MenuIcon />
            </IconButton>
          )}

          <Typography
            component={RouterLink}
            to="/"
            variant="h6"
            sx={{
              fontSize: { xs: "1.25rem", md: "1.45rem" },
              fontWeight: 800,
              letterSpacing: "-0.02em",
              color: "text.primary",
              textDecoration: "none",
              whiteSpace: "nowrap",
              flexShrink: 0,
            }}
          >
            Hotel Booking
          </Typography>

          {isDesktop && (
            <Stack direction="row" spacing={3} sx={{ flexGrow: 1, ml: 1 }}>
              {allLinks.map((l) => (
                <NavLinkItem key={l.to} {...l} />
              ))}
            </Stack>
          )}

          <Box sx={{ flexGrow: 1 }} />

          <Stack
            direction="row"
            spacing={1}
            sx={{ alignItems: "center", flexShrink: 0 }}
          >
            {isAuthenticated ? (
              <>
                <Tooltip title="Notifications">
                  <IconButton
                    component={RouterLink}
                    to="/notifications"
                    aria-label="open notifications"
                    size="small"
                  >
                    <Badge color="error" badgeContent={unreadCount} max={99}>
                      <NotificationsNoneOutlinedIcon fontSize="small" />
                    </Badge>
                  </IconButton>
                </Tooltip>
                <Tooltip title="Account">
                  <IconButton
                    onClick={(e) => setAccountAnchor(e.currentTarget)}
                    sx={{ p: 0.25 }}
                    aria-label="open account menu"
                    aria-controls={accountOpen ? "account-menu" : undefined}
                    aria-haspopup="true"
                    aria-expanded={accountOpen ? "true" : undefined}
                  >
                    <UserAvatar user={user} size={36} />
                  </IconButton>
                </Tooltip>
                <Menu
                  id="account-menu"
                  anchorEl={accountAnchor}
                  open={accountOpen}
                  onClose={closeAccount}
                  anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                  transformOrigin={{ vertical: "top", horizontal: "right" }}
                  slotProps={{ paper: { sx: { mt: 1, minWidth: 220 } } }}
                >
                  <Box sx={{ px: 2, py: 1.25 }}>
                    <Typography variant="body2" fontWeight={600} noWrap>
                      {user?.name ?? "Account"}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" noWrap>
                      {user?.email}
                    </Typography>
                  </Box>
                  <Divider />
                  <MenuItem
                    component={RouterLink}
                    to="/profile"
                    onClick={closeAccount}
                  >
                    Profile
                  </MenuItem>
                  {!isStaff(user?.role) && (
                    <MenuItem
                      component={RouterLink}
                      to="/reservations"
                      onClick={closeAccount}
                    >
                      My reservations
                    </MenuItem>
                  )}
                  <MenuItem
                    component={RouterLink}
                    to="/notifications"
                    onClick={closeAccount}
                  >
                    Notifications
                  </MenuItem>
                  {isStaff(user?.role) && (
                    <>
                      <MenuItem
                        component={RouterLink}
                        to="/admin/reservations"
                        onClick={closeAccount}
                      >
                        Reservations
                      </MenuItem>
                      <MenuItem
                        component={RouterLink}
                        to="/admin/insights"
                        onClick={closeAccount}
                      >
                        Insights
                      </MenuItem>
                      <MenuItem
                        component={RouterLink}
                        to="/admin/users"
                        onClick={closeAccount}
                      >
                        Users
                      </MenuItem>
                    </>
                  )}
                  <Divider />
                  <MenuItem onClick={handleLogout}>Logout</MenuItem>
                </Menu>
              </>
            ) : (
              <>
                {isDesktop && (
                  <Button
                    component={RouterLink}
                    to="/login"
                    variant="text"
                    size="small"
                  >
                    Login
                  </Button>
                )}
                <Button
                  component={RouterLink}
                  to="/register"
                  variant="contained"
                  size="small"
                >
                  {isDesktop ? "Register" : "Sign up"}
                </Button>
              </>
            )}
          </Stack>
        </Toolbar>
      </Container>

      <Drawer
        anchor="left"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      >
        <Box sx={{ width: 260, pt: 1 }} role="presentation">
          {isAuthenticated && (
            <Box
              sx={{
                px: 2,
                py: 1.5,
                display: "flex",
                alignItems: "center",
                gap: 1.5,
              }}
            >
              <UserAvatar user={user} size={40} />
              <Box sx={{ minWidth: 0 }}>
                <Typography variant="body2" fontWeight={600} noWrap>
                  {user?.name ?? "Account"}
                </Typography>
                <Typography variant="caption" color="text.secondary" noWrap>
                  {user?.email}
                </Typography>
              </Box>
            </Box>
          )}
          {isAuthenticated && <Divider />}
          <List>
            {allLinks.map((l) => (
              <ListItem key={l.to} disablePadding>
                <ListItemButton
                  component={RouterLink}
                  to={l.to}
                  onClick={() => setDrawerOpen(false)}
                >
                  <ListItemText primary={l.label} />
                </ListItemButton>
              </ListItem>
            ))}
            {isAuthenticated && (
              <ListItem disablePadding>
                <ListItemButton
                  component={RouterLink}
                  to="/notifications"
                  onClick={() => setDrawerOpen(false)}
                >
                  <ListItemText
                    primary={`Notifications${unreadCount ? ` (${unreadCount})` : ""}`}
                  />
                </ListItemButton>
              </ListItem>
            )}
            {isAuthenticated && (
              <ListItem disablePadding>
                <ListItemButton
                  component={RouterLink}
                  to="/profile"
                  onClick={() => setDrawerOpen(false)}
                >
                  <ListItemText primary="Profile" />
                </ListItemButton>
              </ListItem>
            )}
            {!isAuthenticated && (
              <ListItem disablePadding>
                <ListItemButton
                  component={RouterLink}
                  to="/login"
                  onClick={() => setDrawerOpen(false)}
                >
                  <ListItemText primary="Login" />
                </ListItemButton>
              </ListItem>
            )}
          </List>
          {isAuthenticated && (
            <>
              <Divider />
              <List>
                <ListItem disablePadding>
                  <ListItemButton onClick={handleLogout}>
                    <ListItemText primary="Logout" />
                  </ListItemButton>
                </ListItem>
              </List>
            </>
          )}
        </Box>
      </Drawer>
    </AppBar>
  );
}
