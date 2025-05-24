import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCurrentUser } from '../api';
import { updateUserProfile, uploadProfilePhoto } from '../api';
import { toast } from 'react-toastify';
import { FaUser, FaEnvelope, FaEdit, FaSave, FaTimes, FaSuitcase, FaGraduationCap, FaCertificate, FaLanguage, FaInfoCircle, FaMapMarkerAlt, FaPhone, FaGlobe, FaLinkedin } from 'react-icons/fa';
import '../styles/Account.css';

// Функция для парсинга строк PostgreSQL-массивов вида '{"English","Russian"}' в массив JS
function parsePgArray(str) {
  if (!str) return [];
  if (Array.isArray(str)) return str;
  // Если это JSON-строка массива
  if (str.startsWith('[') || str.startsWith('{')) {
    try {
      // Пробуем JSON.parse
      const parsed = JSON.parse(str.replace(/([a-zA-Z0-9]+):/g, '"$1":'));
      if (Array.isArray(parsed)) return parsed;
    } catch (e) {
      // Если не JSON, парсим вручную
      return str.replace(/^{|}$/g, '').split(',').map(s => s.replace(/"/g, '').trim()).filter(Boolean);
    }
  }
  return str.split(',').map(s => s.replace(/"/g, '').replace(/[{}]/g, '').trim()).filter(Boolean);
}

const Account = () => {
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [professionalData, setProfessionalData] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [photoFile, setPhotoFile] = useState(null);
  const [photoUrl, setPhotoUrl] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      setLoading(true);
      try {
        const data = await getCurrentUser();
        if (!data || !data.user) {
          setError('Пользователь не найден');
          setLoading(false);
          return;
        }
        setProfile(data.user);
        if (data.professional) setProfessionalData(data.professional);
        setEditForm({
          firstName: data.user.firstName || '',
          lastName: data.user.lastName || '',
          email: data.user.email || ''
        });
        setLoading(false);
      } catch (err) {
        setError('Ошибка получения пользователя');
        setLoading(false);
      }
    };
    fetchUser();
  }, [navigate]);

  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleCancelClick = () => {
    setIsEditing(false);
    // Reset editForm to current profile/professional data
    const initialForm = { 
      firstName: profile.firstName || '', 
      lastName: profile.lastName || '', 
      email: profile.email || '',
      // Add other shared user fields here if needed
    };
    if (profile && profile.role === 'professional' && professionalData) {
       initialForm.hourlyRate = professionalData.hourlyRate || '';
       initialForm.education = professionalData.details?.education || '';
       initialForm.certifications = professionalData.details?.certifications || '';
       initialForm.languages = Array.isArray(professionalData.details?.languages) ? professionalData.details.languages.join(', ') : professionalData.details?.languages || '';
       initialForm.specializations = Array.isArray(professionalData.details?.specializations) ? professionalData.details.specializations.join(', ') : professionalData.details?.specializations || '';
       initialForm.about = professionalData.details?.about || '';
       initialForm.location = professionalData.details?.location || '';
       initialForm.contactPhone = professionalData.details?.contactPhone || '';
       initialForm.website = professionalData.details?.website || '';
       initialForm.linkedin = professionalData.details?.socialLinks?.linkedin || '';
    }
    setEditForm(initialForm);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setEditForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePhotoChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setPhotoFile(e.target.files[0]);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    setError(null);
    try {
      // Prepare data based on user role
      const dataToUpdate = { ...editForm };

      if (profile && profile.role === 'professional') {
        // Separate user and professional details for backend update
        const userUpdate = { 
            firstName: dataToUpdate.firstName,
            lastName: dataToUpdate.lastName,
            // email is disabled, so no need to send
            // Add other shared user fields if editable
        };
        const professionalUpdate = {
             hourlyRate: dataToUpdate.hourlyRate,
             details: {
                 education: dataToUpdate.education,
                 certifications: dataToUpdate.certifications,
                 languages: dataToUpdate.languages ? dataToUpdate.languages.split(', ').map(lang => lang.trim()) : undefined, // Convert comma-separated string back to array, handle empty
                 specializations: dataToUpdate.specializations ? dataToUpdate.specializations.split(', ').map(spec => spec.trim()) : undefined, // Convert comma-separated string back to array, handle empty
                 about: dataToUpdate.about,
                 location: dataToUpdate.location,
                 contactPhone: dataToUpdate.contactPhone,
                 website: dataToUpdate.website,
                 socialLinks: { linkedin: dataToUpdate.linkedin }, // Assuming linkedin is the only social link for now
             }
        };
        
        // Сначала обновляем профиль, потом фото (если выбрано)
        const updatedUserData = await updateUserProfile(profile._id, { user: userUpdate, professional: professionalUpdate });
        if (photoFile && profile && profile.professionalId) {
          // Загрузка фото
          const uploadRes = await uploadProfilePhoto(profile.professionalId, photoFile);
          setPhotoUrl(uploadRes.photoUrl);
          toast.success('Фото профиля обновлено!');
        }
         // Update state with combined data from the response
        if(updatedUserData && updatedUserData.user) {
            setProfile(updatedUserData.user);
            if(updatedUserData.professional) setProfessionalData(updatedUserData.professional);
        } else {
             // Handle unexpected response structure
             throw new Error('Failed to update profile: Invalid response structure.');
        }

      } else if (profile) { // Handle regular user update
        const updatedUserData = await updateUserProfile(profile._id, dataToUpdate);
         if(updatedUserData) {
             setProfile(updatedUserData);
         } else {
              throw new Error('Failed to update profile: Invalid response structure.');
         }
      }
      
      setIsEditing(false);
      toast.success('Профиль успешно обновлен!');
    } catch (err) {
      setError(err.message);
      toast.error(err.message);
    } finally {
      setLoading(false);
      setPhotoFile(null);
    }
  };

  // Logout button handled in Sidebar

  if (loading) return <div>Загрузка...</div>;
  if (error) return <div>Ошибка: {error}</div>;
  if (!profile) return <div>Профиль не найден или данные загружаются...</div>;

  const isProfessional = profile.role === 'professional';

  return (
    <div className="account-container">
      <div className="profile-card">
        <div className="profile-header">
          <h2>Личный кабинет</h2>
          {/* Только для профессионала показываем кнопку редактирования */}
          {isProfessional && !isEditing && profile && (
            <button className="edit-button" onClick={handleEditClick}><FaEdit /> Редактировать</button>
          )}
          {isProfessional && isEditing && (
            <div className="edit-buttons">
              <button className="save-button" onClick={handleSave}><FaSave /> Сохранить</button>
              <button className="cancel-button" onClick={handleCancelClick}><FaTimes /> Отмена</button>
            </div>
          )}
        </div>
        
        {!isProfessional && (
          <div className="user-info">
            <p><FaUser /> <strong>Имя:</strong> {profile.firstName} {profile.lastName}</p>
            <p><FaEnvelope /> <strong>Email:</strong> {profile.email}</p>
          </div>
        )}
        {isProfessional && !isEditing && profile && (
          <div className="user-info">
            <p><FaUser /> <strong>Имя:</strong> {profile.firstName} {profile.lastName}</p>
            <p><FaEnvelope /> <strong>Email:</strong> {profile.email}</p>
            {photoUrl && (
              <div style={{margin: '10px 0'}}>
                <img src={photoUrl} alt="Фото профиля" style={{maxWidth: 120, borderRadius: 8}} />
              </div>
            )}
          </div>
        )}
        {/* Блок с полной инфой для профессионала */}
        {isProfessional && professionalData && (
          <div className="professional-info-full">
            <h3>Профессиональный профиль</h3>
            <p><strong>ID профиля:</strong> {professionalData.id}</p>
            <p><strong>Тип:</strong> {professionalData.professionalType?.name || 'Не указано'}</p>
            <p><strong>Почасовая ставка:</strong> {professionalData.hourlyRate}</p>
            <p><strong>Доступен для работы:</strong> {professionalData.isAvailable ? 'Да' : 'Нет'}</p>
            <p><strong>Статус верификации:</strong> {professionalData.isVerified ? 'Верифицирован' : 'Не верифицирован'}</p>
            <p><strong>Статус проверки:</strong> {professionalData.verificationStatus}</p>
            <p><strong>Дата создания профиля:</strong> {professionalData.createdAt}</p>
            <p><strong>Дата обновления профиля:</strong> {professionalData.updatedAt}</p>
            <h4>Детали</h4>
            <p><strong>Образование:</strong> {professionalData.details?.education || 'Не указано'}</p>
            <p><strong>Сертификаты:</strong> {professionalData.details?.certifications || 'Не указано'}</p>
            <p><strong>Языки:</strong> {parsePgArray(professionalData.details?.languages).join(', ') || 'Не указано'}</p>
            <p><strong>Специализации:</strong> {parsePgArray(professionalData.details?.specializations).join(', ') || 'Не указано'}</p>
            <p><strong>О себе:</strong> {professionalData.details?.about || 'Не указано'}</p>
            <p><strong>Местоположение:</strong> {professionalData.details?.location || 'Не указано'}</p>
            <p><strong>Контактный телефон:</strong> {professionalData.details?.contactPhone || 'Не указано'}</p>
            <p><strong>Вебсайт:</strong> {professionalData.details?.website || 'Не указано'}</p>
            <p><strong>LinkedIn:</strong> {professionalData.details?.socialLinks?.linkedin || 'Не указано'}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Account;