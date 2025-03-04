import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Route, Link, Routes } from 'react-router-dom';
import { ReactNotifications } from 'react-notifications-component';
import 'react-notifications-component/dist/theme.css';
import Festival from './components/Festival';
import Purchase from './components/Purchase';
import MyTickets from './components/MyTickets';
import SecondaryMarket from './components/SecondaryMarket';
import Web3 from 'web3';
import './App.css';

const App = () => {
  const [web3, setWeb3] = useState(null);
  const [account, setAccount] = useState('');

  useEffect(() => {
    const initializeWeb3 = async () => {
      try {
        const web3Instance = new Web3('http://127.0.0.1:7545'); // Strictly using Ganache
        setWeb3(web3Instance);
        
        let accounts = await web3Instance.eth.getAccounts();
        
        // Retry fetching accounts if none are found
        if (accounts.length === 0) {
          console.warn('No accounts found. Retrying...');
          await new Promise(resolve => setTimeout(resolve, 2000)); // Wait for 2 sec
          accounts = await web3Instance.eth.getAccounts();
        }

        if (accounts.length === 0) {
          throw new Error('No Ethereum accounts found. Please check if Ganache is running.');
        }

        setAccount(accounts[0]);
        console.log(`Using account: ${accounts[0]}`);
      } catch (error) {
        console.error('Error initializing Web3:', error);
      }
    };
    
    initializeWeb3();
  }, []);

  return (
    <Router>
      <div>
        <ReactNotifications />
        <nav style={{ padding: '0px 30px' }}>
          <div className="nav-wrapper">
            <Link to="/buyTickets" className="brand-logo left">Festival Marketplace</Link>
            <ul className="right hide-on-med-and-down">
              <li><Link to="/createFestival">Add Festival</Link></li>
              <li><Link to="/buyTickets">Buy Tickets</Link></li>
              <li><Link to="/market">Secondary Market</Link></li>
              <li><Link to="/tickets">My Tickets</Link></li>
            </ul>
          </div>
        </nav>

        <Routes>
          <Route path="/createFestival" element={<Festival />} />
          <Route path="/buyTickets" element={<Purchase />} />
          <Route path="/market" element={<SecondaryMarket />} />
          <Route path="/tickets" element={<MyTickets />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
