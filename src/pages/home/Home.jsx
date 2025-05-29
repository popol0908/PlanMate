import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Box,
  Button,
  CircularProgress,
  Paper,
  Stack,
  List,
  ListItem,
  ListItemText,
  Typography,
  Container
} from '@mui/material';
import PageTitle from '../../components/common/PageTitle';
import { Task as TaskIcon, CalendarToday as CalendarIcon, ArrowForward as ArrowForwardIcon } from '@mui/icons-material';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { useAuth } from '../../context/AuthContext';
import { LocalizationProvider, DateCalendar } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { format, isSameDay } from 'date-fns';
import Layout from '../../components/common/Layout';

function useTaskData(currentUser) {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser) {
      setLoading(false);
      return;
    }

    setLoading(true);
    const q = query(
      collection(db, 'tasks'),
      where('userId', '==', currentUser.uid)
    );

    const unsubscribe = onSnapshot(q, 
      (querySnapshot) => {
        const tasksList = [];
        querySnapshot.forEach((doc) => {
          tasksList.push({ id: doc.id, ...doc.data() });
        });
        setTasks(tasksList);
        setLoading(false);
      }, 
      (error) => {
        console.error('Error fetching tasks:', error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [currentUser]);

  return { tasks, loading };
}

export default function Home() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const { tasks, loading } = useTaskData(currentUser);
  
  const remainingCount = React.useMemo(() => {
    return tasks.filter(task => !task.completed).length;
  }, [tasks]);

  const tasksForSelectedDate = React.useMemo(() => {
    if (!selectedDate) return [];
    
    return tasks.filter(task => {
      if (!task.dueDate) return false;
      try {
        const taskDate = task.dueDate.toDate ? task.dueDate.toDate() : new Date(task.dueDate);
        return isSameDay(taskDate, selectedDate);
      } catch (error) {
        console.error('Error processing task date:', task.dueDate, error);
        return false;
      }
    });
  }, [tasks, selectedDate]);

  if (loading) {
    return (
      <Layout>
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Loading...
          </Typography>
        </Box>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
          <CircularProgress />
        </Box>
      </Layout>
    );
  }

  const getDisplayName = () => {
    if (currentUser?.displayName) {
      return currentUser.displayName;
    }
    if (currentUser?.email) {
      const username = currentUser.email.split('@')[0];
      return username.charAt(0).toUpperCase() + username.slice(1);
    }
    return 'User';
  };

  return (
    <Layout>
      {/* Welcome Section */}
      <PageTitle 
        title={`Welcome, ${getDisplayName()}`}
        subtitle="Here's what's happening today"
        icon="/images/Logo.png"
      />

      {/* Task Counter Card */}
      <Paper 
        elevation={2} 
        sx={{ 
          p: 3, 
          mb: 4, 
          background: 'linear-gradient(135deg, #1976d2 0%, #21CBF3 100%)',
          color: 'white',
          borderRadius: 2,
          borderLeft: '6px solid #ff9800',
          position: 'relative'
        }}
      >
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Box>
            <Typography variant="h5" component="h2" gutterBottom>
              {tasks.length === 0 
                ? "No tasks yet!" 
                : remainingCount === 0 
                  ? "All tasks completed! 🎉" 
                  : `You have ${remainingCount} ${remainingCount === 1 ? 'task' : 'tasks'} left to complete.`}
            </Typography>
            <Typography variant="body1" sx={{ opacity: 0.9, mb: 2 }}>
              {tasks.length === 0 
                ? "Start by creating your first task!"
                : remainingCount === 0 
                  ? "Great job! You're all caught up." 
                  : "Here's what you need to do next:"}
            </Typography>
            <Button 
              variant="contained" 
              color="secondary" 
              endIcon={<ArrowForwardIcon />}
              onClick={() => navigate('/plans')}
              sx={{
                backgroundColor: 'white',
                color: '#1976d2',
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.9)',
                },
                fontWeight: 'bold',
                textTransform: 'none',
                px: 3,
                py: 1,
                borderRadius: 2,
                boxShadow: '0 4px 14px 0 rgba(0, 0, 0, 0.1)'
              }}
            >
              View All Tasks
            </Button>
          </Box>
          <TaskIcon sx={{ fontSize: 60, opacity: 0.9 }} />
        </Stack>


      </Paper>

      {/* Calendar Section */}
      <Paper 
        elevation={2} 
        sx={{ 
          p: 3, 
          mb: 4, 
          borderRadius: 2,
          backgroundColor: 'white'
        }}
      >
        <Typography variant="h5" component="h2" gutterBottom sx={{ mb: 3, color: 'text.primary' }}>
          Calendar View
        </Typography>
        
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 4 }}>
            {/* Calendar */}
            <Box sx={{ minWidth: 320 }}>
              <DateCalendar
                value={selectedDate}
                onChange={(newDate) => setSelectedDate(newDate)}
                showDaysOutsideCurrentMonth
                fixedWeekNumber={6}
                sx={{
                  '& .MuiPickersDay-root': {
                    '&.Mui-selected': {
                      backgroundColor: '#1976d2',
                      '&:hover': {
                        backgroundColor: '#1565c0',
                      },
                    },
                  },
                  maxWidth: '100%',
                  width: '100%',
                  height: '100%',
                  '& .MuiPickersCalendarHeader-root': {
                    marginTop: 0,
                  },
                }}
              />
            </Box>

            
            {/* Tasks for Selected Date */}
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                Tasks for {format(selectedDate, 'EEEE, MMMM d, yyyy')}:
              </Typography>
              
              {tasksForSelectedDate.length > 0 ? (
                <List dense sx={{ maxHeight: 300, overflow: 'auto', bgcolor: 'background.paper', borderRadius: 1 }}>
                  {tasksForSelectedDate.map((task) => (
                    <ListItem 
                      key={task.id} 
                      sx={{ 
                        px: 2, 
                        py: 1.5,
                        '&:not(:last-child)': {
                          borderBottom: '1px solid',
                          borderColor: 'divider',
                        },
                        '&:hover': {
                          backgroundColor: 'action.hover',
                        }
                      }}
                    >
                      <ListItemText 
                        primary={task.title} 
                        primaryTypographyProps={{
                          variant: 'body1',
                          color: 'text.primary',
                          fontWeight: 500
                        }}
                        secondary={task.description || 'No description'}
                        secondaryTypographyProps={{
                          variant: 'body2',
                          color: 'text.secondary',
                          noWrap: true,
                          textOverflow: 'ellipsis',
                          overflow: 'hidden'
                        }}
                      />
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Box 
                  sx={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    minHeight: 200,
                    p: 3,
                    textAlign: 'center',
                    bgcolor: 'background.paper',
                    borderRadius: 1,
                    border: '1px dashed',
                    borderColor: 'divider'
                  }}
                >
                  <CalendarIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 2 }} />
                  <Typography variant="body1" color="text.secondary">
                    No tasks scheduled for {format(selectedDate, 'MMMM d, yyyy')}
                  </Typography>
                  <Button 
                    variant="outlined" 
                    size="small" 
                    sx={{ mt: 2 }}
                    onClick={() => navigate('/plans')}
                  >
                    Add Task
                  </Button>
                </Box>
              )}
            </Box>
          </Box>
        </LocalizationProvider>
      </Paper>
    </Layout>
  );
}