import { useState, useEffect } from 'react';
import { getCurrentUser, updateUser } from '../api.js';
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
    Button
} from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import EmailIcon from '@mui/icons-material/Email';
import EditIcon from '@mui/icons-material/Edit';

const Account = ({ user }) => {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState('');
    const [isEditing, setIsEditing] = useState(false);
    const [editForm, setEditForm] = useState({
        username: '',
        email: ''
    });

    useEffect(() => {
        if (!user) return;
        let isMounted = true;

        const fetchProfile = async () => {
            try {
                setLoading(true);
                const userData = await getCurrentUser();
                if (isMounted) {
                    setProfile(userData);
                    setEditForm({
                        username: userData.username || '',
                        email: userData.email || ''
                    });
                    setError(null);
                }
            } catch (err) {
                if (isMounted) {
                    setError(err.message || 'Failed to load profile');
                }
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        };

        fetchProfile();

        return () => {
            isMounted = false;
        };
    }, [user]);

    const handleEdit = () => {
        setIsEditing(true);
    };

    const handleCancel = () => {
        setIsEditing(false);
        setEditForm({
            username: profile.username || '',
            email: profile.email || ''
        });
    };

    const handleSave = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            const updatedUser = await updateUser(profile.id, editForm);
            setProfile(updatedUser);
            setSuccess('Profile updated successfully');
            setIsEditing(false);
        } catch (err) {
            setError(err.message || 'Failed to update profile');
        } finally {
            setLoading(false);
        }
    };

    if (loading || !user) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '70vh' }}>
                <CircularProgress />
            </Box>
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
                <Grid item xs={12}>
                    <Paper elevation={3} sx={{ p: 3 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                            <Typography variant="h5" component="h1">
                                <PersonIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                                Profile
                            </Typography>
                            {!isEditing && (
                                <Button
                                    variant="outlined"
                                    startIcon={<EditIcon />}
                                    onClick={handleEdit}
                                >
                                    Edit Profile
                                </Button>
                            )}
                        </Box>

                        {isEditing ? (
                            <form onSubmit={handleSave}>
                            <Grid container spacing={2}>
                                    <Grid item xs={12}>
                                    <TextField
                                        fullWidth
                                            label="Username"
                                            value={editForm.username}
                                            onChange={(e) => setEditForm(prev => ({ ...prev, username: e.target.value }))}
                                        required
                                    />
                                </Grid>
                                    <Grid item xs={12}>
                                    <TextField
                                        fullWidth
                                            label="Email"
                                            type="email"
                                            value={editForm.email}
                                            onChange={(e) => setEditForm(prev => ({ ...prev, email: e.target.value }))}
                                        required
                                    />
                                    </Grid>
                                    <Grid item xs={12}>
                                        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                                            <Button variant="outlined" onClick={handleCancel}>
                                                Cancel
                                            </Button>
                                            <Button variant="contained" type="submit" disabled={loading}>
                                                Save Changes
                                            </Button>
                                        </Box>
                                    </Grid>
                                </Grid>
                            </form>
                        ) : (
                            <Grid container spacing={2}>
                                <Grid item xs={12}>
                                    <Card variant="outlined">
                                        <CardContent>
                                            <Typography variant="h6" gutterBottom>
                                                <PersonIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                                                Personal Information
                                            </Typography>
                                            <Divider sx={{ mb: 2 }} />
                                            <Grid container spacing={2}>
                                                <Grid item xs={12} sm={6}>
                                                    <Typography variant="subtitle2" color="text.secondary">
                                                        Username
                                                    </Typography>
                                                    <Typography variant="body1">
                                                        {profile.username}
                                                    </Typography>
                                                </Grid>
                                                <Grid item xs={12} sm={6}>
                                                    <Typography variant="subtitle2" color="text.secondary">
                                                        Email
                                                    </Typography>
                                                    <Typography variant="body1">
                                                        <EmailIcon sx={{ mr: 1, verticalAlign: 'middle', fontSize: '1rem' }} />
                                                        {profile.email}
                                                    </Typography>
                                                </Grid>
                                            </Grid>
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