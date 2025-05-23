import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/components/_sidebar.scss';

const PEOPLE = [
  { id: 1, name: 'Иван Иванов' },
  { id: 2, name: 'Мария Петрова' },
  { id: 3, name: 'Сергей Смирнов' },
  { id: 4, name: 'Анна Кузнецова' },
];

const CHAT_HISTORY = [
  { id: 1, title: 'Вопрос по договору' },
  { id: 2, title: 'Консультация по кредиту' },
  { id: 3, title: 'Страхование авто' },
];

const Sidebar = ({ collapsed, setCollapsed }) => {
  const [peopleOpen, setPeopleOpen] = useState(true);
  const [historyOpen, setHistoryOpen] = useState(true);
  const navigate = useNavigate();

  const handleChat = (id) => {
    navigate(`/chat/${id}`);
  };

  const handleSpecialistsPage = () => {
    navigate('/specialists');
  };

  const handleHome = () => {
    navigate('/');
  };

  return (
    <aside className={`sidebar${collapsed ? ' sidebar--collapsed' : ''}`}>
      <div className="sidebar__logo-row">
        <div className="sidebar__logo" onClick={handleHome} style={{ cursor: 'pointer' }}>Law.Ai</div>
        <button className="sidebar__collapse" onClick={() => setCollapsed(true)}>
          ⮜
        </button>
      </div>
      <button className="sidebar__specialists-btn" onClick={handleSpecialistsPage}>
        Все специалисты
      </button>
      <div className="sidebar__people">
        <div
          className="sidebar__section-title sidebar__people-title"
          onClick={() => setPeopleOpen((v) => !v)}
          style={{ cursor: 'pointer', userSelect: 'none', display: 'flex', alignItems: 'center', gap: 6 }}
        >
          Чаты с людьми
          <span style={{ fontSize: 18 }}>{peopleOpen ? '▼' : '▲'}</span>
        </div>
        {peopleOpen && (
          <ul className="sidebar__people-list">
            {PEOPLE.map(person => (
              <li
                key={person.id}
                className="sidebar__person"
                onClick={() => handleChat(person.id)}
              >
                {person.name}
              </li>
            ))}
          </ul>
        )}
      </div>
      <div className="sidebar__history">
        <div
          className="sidebar__section-title sidebar__history-title"
          onClick={() => setHistoryOpen((v) => !v)}
          style={{ cursor: 'pointer', userSelect: 'none', display: 'flex', alignItems: 'center', gap: 6 }}
        >
          История чатов с AI
          <span style={{ fontSize: 18 }}>{historyOpen ? '▼' : '▲'}</span>
        </div>
        {historyOpen && (
          <ul className="sidebar__history-list">
            {CHAT_HISTORY.map(chat => (
              <li key={chat.id} className="sidebar__history-item">
                {chat.title}
              </li>
            ))}
          </ul>
        )}
      </div>
    </aside>
  );
};

export default Sidebar; 