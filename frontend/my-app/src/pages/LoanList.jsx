import React, { useEffect, useState } from 'react';

import api from '../../api';


const LoanList = ({ userId }) => {

    const [loans, setLoans] = useState([]);

    const [errorMessage, setErrorMessage] = useState('');


    useEffect(() => {

        const fetchLoans = async () => {
            try {
                const response = await api.get(`/loans/user/${userId}`);
                setLoans(response.data);
            } catch (error) {
                setErrorMessage(error.response?.data?.message || 'Ошибка при загрузке');
            }
        };

        if (userId) fetchLoans();

    }, [userId, loanUpdated]);


    return (

        <div>

            <h2>Ваши кредиты</h2>

            {errorMessage && <p>{errorMessage}</p>}

            {loans.length === 0 ? (

                <p>У вас нет кредитов.</p>

            ) : (

                <ul>

                    {loans.map((loan) => (

                        <li key={loan.id}>

                            <p>Сумма: {loan.amount} сом</p>

                            <p>Процентная ставка: {loan.interestRate}%</p>

                            <p>Дата начала: {new Date(loan.startDate).toLocaleDateString()}</p>

                            <p>Дата окончания: {new Date(loan.endDate).toLocaleDateString()}</p>

                        </li>

                    ))}

                </ul>

            )}

        </div>

    );

};


export default LoanList;