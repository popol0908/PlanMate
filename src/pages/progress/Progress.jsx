import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Paper, 
  CircularProgress, 
  Grid, 
  Card, 
  CardContent, 
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  IconButton,
  Tooltip,
  useTheme,
  Button,
  CardHeader,
  CardActions,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  FormHelperText,
  Typography,
  Chip
} from '@mui/material';
import { 
  AssignmentTurnedIn as CompletedIcon,
  AssignmentLate as PendingIcon,
  EmojiEvents as AchievementIcon,
  Star as StarIcon,
  TrendingUp as TrendingUpIcon,
  CalendarToday as CalendarIcon,
  CheckCircle as CheckCircleIcon,
  HourglassEmpty as HourglassIcon,
  AccessTime as TimeIcon,
  Event as EventIcon,
  Speed as SpeedIcon,
  WbSunny as MorningIcon,
  Brightness5 as AfternoonIcon,
  Brightness3 as NightIcon
} from '@mui/icons-material';
import { BarChart, PieChart, pieArcLabelClasses } from '@mui/x-charts';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { useAuth } from '../../context/AuthContext';
import Layout from '../../components/common/Layout';
import PageTitle from '../../components/common/PageTitle';

export default function Progress() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const { currentUser } = useAuth();
  const theme = useTheme();
  
  // Calculate weekly metrics
  const getStartOfWeek = (date) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
    return new Date(d.setDate(diff));
  };
  
  // Calculate tasks completed this week and generate date labels
  const { 
    completedTasksThisWeek, 
    tasksThisWeek, 
    weeklyCompletionData,
    dateLabels 
  } = React.useMemo(() => {
    const now = new Date();
    const startOfWeek = getStartOfWeek(now);
    startOfWeek.setHours(0, 0, 0, 0);
    
    // Initialize daily completion data
    const dailyCompletion = Array(7).fill(0);
    let completedThisWeek = 0;
    let totalTasksThisWeek = 0;
    
    // Generate date labels for the week (Mon-Sun)
    const weekDates = [];
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const dateLabels = [];
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(date.getDate() + i);
      const dayName = dayNames[date.getDay()];
      const dayNum = date.getDate();
      dateLabels.push(`${dayName} ${dayNum}`);
      weekDates.push(date);
    }
    
    tasks.forEach(task => {
      if (!task.completedAt) return;
      
      const completedAt = task.completedAt?.toDate ? task.completedAt.toDate() : new Date(task.completedAt);
      
      // Count tasks completed this week
      if (completedAt >= startOfWeek) {
        completedThisWeek++;
        
        // Update daily completion count
        const dayOfWeek = completedAt.getDay(); // 0 = Sunday, 1 = Monday, etc.
        dailyCompletion[dayOfWeek] = (dailyCompletion[dayOfWeek] || 0) + 1;
      }
      
      // Count all tasks with due dates this week
      if (task.dueDate) {
        const dueDate = new Date(task.dueDate);
        if (dueDate >= startOfWeek && dueDate <= now) {
          totalTasksThisWeek++;
        }
      }
    });
    
    // If no tasks with due dates this week, use all tasks for percentage
    if (totalTasksThisWeek === 0) {
      totalTasksThisWeek = tasks.length;
    }
    
    // Ensure we have 7 days of data (Sunday to Saturday)
    // Reorder to start with Monday (index 1) and end with Sunday (index 0)
    const orderedDays = [
      ...dailyCompletion.slice(1), // Monday to Saturday
      dailyCompletion[0] // Sunday
    ];
    
    return {
      completedTasksThisWeek: completedThisWeek,
      tasksThisWeek: totalTasksThisWeek,
      weeklyCompletionData: orderedDays,
      dateLabels: dateLabels
    };
  }, [tasks]);
  
  // Log when tasks change
  useEffect(() => {
    console.log('Tasks updated:', {
      totalTasks: tasks.length,
      completedTasks: tasks.filter(t => t.completed).length,
      withTimestamps: tasks.filter(t => t.completed && t.completedAt).length
    });
  }, [tasks]);
  
  // Get completed tasks with valid timestamps
  const completedTasksWithTime = React.useMemo(() => {
    const completed = tasks.filter(t => t.completed && t.completedAt);
    console.log('Filtered completed tasks with timestamps:', completed);
    return completed;
  }, [tasks]);
  
  // Helper function to calculate task duration in minutes
  const calculateTaskDuration = (task) => {
    if (!task.createdAt || !task.completedAt) return null;
    
    try {
      const completedAt = task.completedAt?.toDate ? task.completedAt.toDate() : new Date(task.completedAt);
      const createdAt = task.createdAt?.toDate ? task.createdAt.toDate() : new Date(task.createdAt);
      
      // Validate dates
      if (isNaN(completedAt.getTime()) || isNaN(createdAt.getTime())) {
        console.warn('Invalid date format for task:', task.id);
        return null;
      }
      
      // Ensure completedAt is after createdAt
      if (completedAt <= createdAt) {
        console.warn('Completion time is not after creation time for task:', task.id);
        return null;
      }
      
      return completedAt - createdAt; // Duration in milliseconds
    } catch (error) {
      console.error('Error calculating task duration:', error, task);
      return null;
    }
  };

  // Calculate productivity insights with useMemo
  const productivityInsights = React.useMemo(() => {
    console.log('Recalculating productivity insights...');
    console.log('Completed tasks with time:', completedTasksWithTime);
    
    if (!completedTasksWithTime || completedTasksWithTime.length === 0) {
      console.log('No completed tasks with timestamps found');
      return {
        mostProductiveTime: { period: 'morning', count: 0 },
        bestDay: { name: 'Monday', count: 0 }
      };
    }
    
    console.log(`Processing ${completedTasksWithTime.length} completed tasks`);
    
    const timeCounts = { morning: 0, afternoon: 0, evening: 0, night: 0 };
    const dayCounts = Array(7).fill(0);
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    let totalDurationMs = 0;
    let validTasks = 0;

    // First pass: calculate durations and count valid tasks
    const tasksWithDuration = completedTasksWithTime.map(task => {
      const duration = calculateTaskDuration(task);
      if (duration !== null) {
        totalDurationMs += duration;
        validTasks++;
      }
      return { ...task, duration };
    });

    // Second pass: calculate time of day and day of week stats
    tasksWithDuration.forEach(task => {
      if (task.duration === null) return;
      
      try {
        const completedAt = task.completedAt?.toDate ? task.completedAt.toDate() : new Date(task.completedAt);
        const hours = completedAt.getHours();
        const day = completedAt.getDay();
        
        // Categorize by time of day
        if (hours >= 5 && hours < 12) timeCounts.morning++;
        else if (hours >= 12 && hours < 17) timeCounts.afternoon++;
        else if (hours >= 17 && hours < 21) timeCounts.evening++;
        else timeCounts.night++;

        // Count by day of week
        dayCounts[day]++;
      } catch (error) {
        console.error('Error processing task:', error, task);
      }
    });

    console.log('Time counts:', timeCounts);
    console.log('Day counts:', dayCounts);
    console.log(`Total valid tasks: ${validTasks}, Total duration (ms): ${totalDurationMs}`);

    // Find most productive time
    const mostProductiveTime = Object.entries(timeCounts).reduce((a, b) => 
      a[1] > b[1] ? a : b, ['morning', 0]
    );

    // Find best day
    const bestDayIndex = dayCounts.indexOf(Math.max(...dayCounts));
    
    // Removed average time per task calculation

    const result = {
      mostProductiveTime: {
        period: mostProductiveTime[0],
        count: mostProductiveTime[1]
      },
      bestDay: {
        name: dayNames[bestDayIndex] || 'N/A',
        count: dayCounts[bestDayIndex] || 0
      },
      _debug: {
        validTasks,
        totalDurationMs
      }
    };

    console.log('Calculated insights:', result);
    return result;
  }, [completedTasksWithTime]);

  useEffect(() => {
    const fetchTasks = async () => {
      if (!currentUser) return;
      try {
        const q = query(
          collection(db, 'tasks'),
          where('userId', '==', currentUser.uid)
        );
        const querySnapshot = await getDocs(q);
        const tasksList = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setTasks(tasksList);
      } catch (error) {
        console.error('Error fetching tasks:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchTasks();
  }, [currentUser]);

  if (loading) {
    return (
      <Layout>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
          <CircularProgress />
        </Box>
      </Layout>
    );
  }

  // Calculate statistics
  const completedTasks = tasks.filter(task => task.completed).length;
  const pendingTasks = tasks.length - completedTasks;
  const highPriorityTasks = tasks.filter(task => task.priority === 'high');
  const completedHighPriority = highPriorityTasks.filter(task => task.completed).length;

  // Prepare data for the weekly completion chart
  const getDayName = (date) => {
    return date.toLocaleDateString('en-US', { weekday: 'short' });
  };

  const getLastSevenDays = () => {
    const result = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      result.push({
        date: d,
        dayName: getDayName(d),
        dateStr: d.toISOString().split('T')[0]
      });
    }
    return result;
  };

  const weeklyData = getLastSevenDays().map(day => {
    const dayTasks = tasks.filter(task => 
      task.dueDate === day.dateStr
    );
    const completed = dayTasks.filter(task => task.completed).length;
    return {
      day: day.dayName,
      completed,
      total: dayTasks.length,
      completionRate: dayTasks.length > 0 ? Math.round((completed / dayTasks.length) * 100) : 0
    };
  });

  // Prepare data for MUI X Charts
  const weeklyChartData = weeklyData.map(day => ({
    day: day.day,
    completed: day.completed,
    total: day.total
  }));

  // Calculate completed tasks by priority
  const completedByPriority = {
    high: tasks.filter(t => t.priority === 'high' && t.completed).length,
    medium: tasks.filter(t => t.priority === 'medium' && t.completed).length,
    low: tasks.filter(t => t.priority === 'low' && t.completed).length
  };

  const priorityData = [
    { id: 0, value: tasks.filter(t => t.priority === 'high').length, label: 'High', color: theme.palette.error.main },
    { id: 1, value: tasks.filter(t => t.priority === 'medium').length, label: 'Medium', color: theme.palette.warning.main },
    { id: 2, value: tasks.filter(t => t.priority === 'low').length, label: 'Low', color: theme.palette.success.main }
  ];

  // Calculate productivity insights
  const calculateProductivityInsights = (tasksWithTime) => {
    console.log('Calculating productivity insights...');
    
    if (!tasksWithTime || tasksWithTime.length === 0) {
      console.log('No completed tasks with timestamps found');
      return {
        mostProductiveTime: { period: 'morning', count: 0 },
        bestDay: { name: 'Monday', count: 0 },
        avgTimePerTask: '0min'
      };
    }
    
    console.log(`Processing ${tasksWithTime.length} completed tasks`);
    
    // Calculate most productive time of day
    const timeCounts = { morning: 0, afternoon: 0, evening: 0, night: 0 };
    const dayCounts = Array(7).fill(0);
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    let totalDuration = 0;
    let processedTasks = 0;

    tasksWithTime.forEach(task => {
      try {
        const completedAt = task.completedAt?.toDate ? task.completedAt.toDate() : new Date(task.completedAt);
        const hours = completedAt.getHours();
        const day = completedAt.getDay();
        
        // Categorize by time of day
        if (hours >= 5 && hours < 12) timeCounts.morning++;
        else if (hours >= 12 && hours < 17) timeCounts.afternoon++;
        else if (hours >= 17 && hours < 21) timeCounts.evening++;
        else timeCounts.night++;

        // Count by day of week
        dayCounts[day]++;

        // Calculate task duration if available
        if (task.createdAt) {
          const createdAt = task.createdAt?.toDate ? task.createdAt.toDate() : new Date(task.createdAt);
          const duration = completedAt - createdAt;
          totalDuration += duration;
        }
        processedTasks++;
      } catch (error) {
        console.error('Error processing task:', error, task);
      }
    });

    console.log('Time counts:', timeCounts);
    console.log('Day counts:', dayCounts);
    console.log('Total duration (ms):', totalDuration);

    // Find most productive time
    const mostProductiveTime = Object.entries(timeCounts).reduce((a, b) => 
      a[1] > b[1] ? a : b, ['morning', 0]
    );

    // Find best day
    const bestDayIndex = dayCounts.indexOf(Math.max(...dayCounts));
    
    // Calculate average time per task in minutes
    const avgTimeMs = processedTasks > 0 ? totalDuration / processedTasks : 0;
    const avgHours = Math.floor(avgTimeMs / (1000 * 60 * 60));
    const avgMinutes = Math.floor((avgTimeMs % (1000 * 60 * 60)) / (1000 * 60));
    const avgTimeStr = avgHours > 0 
      ? `${avgHours}hr ${avgMinutes}min` 
      : `${avgMinutes}min`;

    const result = {
      mostProductiveTime: {
        period: mostProductiveTime[0],
        count: mostProductiveTime[1]
      },
      bestDay: {
        name: dayNames[bestDayIndex] || 'N/A',
        count: dayCounts[bestDayIndex] || 0
      },
      avgTimePerTask: avgTimeStr
    };

    console.log('Calculated insights:', result);
    return result;
  };

  // Get recent completed tasks
  const recentCompleted = [...tasks]
    .filter(t => t.completed)
    .sort((a, b) => new Date(b.completedAt || 0) - new Date(a.completedAt || 0))
    .slice(0, 5);

  return (
    <Layout>
      <Box sx={{ p: 3, width: '100%', maxWidth: '100%', margin: 0 }}>
        <PageTitle 
          title="My Progress"
          subtitle="Track your study progress and achievements"
          icon="/images/Logo.png"
        />
        
        {/* Main Content Grid */}
        <Grid container spacing={2} sx={{ width: '100%', maxWidth: '100%', margin: 0 }}>
          {/* Left Column - Overview and Charts */}
          <Grid item xs={12} lg={7} sx={{ maxWidth: '100%', flexBasis: '100%' }}>
            {/* Stats Overview */}
            <Box sx={{ mb: 4 }}>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                Overview
              </Typography>
              <Grid container spacing={{ xs: 2, sm: 3 }}>
                {/* Completed Tasks Card */}
                <Grid item xs={12} sm={6} md={4} sx={{ display: 'flex' }}>
                  <Paper 
                    elevation={2} 
                    sx={{ 
                      p: { xs: 2, sm: 3 },
                      height: { xs: 'auto', sm: '180px' },
                      minHeight: { xs: '140px' },
                      width: '100%',
                      borderRadius: 2,
                      backgroundColor: 'white',
                      borderLeft: '4px solid #4caf50',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      transition: 'transform 0.2s, box-shadow 0.2s',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: 3
                      }
                    }}
                  >
                    <Box display="flex" alignItems="center" mb={2}>
                      <CompletedIcon color="success" sx={{ mr: 1, fontSize: { xs: 20, sm: 24 } }} />
                      <Typography variant="h6" sx={{ fontWeight: 600, fontSize: { xs: '1rem', sm: '1.1rem' } }}>Completed</Typography>
                    </Box>
                    <Box sx={{ mt: 1 }}>
                      <Typography variant="h4" sx={{ 
                        fontWeight: 'bold', 
                        mb: 0.5,
                        fontSize: { xs: '1.75rem', sm: '2.125rem' }
                      }}>
                        {completedTasks}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem' } }}>
                        {tasks.length > 0 ? `${Math.round((completedTasks / tasks.length) * 100)}% of total` : 'No tasks yet'}
                      </Typography>
                    </Box>
                  </Paper>
                </Grid>

                {/* Pending Tasks Card */}
                <Grid item xs={12} sm={6} md={4} sx={{ display: 'flex' }}>
                  <Paper 
                    elevation={2} 
                    sx={{ 
                      p: { xs: 2, sm: 3 },
                      height: { xs: 'auto', sm: '180px' },
                      minHeight: { xs: '140px' },
                      width: '100%',
                      borderRadius: 2,
                      backgroundColor: 'white',
                      borderLeft: '4px solid #ff9800',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      transition: 'transform 0.2s, box-shadow 0.2s',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: 3
                      }
                    }}
                  >
                    <Box display="flex" alignItems="center" mb={2}>
                      <PendingIcon color="warning" sx={{ mr: 1, fontSize: { xs: 20, sm: 24 } }} />
                      <Typography variant="h6" sx={{ fontWeight: 600, fontSize: { xs: '1rem', sm: '1.1rem' } }}>Pending</Typography>
                    </Box>
                    <Box sx={{ mt: 1 }}>
                      <Typography variant="h4" sx={{ 
                        fontWeight: 'bold', 
                        mb: 0.5,
                        fontSize: { xs: '1.75rem', sm: '2.125rem' }
                      }}>
                        {pendingTasks}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem' } }}>
                        {tasks.length > 0 ? `${Math.round((pendingTasks / tasks.length) * 100)}% of total` : 'No tasks yet'}
                      </Typography>
                    </Box>
                  </Paper>
                </Grid>

                {/* Productivity Card */}
                <Grid item xs={12} sm={6} md={4} sx={{ display: 'flex' }}>
                  <Paper 
                    elevation={2} 
                    sx={{ 
                      p: { xs: 2, sm: 3 },
                      height: { xs: 'auto', sm: '180px' },
                      minHeight: { xs: '140px' },
                      width: '100%',
                      borderRadius: 2,
                      backgroundColor: 'white',
                      borderLeft: '4px solid #2196f3',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      transition: 'transform 0.2s, box-shadow 0.2s',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: 3
                      }
                    }}
                  >
                    <Box display="flex" alignItems="center" mb={2}>
                      <TrendingUpIcon color="info" sx={{ mr: 1, fontSize: { xs: 20, sm: 24 } }} />
                      <Typography variant="h6" sx={{ fontWeight: 600, fontSize: { xs: '1rem', sm: '1.1rem' } }}>Productivity</Typography>
                    </Box>
                    <Box sx={{ mt: 1 }}>
                      <Typography variant="h4" sx={{ 
                        fontWeight: 'bold', 
                        mb: 0.5,
                        fontSize: { xs: '1.75rem', sm: '2.125rem' }
                      }}>
                        {tasks.length > 0 ? `${Math.round((completedTasks / tasks.length) * 100)}%` : '0%'}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem' } }}>
                        Overall completion rate
                      </Typography>
                    </Box>
                  </Paper>
                </Grid>
              </Grid>
            </Box>

            {/* Priority Distribution Chart */}
            <Box sx={{ mb: 4 }}>
              <Paper elevation={2} sx={{ p: 3, borderRadius: 2, backgroundColor: 'white' }}>
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  Task Priority Distribution
                </Typography>
                <Box sx={{ width: '100%', height: 300, display: 'flex', justifyContent: 'center' }}>
                  {tasks.length > 0 ? (
                    <PieChart
                      series={[
                        {
                          data: priorityData,
                          innerRadius: 60,
                          outerRadius: 120,
                          paddingAngle: 5,
                          cornerRadius: 5,
                          startAngle: -90,
                          endAngle: 270,
                          cx: '50%',
                          cy: '50%',
                          highlightScope: { faded: 'global', highlighted: 'item' },
                          faded: { innerRadius: 60, additionalRadius: -30, color: 'gray' },
                        },
                      ]}
                      width={500}
                      height={300}
                      sx={{
                        width: '100%',
                        maxWidth: '100%',
                        [`& .${pieArcLabelClasses.root}`]: {
                          fill: 'white',
                          fontWeight: 'bold',
                        }
                      }}
                    />
                  ) : (
                    <Box 
                      display="flex" 
                      justifyContent="center" 
                      alignItems="center" 
                      height="100%"
                      flexDirection="column"
                      textAlign="center"
                      p={2}
                    >
                      <HourglassIcon color="disabled" sx={{ fontSize: 48, mb: 2 }} />
                      <Typography variant="body1" color="text.secondary">
                        No tasks yet. Start adding tasks to see your priority distribution.
                      </Typography>
                    </Box>
                  )}
                </Box>
              </Paper>
            </Box>
          </Grid>

          {/* Right Column - Productivity Insights */}
          <Grid item xs={12} lg={5} sx={{ maxWidth: '100%', flexBasis: '100%' }}>
            <Paper elevation={2} sx={{ p: 3, mb: 3, borderRadius: 2, backgroundColor: 'white' }}>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                Productivity Insights
              </Typography>
              
              {/* Most Productive Time */}
              <Box sx={{ mb: 3 }}>
                <Box display="flex" alignItems="center" mb={1}>
                  <TimeIcon color="primary" sx={{ mr: 1, fontSize: 20 }} />
                  <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>Most Productive Time</Typography>
                </Box>
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  bgcolor: 'action.hover', 
                  p: 2, 
                  borderRadius: 1,
                  mb: 1
                }}>
                  {productivityInsights.mostProductiveTime.period === 'morning' && (
                    <MorningIcon color="warning" sx={{ mr: 2, fontSize: 32 }} />
                  )}
                  {productivityInsights.mostProductiveTime.period === 'afternoon' && (
                    <AfternoonIcon color="warning" sx={{ mr: 2, fontSize: 32 }} />
                  )}
                  {productivityInsights.mostProductiveTime.period === 'evening' && (
                    <NightIcon color="primary" sx={{ mr: 2, fontSize: 32 }} />
                  )}
                  {productivityInsights.mostProductiveTime.period === 'night' && (
                    <NightIcon color="secondary" sx={{ mr: 2, fontSize: 32 }} />
                  )}
                  <Box>
                    <Typography variant="body1" sx={{ textTransform: 'capitalize', fontWeight: 500 }}>
                      {productivityInsights.mostProductiveTime.period}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {productivityInsights.mostProductiveTime.count} tasks completed
                    </Typography>
                  </Box>
                </Box>
              </Box>

              {/* Best Day */}
              <Box sx={{ mb: 3 }}>
                <Box display="flex" alignItems="center" mb={1}>
                  <EventIcon color="primary" sx={{ mr: 1, fontSize: 20 }} />
                  <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>Best Day</Typography>
                </Box>
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  bgcolor: 'action.hover', 
                  p: 2, 
                  borderRadius: 1,
                  mb: 1
                }}>
                  <Box sx={{ 
                    width: 48, 
                    height: 48, 
                    borderRadius: '50%', 
                    bgcolor: 'primary.light', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    mr: 2
                  }}>
                    <Typography variant="h6" color="primary.contrastText">
                      {productivityInsights.bestDay.name?.charAt(0) || 'N'}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      {productivityInsights.bestDay.name || 'N/A'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {productivityInsights.bestDay.count} tasks completed
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </Paper>

            {/* Weekly Summary */}
            <Paper elevation={2} sx={{ p: 3, mb: 3, borderRadius: 2, backgroundColor: 'white' }}>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                Weekly Summary
              </Typography>
              <Box sx={{ mt: 3, height: 200 }}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Daily Completion
                </Typography>
                <BarChart
                  xAxis={[
                    {
                      data: dateLabels,
                      scaleType: 'band',
                      tickLabelStyle: {
                        fontSize: 12,
                      },
                    },
                  ]}
                  series={[
                    {
                      data: weeklyCompletionData,
                      color: theme.palette.primary.main,
                      valueFormatter: (value) => `${value} task${value !== 1 ? 's' : ''}`,
                    },
                  ]}
                  height={150}
                  margin={{ top: 20, right: 10, left: 10, bottom: 30 }}
                  sx={{
                    '& .MuiChartsAxis-tickLabel': {
                      fontSize: '0.75rem',
                    },
                  }}
                />
              </Box>
            </Paper>

            {/* Recent Activity */}
            <Paper elevation={2} sx={{ p: 3, borderRadius: 2, backgroundColor: 'white' }}>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                Recent Activity
              </Typography>
              {recentCompleted.length > 0 ? (
                <List>
                  {recentCompleted.map((task, index) => (
                    <React.Fragment key={task.id}>
                      <ListItem disableGutters>
                        <ListItemIcon sx={{ minWidth: 36 }}>
                          <CheckCircleIcon color="success" />
                        </ListItemIcon>
                        <ListItemText
                          primary={task.title}
                          secondary={`Completed on ${new Date(task.completedAt?.toDate?.() || task.completedAt).toLocaleDateString()}`}
                          primaryTypographyProps={{
                            sx: {
                              textDecoration: 'line-through',
                              color: 'text.secondary'
                            }
                          }}
                        />
                        <Chip 
                          label={task.priority} 
                          size="small" 
                          sx={{
                            textTransform: 'capitalize',
                            bgcolor: task.priority === 'high' ? 'error.light' : 
                                     task.priority === 'medium' ? 'warning.light' : 'success.light',
                            color: 'white',
                            fontWeight: 500
                          }}
                        />
                      </ListItem>
                      {index < recentCompleted.length - 1 && <Divider component="li" />}
                    </React.Fragment>
                  ))}
                </List>
              ) : (
                <Box 
                  display="flex" 
                  flexDirection="column" 
                  alignItems="center" 
                  justifyContent="center" 
                  p={3}
                  textAlign="center"
                >
                  <HourglassIcon color="disabled" sx={{ fontSize: 48, mb: 2, opacity: 0.5 }} />
                  <Typography variant="body1" color="text.secondary">
                    No recent activity. Complete some tasks to see them here.
                  </Typography>
                </Box>
              )}
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </Layout>
  );
}