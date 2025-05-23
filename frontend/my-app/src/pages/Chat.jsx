import React, { useState } from 'react';
import { useParams } from 'react-router-dom';

const PEOPLE = [
  { id: 1, name: 'Иван Иванов' },
  { id: 2, name: 'Мария Петрова' },
  { id: 3, name: 'Сергей Смирнов' },
  { id: 4, name: 'Анна Кузнецова' },
];

const Chat = () => {
  const { id } = useParams();
  const person = PEOPLE.find(p => p.id === Number(id));
  const [messages, setMessages] = useState([
    { from: 'them', text: 'Здравствуйте! Чем могу помочь?' }
  ]);
  const [input, setInput] = useState('');

  const sendMessage = () => {
    if (input.trim()) {
      setMessages([...messages, { from: 'me', text: input }]);
      setInput('');
    }
  };

  if (!person) return <div style={{ padding: 32 }}>Пользователь не найден</div>;

  return (
    <div style={{ maxWidth: 600, margin: '0 auto', padding: '2rem 0' }}>
      <h2 style={{ color: '#1976d2', marginBottom: 24 }}>Чат с {person.name}</h2>
      <div style={{ background: '#f5f6fa', borderRadius: 8, minHeight: 200, padding: 20, marginBottom: 16 }}>
        {messages.map((msg, idx) => (
          <div key={idx} style={{
            textAlign: msg.from === 'me' ? 'right' : 'left',
            margin: '8px 0',
            color: msg.from === 'me' ? '#1976d2' : '#222'
          }}>
            {msg.text}
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Введите сообщение..."
          style={{ flex: 1, padding: 10, borderRadius: 6, border: '1px solid #e0e0e0' }}
          onKeyDown={e => { if (e.key === 'Enter') sendMessage(); }}
        />
        <button
          onClick={sendMessage}
          style={{ background: '#1976d2', color: '#fff', border: 'none', borderRadius: 6, padding: '0 22px', fontWeight: 500 }}
        >
          Отправить
        </button>
      </div>
    </div>
  );
};

export default Chat; 