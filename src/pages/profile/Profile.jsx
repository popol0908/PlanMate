import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  Typography, 
  Box, 
  Button, 
  Avatar, 
  Paper, 
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  TextField,
  IconButton,
  Snackbar,
  Alert,
  AlertTitle,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  CircularProgress,
  Container
} from '@mui/material';
import PageTitle from '../../components/common/PageTitle';
import { 
  Person as PersonIcon,
  Email as EmailIcon,
  Logout as LogoutIcon,
  Settings as SettingsIcon,
  Edit as EditIcon,
  Check as CheckIcon,
  Close as CloseIcon,
  Lock as LockIcon,
  Delete as DeleteIcon,
  Password as PasswordIcon
} from '@mui/icons-material';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import Layout from '../../components/common/Layout';

export default function Profile() {
  const { currentUser, logout, updateDisplayName, changePassword, deleteAccount } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [displayName, setDisplayName] = useState(currentUser?.displayName || '');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [changePasswordOpen, setChangePasswordOpen] = useState(false);
  const [deleteAccountOpen, setDeleteAccountOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [accountPassword, setAccountPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (currentUser?.displayName) {
      setDisplayName(currentUser.displayName);
    }
  }, [currentUser]);

  const handleSaveName = async () => {
    try {
      if (!displayName.trim()) {
        setSnackbar({ open: true, message: 'Name cannot be empty', severity: 'error' });
        return;
      }
      await updateDisplayName(displayName);
      setSnackbar({ open: true, message: 'Name updated successfully!', severity: 'success' });
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating name:', error);
      setSnackbar({ open: true, message: 'Failed to update name', severity: 'error' });
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Failed to log out:', error);
      setSnackbar({ open: true, message: 'Failed to log out', severity: 'error' });
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      setSnackbar({ open: true, message: 'New passwords do not match', severity: 'error' });
      return;
    }

    try {
      setIsLoading(true);
      await changePassword(currentPassword, newPassword);
      setSnackbar({ open: true, message: 'Password changed successfully!', severity: 'success' });
      setChangePasswordOpen(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      setSnackbar({ open: true, message: error.message, severity: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    try {
      setIsLoading(true);
      await deleteAccount(accountPassword);
      setSnackbar({ open: true, message: 'Account deleted successfully', severity: 'success' });
    } catch (error) {
      setSnackbar({ open: true, message: error.message, severity: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenDeleteDialog = () => {
    setAccountPassword('');
    setDeleteAccountOpen(true);
  };

  const handleCloseDialogs = () => {
    setChangePasswordOpen(false);
    setDeleteAccountOpen(false);
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setAccountPassword('');
  };

  return (
    <Layout>
      <Box sx={{ p: 3, width: '100%', maxWidth: 1200, mx: 'auto' }}>
        <PageTitle 
          title="My Profile"
          subtitle="Manage your account settings and personal information"
          icon="/images/Logo.png"
        />
        
        {/* Profile Section */}
        <Box sx={{ maxWidth: 800, mx: 'auto', width: '100%' }}>
          {/* Profile Header Card */}
          <Paper 
            elevation={2}
            sx={{ 
              p: 4,
              mb: 4,
              borderRadius: 2,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center'
            }}
          >
            <Box sx={{ mb: 3, width: '100%' }}>
              <Avatar
                sx={{ 
                  width: 100, 
                  height: 100, 
                  bgcolor: 'primary.main',
                  mb: 2,
                  boxShadow: 2,
                  mx: 'auto'
                }}
              >
                <PersonIcon sx={{ fontSize: 60 }} />
              </Avatar>
              
              {/* Profile Name and Edit */}
              <Box sx={{ 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center',
                gap: 2,
                width: '100%',
                mb: 2
              }}>
                {isEditing ? (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <TextField
                      variant="standard"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      autoFocus
                      size="small"
                    />
                    <IconButton onClick={handleSaveName} color="primary">
                      <CheckIcon />
                    </IconButton>
                    <IconButton onClick={() => {
                      setIsEditing(false);
                      setDisplayName(currentUser?.displayName || '');
                    }} color="error">
                      <CloseIcon />
                    </IconButton>
                  </Box>
                ) : (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="h4" component="h1">
                      {displayName || 'User'}
                    </Typography>
                    <IconButton 
                      onClick={() => setIsEditing(true)}
                      size="small"
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                  </Box>
                )}
                <Typography variant="subtitle1" color="text.secondary">
                  {currentUser?.email}
                </Typography>
              </Box>
            </Box>
          </Paper>

          <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Account Information
          </Typography>
          <Divider sx={{ mb: 2 }} />
          
          <List>
            <ListItem>
              <ListItemIcon>
                <EmailIcon />
              </ListItemIcon>
              <ListItemText 
                primary="Email" 
                secondary={currentUser?.email || 'No email available'}
              />
            </ListItem>
          </List>
        </Paper>

        <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Settings
          </Typography>
          <Divider sx={{ mb: 2 }} />
          
          <List>
            <ListItem 
              button 
              onClick={() => setChangePasswordOpen(true)}
              sx={{ '&:hover': { bgcolor: 'action.hover' } }}
            >
              <ListItemIcon>
                <PasswordIcon color="primary" />
              </ListItemIcon>
              <ListItemText 
                primary="Change Password" 
                secondary="Update your account password"
              />
            </ListItem>
            <Divider />
            <ListItem 
              button 
              onClick={handleOpenDeleteDialog}
              sx={{ '&:hover': { bgcolor: 'error.light', '& .MuiListItemIcon-root, & .MuiListItemText-root': { color: 'error.contrastText' } } }}
            >
              <ListItemIcon>
                <DeleteIcon color="error" />
              </ListItemIcon>
              <ListItemText 
                primary="Delete Account" 
                primaryTypographyProps={{ color: 'error' }}
                secondary="Permanently delete your account and all data"
                secondaryTypographyProps={{ color: 'error.light' }}
              />
            </ListItem>
          </List>
        </Paper>

        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4, mb: 4 }}>
          <Button
            variant="contained"
            color="error"
            startIcon={<LogoutIcon />}
            onClick={handleLogout}
            size="large"
          >
            Sign Out
          </Button>
        </Box>
        
        <Snackbar 
          open={snackbar.open} 
          autoHideDuration={6000} 
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert onClose={handleCloseSnackbar} severity={snackbar.severity}>
            {snackbar.message}
          </Alert>
        </Snackbar>

          {/* Change Password Dialog */}
          <Dialog open={changePasswordOpen} onClose={handleCloseDialogs} maxWidth="sm" fullWidth>
            <DialogTitle>Change Password</DialogTitle>
            <DialogContent>
              <Box component="form" sx={{ mt: 1 }}>
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  name="currentPassword"
                  label="Current Password"
                  type="password"
                  id="currentPassword"
                  autoComplete="current-password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  disabled={isLoading}
                />
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  name="newPassword"
                  label="New Password"
                  type="password"
                  id="newPassword"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  disabled={isLoading}
                />
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  name="confirmPassword"
                  label="Confirm New Password"
                  type="password"
                  id="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={isLoading}
                  error={newPassword !== confirmPassword && confirmPassword !== ''}
                  helperText={newPassword !== confirmPassword && confirmPassword !== '' ? 'Passwords do not match' : ''}
                />
              </Box>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseDialogs} disabled={isLoading}>
                Cancel
              </Button>
              <Button 
                onClick={handleChangePassword} 
                variant="contained" 
                disabled={!currentPassword || !newPassword || !confirmPassword || isLoading}
              >
                {isLoading ? <CircularProgress size={24} /> : 'Change Password'}
              </Button>
            </DialogActions>
          </Dialog>

          {/* Delete Account Dialog */}
          <Dialog 
            open={deleteAccountOpen} 
            onClose={handleCloseDialogs} 
            maxWidth="sm" 
            fullWidth
          >
            <DialogTitle>Delete Account</DialogTitle>
            <DialogContent>
              <Alert severity="error" sx={{ mb: 2 }}>
                <AlertTitle>Warning: This action cannot be undone</AlertTitle>
                All your data will be permanently deleted. This includes all your tasks, plans, and account information.
              </Alert>
              <Typography variant="body1" paragraph>
                To confirm, please enter your password:
              </Typography>
              <TextField
                margin="normal"
                required
                fullWidth
                name="accountPassword"
                label="Password"
                type="password"
                id="accountPassword"
                value={accountPassword}
                onChange={(e) => setAccountPassword(e.target.value)}
                disabled={isLoading}
              />
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseDialogs} disabled={isLoading}>
                Cancel
              </Button>
              <Button 
                onClick={handleDeleteAccount} 
                variant="contained" 
                color="error"
                disabled={!accountPassword || isLoading}
                startIcon={isLoading ? <CircularProgress size={20} /> : <DeleteIcon />}
              >
                Delete My Account
              </Button>
            </DialogActions>
          </Dialog>
        </Box>
      </Box>
    </Layout>
  );
}