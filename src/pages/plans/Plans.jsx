import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '@mui/material/styles';
import { 
  Container,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Checkbox,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Paper,
  Typography,
  Chip
} from '@mui/material';
import PageTitle from '../../components/common/PageTitle';
import { 
  Add as AddIcon, 
  Delete as DeleteIcon, 
  Edit as EditIcon,
  Event as EventIcon,
  AccessTime as AccessTimeIcon 
} from '@mui/icons-material';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { collection, addDoc, updateDoc, deleteDoc, doc, onSnapshot, query, where } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { useAuth } from '../../context/AuthContext';
import Layout from '../../components/common/Layout';

export default function Plans() {
  const [tasks, setTasks] = useState([]);
  const [open, setOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [taskToComplete, setTaskToComplete] = useState(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState(null);
  const [editingTask, setEditingTask] = useState(null);
  const theme = useTheme();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState(new Date());
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('10:00');
  const [priority, setPriority] = useState('medium');
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState('active');
  const [priorityFilter, setPriorityFilter] = useState(null);
  const [sortBy, setSortBy] = useState('priority');
  const [sortOrder, setSortOrder] = useState('desc');
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const filteredTasks = tasks.filter(task => {
    if (statusFilter === 'active' && task.completed) return false;
    if (statusFilter === 'completed' && !task.completed) return false;
    
    if (priorityFilter && task.priority !== priorityFilter) return false;
    
    return true;
  });

  const sortedTasks = [...filteredTasks].sort((a, b) => {
    let comparison = 0;
    
    if (sortBy === 'dueDate') {
      comparison = new Date(a.dueDate) - new Date(b.dueDate);
    } else if (sortBy === 'priority') {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      comparison = priorityOrder[a.priority] - priorityOrder[b.priority];
    } else if (sortBy === 'createdAt') {
      comparison = new Date(a.createdAt) - new Date(b.createdAt);
    }
    
    return sortOrder === 'asc' ? comparison : -comparison;
  });

  const getPriorityStyles = (priority) => {
    const styles = {
      high: {
        bgcolor: 'rgba(255, 0, 0, 0.08)',
        borderLeft: '4px solid #f44336',
        '&:hover': {
          bgcolor: 'rgba(255, 0, 0, 0.12)',
        }
      },
      medium: {
        bgcolor: 'rgba(255, 152, 0, 0.06)',
        borderLeft: '4px solid #ff9800',
        '&:hover': {
          bgcolor: 'rgba(255, 152, 0, 0.1)',
        }
      },
      low: {
        bgcolor: 'rgba(76, 175, 80, 0.04)',
        borderLeft: '4px solid #4caf50',
        '&:hover': {
          bgcolor: 'rgba(76, 175, 80, 0.08)',
        }
      }
    };
    return styles[priority] || {};
  };

  const PriorityChip = ({ priority }) => {
    const priorityColors = {
      high: 'error',
      medium: 'warning',
      low: 'success'
    };
    
    const priorityLabels = {
      high: 'High',
      medium: 'Medium',
      low: 'Low'
    };
    
    return (
      <Chip 
        label={priorityLabels[priority] || priority} 
        color={priorityColors[priority] || 'default'} 
        size="small"
        variant="outlined"
        sx={{
          fontWeight: 600,
          borderWidth: '1.5px',
          '& .MuiChip-label': {
            px: 1,
          },
        }}
      />
    );
  };

  useEffect(() => {
    if (!currentUser) return;

    const q = query(
      collection(db, 'tasks'),
      where('userId', '==', currentUser.uid)
    );

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const tasksList = [];
      querySnapshot.forEach((doc) => {
        tasksList.push({ id: doc.id, ...doc.data() });
      });
      setTasks(tasksList);
    });

    return () => unsubscribe();
  }, [currentUser]);

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditingTask(null);
    setTitle('');
    setDescription('');
    setDueDate(new Date());
    setPriority('medium');
  };

  const isToday = (someDate) => {
    const today = new Date();
    return someDate.getDate() === today.getDate() &&
      someDate.getMonth() === today.getMonth() &&
      someDate.getFullYear() === today.getFullYear();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (isToday(dueDate)) {
      const now = new Date();
      const [startHours, startMinutes] = startTime.split(':').map(Number);
      const startDate = new Date(dueDate);
      startDate.setHours(startHours, startMinutes, 0, 0);
      
      if (startDate <= now) {
        alert('Start time must be in the future for today\'s date');
        return;
      }
    }

    setLoading(true);

    try {
    const [startHours, startMinutes] = startTime.split(':').map(Number);
    const taskDueDate = new Date(dueDate);
    taskDueDate.setHours(startHours, startMinutes, 0, 0);
    
    const taskData = {
      title,
      description,
      dueDate: taskDueDate.toISOString(),
      startTime,
      endTime,
      priority,
      completed: editingTask ? editingTask.completed : false,
      userId: currentUser.uid,
      createdAt: editingTask ? editingTask.createdAt : new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

      if (editingTask) {
        await updateDoc(doc(db, 'tasks', editingTask.id), taskData);
      } else {
        await addDoc(collection(db, 'tasks'), taskData);
      }
      
      handleClose();
    } catch (error) {
      console.error('Error saving task: ', error);
      alert('Error saving task. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (task) => {
    setEditingTask(task);
    setTitle(task.title);
    setDescription(task.description || '');
    
    const taskDueDate = task.dueDate ? new Date(task.dueDate) : new Date();
    setDueDate(taskDueDate);
    
    if (task.startTime) {
      setStartTime(task.startTime);
      const [hours, minutes] = task.startTime.split(':').map(Number);
      taskDueDate.setHours(hours, minutes, 0, 0);
    } else {
      setStartTime('09:00');
    }
    
    setEndTime(task.endTime || '10:00');
    setPriority(task.priority || 'medium');
    setOpen(true);
  };

  const handleDeleteClick = (task) => {
    setTaskToDelete(task);
    setDeleteConfirmOpen(true);
  };

  const confirmDelete = async (confirmed) => {
    if (confirmed && taskToDelete) {
      try {
        await deleteDoc(doc(db, 'tasks', taskToDelete.id));
      } catch (error) {
        console.error('Error deleting task: ', error);
        alert('Error deleting task. Please try again.');
      }
    }
    setDeleteConfirmOpen(false);
    setTaskToDelete(null);
  };

  const handleCompleteClick = (task) => {
    setTaskToComplete(task);
    setConfirmOpen(true);
  };

  const confirmComplete = async (confirmed) => {
    if (confirmed && taskToComplete) {
      try {
        const taskRef = doc(db, 'tasks', taskToComplete.id);
        const updates = {
          completed: !taskToComplete.completed,
          updatedAt: new Date().toISOString()
        };
        
        if (!taskToComplete.completed) {
          updates.completedAt = new Date().toISOString();
        } else {
          updates.completedAt = null;
        }
        
        await updateDoc(taskRef, updates);
        console.log('Task updated with completedAt timestamp:', updates);
      } catch (error) {
        console.error('Error updating task: ', error);
      }
    }
    setConfirmOpen(false);
    setTaskToComplete(null);
  };

  const toggleComplete = async (task) => {
    if (task.completed) {
      try {
        const taskRef = doc(db, 'tasks', task.id);
        await updateDoc(taskRef, {
          completed: false,
          completedAt: null,
          updatedAt: new Date().toISOString()
        });
      } catch (error) {
        console.error('Error updating task: ', error);
      }
    } else {
      handleCompleteClick(task);
    }
  };

  return (
    <Layout>
      <Container maxWidth="md">
        <PageTitle 
          title="My Study Plan"
          subtitle="Organize your subjects and track your progress"
          icon="/images/Logo.png"
        />
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 3 }}>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={handleOpen}
          >
            Add Task
          </Button>
        </Box>

        {/* Filter and Sort Controls */}
        <Box sx={{ mb: 3, display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Box>
            <Typography variant="subtitle2" color="textSecondary" gutterBottom>
              Filter by Status
            </Typography>
            <ToggleButtonGroup
              color="primary"
              value={statusFilter}
              exclusive
              onChange={(e, newFilter) => newFilter && setStatusFilter(newFilter)}
              aria-label="task status filter"
              size="small"
              fullWidth
              sx={{ mb: 2 }}
            >
              <ToggleButton value="active">Pending</ToggleButton>
              <ToggleButton value="completed">Completed</ToggleButton>
            </ToggleButtonGroup>
          </Box>
          
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <FormControl size="small" sx={{ minWidth: 200 }}>
              <InputLabel id="sort-by-label">Sort By</InputLabel>
              <Select
                labelId="sort-by-label"
                id="sort-by"
                value={sortBy}
                label="Sort By"
                onChange={(e) => setSortBy(e.target.value)}
              >
                <MenuItem value="dueDate">Due Date</MenuItem>
                <MenuItem value="priority">Priority</MenuItem>
                <MenuItem value="createdAt">Created At</MenuItem>
              </Select>
            </FormControl>
            
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel id="sort-order-label">Order</InputLabel>
              <Select
                labelId="sort-order-label"
                id="sort-order"
                value={sortOrder}
                label="Order"
                onChange={(e) => setSortOrder(e.target.value)}
              >
                <MenuItem value="asc">Ascending</MenuItem>
                <MenuItem value="desc">Descending</MenuItem>
              </Select>
            </FormControl>
            
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, ml: 'auto', minWidth: 200 }}>
              <Typography variant="subtitle2" color="textSecondary">Filter by Priority</Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                <Chip 
                  label="High" 
                  onClick={() => setPriorityFilter(priorityFilter === 'high' ? null : 'high')}
                  color={priorityFilter === 'high' ? 'error' : 'default'}
                  variant={priorityFilter === 'high' ? 'filled' : 'outlined'}
                  clickable
                />
                <Chip 
                  label="Medium" 
                  onClick={() => setPriorityFilter(priorityFilter === 'medium' ? null : 'medium')}
                  color={priorityFilter === 'medium' ? 'warning' : 'default'}
                  variant={priorityFilter === 'medium' ? 'filled' : 'outlined'}
                  clickable
                />
                <Chip 
                  label="Low" 
                  onClick={() => setPriorityFilter(priorityFilter === 'low' ? null : 'low')}
                  color={priorityFilter === 'low' ? 'success' : 'default'}
                  variant={priorityFilter === 'low' ? 'filled' : 'outlined'}
                  clickable
                />
              </Box>
            </Box>
          </Box>
        </Box>

        {sortedTasks.length === 0 ? (
          <Paper sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="body1" color="textSecondary">
              No tasks yet. Click "Add Task" to get started!
            </Typography>
          </Paper>
        ) : (
          <List>
            {sortedTasks.map((task) => (
              <Paper 
                key={task.id} 
                elevation={1}
                sx={{
                  mb: 1.5,
                  borderRadius: 2,
                  overflow: 'hidden',
                  transition: 'all 0.2s ease-in-out',
                  ...getPriorityStyles(task.priority),
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: 3,
                  },
                }}
              >
                <ListItem sx={{ py: 1.5, px: 2 }}>
                  <Checkbox
                    checked={task.completed || false}
                    onChange={() => toggleComplete(task)}
                    onClick={(e) => {
                      if (!task.completed) {
                        e.preventDefault();
                        handleCompleteClick(task);
                      }
                    }}
                    color="primary"
                    sx={{
                      '&.Mui-checked': {
                        color: (theme) => {
                          if (task.priority === 'high') return theme.palette.error.main;
                          if (task.priority === 'medium') return theme.palette.warning.main;
                          return theme.palette.success.main;
                        },
                      },
                    }}
                  />
                  <ListItemText
                    primary={
                      <Typography 
                        variant="subtitle1" 
                        sx={{
                          fontWeight: 600,
                          color: task.priority === 'high' ? 'error.main' : 'text.primary'
                        }}
                      >
                        {task.title}
                      </Typography>
                    }
                    secondary={
                      <Box sx={{ mt: 0.5 }}>
                        <Box sx={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: 1.5,
                          flexWrap: 'wrap',
                          mb: task.description ? 0.5 : 0
                        }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <EventIcon fontSize="small" color="action" sx={{ fontSize: 16 }} />
                            <Typography 
                              variant="body2" 
                              color="text.secondary"
                            >
                              {new Date(task.dueDate).toLocaleDateString()}
                            </Typography>
                          </Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <AccessTimeIcon fontSize="small" color="action" sx={{ fontSize: 16 }} />
                            <Typography 
                              variant="body2" 
                              color="text.secondary"
                            >
                              {task.startTime} - {task.endTime}
                            </Typography>
                          </Box>
                          <PriorityChip priority={task.priority} />
                        </Box>
                        {task.description && (
                          <Typography 
                            variant="body1" 
                            sx={{
                              mt: 1.5,
                              mr: 8,
                              fontStyle: 'normal',
                              fontWeight: 400,
                              lineHeight: 1.6,
                              color: (theme) => theme.palette.mode === 'dark' 
                                ? 'rgba(255, 255, 255, 0.9)' 
                                : 'rgba(0, 0, 0, 0.85)',
                              backgroundColor: (theme) => theme.palette.mode === 'dark' 
                                ? 'rgba(255, 255, 255, 0.06)' 
                                : 'rgba(0, 0, 0, 0.04)',
                              p: 1.5,
                              borderRadius: 1,
                              borderLeft: (theme) => `3px solid ${theme.palette.mode === 'dark' 
                                ? 'rgba(255, 255, 255, 0.1)' 
                                : 'rgba(0, 0, 0, 0.1)'}`,
                              boxShadow: (theme) => theme.shadows[1],
                              transition: 'all 0.2s ease',
                              maxWidth: 'calc(100% - 100px)',
                              wordWrap: 'break-word',
                              '&:hover': {
                                backgroundColor: (theme) => theme.palette.mode === 'dark' 
                                  ? 'rgba(255, 255, 255, 0.08)' 
                                  : 'rgba(0, 0, 0, 0.03)',
                              },
                            }}
                          >
                            {task.description}
                          </Typography>
                        )}
                      </Box>
                    }
                    sx={{ ml: 1 }}
                  />
                  <ListItemSecondaryAction>
                    <IconButton
                      edge="end"
                      aria-label="edit"
                      onClick={() => handleEdit(task)}
                      sx={{
                        color: 'text.secondary',
                        '&:hover': {
                          color: 'primary.main',
                          bgcolor: 'rgba(25, 118, 210, 0.04)'
                        },
                      }}
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      edge="end"
                      aria-label="delete"
                      onClick={() => handleDeleteClick(task)}
                      sx={{
                        color: 'text.secondary',
                        '&:hover': {
                          color: 'error.main',
                          bgcolor: 'rgba(211, 47, 47, 0.04)'
                        },
                      }}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </ListItemSecondaryAction>
                </ListItem>
              </Paper>
            ))}
          </List>
        )}

        <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
          <form onSubmit={handleSubmit}>
            <DialogTitle>
              {editingTask ? 'Edit Task' : 'Add New Task'}
            </DialogTitle>
            <DialogContent>
              <TextField
                autoFocus
                margin="dense"
                label="Title"
                type="text"
                fullWidth
                variant="outlined"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                sx={{ mb: 2 }}
              />
              <TextField
                margin="dense"
                label="Description"
                type="text"
                fullWidth
                multiline
                rows={3}
                variant="outlined"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                sx={{ mb: 2 }}
              />
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label="Due Date"
                  value={dueDate}
                  onChange={(newValue) => setDueDate(newValue)}
                  minDate={new Date()}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      fullWidth
                      margin="dense"
                      required
                      sx={{ mb: 2 }}
                    />
                  )}
                />
              </LocalizationProvider>
              <Box sx={{ display: 'flex', gap: 2, mt: 2, mb: 2 }}>
                <TextField
                  label="Start Time"
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  fullWidth
                  InputLabelProps={{
                    shrink: true,
                  }}
                  inputProps={{
                    step: 300, // 5 min
                  }}
                  required
                />
                <TextField
                  label="End Time"
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  fullWidth
                  InputLabelProps={{
                    shrink: true,
                  }}
                  inputProps={{
                    step: 300 // 5 min
                  }}
                  required
                />
              </Box>
              <FormControl fullWidth margin="dense">
                <InputLabel id="priority-label">Priority</InputLabel>
                <Select
                  labelId="priority-label"
                  id="priority"
                  value={priority}
                  label="Priority"
                  onChange={(e) => setPriority(e.target.value)}
                  required
                >
                  <MenuItem value="low">Low</MenuItem>
                  <MenuItem value="medium">Medium</MenuItem>
                  <MenuItem value="high">High</MenuItem>
                </Select>
              </FormControl>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleClose} disabled={loading}>
                Cancel
              </Button>
              <Button type="submit" color="primary" disabled={loading}>
                {loading ? 'Saving...' : 'Save'}
              </Button>
            </DialogActions>
          </form>
        </Dialog>

        {/* Completion Confirmation Dialog */}
        <Dialog
          open={confirmOpen}
          onClose={() => setConfirmOpen(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>Mark as Complete?</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Are you sure you want to mark "{taskToComplete?.title}" as complete?
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => confirmComplete(false)} color="primary">
              Cancel
            </Button>
            <Button 
              onClick={() => confirmComplete(true)} 
              color="primary"
              variant="contained"
              autoFocus
            >
              Mark Complete
            </Button>
          </DialogActions>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog
          open={deleteConfirmOpen}
          onClose={() => setDeleteConfirmOpen(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>Delete Task?</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Are you sure you want to delete "{taskToDelete?.title}"? This action cannot be undone.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => confirmDelete(false)} color="primary">
              Cancel
            </Button>
            <Button 
              onClick={() => confirmDelete(true)} 
              color="error"
              variant="contained"
              autoFocus
            >
              Delete
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Layout>
  );
}