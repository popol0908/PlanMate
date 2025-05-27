import React from 'react';
import { 
  Container, 
  Box, 
  Paper, 
  Grid, 
  Card, 
  CardContent, 
  Avatar,
  Divider,
  Typography
} from '@mui/material';
import PageTitle from '../components/common/PageTitle';
import { 
  School as SchoolIcon,
  Group as GroupIcon,
  Code as CodeIcon,
  EmojiEvents as TrophyIcon
} from '@mui/icons-material';

const teamMembers = [
  {
    name: 'Paul Angelo Sulla',
    role: 'Frontend Developer',
    avatar: 'PA',
    description: 'Passionate about creating intuitive user interfaces and enhancing user experience.'
  },
  {
    name: 'Paul Jeric Rich P. Minimo',
    role: 'Backend Developer',
    avatar: 'PJ',
    description: 'Focused on building backend systems and ensuring seamless data flow.'
  },
];

const features = [
  {
    icon: <SchoolIcon color="primary" sx={{ fontSize: 40 }} />,
    title: 'Academic Planning',
    description: 'Plan your semesters, track your progress, and stay on top of your academic goals.'
  },
  {
    icon: <CodeIcon color="primary" sx={{ fontSize: 40 }} />,
    title: 'Task Management',
    description: 'Organize your assignments, projects, and study sessions in one place.'
  }
];

export default function AboutUs() {
  return (
    <Container maxWidth="lg" sx={{ minHeight: '100vh', py: 4, pb: 8 }}>
      <PageTitle 
        title="About PlanMate"
        subtitle="Your personal academic companion for better planning and organization"
        icon="/images/Logo.png"
      />

        {/* Mission Section */}
        <Paper elevation={3} sx={{ p: 4, mb: 6, bgcolor: 'primary.light', color: 'primary.contrastText' }}>
          <Typography variant="h4" align="center" gutterBottom>
            Our Mission
          </Typography>
          <Typography variant="body1" align="center" paragraph>
            Our mission is to empower individuals to take full control of their time, goals, and routines through thoughtful and intuitive task management.
            We believe productivity doesn't come from pressure, but from clarity. That's why PlanMate is designed to help you prioritize what truly matters, keep your schedule organized, and make planning feel like progress.
          </Typography>
        </Paper>

        {/* Features Section */}
        <Box sx={{ mb: 6 }}>
          <Typography variant="h4" align="center" gutterBottom>
            Features
          </Typography>
          <Grid container spacing={4} sx={{ mt: 2 }}>
            {features.map((feature, index) => (
              <Grid item xs={12} md={4} key={index}>
                <Card elevation={3} sx={{ height: '100%', p: 3, textAlign: 'center' }}>
                  <Box sx={{ mb: 2 }}>
                    {feature.icon}
                  </Box>
                  <Typography variant="h6" gutterBottom>
                    {feature.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {feature.description}
                  </Typography>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* Team Section */}
        <Box sx={{ mb: 6 }}>
          <Typography variant="h4" align="center" gutterBottom>
            Our Team
          </Typography>
          <Grid container spacing={4} sx={{ mt: 2 }}>
            {teamMembers.map((member, index) => (
              <Grid item xs={12} md={4} key={index}>
                <Card elevation={3} sx={{ p: 3, textAlign: 'center', height: '100%' }}>
                  <Avatar 
                    sx={{ 
                      width: 80, 
                      height: 80, 
                      bgcolor: 'primary.main',
                      mx: 'auto',
                      mb: 2,
                      fontSize: '2rem'
                    }}
                  >
                    {member.avatar}
                  </Avatar>
                  <Typography variant="h6" gutterBottom>
                    {member.name}
                  </Typography>
                  <Typography 
                    variant="subtitle1" 
                    color="primary" 
                    gutterBottom
                    sx={{ mb: 2 }}
                  >
                    {member.role}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {member.description}
                  </Typography>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* Contact Section */}
        <Paper elevation={3} sx={{ p: 4, textAlign: 'center', mb: 8 }}>
          <Typography variant="h5" gutterBottom>
            Have questions or feedback?
          </Typography>
          <Typography variant="body1" paragraph>
            We'd love to hear from you! Reach out to us at:
          </Typography>
          <Typography variant="h6" color="primary">
            contact@planmate.app
          </Typography>
        </Paper>
    </Container>
  );
}