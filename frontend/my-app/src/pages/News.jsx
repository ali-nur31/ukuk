// src/pages/News.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import {
    Box,
    Container,
    Typography,
    Card,
    CardContent,
    CardMedia,
    Button,
    TextField,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Grid,
    IconButton,
    Snackbar,
    Alert,
    CircularProgress
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';

const News = ({ user }) => {
    const navigate = useNavigate();
    const [news, setNews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [openDialog, setOpenDialog] = useState(false);
    const [openDetailsDialog, setOpenDetailsDialog] = useState(false);
    const [selectedNews, setSelectedNews] = useState(null);
    const [editingNews, setEditingNews] = useState(null);
    const [formData, setFormData] = useState({
        title: '',
        content: '',
        imageUrl: ''
    });
    const [snackbar, setSnackbar] = useState({
        open: false,
        message: '',
        severity: 'success'
    });
    const [isAdmin, setIsAdmin] = useState(false);

    useEffect(() => {
        loadNews();
        const checkAdminRole = async () => {
            if (user) {
                try {
                    const roleData = await getUserRole(user.username);
                    setIsAdmin(roleData.name === 'ROLE_ADMIN');
                } catch (error) {
                    console.error('Ошибка при проверке роли:', error);
                    setIsAdmin(false);
                }
            }
        };
        checkAdminRole();
    }, []);

    const loadNews = async () => {
        try {
            setLoading(true);
            const response = await api.get('/news/preview');
            const sortedNews = response.data.sort((a, b) => 
                new Date(b.publicationDate) - new Date(a.publicationDate)
            );
            setNews(sortedNews);
        } catch (error) {
            console.error('Failed to load news:', error);
            showSnackbar('Failed to load news', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleOpenDialog = (newsItem = null) => {
        if (newsItem) {
            setEditingNews(newsItem);
            setFormData({
                title: newsItem.title,
                content: newsItem.content,
                imageUrl: newsItem.imageUrl || ''
            });
        } else {
            setEditingNews(null);
            setFormData({
                title: '',
                content: '',
                imageUrl: ''
            });
        }
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setEditingNews(null);
        setFormData({
            title: '',
            content: '',
            imageUrl: ''
        });
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingNews) {
                await api.put(`/news/${editingNews.id}`, formData);
                showSnackbar('News updated successfully');
            } else {
                await api.post('/news', formData);
                showSnackbar('News created successfully');
            }
            handleCloseDialog();
            loadNews();
        } catch (error) {
            showSnackbar(error.response?.data?.message || 'Operation failed', 'error');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this news?')) {
            try {
                await api.delete(`/news/${id}`);
                showSnackbar('News deleted successfully');
                loadNews();
            } catch (error) {
                showSnackbar(error.response?.data?.message || 'Failed to delete news', 'error');
            }
        }
    };

    const showSnackbar = (message, severity = 'success') => {
        setSnackbar({
            open: true,
            message,
            severity
        });
    };

    const handleCloseSnackbar = () => {
        setSnackbar(prev => ({ ...prev, open: false }));
    };

    const handleOpenDetailsDialog = (newsItem) => {
        setSelectedNews(newsItem);
        setOpenDetailsDialog(true);
    };

    const handleCloseDetailsDialog = () => {
        setOpenDetailsDialog(false);
        setSelectedNews(null);
    };

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 4 }}>
                <Typography variant="h4" component="h1">
                    News
                </Typography>
                {isAdmin && (
                    <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={() => handleOpenDialog()}
                    >
                        Add News
                    </Button>
                )}
            </Box>

            <Grid container spacing={3}>
                {news.map((newsItem) => (
                    <Grid item xs={12} md={6} lg={4} key={newsItem.id}>
                        <Card>
                            {newsItem.imageUrl && (
                                <CardMedia
                                    component="img"
                                    height="200"
                                    image={newsItem.imageUrl}
                                    alt={newsItem.title}
                                />
                            )}
                            <CardContent>
                                <Typography variant="h6" component="h2">
                                    {newsItem.title}
                                </Typography>
                                <Typography
                                    variant="body2"
                                    color="text.secondary"
                                    sx={{ mt: 1 }}
                                >
                                    {newsItem.content}
                                </Typography>
                                <Typography
                                    variant="caption"
                                    color="text.secondary"
                                    sx={{ mt: 2, display: 'block' }}
                                >
                                    {new Date(newsItem.publicationDate).toLocaleDateString()}
                                </Typography>
                                <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                                    <Button
                                        size="small"
                                        variant="outlined"
                                        onClick={() => navigate(`/news/${newsItem.id}`)}
                                    >
                                        Подробнее
                                    </Button>
                                    {isAdmin && (
                                        <>
                                            <IconButton
                                                size="small"
                                                onClick={() => handleOpenDialog(newsItem)}
                                            >
                                                <EditIcon />
                                            </IconButton>
                                            <IconButton
                                                size="small"
                                                onClick={() => handleDelete(newsItem.id)}
                                            >
                                                <DeleteIcon />
                                            </IconButton>
                                        </>
                                    )}
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>

            <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
                <DialogTitle>
                    {editingNews ? 'Edit News' : 'Create News'}
                </DialogTitle>
                <form onSubmit={handleSubmit}>
                    <DialogContent>
                        <TextField
                            fullWidth
                            label="Title"
                            name="title"
                            value={formData.title}
                            onChange={handleInputChange}
                            margin="normal"
                            required
                        />
                        <TextField
                            fullWidth
                            label="Content"
                            name="content"
                            value={formData.content}
                            onChange={handleInputChange}
                            margin="normal"
                            required
                            multiline
                            rows={4}
                        />
                        <TextField
                            fullWidth
                            label="Image URL"
                            name="imageUrl"
                            value={formData.imageUrl}
                            onChange={handleInputChange}
                            margin="normal"
                        />
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleCloseDialog}>Cancel</Button>
                        <Button type="submit" variant="contained">
                            {editingNews ? 'Update' : 'Create'}
                        </Button>
                    </DialogActions>
                </form>
            </Dialog>

            <Dialog open={openDetailsDialog} onClose={handleCloseDetailsDialog} maxWidth="md" fullWidth>
                <DialogTitle>
                    {selectedNews?.title}
                </DialogTitle>
                <DialogContent>
                    {selectedNews?.imageUrl && (
                        <Box sx={{ mb: 2 }}>
                            <img 
                                src={selectedNews.imageUrl} 
                                alt={selectedNews.title}
                                style={{ width: '100%', maxHeight: '400px', objectFit: 'cover' }}
                            />
                        </Box>
                    )}
                    <Typography variant="body1" paragraph>
                        {selectedNews?.content}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                        Published on: {selectedNews && new Date(selectedNews.publicationDate).toLocaleDateString()}
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDetailsDialog}>Close</Button>
                </DialogActions>
            </Dialog>

            <Snackbar
                open={snackbar.open}
                autoHideDuration={6000}
                onClose={handleCloseSnackbar}
            >
                <Alert
                    onClose={handleCloseSnackbar}
                    severity={snackbar.severity}
                    sx={{ width: '100%' }}
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Container>
    );
};

export default News;