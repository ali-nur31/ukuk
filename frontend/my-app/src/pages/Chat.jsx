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
        // res.data — массив сообщений, сгруппируем по senderId
        const counts = {};
        res.data.forEach(msg => {
          counts[msg.senderId] = (counts[msg.senderId] || 0) + 1;
        });
        setUnread(counts);
      } catch (e) {
        setUnread({});
      }
    };
    fetchUnread();
  }, [user, messages]);

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
        setMessages(prev => [...prev, msg]);
      }
      // Обновить непрочитанные
      setUnread(prev => ({ ...prev, [msg.senderId]: (prev[msg.senderId] || 0) + 1 }));
    });
    socketRef.current.on('messages_read', ({ receiverId }) => {
      // Обнуляем счетчик для этого контакта
      setUnread(prev => ({ ...prev, [receiverId]: 0 }));
    });
    return () => {
      socketRef.current.disconnect();
    };
  }, [user, selectedContact]);

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
      setMessages(res.data);
      // Пометить сообщения как прочитанные
      await axios.put(`${API_URL}/chat/read/${contactId}`, {}, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setUnread(prev => ({ ...prev, [contactId]: 0 }));
      // Сообщить через сокет
      socketRef.current.emit('mark_read', { senderId: contactId, receiverId: user.user.id });
    } catch (e) {
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
    try {
      const res = await axios.post(`${API_URL}/chat/send`, {
        receiverId: selectedContact.id,
        content: newMessage
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setMessages(prev => [...prev, res.data]);
      setNewMessage('');
      // WebSocket отправка (для real-time)
      socketRef.current.emit('send_message', {
        senderId: user.user.id,
        receiverId: selectedContact.id,
        content: newMessage
      });
    } catch (e) {}
  };

  return (
    <div style={{ display: 'flex', height: '80vh', border: '1px solid #eee', borderRadius: 8, overflow: 'hidden' }}>
      {/* Контакты */}
      <div style={{ width: 250, borderRight: '1px solid #eee', overflowY: 'auto', background: '#fafbfc' }}>
        <h3 style={{ padding: 16, margin: 0 }}>Контакты</h3>
        {contacts.map(c => (
          <div
            key={c.id}
            onClick={() => setSelectedContact(c)}
            style={{
              padding: 12,
              cursor: 'pointer',
              background: selectedContact && selectedContact.id === c.id ? '#e3f2fd' : 'transparent',
              borderBottom: '1px solid #f0f0f0',
              position: 'relative'
            }}
          >
            {c.firstName} {c.lastName || ''}
            <div style={{ fontSize: 12, color: '#888' }}>{c.email}</div>
            {unread[c.id] > 0 && (
              <span style={{
                position: 'absolute',
                right: 12,
                top: 12,
                background: '#d32f2f',
                color: '#fff',
                borderRadius: '50%',
                minWidth: 22,
                height: 22,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 13,
                fontWeight: 600
              }}>{unread[c.id]}</span>
            )}
          </div>
        ))}
      </div>
      {/* Чат */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <div style={{ flex: 1, overflowY: 'auto', padding: 16, background: '#fff' }}>
          {loading ? <div>Загрузка...</div> : (
            Array.isArray(messages) && messages.length > 0 ? (
              [...messages].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt)).map((msg, i) => (
                <div key={msg.id || i} style={{
                  textAlign: user && user.user && msg.senderId === user.user.id ? 'right' : 'left',
                  margin: '8px 0'
                }}>
                  <div style={{ fontSize: 12, color: '#666', marginBottom: 4 }}>
                    {user && user.user && msg.senderId === user.user.id
                      ? 'Вы'
                      : (msg.sender && (msg.sender.firstName || msg.sender.lastName)
                        ? `${msg.sender.firstName || ''} ${msg.sender.lastName || ''}`.trim()
                        : 'Пользователь')}
                    {' • '}
                    {msg.createdAt ? new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
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
              <div style={{ color: '#aaa', textAlign: 'center', marginTop: 40 }}>Нет сообщений</div>
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
              placeholder="Введите сообщение..."
              style={{ flex: 1, padding: 8, borderRadius: 4, border: '1px solid #ccc', marginRight: 8 }}
            />
            <button type="submit" style={{ padding: '8px 16px', borderRadius: 4, background: '#1976d2', color: '#fff', border: 'none' }}>Отправить</button>
          </form>
        )}
      </div>
    </div>
  );
};

export default Chat; 