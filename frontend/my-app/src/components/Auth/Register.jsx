import { useState, useEffect } from 'react';
import { registerUser, registerProfessional, getProfessionalTypes } from '../../api';
import '../../styles/components/_auth.scss';
import { Link, useNavigate } from 'react-router-dom';

const Register = () => {
    const [formType, setFormType] = useState('user');
    const [currentStep, setCurrentStep] = useState(1);
    const [professionalTypes, setProfessionalTypes] = useState([]);
    const [formData, setFormData] = useState({
        // Шаг 1: Основная информация
        email: '',
        password: '',
        firstName: '',
        lastName: '',
        // Шаг 2: Профессиональная информация
        professionalTypeName: '',
        experience: '',
        hourlyRate: '',
        // Шаг 3: Образование и квалификация
        education: '',
        certifications: '',
        languages: [''],
        specializations: [''],
        // Шаг 4: Дополнительная информация
        about: '',
        location: '',
        contactPhone: '',
        socialLinks: {
            linkedin: ''
        }
    });
    const [success, setSuccess] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const navigate = useNavigate();

    const totalSteps = 4;

    // Fetch professional types when component mounts
    useEffect(() => {
        const fetchProfessionalTypes = async () => {
            try {
                const types = await getProfessionalTypes();
                setProfessionalTypes(types);
            } catch (error) {
                console.error('Error fetching professional types:', error);
                setErrorMessage('Failed to load professional types. Please try again later.');
            }
        };

        if (formType === 'professional') {
            fetchProfessionalTypes();
        }
    }, [formType]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        if (name.includes('.')) {
            const [parent, child] = name.split('.');
            setFormData(prev => ({
                ...prev,
                [parent]: {
                    ...prev[parent],
                    [child]: value
                }
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: value
            }));
        }
    };

    const handleArrayInputChange = (index, value, field) => {
        setFormData(prev => ({
            ...prev,
            [field]: prev[field].map((item, i) => i === index ? value : item)
        }));
    };

    const addArrayField = (field) => {
        setFormData(prev => ({
            ...prev,
            [field]: [...prev[field], '']
        }));
    };

    const removeArrayField = (index, field) => {
        setFormData(prev => ({
            ...prev,
            [field]: prev[field].filter((_, i) => i !== index)
        }));
    };

    const nextStep = () => {
        setCurrentStep(prev => Math.min(prev + 1, totalSteps));
    };

    const prevStep = () => {
        setCurrentStep(prev => Math.max(prev - 1, 1));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (formType === 'professional' && currentStep < totalSteps) {
            nextStep();
            return;
        }

        try {
            if (formType === 'user') {
                await registerUser({
                    email: formData.email,
                    password: formData.password,
                    firstName: formData.firstName,
                    lastName: formData.lastName
                });
            } else {
                await registerProfessional({
                    ...formData,
                    experience: Number(formData.experience),
                    hourlyRate: Number(formData.hourlyRate),
                    languages: formData.languages.filter(lang => lang.trim() !== ''),
                    specializations: formData.specializations.filter(spec => spec.trim() !== '')
                });
            }
            setSuccess(true);
            setErrorMessage('');
            setTimeout(() => navigate('/login'), 2000);
        } catch (error) {
            setSuccess(false);
            setErrorMessage(error.message || 'Registration failed. Please try again.');
        }
    };

    const renderStepIndicator = () => {
        if (formType !== 'professional') return null;
        
        return (
            <div className="step-indicator">
                {Array.from({ length: totalSteps }, (_, i) => (
                    <div 
                        key={i} 
                        className={`step ${i + 1 === currentStep ? 'active' : ''} ${i + 1 < currentStep ? 'completed' : ''}`}
                    >
                        <div className="step-number">{i + 1}</div>
                        <div className="step-label">
                            {i === 0 && 'Основная информация'}
                            {i === 1 && 'Профессиональная информация'}
                            {i === 2 && 'Образование и квалификация'}
                            {i === 3 && 'Дополнительная информация'}
                        </div>
                    </div>
                ))}
            </div>
        );
    };

    const renderStepContent = () => {
        if (formType === 'user') {
            return (
                <>
                    <input
                        type="email"
                        name="email"
                        placeholder="Email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                    />
                    <input
                        type="password"
                        name="password"
                        placeholder="Пароль"
                        value={formData.password}
                        onChange={handleInputChange}
                        required
                    />
                    <input
                        type="text"
                        name="firstName"
                        placeholder="Имя"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        required
                    />
                    <input
                        type="text"
                        name="lastName"
                        placeholder="Фамилия"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        required
                    />
                </>
            );
        }

        switch (currentStep) {
            case 1:
                return (
                    <>
                        <h3>Основная информация</h3>
                        <input
                            type="email"
                            name="email"
                            placeholder="Email"
                            value={formData.email}
                            onChange={handleInputChange}
                            required
                        />
                        <input
                            type="password"
                            name="password"
                            placeholder="Пароль"
                            value={formData.password}
                            onChange={handleInputChange}
                            required
                        />
                        <input
                            type="text"
                            name="firstName"
                            placeholder="Имя"
                            value={formData.firstName}
                            onChange={handleInputChange}
                            required
                        />
                        <input
                            type="text"
                            name="lastName"
                            placeholder="Фамилия"
                            value={formData.lastName}
                            onChange={handleInputChange}
                            required
                        />
                    </>
                );
            case 2:
                return (
                    <>
                        <h3>Профессиональная информация</h3>
                        <select
                            name="professionalTypeName"
                            value={formData.professionalTypeName}
                            onChange={handleInputChange}
                            required
                            className="select-input"
                        >
                            <option value="">Выберите тип профессии</option>
                            {professionalTypes.map(type => (
                                <option key={type.id} value={type.name}>
                                    {type.name}
                                </option>
                            ))}
                        </select>
                        <input
                            type="number"
                            name="experience"
                            placeholder="Опыт работы (лет)"
                            value={formData.experience}
                            onChange={handleInputChange}
                            required
                        />
                        <input
                            type="number"
                            name="hourlyRate"
                            placeholder="Почасовая ставка"
                            value={formData.hourlyRate}
                            onChange={handleInputChange}
                            required
                        />
                    </>
                );
            case 3:
                return (
                    <>
                        <h3>Образование и квалификация</h3>
                        <input
                            type="text"
                            name="education"
                            placeholder="Образование"
                            value={formData.education}
                            onChange={handleInputChange}
                            required
                        />
                        <input
                            type="text"
                            name="certifications"
                            placeholder="Сертификаты"
                            value={formData.certifications}
                            onChange={handleInputChange}
                            required
                        />
                        <div className="array-inputs">
                            <label>Языки</label>
                            {formData.languages.map((lang, index) => (
                                <div key={index} className="array-input-row">
                                    <input
                                        type="text"
                                        value={lang}
                                        onChange={(e) => handleArrayInputChange(index, e.target.value, 'languages')}
                                        placeholder="Язык"
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => removeArrayField(index, 'languages')}
                                        className="remove-btn"
                                    >
                                        ✕
                                    </button>
                                </div>
                            ))}
                            <button
                                type="button"
                                onClick={() => addArrayField('languages')}
                                className="add-btn"
                            >
                                + Добавить язык
                            </button>
                        </div>

                        <div className="array-inputs">
                            <label>Специализации</label>
                            {formData.specializations.map((spec, index) => (
                                <div key={index} className="array-input-row">
                                    <input
                                        type="text"
                                        value={spec}
                                        onChange={(e) => handleArrayInputChange(index, e.target.value, 'specializations')}
                                        placeholder="Специализация"
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => removeArrayField(index, 'specializations')}
                                        className="remove-btn"
                                    >
                                        ✕
                                    </button>
                                </div>
                            ))}
                            <button
                                type="button"
                                onClick={() => addArrayField('specializations')}
                                className="add-btn"
                            >
                                + Добавить специализацию
                            </button>
                        </div>
                    </>
                );
            case 4:
                return (
                    <>
                        <h3>Дополнительная информация</h3>
                        <textarea
                            name="about"
                            placeholder="О себе"
                            value={formData.about}
                            onChange={handleInputChange}
                            required
                        />
                        <input
                            type="text"
                            name="location"
                            placeholder="Местоположение"
                            value={formData.location}
                            onChange={handleInputChange}
                            required
                        />
                        <input
                            type="tel"
                            name="contactPhone"
                            placeholder="Контактный телефон"
                            value={formData.contactPhone}
                            onChange={handleInputChange}
                            required
                        />
                        <input
                            type="url"
                            name="socialLinks.linkedin"
                            placeholder="LinkedIn профиль"
                            value={formData.socialLinks.linkedin}
                            onChange={handleInputChange}
                        />
                    </>
                );
            default:
                return null;
        }
    };

    return (
        <div className="auth-form">
            {success ? (
                <div className="success-message">
                    <h2>Регистрация прошла успешно! 🎉</h2>
                    <p>Вы теперь можете <Link to="/login">войти</Link> в свой аккаунт.</p>
                </div>
            ) : (
                <>
                    <h1>Создать аккаунт</h1>
                    <div className="form-type-toggle">
                        <button
                            className={formType === 'user' ? 'active' : ''}
                            onClick={() => {
                                setFormType('user');
                                setCurrentStep(1);
                            }}
                        >
                            Пользователь
                        </button>
                        <button
                            className={formType === 'professional' ? 'active' : ''}
                            onClick={() => {
                                setFormType('professional');
                                setCurrentStep(1);
                            }}
                        >
                            Профессионал
                        </button>
                    </div>

                    {renderStepIndicator()}

                    <form onSubmit={handleSubmit}>
                        {renderStepContent()}

                        <div className="form-navigation">
                            {formType === 'professional' && currentStep > 1 && (
                                <button type="button" onClick={prevStep} className="prev-btn">
                                    Назад
                                </button>
                            )}
                            <button type="submit" className="submit-btn">
                                {formType === 'professional' && currentStep < totalSteps ? 'Далее' : 'Зарегистрироваться'}
                            </button>
                        </div>
                    </form>

                    {errorMessage && <div className="error-message">{errorMessage}</div>}
                    <div className="auth-links">
                        Уже есть аккаунт? <Link to="/login">Войти</Link>
                    </div>
                </>
            )}
        </div>
    );
};

export default Register;