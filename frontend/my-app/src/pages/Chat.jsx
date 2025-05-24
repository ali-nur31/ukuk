import React, { useEffect, useState, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getAllProfessionals, getAllUsers } from '../api';
import axios from 'axios';
import { io } from 'socket.io-client';

const API_URL = 'http://127.0.0.1:5000/api';
const SOCKET_URL = 'http://127.0.0.1:5000';

const Chat = () => {
  const { user } = useAuth();
  const [contacts, setContacts] = useState([]);
  const [selectedContact, setSelectedContact] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [unread, setUnread] = useState({}); // { userId: count }
  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);

  // Получить список контактов (все специалисты, если ты user, или все users, если ты professional)
  useEffect(() => {
    const fetchContacts = async () => {
      try {
        if (!user || !user.user) return;
        if (user.user.role === 'professional') {
          // Для профессионала — все пользователи
          const users = await getAllUsers();
          setContacts(users.filter(u => u.id !== user.user.id));
        } else {
          // Для обычного пользователя — все профессионалы
          const pros = await getAllProfessionals();
          setContacts((pros.professionals || pros).map(p => p.user).filter(u => u.id !== user.user.id));
        }
      } catch (e) {
        console.error('Error fetching contacts:', e);
        setContacts([]);
      }
    };
    fetchContacts();
  }, [user]);

  // Получить непрочитанные сообщения
  useEffect(() => {
    const fetchUnread = async () => {
      try {
        const res = await axios.get(`${API_URL}/chat/unread`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        // Группируем сообщения по отправителю
        const counts = {};
        const lastMessages = {};
        res.data.forEach(msg => {
          const senderId = msg.senderId;
          counts[senderId] = (counts[senderId] || 0) + 1;
          // Сохраняем последнее сообщение от каждого отправителя
          if (!lastMessages[senderId] || new Date(msg.createdAt) > new Date(lastMessages[senderId].createdAt)) {
            lastMessages[senderId] = msg;
          }
        });
        setUnread(counts);
        
        // Обновляем список контактов, добавляя отправителей непрочитанных сообщений
        if (user?.user?.role === 'professional') {
          const unreadSenders = res.data.map(msg => msg.sender).filter((sender, index, self) => 
            index === self.findIndex(s => s.id === sender.id)
          );
          setContacts(prevContacts => {
            const existingIds = new Set(prevContacts.map(c => c.id));
            const newContacts = unreadSenders.filter(sender => !existingIds.has(sender.id));
            return [...prevContacts, ...newContacts];
          });
        }
      } catch (e) {
        console.error('Error fetching unread messages:', e);
        setUnread({});
      }
    };
    fetchUnread();
  }, [user, messages]);

  // Получить историю сообщений
  const fetchMessages = async (contactId) => {
    setLoading(true);
    try {
      const res = await axios.get(
        `${API_URL}/chat/history/${contactId}`,
        {
          params: { limit: 50, offset: 0 },
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        }
      );
      // Сортируем сообщения по времени
      const sortedMessages = res.data.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
      setMessages(sortedMessages);
      
      // Пометить сообщения как прочитанные
      if (sortedMessages.length > 0) {
        try {
          await axios.put(`${API_URL}/chat/read/${contactId}`, {}, {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
          });
          setUnread(prev => ({ ...prev, [contactId]: 0 }));
          // Сообщить через сокет
          socketRef.current?.emit('mark_read', { 
            senderId: contactId, 
            receiverId: user.user.id,
            timestamp: new Date().toISOString()
          });
        } catch (error) {
          console.error('Error marking messages as read:', error);
        }
      }
    } catch (e) {
      console.error('Error fetching messages:', e);
      setMessages([]);
    } finally {
      setLoading(false);
    }
  };

  // При выборе контакта — загрузить историю
  useEffect(() => {
    if (selectedContact) {
      fetchMessages(selectedContact.id);
    }
  }, [selectedContact]);

  // Скролл вниз при новых сообщениях
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Отправить сообщение
  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedContact) return;
    
    const messageToSend = {
      receiverId: selectedContact.id,
      content: newMessage.trim()
    };

    try {
      const res = await axios.post(`${API_URL}/chat/send`, messageToSend, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      
      // Добавляем новое сообщение в историю
      setMessages(prev => {
        const newMessages = [...prev, res.data];
        return newMessages.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
      });
      
      setNewMessage('');
      
      // WebSocket отправка (для real-time)
      socketRef.current?.emit('send_message', {
        senderId: user.user.id,
        receiverId: selectedContact.id,
        content: newMessage.trim(),
        timestamp: new Date().toISOString()
      });
    } catch (e) {
      console.error('Error sending message:', e);
    }
  };

  // WebSocket подключение
  useEffect(() => {
    if (!user || !user.user) return;
    
    socketRef.current = io(SOCKET_URL, {
      auth: { token: localStorage.getItem('token') },
      transports: ['websocket'],
    });
    
    socketRef.current.emit('join', user.user.id);
    
    socketRef.current.on('new_message', (msg) => {
      if (selectedContact && (msg.senderId === selectedContact.id || msg.receiverId === selectedContact.id)) {
        setMessages(prev => {
          const newMessages = [...prev, msg];
          return newMessages.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        });
        // Если сообщение получено в активном чате, сразу помечаем как прочитанное
        if (msg.senderId === selectedContact.id) {
          socketRef.current?.emit('mark_read', { 
            senderId: msg.senderId, 
            receiverId: user.user.id,
            timestamp: new Date().toISOString()
          });
          setUnread(prev => ({ ...prev, [msg.senderId]: 0 }));
        }
      } else {
        // Обновить непрочитанные для других чатов
        setUnread(prev => ({ ...prev, [msg.senderId]: (prev[msg.senderId] || 0) + 1 }));
      }
    });
    
    socketRef.current.on('messages_read', ({ senderId, timestamp }) => {
      // Обнуляем счетчик для этого контакта
      setUnread(prev => ({ ...prev, [senderId]: 0 }));
      // Обновляем статус прочтения в сообщениях
      setMessages(prev => prev.map(msg => 
        msg.senderId === senderId && new Date(msg.createdAt) <= new Date(timestamp)
          ? { ...msg, isRead: true }
          : msg
      ));
    });
    
    return () => {
      socketRef.current?.disconnect();
    };
  }, [user, selectedContact]);

  return (
    <div style={{ 
        display: 'flex', 
        height: '100vh',
        width: '100%',
        alignItems: 'center',
        justifyContent: 'center'
    }}>
        <div style={{ 
            display: 'flex', 
            height: '80vh', 
            width: '90%',
            maxWidth: 1200,
            border: '1px solid #eee', 
            borderRadius: 8, 
            overflow: 'hidden',
        }}>
            {/* Контакты */}
            <div style={{ width: 250, borderRight: '1px solid #eee', overflowY: 'auto', background: '#fafbfc' }}>
                <h3 style={{ padding: 16, margin: 0 }}>Байланыштар</h3>
                {contacts.map(c => (
                    <div
                        key={c.id}
                        onClick={() => setSelectedContact(c)}
                        style={{
                            padding: 12,
                            cursor: 'pointer',
                            background: selectedContact && selectedContact.id === c.id ? '#e3f2fd' : 'transparent',
                            borderBottom: '1px solid #f0f0f0',
                            position: 'relative',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '4px'
                        }}
                    >
                        <div style={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'space-between',
                            width: '100%'
                        }}>
                            <div style={{ fontWeight: 500 }}>
                                {c.firstName} {c.lastName || ''}
                            </div>
                            {unread[c.id] > 0 && (
                                <span style={{
                                    background: '#d32f2f',
                                    color: '#fff',
                                    borderRadius: '50%',
                                    minWidth: 22,
                                    height: 22,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: 13,
                                    fontWeight: 600,
                                    padding: '0 6px'
                                }}>{unread[c.id]}</span>
                            )}
                        </div>
                        <div style={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'space-between',
                            width: '100%'
                        }}>
                            <div style={{ fontSize: 12, color: '#888' }}>{c.email}</div>
                            {unread[c.id] > 0 && (
                                <span style={{
                                    fontSize: 12,
                                    color: '#d32f2f',
                                    fontWeight: 500
                                }}>Жаңы билдирүүлөр</span>
                            )}
                        </div>
                    </div>
                ))}
            </div>
            {/* Чат */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                <div style={{ flex: 1, overflowY: 'auto', padding: 16, background: '#fff' }}>
                    {loading ? <div>Жүктөлүүдө...</div> : (
                        Array.isArray(messages) && messages.length > 0 ? (
                            [...messages].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt)).map((msg, i) => (
                                <div key={msg.id || i} style={{
                                    textAlign: user && user.user && msg.senderId === user.user.id ? 'right' : 'left',
                                    margin: '8px 0'
                                }}>
                                    <div style={{ fontSize: 12, color: '#666', marginBottom: 4 }}>
                                        {user && user.user && msg.senderId === user.user.id
                                            ? 'Сиз'
                                            : (msg.sender && (msg.sender.firstName || msg.sender.lastName)
                                                ? `${msg.sender.firstName || ''} ${msg.sender.lastName || ''}`.trim()
                                                : 'Колдонуучу')}
                                        {' • '}
                                        {msg.createdAt ? new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                                        {user && user.user && msg.senderId === user.user.id && (
                                            <span style={{ marginLeft: 4, color: msg.isRead ? '#4caf50' : '#999' }}>
                                                {msg.isRead ? '✓✓' : '✓'}
                                            </span>
                                        )}
                                    </div>
                                    <div style={{
                                        display: 'inline-block',
                                        background: user && user.user && msg.senderId === user.user.id ? '#e3f2fd' : '#f5f5f5',
                                        padding: '8px 12px',
                                        borderRadius: 8,
                                        maxWidth: 320
                                    }}>
                                        {msg.content}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div style={{ color: '#aaa', textAlign: 'center', marginTop: 40 }}>Билдирүүлөр жок</div>
                        )
                    )}
                    <div ref={messagesEndRef} />
                </div>
                {selectedContact && (
                    <form onSubmit={handleSend} style={{ display: 'flex', borderTop: '1px solid #eee', padding: 8, background: '#fafbfc' }}>
                        <input
                            type="text"
                            value={newMessage}
                            onChange={e => setNewMessage(e.target.value)}
                            placeholder="Билдирүү жазыңыз..."
                            style={{ flex: 1, padding: 8, borderRadius: 4, border: '1px solid #ccc', marginRight: 8 }}
                        />
                        <button type="submit" style={{ padding: '8px 16px', borderRadius: 4, background: '#1976d2', color: '#fff', border: 'none' }}>Жөнөтүү</button>
                    </form>
                )}
            </div>
        </div>
    </div>
  );
};

export default Chat; 