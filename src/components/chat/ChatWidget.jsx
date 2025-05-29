import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  Box, 
  IconButton, 
  TextField, 
  Paper, 
  Typography, 
  Avatar,
  Button,
  Slide,
  Fade,
  CircularProgress,
  Tooltip,
  Alert
} from '@mui/material';
import { 
  Chat as ChatIcon, 
  Send as SendIcon, 
  Close as CloseIcon,
  SmartToy as BotIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { sendMessageToAI, resetChatHistory } from '../../services/chatService';

const ChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const handleResetConversation = () => {
    resetChatHistory();
    
    setMessages([{
      id: 1, 
      text: 'Hello! I\'m your PlanMate AI assistant. How can I help you with your tasks and productivity today?', 
      sender: 'bot',
      timestamp: new Date()
    }]);
  };
  const [messages, setMessages] = useState([
    { 
      id: 1, 
      text: 'Hello! I\'m your PlanMate AI assistant. How can I help you with your tasks and productivity today?', 
      sender: 'bot',
      timestamp: new Date()
    }
  ]);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const toggleChat = useCallback(() => {
    setIsOpen(prev => !prev);
    if (!isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 300);
    }
  }, [isOpen]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    const trimmedMessage = message.trim();
    if (!trimmedMessage || isLoading) return;

    const userMessage = {
      id: Date.now(),
      text: trimmedMessage,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setMessage('');
    setError(null);
    setIsLoading(true);

    try {
      const aiResponse = await sendMessageToAI([{
        role: 'user',
        parts: [{ text: trimmedMessage }]
      }]);
      
      if (!aiResponse) {
        throw new Error('No response from AI');
      }
      
      const botResponse = {
        id: Date.now() + 1,
        text: aiResponse,
        sender: 'bot',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, botResponse]);
    } catch (err) {
      console.error('Error getting AI response:', err);
      setError('Failed to get response from AI. Please try again.');
      
      const errorMessage = {
        id: Date.now() + 1,
        text: 'Sorry, I encountered an error. Please try again in a moment.',
        sender: 'bot',
        timestamp: new Date(),
        isError: true
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        toggleChat();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [toggleChat]);

  return (
    <Box sx={{ position: 'fixed', bottom: 24, right: 24, zIndex: 1300 }}>
      {/* Chat Window */}
      <Slide direction="left" in={isOpen} mountOnEnter unmountOnExit>
        <Paper
          elevation={6}
          sx={{
            position: 'fixed',
            bottom: { xs: 80, sm: 24 },
            right: { xs: 16, sm: 24 },
            width: { xs: 'calc(100% - 32px)', sm: 380 },
            maxWidth: '100%',
            height: { xs: 'calc(100% - 100px)', sm: 600 },
            maxHeight: { xs: 'calc(100vh - 100px)', sm: 'calc(100vh - 120px)' },
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            zIndex: 1300,
            borderRadius: { xs: 3, sm: 4 },
            bgcolor: 'background.paper',
            boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
            transform: 'scale(1)',
            transformOrigin: 'bottom right',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
          }}
        >
          {/* Chat Header */}
          <Box 
            sx={{ 
              bgcolor: 'primary.main', 
              color: 'white', 
              p: 2, 
              display: 'flex', 
              alignItems: 'center',
              justifyContent: 'space-between'
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <BotIcon />
              <Typography variant="subtitle1" fontWeight="bold">PlanMate AI Assistant</Typography>
              {isLoading && (
                <CircularProgress 
                  size={16} 
                  thickness={5}
                  sx={{ ml: 1, color: 'white' }} 
                />
              )}
            </Box>
            <IconButton 
              size="small" 
              color="inherit" 
              onClick={toggleChat}
              sx={{ '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' } }}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          </Box>

          {/* Messages */}
          <Box 
            sx={{ 
              flex: 1, 
              p: 2, 
              overflowY: 'auto',
              bgcolor: 'background.paper',
              display: 'flex',
              flexDirection: 'column',
              gap: 1
            }}
          >
            {messages.map((msg) => (
              <Box 
                key={msg.id}
                sx={{
                  alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                  maxWidth: '80%'
                }}
              >
                <Box
                  sx={{
                    p: 1.5,
                    borderRadius: 2,
                    bgcolor: msg.sender === 'user' 
                      ? 'primary.main' 
                      : msg.isError 
                        ? 'error.light' 
                        : 'grey.200',
                    color: msg.sender === 'user' || msg.isError ? 'white' : 'text.primary',
                    boxShadow: 1,
                    position: 'relative',
                    overflow: 'hidden'
                  }}
                >
                  {msg.isError && (
                    <Box 
                      sx={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        height: 3,
                        bgcolor: 'error.dark',
                      }}
                    />
                  )}
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      whiteSpace: 'pre-wrap',
                      wordBreak: 'break-word',
                      pt: msg.isError ? 1.5 : 0
                    }}
                  >
                    {msg.text}
                  </Typography>
                  <Box 
                    sx={{ 
                      display: 'flex', 
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      mt: 1,
                      pt: 0.5,
                      borderTop: '1px solid',
                      borderColor: msg.sender === 'user' 
                        ? 'rgba(255,255,255,0.1)' 
                        : 'rgba(0,0,0,0.1)'
                    }}
                  >
                    <Typography 
                      variant="caption" 
                      sx={{ 
                        opacity: 0.7,
                        color: msg.sender === 'user' || msg.isError 
                          ? 'rgba(255,255,255,0.8)' 
                          : 'text.secondary'
                      }}
                    >
                      {msg.sender === 'user' ? 'You' : 'PlanMate AI'}
                    </Typography>
                    <Typography 
                      variant="caption" 
                      sx={{ 
                        opacity: 0.7,
                        color: msg.sender === 'user' || msg.isError 
                          ? 'rgba(255,255,255,0.8)' 
                          : 'text.secondary'
                      }}
                    >
                      {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </Typography>
                  </Box>
                </Box>
              </Box>
            ))}
            <div ref={messagesEndRef} />
          </Box>

          {/* Message Input */}
          <Box 
            component="form" 
            onSubmit={handleSendMessage}
            sx={{ 
              p: 2, 
              borderTop: '1px solid',
              borderColor: 'divider',
              bgcolor: 'background.paper',
              position: 'relative'
            }}
          >
            {error && (
              <Alert 
                severity="error" 
                sx={{ 
                  mb: 2, 
                  py: 0.5,
                  '& .MuiAlert-message': { py: 1 }
                }}
              >
                {error}
              </Alert>
            )}
            <Box sx={{ display: 'flex', gap: 1, position: 'relative' }}>
              <TextField
                inputRef={inputRef}
                fullWidth
                size="small"
                placeholder="Ask me anything..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                variant="outlined"
                disabled={isLoading}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage(e);
                  }
                }}
                sx={{ 
                  '& .MuiOutlinedInput-root': { 
                    borderRadius: 4,
                    bgcolor: 'background.paper',
                    pr: 6
                  },
                  '& .Mui-disabled': {
                    bgcolor: 'action.disabledBackground'
                  }
                }}
                multiline
                maxRows={4}
              />
              <Box sx={{ position: 'absolute', right: 12, bottom: 8, display: 'flex', gap: 0.5 }}>
                {isLoading ? (
                  <CircularProgress size={24} />
                ) : message.trim() ? (
                  <Button 
                    type="submit" 
                    variant="contained" 
                    color="primary"
                    disabled={!message.trim() || isLoading}
                    sx={{ 
                      minWidth: 'auto', 
                      width: 32, 
                      height: 32,
                      borderRadius: '50%',
                      p: 0,
                      minHeight: 'auto',
                      '&:hover': {
                        transform: 'scale(1.05)'
                      },
                      transition: 'transform 0.2s',
                      boxShadow: 2
                    }}
                  >
                    <SendIcon fontSize="small" />
                  </Button>
                ) : null}
              </Box>
            </Box>
            <Typography 
              variant="caption" 
              sx={{ 
                display: 'block', 
                textAlign: 'center', 
                mt: 1,
                color: 'text.secondary',
                fontSize: '0.7rem',
                opacity: 0.7
              }}
            >
              Press Enter to send, Shift+Enter for new line
            </Typography>
          </Box>
        </Paper>
      </Slide>

      {/* Floating Button */}
      <Fade in={!isOpen}>
        <Tooltip title="Chat with PlanMate AI (Ctrl+K)" arrow>
          <IconButton
            color="primary"
            aria-label="chat"
            onClick={toggleChat}
            sx={{
              position: 'fixed',
              bottom: { xs: 70, sm: 24 },
              right: { xs: 16, sm: 24 },
              width: { xs: 56, sm: 60 },
              height: { xs: 56, sm: 60 },
              bgcolor: 'primary.main',
              color: 'white',
              boxShadow: 3,
              '&:hover': {
                bgcolor: 'primary.dark',
                transform: 'scale(1.1)',
              },
              transition: 'all 0.2s ease-in-out',
              animation: 'pulse 2s infinite',
              '@keyframes pulse': {
                '0%': { boxShadow: '0 0 0 0 rgba(25, 118, 210, 0.7)' },
                '70%': { boxShadow: '0 0 0 10px rgba(25, 118, 210, 0)' },
                '100%': { boxShadow: '0 0 0 0 rgba(25, 118, 210, 0)' },
              },
              '&::after': {
                content: '""',
                position: 'absolute',
                top: -2,
                right: -2,
                width: 12,
                height: 12,
                bgcolor: 'success.main',
                borderRadius: '50%',
                border: '2px solid white'
              }
            }}
          >
            <ChatIcon fontSize="large" />
          </IconButton>
        </Tooltip>
      </Fade>
    </Box>
  );
};

export default ChatWidget;
