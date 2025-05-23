import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api';
import {
    Box,
    Container,
    Typography,
    Button,
    CircularProgress,
    Paper,
    Divider
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

const NewsDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [news, setNews] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        loadNews();
    }, [id]);

    const loadNews = async () => {
        try {
            setLoading(true);
            const response = await api.get(`/news/${id}`);
            setNews(response.data);
            setError(null);
        } catch (error) {
            console.error('Failed to load news:', error);
            setError('Failed to load news. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return (
            <Container maxWidth="lg" sx={{ mt: 4 }}>
                <Typography color="error">{error}</Typography>
                <Button
                    startIcon={<ArrowBackIcon />}
                    onClick={() => navigate('/news')}
                    sx={{ mt: 2 }}
                >
                    Back to News
                </Button>
            </Container>
        );
    }

    if (!news) {
        return (
            <Container maxWidth="lg" sx={{ mt: 4 }}>
                <Typography>News not found</Typography>
                <Button
                    startIcon={<ArrowBackIcon />}
                    onClick={() => navigate('/news')}
                    sx={{ mt: 2 }}
                >
                    Back to News
                </Button>
            </Container>
        );
    }

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Button
                startIcon={<ArrowBackIcon />}
                onClick={() => navigate('/news')}
                sx={{ mb: 3 }}
            >
                Back to News
            </Button>

            <Paper elevation={3} sx={{ p: 4 }}>
                <Typography variant="h4" component="h1" gutterBottom>
                    {news.title}
                </Typography>
                
                <Typography variant="caption" color="text.secondary" sx={{ mb: 3, display: 'block' }}>
                    Published on: {new Date(news.publicationDate).toLocaleDateString()}
                </Typography>

                {news.imageUrl && (
                    <Box sx={{ mb: 4 }}>
                        <img
                            src={news.imageUrl}
                            alt={news.title}
                            style={{
                                width: '100%',
                                maxHeight: '500px',
                                objectFit: 'cover',
                                borderRadius: '8px'
                            }}
                        />
                    </Box>
                )}

                <Divider sx={{ my: 3 }} />

                <Typography variant="body1" paragraph sx={{ whiteSpace: 'pre-wrap' }}>
                    {news.content}
                </Typography>
            </Paper>
        </Container>
    );
};

export default NewsDetail; 