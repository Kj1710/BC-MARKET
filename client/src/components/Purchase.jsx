import React, { Component } from 'react';
import Web3 from 'web3';
import festivalFactory from '../proxies/FestivalFactory';
import FestivalMarketplace from '../proxies/FestivalMarketplace';
import festToken from '../proxies/FestToken';
import renderNotification from '../utils/notification-handler';

class Purchase extends Component {
  constructor() {
    super();

    this.state = { festivals: [], accounts: [] };
    this.web3 = new Web3(new Web3.providers.HttpProvider('http://127.0.0.1:7545'));
  }

  async componentDidMount() {
    const accounts = await this.web3.eth.getAccounts();
    if (accounts.length < 2) {
      console.error('Not enough accounts found in Ganache. Please check Ganache.');
      return;
    }
    this.setState({ accounts });
    await this.updateFestivals();
  }
  

  updateFestivals = async () => {
    try {
      const { accounts } = this.state;
      const activeFests = await festivalFactory.methods.getActiveFests().call({ from: accounts[0] });

      const fests = await Promise.all(activeFests.map(async (fest) => {
        const details = await festivalFactory.methods.getFestDetails(fest).call({ from: accounts[0] });

        // Since details might be an object, extract properties correctly
        const festName = details.festName || details[0];
        const ticketPrice = details.ticketPrice || details[2];
        const totalSupply = details.totalSupply || details[3];

        return (
          <tr key={fest}>
            <td>{festName}</td>
            <td>{this.web3.utils.fromWei(ticketPrice.toString(), 'ether')}</td>
            <td>{totalSupply}</td>
            <td>
              <button onClick={() => this.onPurchaseTicket(fest, ticketPrice)}>Buy</button>
            </td>
          </tr>
        );
      }));

      this.setState({ festivals: fests });
    } catch (err) {
      console.error('Error updating festivals:', err);
      renderNotification('danger', 'Error', err.message);
    }
  };

  onPurchaseTicket = async (festival, ticketPrice) => {
    try {
      const { accounts } = this.state;
      const buyer = accounts[1]; 
      const marketplace = await FestivalMarketplace(festival);
  
      console.log('Approving token spending...');
      await festToken.methods.approve(festival, ticketPrice).send({ from: buyer, gas: 6700000 });
  
      console.log('Purchasing ticket...');
      await marketplace.methods.purchaseTicket().send({ from: buyer, gas: 6700000 });
  
      renderNotification('success', 'Success', 'Ticket Purchased!');
      await this.updateFestivals();
    } catch (err) {
      console.error('Error purchasing ticket:', err);
      renderNotification('danger', 'Error', err.message);
    }
  };
  

  render() {
    return (
      <div className="container">
        <h4>Buy Tickets</h4>
        <table>
          <thead>
            <tr>
              <th>Festival</th>
              <th>Price (ETH)</th>
              <th>Tickets Left</th>
              <th>Purchase</th>
            </tr>
          </thead>
          <tbody>{this.state.festivals}</tbody>
        </table>
      </div>
    );
  }
}

export default Purchase;
