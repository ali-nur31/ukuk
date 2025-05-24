import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getChatHistory, sendMessage, getUnreadMessages, markMessagesAsRead } from '../api';
import { getCurrentUser } from '../api';

const Chat = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);

  // Fetch current user and chat history
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [userData, chatData] = await Promise.all([
          getCurrentUser(),
          getChatHistory(userId, { limit: 50 })
        ]);
        setCurrentUser(userData);
        setMessages(chatData.messages || []);
        
        // Mark messages as read
        if (chatData.messages?.length > 0) {
          await markMessagesAsRead(userId);
        }
      } catch (err) {
        setError(err.message);
        if (err.message.includes('unauthorized')) {
          navigate('/login');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    // Set up polling for new messages
    const pollInterval = setInterval(fetchData, 5000);
    return () => clearInterval(pollInterval);
  }, [userId, navigate]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!input.trim() || !currentUser) return;

    try {
      const newMessage = {
        receiverId: Number(userId),
        content: input.trim()
      };

      const response = await sendMessage(newMessage);
      setMessages(prev => [...prev, response]);
      setInput('');
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) {
    return <div style={{ padding: 32, textAlign: 'center' }}>Загрузка чата...</div>;
  }

  if (error) {
    return <div style={{ padding: 32, color: 'red' }}>Ошибка: {error}</div>;
  }

  if (!currentUser) {
    return <div style={{ padding: 32 }}>Пожалуйста, войдите в систему</div>;
  }

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: '2rem 0' }}>
      <div style={{ 
        background: '#fff', 
        borderRadius: 12, 
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        height: '80vh',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* Chat header */}
        <div style={{ 
          padding: '1rem', 
          borderBottom: '1px solid #eee',
          background: '#f8f9fa',
          borderRadius: '12px 12px 0 0'
        }}>
          <h2 style={{ margin: 0, color: '#1976d2' }}>Чат</h2>
        </div>

        {/* Messages container */}
        <div style={{ 
          flex: 1, 
          overflowY: 'auto', 
          padding: '1rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.5rem'
        }}>
          {messages.map((msg, idx) => (
            <div
              key={msg.id || idx}
              style={{
                alignSelf: msg.senderId === currentUser.id ? 'flex-end' : 'flex-start',
                maxWidth: '70%',
                background: msg.senderId === currentUser.id ? '#1976d2' : '#f0f2f5',
                color: msg.senderId === currentUser.id ? '#fff' : '#000',
                padding: '0.75rem 1rem',
                borderRadius: '1rem',
                marginBottom: '0.5rem',
                wordBreak: 'break-word'
              }}
            >
              <div style={{ fontSize: '0.9rem' }}>{msg.content}</div>
              <div style={{ 
                fontSize: '0.75rem', 
                opacity: 0.7,
                marginTop: '0.25rem',
                textAlign: 'right'
              }}>
                {new Date(msg.createdAt).toLocaleTimeString()}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Input area */}
        <div style={{ 
          padding: '1rem',
          borderTop: '1px solid #eee',
          background: '#fff',
          borderRadius: '0 0 12px 12px'
        }}>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Введите сообщение..."
              style={{
                flex: 1,
                padding: '0.75rem',
                borderRadius: '1.5rem',
                border: '1px solid #e0e0e0',
                fontSize: '1rem',
                outline: 'none',
                transition: 'border-color 0.2s',
                '&:focus': {
                  borderColor: '#1976d2'
                }
              }}
              onKeyDown={e => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
            />
            <button
              onClick={handleSendMessage}
              disabled={!input.trim()}
              style={{
                background: input.trim() ? '#1976d2' : '#e0e0e0',
                color: '#fff',
                border: 'none',
                borderRadius: '1.5rem',
                padding: '0.75rem 1.5rem',
                fontWeight: 500,
                cursor: input.trim() ? 'pointer' : 'not-allowed',
                transition: 'background-color 0.2s'
              }}
            >
              Отправить
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chat; 