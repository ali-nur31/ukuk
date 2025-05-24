import { useState, useEffect } from 'react';
import { getCurrentUser, updateUser } from '../api';
import '../styles/components/_account.scss';
import {
    Box,
    Typography,
    Paper,
    Container,
    Grid,
    Card,
    CardContent,
    Divider,
    Alert,
    CircularProgress,
    TextField,
    Button,
    Tabs,
    Tab,
    Avatar,
    IconButton,
    Chip
} from '@mui/material';
import {
    Person as PersonIcon,
    Email as EmailIcon,
    Phone as PhoneIcon,
    LocationOn as LocationIcon,
    Edit as EditIcon,
    Save as SaveIcon,
    Cancel as CancelIcon,
    Work as WorkIcon,
    School as SchoolIcon,
    Language as LanguageIcon,
    Star as StarIcon
} from '@mui/icons-material';

const Account = () => {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState('');
    const [isEditing, setIsEditing] = useState(false);
    const [activeTab, setActiveTab] = useState(0);
    const [editForm, setEditForm] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        location: ''
    });

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            setLoading(true);
            const userData = await getCurrentUser();
            setProfile(userData);
            setEditForm({
                firstName: userData.firstName || '',
                lastName: userData.lastName || '',
                email: userData.email || '',
                phone: userData.phone || '',
                location: userData.location || ''
            });
            setError(null);
        } catch (err) {
            console.error('Error fetching profile:', err);
            setError(err.message || 'Failed to load profile');
            if (err.response?.status === 401) {
                // Token expired or invalid
                localStorage.removeItem('accessToken');
                localStorage.removeItem('refreshToken');
                window.location.href = '/login';
            }
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = () => {
        setIsEditing(true);
    };

    const handleCancel = () => {
        setIsEditing(false);
        setEditForm({
            firstName: profile.firstName || '',
            lastName: profile.lastName || '',
            email: profile.email || '',
            phone: profile.phone || '',
            location: profile.location || ''
        });
    };

    const handleSave = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            const updatedUser = await updateUser(profile.id, editForm);
            setProfile(updatedUser);
            setSuccess('Профиль успешно обновлен');
            setIsEditing(false);
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            setError(err.message || 'Не удалось обновить профиль');
            setTimeout(() => setError(null), 3000);
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setEditForm(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleTabChange = (event, newValue) => {
        setActiveTab(newValue);
    };

    if (loading && !profile) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '70vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    if (!profile) {
        return (
            <Container maxWidth="lg" sx={{ mt: 4 }}>
                <Alert severity="error">
                    Не удалось загрузить профиль. Пожалуйста, войдите снова.
                </Alert>
            </Container>
        );
    }

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                </Alert>
            )}
            {success && (
                <Alert severity="success" sx={{ mb: 2 }}>
                    {success}
                </Alert>
            )}

            <Grid container spacing={3}>
                {/* Profile Header */}
                <Grid item xs={12}>
                    <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                            <Avatar
                                sx={{ width: 100, height: 100, bgcolor: 'primary.main' }}
                            >
                                {profile.firstName?.[0]}{profile.lastName?.[0]}
                            </Avatar>
                            <Box sx={{ flex: 1 }}>
                                <Typography variant="h4" gutterBottom>
                                    {profile.firstName} {profile.lastName}
                                </Typography>
                                <Typography variant="subtitle1" color="text.secondary" gutterBottom>
                                    <EmailIcon sx={{ mr: 1, verticalAlign: 'middle', fontSize: '1rem' }} />
                                    {profile.email}
                                </Typography>
                                {profile.role && (
                                    <Chip
                                        icon={<WorkIcon />}
                                        label={profile.role === 'professional' ? 'Профессионал' : 'Пользователь'}
                                        color={profile.role === 'professional' ? 'primary' : 'default'}
                                        sx={{ mt: 1 }}
                                    />
                                )}
                            </Box>
                            {!isEditing && (
                                <Button
                                    variant="outlined"
                                    startIcon={<EditIcon />}
                                    onClick={handleEdit}
                                >
                                    Редактировать
                                </Button>
                            )}
                        </Box>
                    </Paper>
                </Grid>

                {/* Main Content */}
                <Grid item xs={12}>
                    <Paper elevation={3} sx={{ p: 3 }}>
                        <Tabs value={activeTab} onChange={handleTabChange} sx={{ mb: 3 }}>
                            <Tab label="Основная информация" />
                            {profile.role === 'professional' && (
                                <>
                                    <Tab label="Профессиональная информация" />
                                    <Tab label="Образование и квалификация" />
                                </>
                            )}
                        </Tabs>

                        {activeTab === 0 && (
                            isEditing ? (
                                <form onSubmit={handleSave}>
                                    <Grid container spacing={3}>
                                        <Grid item xs={12} sm={6}>
                                            <TextField
                                                fullWidth
                                                label="Имя"
                                                name="firstName"
                                                value={editForm.firstName}
                                                onChange={handleInputChange}
                                                required
                                            />
                                        </Grid>
                                        <Grid item xs={12} sm={6}>
                                            <TextField
                                                fullWidth
                                                label="Фамилия"
                                                name="lastName"
                                                value={editForm.lastName}
                                                onChange={handleInputChange}
                                                required
                                            />
                                        </Grid>
                                        <Grid item xs={12} sm={6}>
                                            <TextField
                                                fullWidth
                                                label="Email"
                                                name="email"
                                                type="email"
                                                value={editForm.email}
                                                onChange={handleInputChange}
                                                required
                                            />
                                        </Grid>
                                        <Grid item xs={12} sm={6}>
                                            <TextField
                                                fullWidth
                                                label="Телефон"
                                                name="phone"
                                                value={editForm.phone}
                                                onChange={handleInputChange}
                                            />
                                        </Grid>
                                        <Grid item xs={12}>
                                            <TextField
                                                fullWidth
                                                label="Местоположение"
                                                name="location"
                                                value={editForm.location}
                                                onChange={handleInputChange}
                                            />
                                        </Grid>
                                        <Grid item xs={12}>
                                            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                                                <Button
                                                    variant="outlined"
                                                    startIcon={<CancelIcon />}
                                                    onClick={handleCancel}
                                                >
                                                    Отмена
                                                </Button>
                                                <Button
                                                    type="submit"
                                                    variant="contained"
                                                    startIcon={<SaveIcon />}
                                                    disabled={loading}
                                                >
                                                    Сохранить
                                                </Button>
                                            </Box>
                                        </Grid>
                                    </Grid>
                                </form>
                            ) : (
                                <Grid container spacing={3}>
                                    <Grid item xs={12} sm={6}>
                                        <Card variant="outlined">
                                            <CardContent>
                                                <Typography variant="h6" gutterBottom>
                                                    <PersonIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                                                    Личная информация
                                                </Typography>
                                                <Divider sx={{ mb: 2 }} />
                                                <Grid container spacing={2}>
                                                    <Grid item xs={12}>
                                                        <Typography variant="subtitle2" color="text.secondary">
                                                            Имя
                                                        </Typography>
                                                        <Typography variant="body1">
                                                            {profile.firstName}
                                                        </Typography>
                                                    </Grid>
                                                    <Grid item xs={12}>
                                                        <Typography variant="subtitle2" color="text.secondary">
                                                            Фамилия
                                                        </Typography>
                                                        <Typography variant="body1">
                                                            {profile.lastName}
                                                        </Typography>
                                                    </Grid>
                                                </Grid>
                                            </CardContent>
                                        </Card>
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                        <Card variant="outlined">
                                            <CardContent>
                                                <Typography variant="h6" gutterBottom>
                                                    <EmailIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                                                    Контактная информация
                                                </Typography>
                                                <Divider sx={{ mb: 2 }} />
                                                <Grid container spacing={2}>
                                                    <Grid item xs={12}>
                                                        <Typography variant="subtitle2" color="text.secondary">
                                                            Email
                                                        </Typography>
                                                        <Typography variant="body1">
                                                            {profile.email}
                                                        </Typography>
                                                    </Grid>
                                                    {profile.phone && (
                                                        <Grid item xs={12}>
                                                            <Typography variant="subtitle2" color="text.secondary">
                                                                Телефон
                                                            </Typography>
                                                            <Typography variant="body1">
                                                                <PhoneIcon sx={{ mr: 1, verticalAlign: 'middle', fontSize: '1rem' }} />
                                                                {profile.phone}
                                                            </Typography>
                                                        </Grid>
                                                    )}
                                                    {profile.location && (
                                                        <Grid item xs={12}>
                                                            <Typography variant="subtitle2" color="text.secondary">
                                                                Местоположение
                                                            </Typography>
                                                            <Typography variant="body1">
                                                                <LocationIcon sx={{ mr: 1, verticalAlign: 'middle', fontSize: '1rem' }} />
                                                                {profile.location}
                                                            </Typography>
                                                        </Grid>
                                                    )}
                                                </Grid>
                                            </CardContent>
                                        </Card>
                                    </Grid>
                                </Grid>
                            )
                        )}

                        {activeTab === 1 && profile.role === 'professional' && (
                            <Grid container spacing={3}>
                                <Grid item xs={12}>
                                    <Card variant="outlined">
                                        <CardContent>
                                            <Typography variant="h6" gutterBottom>
                                                <WorkIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                                                Профессиональная информация
                                            </Typography>
                                            <Divider sx={{ mb: 2 }} />
                                            {profile.professionalType && (
                                                <Grid container spacing={2}>
                                                    <Grid item xs={12}>
                                                        <Typography variant="subtitle2" color="text.secondary">
                                                            Тип профессии
                                                        </Typography>
                                                        <Typography variant="body1">
                                                            {profile.professionalType.name}
                                                        </Typography>
                                                    </Grid>
                                                    {profile.hourlyRate && (
                                                        <Grid item xs={12}>
                                                            <Typography variant="subtitle2" color="text.secondary">
                                                                Почасовая ставка
                                                            </Typography>
                                                            <Typography variant="body1">
                                                                {profile.hourlyRate} ₽/час
                                                            </Typography>
                                                        </Grid>
                                                    )}
                                                </Grid>
                                            )}
                                        </CardContent>
                                    </Card>
                                </Grid>
                            </Grid>
                        )}

                        {activeTab === 2 && profile.role === 'professional' && (
                            <Grid container spacing={3}>
                                <Grid item xs={12}>
                                    <Card variant="outlined">
                                        <CardContent>
                                            <Typography variant="h6" gutterBottom>
                                                <SchoolIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                                                Образование и квалификация
                                            </Typography>
                                            <Divider sx={{ mb: 2 }} />
                                            {profile.details && (
                                                <Grid container spacing={2}>
                                                    {profile.details.education && (
                                                        <Grid item xs={12}>
                                                            <Typography variant="subtitle2" color="text.secondary">
                                                                Образование
                                                            </Typography>
                                                            <Typography variant="body1">
                                                                {profile.details.education}
                                                            </Typography>
                                                        </Grid>
                                                    )}
                                                    {profile.details.certifications && (
                                                        <Grid item xs={12}>
                                                            <Typography variant="subtitle2" color="text.secondary">
                                                                Сертификаты
                                                            </Typography>
                                                            <Typography variant="body1">
                                                                {profile.details.certifications}
                                                            </Typography>
                                                        </Grid>
                                                    )}
                                                    {profile.details.languages && profile.details.languages.length > 0 && (
                                                        <Grid item xs={12}>
                                                            <Typography variant="subtitle2" color="text.secondary">
                                                                Языки
                                                            </Typography>
                                                            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                                                                {profile.details.languages.map((lang, index) => (
                                                                    <Chip
                                                                        key={index}
                                                                        icon={<LanguageIcon />}
                                                                        label={lang}
                                                                        variant="outlined"
                                                                    />
                                                                ))}
                                                            </Box>
                                                        </Grid>
                                                    )}
                                                    {profile.details.specializations && profile.details.specializations.length > 0 && (
                                                        <Grid item xs={12}>
                                                            <Typography variant="subtitle2" color="text.secondary">
                                                                Специализации
                                                            </Typography>
                                                            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                                                                {profile.details.specializations.map((spec, index) => (
                                                                    <Chip
                                                                        key={index}
                                                                        icon={<StarIcon />}
                                                                        label={spec}
                                                                        variant="outlined"
                                                                        color="primary"
                                                                    />
                                                                ))}
                                                            </Box>
                                                        </Grid>
                                                    )}
                                                </Grid>
                                            )}
                                        </CardContent>
                                    </Card>
                                </Grid>
                            </Grid>
                        )}
                    </Paper>
                </Grid>
            </Grid>
        </Container>
    );
};

export default Account;