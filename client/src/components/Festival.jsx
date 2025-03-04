import React, { Component } from 'react';
import Web3 from 'web3';
import festivalFactory from '../proxies/FestivalFactory';
import festToken from '../proxies/FestToken';
import FestivalNFT from '../proxies/FestivalNFT';
import renderNotification from '../utils/notification-handler';

class Festival extends Component {
  constructor() {
    super();

    this.web3 = new Web3(new Web3.providers.HttpProvider('http://127.0.0.1:7545'));

    this.state = {
      name: '',
      symbol: '',
      price: '',
      supply: '',
      accounts: [],
    };
  }

  async componentDidMount() {
    const accounts = await this.web3.eth.getAccounts();
    this.setState({ accounts });

    if (!accounts.length) {
      console.error('Ganache accounts not found. Ensure Ganache is running.');
    }
  }

  onCreateFestival = async (e) => {
    e.preventDefault();
    try {
      const { accounts, name, symbol, price, supply } = this.state;
      const organiser = accounts[0];

      if (!name || !symbol || !price || !supply) {
        throw new Error('All fields are required');
      }

      const response = await festivalFactory.methods.createNewFest(
        festToken._address,
        name,
        symbol,
        this.web3.utils.toWei(price, 'ether'),
        supply
      ).send({ from: organiser, gas: 6700000 });

      const { ntfAddress, marketplaceAddress } = response.events.Created.returnValues;
      renderNotification('success', 'Success', 'Festival Created Successfully!');

      const nftInstance = await FestivalNFT(ntfAddress);
      const batches = Math.ceil(supply / 30);
      
      for (let i = 0; i < batches; i++) {
        const batchSize = Math.min(30, supply - (i * 30));
        await nftInstance.methods.bulkMintTickets(batchSize, marketplaceAddress).send({ from: organiser, gas: 6700000 });
      }
    } catch (err) {
      console.error('Error while creating festival', err);
      renderNotification('danger', 'Error', err.message);
    }
  };

  inputChangedHandler = (e) => this.setState({ [e.target.name]: e.target.value });

  render() {
    return (
      <div className="container center">
        <h5>Create New Festival</h5>
        <form onSubmit={this.onCreateFestival}>
          <input type="text" name="name" placeholder="Festival Name" onChange={this.inputChangedHandler} />
          <input type="text" name="symbol" placeholder="Festival Symbol" onChange={this.inputChangedHandler} />
          <input type="text" name="price" placeholder="Ticket Price (ETH)" onChange={this.inputChangedHandler} />
          <input type="text" name="supply" placeholder="Total Supply" onChange={this.inputChangedHandler} />
          <button type="submit" className="custom-btn login-btn">Create Festival</button>
        </form>
      </div>
    );
  }
}

export default Festival;
