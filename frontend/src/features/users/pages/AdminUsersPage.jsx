import { useEffect, useState } from "react";
import {
  Alert,
  Button,
  Chip,
  CircularProgress,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  FormControl,
  InputLabel,
  Menu,
  MenuItem,
  Paper,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import {
  getUserPermissions,
  listUsers,
  updateUserPermissions,
  updateUserRole,
} from "../api";
import { isOwner } from "@/lib/access";
import { useAuth } from "@/hooks/useAuth";

export default function AdminUsersPage() {
  const { user: authUser } = useAuth();
  const [q, setQ] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [state, setState] = useState({
    loading: true,
    error: null,
    items: [],
    meta: { total: 0 },
  });
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [menuUser, setMenuUser] = useState(null);
  const [permDialogOpen, setPermDialogOpen] = useState(false);
  const [permState, setPermState] = useState({
    loading: false,
    saving: false,
    error: null,
    targetUser: null,
    availablePermissions: [],
    modeByPermission: {},
  });
  const canManagePermissions = isOwner(authUser?.role);

  async function load() {
    setState((s) => ({ ...s, loading: true, error: null }));
    try {
      const result = await listUsers({ q, role: roleFilter || undefined, pageSize: 50 });
      setState({ loading: false, error: null, items: result.items, meta: result.meta });
    } catch (err) {
      setState({
        loading: false,
        error: err?.message ?? "Could not load users",
        items: [],
        meta: { total: 0 },
      });
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function onRoleChange(userId, nextRole) {
    try {
      await updateUserRole(userId, nextRole);
      setState((s) => ({
        ...s,
        items: s.items.map((u) => (u.id === userId ? { ...u, role: nextRole } : u)),
      }));
    } catch (err) {
      setState((s) => ({ ...s, error: err?.message ?? "Role update failed" }));
    }
  }

  function openActionsMenu(event, user) {
    setMenuAnchor(event.currentTarget);
    setMenuUser(user);
  }

  function closeActionsMenu() {
    setMenuAnchor(null);
    setMenuUser(null);
  }

  async function applyRoleFromMenu(role) {
    if (!menuUser) return;
    await onRoleChange(menuUser.id, role);
    closeActionsMenu();
  }

  function buildModeByPermission(payload) {
    const allow = new Set(payload?.overrides?.allow ?? []);
    const deny = new Set(payload?.overrides?.deny ?? []);
    const out = {};
    for (const permission of payload?.availablePermissions ?? []) {
      if (deny.has(permission)) out[permission] = "deny";
      else if (allow.has(permission)) out[permission] = "allow";
      else out[permission] = "inherit";
    }
    return out;
  }

  async function openPermissionsEditor() {
    if (!menuUser) return;
    closeActionsMenu();
    setPermDialogOpen(true);
    setPermState({
      loading: true,
      saving: false,
      error: null,
      targetUser: menuUser,
      availablePermissions: [],
      modeByPermission: {},
    });
    try {
      const payload = await getUserPermissions(menuUser.id);
      setPermState({
        loading: false,
        saving: false,
        error: null,
        targetUser: payload?.user ?? menuUser,
        availablePermissions: payload?.availablePermissions ?? [],
        modeByPermission: buildModeByPermission(payload),
      });
    } catch (err) {
      setPermState((s) => ({
        ...s,
        loading: false,
        error: err?.message ?? "Could not load permissions",
      }));
    }
  }

  function closePermissionsDialog() {
    if (permState.saving) return;
    setPermDialogOpen(false);
  }

  function setPermissionMode(permission, mode) {
    setPermState((s) => ({
      ...s,
      modeByPermission: { ...s.modeByPermission, [permission]: mode },
    }));
  }

  async function savePermissionOverrides() {
    if (!permState.targetUser?.id) return;
    const allow = [];
    const deny = [];
    for (const permission of permState.availablePermissions) {
      const mode = permState.modeByPermission[permission] ?? "inherit";
      if (mode === "allow") allow.push(permission);
      if (mode === "deny") deny.push(permission);
    }

    setPermState((s) => ({ ...s, saving: true, error: null }));
    try {
      await updateUserPermissions(permState.targetUser.id, { allow, deny });
      setPermState((s) => ({ ...s, saving: false }));
      setPermDialogOpen(false);
    } catch (err) {
      setPermState((s) => ({
        ...s,
        saving: false,
        error: err?.message ?? "Could not save permission overrides",
      }));
    }
  }

  return (
    <Container maxWidth="lg" sx={{ py: 3 }}>
      <Stack spacing={2}>
        <Paper variant="outlined" sx={{ p: 3 }}>
          <Typography variant="h5" fontWeight={700}>
            User Access Management
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Owner can manage role assignments for non-owner members.
          </Typography>
        </Paper>

        <Paper variant="outlined" sx={{ p: 2 }}>
          <Stack direction={{ xs: "column", md: "row" }} spacing={1.5}>
            <TextField
              size="small"
              label="Search name/email"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              fullWidth
            />
            <Select
              size="small"
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              displayEmpty
              sx={{ minWidth: 180 }}
            >
              <MenuItem value="">All roles</MenuItem>
              <MenuItem value="owner">Owner</MenuItem>
              <MenuItem value="user">User</MenuItem>
              <MenuItem value="admin">Admin</MenuItem>
            </Select>
            <Button variant="contained" onClick={load}>
              Apply
            </Button>
          </Stack>
        </Paper>

        {state.error && <Alert severity="error">{state.error}</Alert>}
        {state.loading && <Typography color="text.secondary">Loading users...</Typography>}

        {!state.loading && (
          <Paper variant="outlined" sx={{ p: 0 }}>
            <Typography variant="body2" color="text.secondary" sx={{ px: 2, pt: 2, pb: 1 }}>
              {state.meta.total} user{state.meta.total === 1 ? "" : "s"}
            </Typography>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Role</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {state.items.map((u) => (
                    <TableRow key={u.id} hover>
                      <TableCell>{u.name}</TableCell>
                      <TableCell>{u.email}</TableCell>
                      <TableCell sx={{ textTransform: "lowercase" }}>{u.role}</TableCell>
                      <TableCell align="right">
                        <IconButton size="small" onClick={(e) => openActionsMenu(e, u)}>
                          <MoreVertIcon fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        )}
      </Stack>

      <Menu anchorEl={menuAnchor} open={Boolean(menuAnchor)} onClose={closeActionsMenu}>
        <MenuItem
          disabled={menuUser?.role === "user" || isOwner(menuUser?.role)}
          onClick={() => applyRoleFromMenu("user")}
        >
          Change role to user
        </MenuItem>
        <MenuItem
          disabled={menuUser?.role === "admin" || isOwner(menuUser?.role)}
          onClick={() => applyRoleFromMenu("admin")}
        >
          Change role to admin
        </MenuItem>
        <MenuItem
          disabled={!canManagePermissions || menuUser?.role !== "admin"}
          onClick={openPermissionsEditor}
        >
          Edit admin permissions
        </MenuItem>
      </Menu>

      <Dialog open={permDialogOpen} onClose={closePermissionsDialog} fullWidth maxWidth="md">
        <DialogTitle>Admin Permission Overrides</DialogTitle>
        <DialogContent>
          <Stack spacing={1.5} sx={{ mt: 1 }}>
            {permState.targetUser && (
              <Typography variant="body2" color="text.secondary">
                {permState.targetUser.name} ({permState.targetUser.email})
              </Typography>
            )}
            {permState.loading && (
              <Stack direction="row" spacing={1} alignItems="center">
                <CircularProgress size={18} />
                <Typography color="text.secondary">Loading permissions...</Typography>
              </Stack>
            )}
            {permState.error && <Alert severity="error">{permState.error}</Alert>}
            {!permState.loading &&
              !permState.error &&
              permState.availablePermissions.map((permission) => (
                <Stack
                  key={permission}
                  direction={{ xs: "column", sm: "row" }}
                  spacing={1}
                  alignItems={{ sm: "center" }}
                  justifyContent="space-between"
                  sx={{ border: 1, borderColor: "divider", borderRadius: 1, p: 1.25 }}
                >
                  <Chip label={permission} size="small" />
                  <FormControl size="small" sx={{ minWidth: 180 }}>
                    <InputLabel>Mode</InputLabel>
                    <Select
                      label="Mode"
                      value={permState.modeByPermission[permission] ?? "inherit"}
                      onChange={(e) => setPermissionMode(permission, e.target.value)}
                    >
                      <MenuItem value="inherit">Inherit role default</MenuItem>
                      <MenuItem value="allow">Allow explicitly</MenuItem>
                      <MenuItem value="deny">Deny explicitly</MenuItem>
                    </Select>
                  </FormControl>
                </Stack>
              ))}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={closePermissionsDialog} disabled={permState.saving}>
            Cancel
          </Button>
          <Button variant="contained" onClick={savePermissionOverrides} disabled={permState.saving}>
            Save overrides
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
