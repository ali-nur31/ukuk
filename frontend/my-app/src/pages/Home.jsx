import React, { useState } from 'react';
import '../styles/components/_home.scss';

const Home = () => {
    const [input, setInput] = useState('');

    return (
        <div style={{
            minHeight: '100vh',
            background: '#fff',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            color: '#222',
            paddingBottom: 0
        }}>
            <div style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                width: '100%'
            }}>
                <h1 style={{
                    fontSize: '2.5rem',
                    fontWeight: 600,
                    marginBottom: 32,
                    color: '#222',
                    textAlign: 'center',
                    letterSpacing: 1
                }}>
                    Чем я могу помочь?
                </h1>
                <form
                    style={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        gap: 12,
                        marginTop: 12
                    }}
                    onSubmit={e => { e.preventDefault(); }}
                >
                    <input
                        type="text"
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        placeholder="Спросите что-нибудь..."
                        style={{
                            width: 380,
                            maxWidth: '90vw',
                            padding: '16px 20px',
                            borderRadius: 18,
                            border: '1px solid #e0e0e0',
                            fontSize: '1.1rem',
                            background: '#f5f6fa',
                            color: '#222',
                            outline: 'none',
                        }}
                    />
                    <button
                        type="submit"
                        style={{
                            background: '#1976d2',
                            color: '#fff',
                            border: 'none',
                            borderRadius: 16,
                            padding: '0 24px',
                            fontWeight: 500,
                            fontSize: '1.05rem',
                            height: 48,
                            cursor: 'pointer',
                            transition: 'background 0.18s'
                        }}
                    >
                        Отправить
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Home;

