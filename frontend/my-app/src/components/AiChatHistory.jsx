import React, { useState } from 'react';
import {
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Typography,
  Box,
  Divider,
  IconButton,
  Collapse
} from '@mui/material';
import { 
  Chat as ChatIcon,
  ExpandLess as ExpandLessIcon,
  ExpandMore as ExpandMoreIcon
} from '@mui/icons-material';

const AiChatHistory = ({ chats, onChatSelect, selectedChatId }) => {
  const [isExpanded, setIsExpanded] = useState(true);

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  // Оставляем только заглушку
  const chatsWithPlaceholder = [
    {
      id: '/',
      title: 'Кылмыштар кандай учурларда пайда болот?',
      lastMessage: 'Кылмыштардын пайда болушунун негизги себептери...'
    }
  ];

  return (
    <Box sx={{ mt: 2 }}>
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        px: 2,
        py: 1
      }}>
        <Typography
          variant="subtitle2"
          sx={{
            color: 'text.secondary',
            fontWeight: 'medium'
          }}
        >
          Сүйлөшүүлөрдүн тарыхы
        </Typography>
        <IconButton 
          onClick={toggleExpand}
          size="small"
          sx={{ 
            color: 'text.secondary',
            '&:hover': {
              color: 'primary.main'
            }
          }}
        >
          {isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
        </IconButton>
      </Box>
      <Collapse in={isExpanded}>
        <List sx={{ py: 0 }}>
          {chatsWithPlaceholder.map((chat) => (
            <React.Fragment key={chat.id}>
              <ListItem
                button
                onClick={() => onChatSelect(chat.id)}
                selected={selectedChatId === chat.id}
                sx={{
                  py: 1,
                  px: 2,
                  '&.Mui-selected': {
                    backgroundColor: 'primary.light + 20',
                    '&:hover': {
                      backgroundColor: 'primary.light + 30',
                    },
                  },
                }}
              >
                <ListItemIcon sx={{ minWidth: 36 }}>
                  <ChatIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText
                  primary={chat.title || 'Жаңы сүйлөшүү'}
                  secondary={chat.lastMessage}
                  primaryTypographyProps={{
                    variant: 'body2',
                    noWrap: true,
                  }}
                  secondaryTypographyProps={{
                    variant: 'caption',
                    noWrap: true,
                  }}
                />
              </ListItem>
              <Divider variant="inset" component="li" />
            </React.Fragment>
          ))}
        </List>
      </Collapse>
    </Box>
  );
};

export default AiChatHistory; 