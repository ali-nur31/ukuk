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

const News = () => {
    const navigate = useNavigate();
    const [news, setNews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
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

    useEffect(() => {
        loadNews();
    }, []);

    const loadNews = async () => {
        try {
            setLoading(true);
            const response = await api.get('/news');
            setNews(response.data);
            setError(null);
        } catch (error) {
            console.error('Error loading news:', error);
            setError('Не удалось загрузить новости');
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
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return (
            <Container>
                <Typography color="error" sx={{ mt: 4, textAlign: 'center' }}>
                    {error}
                </Typography>
            </Container>
        );
    }

    return (
        <Container sx={{ py: 4 }}>
            <Typography variant="h4" component="h1" gutterBottom>
                Новости
            </Typography>
            
            <Grid container spacing={3}>
                {news.map((item) => (
                    <Grid item xs={12} md={6} lg={4} key={item.id}>
                        <Card 
                            sx={{ 
                                height: '100%', 
                                display: 'flex', 
                                flexDirection: 'column',
                                cursor: 'pointer',
                                '&:hover': {
                                    boxShadow: 6
                                }
                            }}
                            onClick={() => navigate(`/news/${item.id}`)}
                        >
                            {item.imageUrl && (
                                <CardMedia
                                    component="img"
                                    height="200"
                                    image={item.imageUrl}
                                    alt={item.title}
                                />
                            )}
                            <CardContent sx={{ flexGrow: 1 }}>
                                <Typography gutterBottom variant="h5" component="h2">
                                    {item.title}
                                </Typography>
                                <Typography>
                                    {item.content.length > 150 
                                        ? `${item.content.substring(0, 150)}...` 
                                        : item.content}
                                </Typography>
                                <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: 'block' }}>
                                    {new Date(item.createdAt).toLocaleDateString()}
                                </Typography>
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