import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
    getNewsPreviews,
    getNewsById,
    createNews,
    updateNews,
    deleteNews
} from '../api';
import {
    Box,
    Typography,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Button,
    TextField,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    IconButton,
    Tooltip,
    Grid,
    Card,
    CardContent,
    Alert,
    Snackbar,
    CircularProgress
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

const AdminNews = () => {
    const [news, setNews] = useState([]);
    const [openNewsDialog, setOpenNewsDialog] = useState(false);
    const [newsForm, setNewsForm] = useState({
        title: '',
        preview: '',
        fullContent: '',
        imageUrl: ''
    });
    const [selectedNews, setSelectedNews] = useState(null);
    const [previewLength, setPreviewLength] = useState(0);
    const [contentLength, setContentLength] = useState(0);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchNews();
    }, []);

    const fetchNews = async () => {
        try {
            setLoading(true);
            const newsData = await getNewsPreviews();
            setNews(newsData);
        } catch (err) {
            console.error('Error fetching news:', err);
            setError(err.message || 'Failed to fetch news');
        } finally {
            setLoading(false);
        }
    };

    const handleNewsDialogOpen = async (newsItem = null) => {
        if (newsItem) {
            try {
                const fullNews = await getNewsById(newsItem.id);
                setNewsForm({
                    title: fullNews.title,
                    preview: fullNews.preview,
                    fullContent: fullNews.fullContent,
                    imageUrl: fullNews.imageUrl
                });
                setSelectedNews(fullNews);
                setPreviewLength(fullNews.preview.length);
                setContentLength(fullNews.fullContent.length);
            } catch (err) {
                setError(err.message || 'Failed to fetch news details');
                return;
            }
        } else {
            setNewsForm({
                title: '',
                preview: '',
                fullContent: '',
                imageUrl: ''
            });
            setSelectedNews(null);
            setPreviewLength(0);
            setContentLength(0);
        }
        setOpenNewsDialog(true);
    };

    const handleNewsSubmit = async (e) => {
        e.preventDefault();
        try {
            // Validate form data
            if (!newsForm.title || !newsForm.preview || !newsForm.fullContent) {
                setError('Заголовок, превью и содержание обязательны для заполнения');
                return;
            }

            if (newsForm.preview.length > 500) {
                setError('Превью не должно превышать 500 символов');
                return;
            }

            if (newsForm.fullContent.length > 5000) {
                setError('Полное содержание не должно превышать 5000 символов');
                return;
            }

            const newsData = {
                title: newsForm.title.trim(),
                preview: newsForm.preview.trim(),
                fullContent: newsForm.fullContent.trim(),
                imageUrl: newsForm.imageUrl.trim() || null
            };

            if (selectedNews) {
                await updateNews(selectedNews.id, newsData);
                setSuccess('Новость успешно обновлена');
            } else {
                await createNews(newsData);
                setSuccess('Новость успешно создана');
            }
            setOpenNewsDialog(false);
            fetchNews();
        } catch (err) {
            console.error('Error in handleNewsSubmit:', err);
            setError(err.message || 'Произошла ошибка при сохранении новости');
        }
    };

    const handleNewsFormChange = (field, value) => {
        try {
            if (field === 'preview') {
                setPreviewLength(value.length);
                if (value.length > 500) {
                    setError('Превью не должно превышать 500 символов');
                }
            } else if (field === 'fullContent') {
                setContentLength(value.length);
                if (value.length > 5000) {
                    setError('Полное содержание не должно превышать 5000 символов');
                }
            }
            setNewsForm(prev => ({ ...prev, [field]: value }));
        } catch (err) {
            console.error('Error updating news form:', err);
            setError('Ошибка при обновлении формы');
        }
    };

    const handleDeleteNews = async (newsId) => {
        if (window.confirm('Вы уверены, что хотите удалить эту новость?')) {
            try {
                await deleteNews(newsId);
                setSuccess('Новость успешно удалена');
                fetchNews();
            } catch (err) {
                setError(err.message);
            }
        }
    };

    return (
        <Box sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <Button
                    component={Link}
                    to="/admin"
                    startIcon={<ArrowBackIcon />}
                    sx={{ mr: 2 }}
                >
                    Назад к панели администратора
                </Button>
                <Typography variant="h4" gutterBottom>
                    Управление новостями
                </Typography>
            </Box>

            {loading && (
                <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
                    <CircularProgress />
                </Box>
            )}

            {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                </Alert>
            )}

            <Grid container spacing={3} sx={{ mb: 3 }}>
                <Grid item xs={12}>
                    <Card>
                        <CardContent>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                <Typography variant="h6">
                                    Список новостей
                                </Typography>
                                <Button
                                    variant="contained"
                                    startIcon={<AddIcon />}
                                    onClick={() => handleNewsDialogOpen()}
                                >
                                    Добавить новость
                                </Button>
                            </Box>
                            <TableContainer component={Paper}>
                                <Table>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>Заголовок</TableCell>
                                            <TableCell>Превью</TableCell>
                                            <TableCell>Действия</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {news.map((newsItem) => (
                                            <TableRow key={newsItem.id}>
                                                <TableCell>{newsItem.title}</TableCell>
                                                <TableCell>{newsItem.preview}</TableCell>
                                                <TableCell>
                                                    <Box sx={{ display: 'flex', gap: 1 }}>
                                                        <Tooltip title="Редактировать">
                                                            <IconButton onClick={() => handleNewsDialogOpen(newsItem)}>
                                                                <EditIcon />
                                                            </IconButton>
                                                        </Tooltip>
                                                        <Tooltip title="Удалить">
                                                            <IconButton onClick={() => handleDeleteNews(newsItem.id)}>
                                                                <DeleteIcon />
                                                            </IconButton>
                                                        </Tooltip>
                                                    </Box>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                        {news.length === 0 && (
                                            <TableRow>
                                                <TableCell colSpan={3} align="center">
                                                    Новости не найдены
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* News Dialog */}
            <Dialog open={openNewsDialog} onClose={() => setOpenNewsDialog(false)} maxWidth="md" fullWidth>
                <DialogTitle>
                    {selectedNews ? 'Редактировать новость' : 'Добавить новую новость'}
                </DialogTitle>
                <DialogContent>
                    <Box component="form" onSubmit={handleNewsSubmit} sx={{ mt: 2 }}>
                        <TextField
                            fullWidth
                            label="Заголовок"
                            value={newsForm.title}
                            onChange={(e) => handleNewsFormChange('title', e.target.value)}
                            sx={{ mb: 2 }}
                            required
                            error={!newsForm.title}
                            helperText={!newsForm.title ? 'Заголовок обязателен' : ''}
                        />
                        <TextField
                            fullWidth
                            label="Превью"
                            value={newsForm.preview}
                            onChange={(e) => handleNewsFormChange('preview', e.target.value)}
                            sx={{ mb: 1 }}
                            required
                            error={!newsForm.preview || previewLength > 500}
                            helperText={
                                !newsForm.preview 
                                    ? 'Превью обязательно' 
                                    : `${previewLength}/500 символов`
                            }
                        />
                        <TextField
                            fullWidth
                            label="Полное содержание"
                            multiline
                            rows={4}
                            value={newsForm.fullContent}
                            onChange={(e) => handleNewsFormChange('fullContent', e.target.value)}
                            sx={{ mb: 1 }}
                            required
                            error={!newsForm.fullContent || contentLength > 5000}
                            helperText={
                                !newsForm.fullContent 
                                    ? 'Содержание обязательно' 
                                    : `${contentLength}/5000 символов`
                            }
                        />
                        <TextField
                            fullWidth
                            label="URL изображения"
                            value={newsForm.imageUrl}
                            onChange={(e) => handleNewsFormChange('imageUrl', e.target.value)}
                            sx={{ mb: 2 }}
                            helperText="URL изображения (необязательно)"
                        />
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenNewsDialog(false)}>Отмена</Button>
                    <Button 
                        onClick={handleNewsSubmit} 
                        variant="contained"
                        disabled={
                            !newsForm.title || 
                            !newsForm.preview || 
                            !newsForm.fullContent ||
                            previewLength > 500 ||
                            contentLength > 5000
                        }
                    >
                        {selectedNews ? 'Обновить' : 'Создать'}
                    </Button>
                </DialogActions>
            </Dialog>

            <Snackbar
                open={!!error}
                autoHideDuration={6000}
                onClose={() => setError('')}
            >
                <Alert severity="error" onClose={() => setError('')}>
                    {error}
                </Alert>
            </Snackbar>

            <Snackbar
                open={!!success}
                autoHideDuration={6000}
                onClose={() => setSuccess('')}
            >
                <Alert severity="success" onClose={() => setSuccess('')}>
                    {success}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default AdminNews; 