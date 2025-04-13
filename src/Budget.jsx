import React, { useEffect, useState } from 'react'

const Budget = () => {
    const [income, setIncome] = useState('');
    const [expenseName, setExpenseName] = useState('');
    const [expenseCategory, setExpenseCateory] = useState('');
    const [expenseAmount, setExpenseAmount] = useState('');
    const [expenses, setExpenses] = useState([]);
    const [isEditing, setIsEditing] = useState(false);
    const [editId, setEditId] = useState(null);
    const [darkMode, setDarkMode] = useState(() => {
        const storedMode = localStorage.getItem("darkMode");
        return storedMode === 'true';
    });
    const [filteredCategory, setFilteredCategory] = useState('All');
    const [monthlyBudget, setMonthlyBudget] = useState('');
    const [date, setDate] = useState('');
    const [sortOrder, setSortOrder] = useState('newest');

    const toggleDarkMode = () => {
        setDarkMode((prevMode) => !prevMode);
    };

    useEffect(() => {
        const item = localStorage.getItem('monthlyBudget');
        if(item) {
            const storedData = JSON.parse(item)
            setMonthlyBudget(storedData);
        }
    }, []);

    useEffect(() => {
        localStorage.setItem('monthlyBudget', monthlyBudget)
    },[monthlyBudget]);

    useEffect(() => {
        localStorage.setItem('darkMode', darkMode);
    },[darkMode]);

    useEffect(() => {
        document.body.className = darkMode ? 'darkmode' : '';
    },[darkMode]);

    useEffect(() => {
        const savedData = JSON.parse(localStorage.getItem('budgetPlan'));
        if(savedData) {
            setIncome(savedData.income);
            setExpenses(savedData.expenses);
        }
    },[]);

    useEffect(() => {
        localStorage.setItem('budgetPlan', JSON.stringify({income, expenses}));
    }, [income, expenses]);

    useEffect(() => {
        localStorage.setItem("expenses", JSON.stringify(expenses));
    },[expenses])

    const handleSubmit = (e) => {
        e.preventDefault();

    if (!expenseName || !expenseCategory || !expenseAmount) return;

    if(isEditing) {
        const updatedExpenses = expenses.map((expense) => 
        expense.id === editId ? {
            ...expense,
            expenseName, 
            expenseCategory, 
            expenseAmount: Number(expenseAmount)}
            : expense
        );
        setExpenses(updatedExpenses);
        setEditId(null);
        setIsEditing(false);
    } else {
        const newExpense = {
            id: Date.now(),
            expenseName,
            expenseAmount: Number(expenseAmount),
            expenseCategory,
            date: date || new Date().toISOString(),
        };
        setExpenses([...expenses, newExpense]);
    }

    setExpenseName('');
    setExpenseCateory('');
    setExpenseAmount('');

    console.log(editId, isEditing);
    };

    const deleteExpense = (id) => {
        const updated = expenses.filter((exp) => exp.id !== id);
        setExpenses(updated);
    }

    const handleEdit = (expense) => {
        setExpenseName(expense.expenseName);
        setExpenseAmount(expense.expenseAmount);
        setExpenseCateory(expense.expenseCategory);
        setEditId(expense.id);
        setIsEditing(true);
    }

    const totalExpense = expenses.reduce((sum,exp) => sum + exp.expenseAmount,0);
    const balance = income - totalExpense;
    const budgetCap = parseFloat(monthlyBudget);
    const percentageSpent = budgetCap > 0 ? (totalExpense / budgetCap) * 100 : 0;

    const filteredExpenses = filteredCategory === 'All' ? expenses :
    expenses.filter((expense) => expense.expenseCategory === filteredCategory);

    const sortedExpenses = [...filteredExpenses].sort((a,b) =>{
        const dateA = new Date(a.date);
        const dateB = new Date(b.date);

        return sortOrder === 'newest'
        ? dateB - dateA
        : dateA - dateB;
    })

    const exportToCSV = () => {
        const headers = ['Title', 'Amount', 'Category', 'Date'];
        const rows = expenses.map(exp => [
            exp.expenseName,
            exp.expenseAmount,
            exp.expenseCategory,
            new Date(exp.date).toLocaleDateString()
        ]);

        const csvContent = [
            headers.join(','),
            ...rows.map(row => row.join(','))
        ].join('\n');

        const blob = new Blob([csvContent], {type: 'text/csv'});
        const url = URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = url;
        a.download = 'expense.csv';
        a.click();

        URL.revokeObjectURL(url); // clean up
    }

  return (
    <div className= {`app-container ${darkMode ? 'darkmode' : ''}`}>
        <div className="app-header">
        <h1>Budget Buddy</h1>
        <button
            className='btn'
            onClick={toggleDarkMode}>
            {darkMode ? 'Light Mode' : 'Dark Mode'}
        </button>
        </div>

        <form className="inputFields" onSubmit={handleSubmit}>
            <input 
                type="number"
                value={income}
                placeholder='Enter your income amount'
                onChange={(e) => setIncome(parseFloat(e.target.value))}/>
            <div className="budget-cap">
                <label>Set Monthly Budget</label>
                <input 
                    type="number"
                    value={monthlyBudget}
                    onChange={(e) => setMonthlyBudget(Number(e.target.value))}
                    placeholder='Enter your monthly budget amount' />
            </div>
            <input 
                type="text"
                value={expenseName}
                placeholder='Enter your item'
                onChange={(e) => setExpenseName(e.target.value)}/>
            <input 
                type="text"
                value={expenseCategory}
                placeholder='Expense category eg. Transport, Utilities, Food, Entertainment'
                onChange={(e) => setExpenseCateory(e.target.value)}/>
            <input 
                type="number"
                value={expenseAmount}
                placeholder='Your expense amount'
                onChange={(e) => setExpenseAmount(e.target.value)}/>
            <input 
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required />
            <button
                className='btn btn-primary'
                type='submit'>
                    {isEditing ? "Update Expense" : "Add Expense"}
                </button>
                <select 
                    value={filteredCategory}
                    onChange={(e) => setFilteredCategory(e.target.value)}>
                    <option value="All">All</option>
                    <option value="Food">Food</option>
                    <option value="Transport">Transport</option>
                    <option value="Entertainment">Entertainment</option>
                    <option value="Utilities">Utilities</option>
                </select>

                <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value)}>
                    <option value="newest">Newest First</option>
                    <option value="oldest">Oldest First</option>
                </select>
        </form>


        <div className="summary">
            <div className="summary-item">
                <p>
                    Total income: Ksh.{income || 0}
                </p>
                <p>
                    Total Expenses: Ksh. {totalExpense}
                </p>
                <p>
                    Balance:{''}
                    <span className= {balance >= 0 ? 'balance-positive' : 'balance-negative'}>
                        Ksh. {balance}
                    </span> 
                </p>
            </div>
        </div>
        
        {expenses.length === 0 ? (
            <p>No expenses added yet</p>
        ) :
        sortedExpenses.map((expense) => (
           <div key={expense.id} className="expense-item">
            <p>Name: {expense.expenseName}</p>
            <p>Ksh.{expense.expenseAmount}</p>
            <p>Category: {expense.expenseCategory}</p>
            <p>Date: {new Date(expense.date).toLocaleDateString()}</p>
            <button className='btn btn-secondary' onClick={() => handleEdit(expense)}>Edit</button>
            <button className=' btn btn-danger' onClick={()=> deleteExpense(expense.id)}>Delete</button>
           </div>
        ))}

        <div className="budget-status">
            <h3>MONTHLY BUDGET</h3>
            <p className= {totalExpense > monthlyBudget ? 'over-budget' : 'within-budget'}>Total Spent: Ksh{totalExpense}</p>
            <p>Budget: ksh{monthlyBudget}</p>
            <p>
                {totalExpense > monthlyBudget ? `You are KSh${totalExpense - monthlyBudget} over budget!`
                : `You have Ksh${monthlyBudget - totalExpense} remaining.`}
            </p>
        </div>

   
        <button className='csv-btn' onClick={exportToCSV}>
            Export Expenses to CSV
        </button>
    </div>
  )
}

export default Budget