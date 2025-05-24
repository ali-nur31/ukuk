import React, { useState, useEffect } from 'react';
import { getAllProfessionals } from '../api';
import '../styles/pages/_specialists.scss';

const Specialists = () => {
    const [professionals, setProfessionals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filters, setFilters] = useState({
        professionalType: '',
        specialization: '',
        language: ''
    });

    useEffect(() => {
        fetchProfessionals();
    }, []);

    const fetchProfessionals = async () => {
        try {
            setLoading(true);
            const data = await getAllProfessionals();
            setProfessionals(data);
            setError(null);
        } catch (err) {
            setError('Failed to fetch professionals. Please try again later.');
            console.error('Error fetching professionals:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const filteredProfessionals = professionals.filter(professional => {
        return (
            (!filters.professionalType || professional.professionalTypeName.toLowerCase().includes(filters.professionalType.toLowerCase())) &&
            (!filters.specialization || professional.specializations.some(spec => 
                spec.toLowerCase().includes(filters.specialization.toLowerCase())
            )) &&
            (!filters.language || professional.languages.some(lang => 
                lang.toLowerCase().includes(filters.language.toLowerCase())
            ))
        );
    });

    if (loading) {
        return (
            <div className="specialists-page loading">
                <div className="spinner"></div>
                <p>Loading professionals...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="specialists-page error">
                <p>{error}</p>
                <button onClick={fetchProfessionals}>Try Again</button>
            </div>
        );
    }

    return (
        <div className="specialists-page">
            <h1>Наши специалисты</h1>
            
            <div className="filters">
                <input
                    type="text"
                    name="professionalType"
                    placeholder="Тип профессии"
                    value={filters.professionalType}
                    onChange={handleFilterChange}
                />
                <input
                    type="text"
                    name="specialization"
                    placeholder="Специализация"
                    value={filters.specialization}
                    onChange={handleFilterChange}
                />
                <input
                    type="text"
                    name="language"
                    placeholder="Язык"
                    value={filters.language}
                    onChange={handleFilterChange}
                />
            </div>

            <div className="professionals-grid">
                {filteredProfessionals.map(professional => (
                    <div key={professional.id} className="professional-card">
                        <div className="professional-header">
                            <h2>{professional.firstName} {professional.lastName}</h2>
                            <span className="professional-type">{professional.professionalTypeName}</span>
                        </div>
                        
                        <div className="professional-info">
                            <div className="info-section">
                                <h3>О специалисте</h3>
                                <p>{professional.about}</p>
                            </div>

                            <div className="info-section">
                                <h3>Образование</h3>
                                <p>{professional.education}</p>
                            </div>

                            <div className="info-section">
                                <h3>Сертификаты</h3>
                                <p>{professional.certifications}</p>
                            </div>

                            <div className="info-section">
                                <h3>Опыт работы</h3>
                                <p>{professional.experience} лет</p>
                            </div>

                            <div className="info-section">
                                <h3>Почасовая ставка</h3>
                                <p>${professional.hourlyRate}/час</p>
                            </div>

                            <div className="info-section">
                                <h3>Специализации</h3>
                                <div className="tags">
                                    {professional.specializations.map((spec, index) => (
                                        <span key={index} className="tag">{spec}</span>
                                    ))}
                                </div>
                            </div>

                            <div className="info-section">
                                <h3>Языки</h3>
                                <div className="tags">
                                    {professional.languages.map((lang, index) => (
                                        <span key={index} className="tag">{lang}</span>
                                    ))}
                                </div>
                            </div>

                            <div className="info-section">
                                <h3>Контакты</h3>
                                <p>📍 {professional.location}</p>
                                <p>📞 {professional.contactPhone}</p>
                                {professional.socialLinks?.linkedin && (
                                    <a 
                                        href={professional.socialLinks.linkedin}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="social-link"
                                    >
                                        LinkedIn Profile
                                    </a>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {filteredProfessionals.length === 0 && (
                <div className="no-results">
                    <p>No professionals found matching your criteria.</p>
                </div>
            )}
        </div>
    );
};

export default Specialists; 