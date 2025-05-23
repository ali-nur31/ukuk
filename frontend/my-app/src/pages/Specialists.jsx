import React from 'react';

const SPECIALISTS = [
  { id: 1, name: 'Иван Иванов', role: 'Кредитный эксперт' },
  { id: 2, name: 'Мария Петрова', role: 'Ипотечный консультант' },
  { id: 3, name: 'Сергей Смирнов', role: 'Финансовый аналитик' },
  { id: 4, name: 'Анна Кузнецова', role: 'Страховой агент' },
];

const Specialists = () => {
  return (
    <div style={{ maxWidth: 500, margin: '0 auto', padding: '2rem 0' }}>
      <h2 style={{ marginBottom: '1.5rem', color: '#1976d2' }}>Наши специалисты</h2>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {SPECIALISTS.map(s => (
          <li key={s.id} style={{
            background: '#f5f6fa',
            borderRadius: 8,
            marginBottom: 16,
            padding: '18px 20px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
          }}>
            <div style={{ fontWeight: 600, fontSize: '1.15rem', color: '#1976d2' }}>{s.name}</div>
            <div style={{ color: '#555', fontSize: '1rem', marginTop: 4 }}>{s.role}</div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Specialists; 