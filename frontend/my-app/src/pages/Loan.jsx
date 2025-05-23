import React, { useState, useEffect } from 'react';
import api, { getLoanTransactions } from '../api.js';
import '../styles/components/_load.scss';
import {
    Box,
    Typography,
    Paper,
    TextField,
    Button,
    Container,
    Grid,
    Card,
    CardContent,
    Divider,
    Alert,
    Chip,
    TableContainer,
    Table,
    TableHead,
    TableBody,
    TableRow,
    TableCell,
    CircularProgress,
    Accordion,
    AccordionSummary,
    AccordionDetails
} from '@mui/material';
import MoneyIcon from '@mui/icons-material/Money';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import PaymentIcon from '@mui/icons-material/Payment';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PendingIcon from '@mui/icons-material/Pending';
import DoneIcon from '@mui/icons-material/Done';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import HistoryIcon from '@mui/icons-material/History';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import CreditCardIcon from '@mui/icons-material/CreditCard';

const Loan = ({ userId }) => {
    const [amount, setAmount] = useState('');
    const [interestRate, setInterestRate] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [loans, setLoans] = useState([]);
    const [selectedLoan, setSelectedLoan] = useState(null);
    const [paymentAmount, setPaymentAmount] = useState('');
    const [loading, setLoading] = useState(false);
    const [loanTransactions, setLoanTransactions] = useState({});
    const [expandedLoanId, setExpandedLoanId] = useState(null);
    const [userRole, setUserRole] = useState('');

    // Fetch user's loans
    useEffect(() => {
        const fetchLoans = async () => {
            try {
                setLoading(true);
                const response = await api.get(`/loans/user/${userId}`);
                // Ensure we always set an array to loans state
                setLoans(Array.isArray(response.data) ? response.data : []);
                
                // Log the response for debugging
                console.log('Loans data from API:', response.data);
                console.log('Data type:', typeof response.data);
                if (response.data) {
                    console.log('Is array:', Array.isArray(response.data));
                }
            } catch (error) {
                console.error('Error fetching loans:', error);
                setLoans([]);  // Set empty array on error
            } finally {
                setLoading(false);
            }
        };
        fetchLoans();
    }, [userId]);

    useEffect(() => {
        const fetchUserRole = async () => {
            try {
                const user = await getCurrentUser();
                setUserRole(user.role);
            } catch (error) {
                console.error('Ошибка при получении роли пользователя:', error);
            }
        };
        fetchUserRole();
    }, []);

    const handleLoanRequest = async (e) => {
        e.preventDefault();

        try {
            setLoading(true);
            const loanData = {
                amount: parseFloat(amount),
                interestRate: parseFloat(interestRate),
                userId: userId,
                termInMonths: 12
            };

            const response = await api.post('/loans', loanData);

            if (response.status === 200) {
                setSuccessMessage('Кредит успешно запрошен!');
                setErrorMessage('');
                setAmount('');
                setInterestRate('');
                // Refresh loans list
                const updatedLoans = await api.get(`/loans/user/${userId}`);
                setLoans(Array.isArray(updatedLoans.data) ? updatedLoans.data : []);
            }
        } catch (error) {
            const serverError = error.response?.data?.message;
            if (serverError) {
                setErrorMessage(serverError);
            } else if (error.message.includes('Network Error')) {
                setErrorMessage('Проблемы с соединением');
            } else {
                setErrorMessage('Ошибка сервера');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleApproveLoan = async (loanId) => {
        try {
            setLoading(true);
            const response = await api.post(`/loans/${loanId}/approve`);
            if (response.status === 200) {
                setSuccessMessage('Кредит успешно одобрен!');
                // Refresh loans list
                const updatedLoans = await api.get(`/loans/user/${userId}`);
                setLoans(Array.isArray(updatedLoans.data) ? updatedLoans.data : []);
                
                // Fetch updated transactions for this loan
                fetchLoanTransactions(loanId);
            }
        } catch (error) {
            setErrorMessage('Ошибка при одобрении кредита');
        } finally {
            setLoading(false);
        }
    };

    const handleMakePayment = async (loanId) => {
        try {
            setLoading(true);
            const response = await api.post(`/loans/${loanId}/payment?amount=${paymentAmount}`);
            if (response.status === 200) {
                setSuccessMessage('Платеж успешно внесен!');
                setPaymentAmount('');
                // Refresh loans list
                const updatedLoans = await api.get(`/loans/user/${userId}`);
                setLoans(Array.isArray(updatedLoans.data) ? updatedLoans.data : []);
                
                // Fetch updated transactions for this loan
                fetchLoanTransactions(loanId);
            }
        } catch (error) {
            setErrorMessage('Ошибка при внесении платежа');
        } finally {
            setLoading(false);
        }
    };
    
    const fetchLoanTransactions = async (loanId) => {
        try {
            const transactions = await getLoanTransactions(loanId);
            setLoanTransactions(prev => ({
                ...prev,
                [loanId]: transactions
            }));
        } catch (error) {
            console.error(`Error fetching transactions for loan ${loanId}:`, error);
        }
    };
    
    const handleExpandLoan = (loanId) => {
        // If this loan is already expanded, collapse it
        if (expandedLoanId === loanId) {
            setExpandedLoanId(null);
            return;
        }
        
        // Otherwise, expand this loan and fetch its transactions
        setExpandedLoanId(loanId);
        
        if (!loanTransactions[loanId]) {
            fetchLoanTransactions(loanId);
        }
    };

    // Helper function to get status chip
    const getStatusChip = (status) => {
        switch(status) {
            case 'PENDING':
                return <Chip icon={<PendingIcon />} label="В ожидании" color="warning" />;
            case 'ACTIVE':
                return <Chip icon={<MoneyIcon />} label="Активный" color="primary" />;
            case 'PAID':
                return <Chip icon={<DoneIcon />} label="Оплачен" color="success" />;
            default:
                return <Chip label={status} />;
        }
    };
    
    // Helper function to get transaction icon
    const getTransactionIcon = (type) => {
        switch (type) {
            case 'LOAN_CREATED':
                return <CreditCardIcon color="primary" />;
            case 'LOAN_APPROVED':
                return <MoneyIcon color="success" />;
            case 'LOAN_PAYMENT':
                return <PaymentIcon color="warning" />;
            case 'LOAN_PAID':
                return <DoneIcon color="success" />;
            default:
                return <MoneyIcon />;
        }
    };
    
    // Helper function to format date
    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleString('ru-RU', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Typography variant="h4" gutterBottom sx={{ mb: 3 }}>
                Кредитный центр
            </Typography>

            {loading && (
                <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
                    <CircularProgress />
                </Box>
            )}

            {successMessage && (
                <Alert severity="success" sx={{ mb: 2 }}>
                    {successMessage}
                </Alert>
            )}

            {errorMessage && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    {errorMessage}
                </Alert>
            )}

            <Grid container spacing={3}>
                <Grid item xs={12} md={5}>
                    <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
                        <Typography variant="h6" gutterBottom>
                            <AccountBalanceIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                            Запрос нового кредита
                        </Typography>
                        <Box component="form" onSubmit={handleLoanRequest} sx={{ mt: 2 }}>
                            <TextField
                                fullWidth
                                id="amount"
                                label="Сумма кредита"
                                type="number"
                                inputProps={{ min: 0, step: 0.01 }}
                                value={amount}
                                onChange={(e) => setAmount(e.target.value.replace(/[^0-9.]/g, ''))}
                                required
                                sx={{ mb: 2 }}
                            />
                            <TextField
                                fullWidth
                                id="interestRate"
                                label="Процентная ставка (%)"
                                type="number"
                                inputProps={{ min: 0, step: 0.01 }}
                                value={interestRate}
                                onChange={(e) => setInterestRate(e.target.value.replace(/[^0-9.]/g, ''))}
                                required
                                sx={{ mb: 3 }}
                            />
                            <Button 
                                type="submit" 
                                variant="contained" 
                                fullWidth
                                disabled={loading}
                                startIcon={<MoneyIcon />}
                            >
                                Запросить кредит
                            </Button>
                        </Box>
                    </Paper>
                </Grid>

                <Grid item xs={12} md={7}>
                    <Paper elevation={3} sx={{ p: 3 }}>
                        <Typography variant="h6" gutterBottom>
                            <PaymentIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                            Ваши кредиты
                        </Typography>
                        
                        {loans.length > 0 ? (
                            <TableContainer>
                                <Table>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>ID</TableCell>
                                            <TableCell>Сумма</TableCell>
                                            <TableCell>Ставка</TableCell>
                                            <TableCell>Статус</TableCell>
                                            <TableCell>Действия</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {loans.map((loan) => (
                                            <TableRow key={loan.id}>
                                                <TableCell>{loan.id}</TableCell>
                                                <TableCell>{loan.amount}</TableCell>
                                                <TableCell>{loan.interestRate}%</TableCell>
                                                <TableCell>{getStatusChip(loan.status)}</TableCell>
                                                <TableCell>
                                                    {loan.status === 'PENDING' && (
                                                        userRole === 'ADMIN' ? (
                                                            <Button
                                                                variant="outlined"
                                                                size="small"
                                                                color="primary"
                                                                onClick={() => handleApproveLoan(loan.id)}
                                                                startIcon={<CheckCircleIcon />}
                                                            >
                                                                Одобрить
                                                            </Button>
                                                        ) : (
                                                            <Typography variant="body2" color="textSecondary">
                                                                Ждём одобрения
                                                            </Typography>
                                                        )
                                                    )}
                                                    {/* Остальной код для других статусов без изменений */}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        ) : (
                            <Typography variant="body2" color="textSecondary" sx={{ mt: 2 }}>
                                У вас пока нет кредитов
                            </Typography>
                        )}
                    </Paper>

                    {/* Loan Details */}
                    {loans.length > 0 && (
                        <Grid container spacing={2} sx={{ mt: 2 }}>
                            {loans.map((loan) => (
                                <Grid item xs={12} key={`details-${loan.id}`}>
                                    <Accordion 
                                        expanded={expandedLoanId === loan.id}
                                        onChange={() => handleExpandLoan(loan.id)}
                                    >
                                        <AccordionSummary
                                            expandIcon={<ExpandMoreIcon />}
                                            aria-controls={`loan-${loan.id}-content`}
                                            id={`loan-${loan.id}-header`}
                                        >
                                            <Typography variant="subtitle1">
                                                Детали кредита #{loan.id} - {getStatusChip(loan.status)}
                                            </Typography>
                                        </AccordionSummary>
                                        <AccordionDetails>
                                            <Grid container spacing={2}>
                                                <Grid item xs={12} md={6}>
                                                    <Card variant="outlined">
                                                        <CardContent>
                                                            <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
                                                                Информация о кредите
                                                            </Typography>
                                                            <Divider sx={{ mb: 2 }} />
                                                            <Grid container spacing={2}>
                                                                <Grid item xs={6}>
                                                                    <Typography variant="body2" color="textSecondary">
                                                                        Сумма:
                                                                    </Typography>
                                                                    <Typography variant="body1">
                                                                        {loan.amount}
                                                                    </Typography>
                                                                </Grid>
                                                                <Grid item xs={6}>
                                                                    <Typography variant="body2" color="textSecondary">
                                                                        Процентная ставка:
                                                                    </Typography>
                                                                    <Typography variant="body1">
                                                                        {loan.interestRate}%
                                                                    </Typography>
                                                                </Grid>
                                                                <Grid item xs={6}>
                                                                    <Typography variant="body2" color="textSecondary">
                                                                        Срок:
                                                                    </Typography>
                                                                    <Typography variant="body1">
                                                                        {loan.termInMonths} мес.
                                                                    </Typography>
                                                                </Grid>
                                                                <Grid item xs={6}>
                                                                    <Typography variant="body2" color="textSecondary">
                                                                        Ежемесячный платеж:
                                                                    </Typography>
                                                                    <Typography variant="body1">
                                                                        {loan.monthlyPayment}
                                                                    </Typography>
                                                                </Grid>
                                                                <Grid item xs={6}>
                                                                    <Typography variant="body2" color="textSecondary">
                                                                        Остаток долга:
                                                                    </Typography>
                                                                    <Typography variant="body1">
                                                                        {loan.remainingAmount}
                                                                    </Typography>
                                                                </Grid>
                                                                <Grid item xs={6}>
                                                                    <Typography variant="body2" color="textSecondary">
                                                                        Дата начала:
                                                                    </Typography>
                                                                    <Typography variant="body1">
                                                                        {formatDate(loan.startDate)}
                                                                    </Typography>
                                                                </Grid>
                                                                <Grid item xs={6}>
                                                                    <Typography variant="body2" color="textSecondary">
                                                                        Дата окончания:
                                                                    </Typography>
                                                                    <Typography variant="body1">
                                                                        {formatDate(loan.endDate)}
                                                                    </Typography>
                                                                </Grid>
                                                            </Grid>
                                                        </CardContent>
                                                    </Card>
                                                </Grid>
                                                
                                                <Grid item xs={12} md={6}>
                                                    <Card variant="outlined">
                                                        <CardContent>
                                                            <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
                                                                <HistoryIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                                                                История операций
                                                            </Typography>
                                                            <Divider sx={{ mb: 2 }} />
                                                            
                                                            {!loanTransactions[loan.id] ? (
                                                                <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
                                                                    <CircularProgress size={30} />
                                                                </Box>
                                                            ) : loanTransactions[loan.id].length === 0 ? (
                                                                <Typography variant="body2" color="textSecondary" sx={{ textAlign: 'center' }}>
                                                                    Нет операций по кредиту
                                                                </Typography>
                                                            ) : (
                                                                <TableContainer>
                                                                    <Table size="small">
                                                                        <TableHead>
                                                                            <TableRow>
                                                                                <TableCell>Тип</TableCell>
                                                                                <TableCell>Дата</TableCell>
                                                                                <TableCell>Сумма</TableCell>
                                                                            </TableRow>
                                                                        </TableHead>
                                                                        <TableBody>
                                                                            {loanTransactions[loan.id].map((transaction) => (
                                                                                <TableRow key={transaction.id}>
                                                                                    <TableCell>
                                                                                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                                                            {getTransactionIcon(transaction.type)}
                                                                                        </Box>
                                                                                    </TableCell>
                                                                                    <TableCell>
                                                                                        {formatDate(transaction.date)}
                                                                                    </TableCell>
                                                                                    <TableCell sx={{ 
                                                                                        color: transaction.type === 'LOAN_PAYMENT' 
                                                                                            ? 'error.main' 
                                                                                            : transaction.type === 'LOAN_APPROVED' 
                                                                                                ? 'success.main' 
                                                                                                : 'text.primary',
                                                                                        fontWeight: 'medium' 
                                                                                    }}>
                                                                                        {transaction.amount ? transaction.amount : '0.00'}
                                                                                    </TableCell>
                                                                                </TableRow>
                                                                            ))}
                                                                        </TableBody>
                                                                    </Table>
                                                                </TableContainer>
                                                            )}
                                                        </CardContent>
                                                    </Card>
                                                </Grid>
                                            </Grid>
                                        </AccordionDetails>
                                    </Accordion>
                                </Grid>
                            ))}
                        </Grid>
                    )}
                </Grid>
            </Grid>
        </Container>
    );
};

export default Loan;