import { useState, useEffect } from 'react';
import { 
    getUserTransactions, 
    transferMoney, 
    getAccountBalance 
} from '../api.js';
import '../styles/components/_account.scss';
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
    List,
    ListItem,
    ListItemText,
    ListItemIcon,
    CircularProgress,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow
} from '@mui/material';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import MoneyIcon from '@mui/icons-material/Money';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import PaymentIcon from '@mui/icons-material/Payment';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import SendIcon from '@mui/icons-material/Send';

const Account = ({user}) => {
    const [balance, setBalance] = useState(0);
    const [transactions, setTransactions] = useState([]);
    const [transferData, setTransferData] = useState({
        amount: '',
        toAccountId: ''
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState('');
    const [isTransferring, setIsTransferring] = useState(false);

    useEffect(() => {
        if (!user) return;
        let isMounted = true;
        const controller = new AbortController();

        const fetchData = async () => {
            try {
                setLoading(true);
                console.log('Starting data fetch...');

                const [balanceResponse, transactionsResponse] = await Promise.all([
                    getAccountBalance(),
                    getUserTransactions()
                ]);

                console.log('API responses:', {
                    balance: balanceResponse,
                    transactions: transactionsResponse
                });

                if (isMounted) {
                    setBalance(balanceResponse);
                    setTransactions(transactionsResponse);
                    setError(null);
                }
            } catch (err) {
                console.error('Fetch error details:', {
                    message: err.message,
                    response: err.response?.data,
                    status: err.response?.status
                });

                if (isMounted) {
                    setError(err.message || 'Failed to load data');
                }
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        };

        fetchData();

        return () => {
            isMounted = false;
            controller.abort();
        };
    }, [user]);

    const handleTransfer = async (e) => {
        e.preventDefault();

        // Валидация на клиенте
        if (!transferData.amount || !transferData.toAccountId) {
            setError("Заполните все поля");
            return;
        }

        if (transferData.toAccountId === user?.id?.toString()) {
            setError("Нельзя перевести деньги самому себе");
            return;
        }

        try {
            setIsTransferring(true);
            setError(null);
            setSuccess('');

            // Выполняем перевод
            const result = await transferMoney(transferData.amount, transferData.toAccountId);

            // Обновляем данные после успешного перевода
            const [newBalance, newTransactions] = await Promise.all([
                getAccountBalance(),
                getUserTransactions()
            ]);

            setBalance(newBalance);
            setTransactions(newTransactions);
            setTransferData({ amount: '', toAccountId: '' });

            // Показываем успешное сообщение
            setSuccess(result.message || 'Перевод выполнен успешно!');

        } catch (error) {
            setError(error.message);
        } finally {
            setIsTransferring(false);
        }
    };

    // Helper function to get icon based on transaction type
    const getTransactionIcon = (type) => {
        switch (type) {
            case 'TRANSFER_IN':
                return <ArrowUpwardIcon color="success" />;
            case 'TRANSFER_OUT':
                return <ArrowDownwardIcon color="error" />;
            case 'LOAN_CREATED':
                return <CreditCardIcon color="primary" />;
            case 'LOAN_APPROVED':
                return <MoneyIcon color="success" />;
            case 'LOAN_PAYMENT':
                return <PaymentIcon color="warning" />;
            case 'LOAN_PAID':
                return <PaymentIcon color="success" />;
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

    if (loading || !user) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '70vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Typography variant="h4" gutterBottom sx={{ mb: 3 }}>
                Личный кабинет
            </Typography>

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
                {/* Balance Card */}
                <Grid item xs={12} md={4}>
                    <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                            <AccountBalanceIcon color="primary" sx={{ fontSize: 40, mr: 2 }} />
                            <Typography variant="h6">Баланс счета</Typography>
                        </Box>
                        <Typography variant="h4" sx={{ color: '#2E7D32', fontWeight: 'bold', mb: 2 }}>
                            {parseFloat(balance).toLocaleString('ru-RU', { minimumFractionDigits: 2 })} сом
                        </Typography>
                        {user?.id && (
                            <Typography variant="body2" color="textSecondary">
                                Ваш ID: {user.id}
                            </Typography>
                        )}
                    </Paper>
                </Grid>

                {/* Transfer Card */}
                <Grid item xs={12} md={8}>
                    <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
                        <Typography variant="h6" gutterBottom>
                            <SendIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                            Перевод средств
                        </Typography>
                        <Box component="form" onSubmit={handleTransfer} sx={{ mt: 2 }}>
                            <Grid container spacing={2}>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        fullWidth
                                        label="ID получателя"
                                        value={transferData.toAccountId}
                                        onChange={(e) => setTransferData({
                                            ...transferData,
                                            toAccountId: e.target.value
                                        })}
                                        required
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        fullWidth
                                        label="Сумма перевода"
                                        type="number"
                                        inputProps={{ min: 0, step: 0.01 }}
                                        value={transferData.amount}
                                        onChange={(e) => setTransferData({
                                            ...transferData,
                                            amount: e.target.value
                                        })}
                                        required
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <Button
                                        type="submit"
                                        variant="contained"
                                        fullWidth
                                        disabled={isTransferring}
                                        startIcon={<SendIcon />}
                                    >
                                        {isTransferring ? 'Выполняется...' : 'Отправить перевод'}
                                    </Button>
                                </Grid>
                            </Grid>
                        </Box>
                    </Paper>
                </Grid>

                {/* Transactions Table */}
                <Grid item xs={12}>
                    <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
                        <Typography variant="h6" gutterBottom>
                            <PaymentIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                            История транзакций
                        </Typography>
                        
                        {transactions.length === 0 ? (
                            <Typography variant="body2" sx={{ textAlign: 'center', mt: 2, color: 'text.secondary' }}>
                                У вас пока нет транзакций
                            </Typography>
                        ) : (
                            <TableContainer>
                                <Table>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>Тип</TableCell>
                                            <TableCell>Дата</TableCell>
                                            <TableCell>Сумма</TableCell>
                                            <TableCell>Описание</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {transactions.map((transaction) => (
                                            <TableRow key={transaction.id}>
                                                <TableCell>
                                                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                        {getTransactionIcon(transaction.type)}
                                                        <Typography variant="body2" sx={{ ml: 1 }}>
                                                            {transaction.type}
                                                        </Typography>
                                                    </Box>
                                                </TableCell>
                                                <TableCell>{formatDate(transaction.date)}</TableCell>
                                                <TableCell sx={{ 
                                                    color: transaction.type === 'TRANSFER_OUT' || transaction.type === 'LOAN_PAYMENT' 
                                                        ? 'error.main' 
                                                        : transaction.type === 'TRANSFER_IN' || transaction.type === 'LOAN_APPROVED' 
                                                            ? 'success.main' 
                                                            : 'text.primary',
                                                    fontWeight: 'medium' 
                                                }}>
                                                    {transaction.type === 'TRANSFER_OUT' || transaction.type === 'LOAN_PAYMENT' ? '- ' : transaction.type === 'TRANSFER_IN' || transaction.type === 'LOAN_APPROVED' ? '+ ' : ''}
                                                    {transaction.amount ? transaction.amount.toLocaleString('ru-RU', { minimumFractionDigits: 2 }) : '0.00'} сом
                                                </TableCell>
                                                <TableCell>{transaction.description}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        )}
                    </Paper>
                </Grid>
            </Grid>
        </Container>
    );
};

export default Account;