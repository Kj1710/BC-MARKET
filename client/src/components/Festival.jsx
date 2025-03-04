import React, { Component } from 'react';
import Web3 from 'web3';
import festivalFactory from '../proxies/FestivalFactory';
import festToken from '../proxies/FestToken';
import FestivalNFT from '../proxies/FestivalNFT';
import renderNotification from '../utils/notification-handler';

class Festival extends Component {
  constructor() {
    super();

    // Initialize Web3 with Ganache
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
    try {
      // Fetch available accounts from Ganache
      const accounts = await this.web3.eth.getAccounts();
      this.setState({ accounts });

      if (accounts.length === 0) {
        console.error('No accounts found in Ganache. Please check Ganache settings.');
      }
    } catch (error) {
      console.error('Error connecting to Ganache:', error);
    }
  }

  onCreateFestival = async (e) => {
    try {
      e.preventDefault();
      if (!this.web3) {
        throw new Error('Web3 is not initialized');
      }

      const { accounts, name, symbol, price, supply } = this.state;
      const organiser = accounts[0];

      if (!organiser) {
        throw new Error('No Ethereum account found. Please check Ganache.');
      }

      if (!name || !symbol || !price || !supply) {
        throw new Error('All fields are required');
      }

      const { events: { Created: { returnValues: { ntfAddress, marketplaceAddress } } } } = await festivalFactory.methods.createNewFest(
        festToken._address,
        name,
        symbol,
        this.web3.utils.toWei(price, 'ether'),
        supply
      ).send({ from: organiser, gas: 6700000 });

      renderNotification('success', 'Success', `Festival Created Successfully!`);

      const nftInstance = await FestivalNFT(ntfAddress);
      const batches = Math.ceil(supply / 30);
      let batchSupply = 30;
      let curCount = 0;
      let prevCount = 0;

      if (supply < 30) {
        await nftInstance.methods.bulkMintTickets(supply, marketplaceAddress).send({ from: organiser, gas: 6700000 });
      } else {
        for (let i = 0; i < batches; i++) {
          prevCount = curCount;
          curCount += 30;
          if (supply < curCount) {
            batchSupply = supply - prevCount;
          }
          await nftInstance.methods.bulkMintTickets(batchSupply, marketplaceAddress).send({ from: organiser, gas: 6700000 });
        }
      }
    } catch (err) {
      console.error('Error while creating new festival', err);
      renderNotification('danger', 'Error', `${err.message}`);
    }
  };

  inputChangedHandler = (e) => {
    this.setState({ [e.target.name]: e.target.value });
  };

  render() {
    return (
      <div className="container center">
        <div className="row">
          <div className="container">
            <h5 style={{ padding: "30px 0px 0px 10px" }}>Create new Festival</h5>
            <form onSubmit={this.onCreateFestival}>
              <label className="left">Fest Name</label>
              <input id="name" className="validate" placeholder="Fest Name" type="text" name="name" onChange={this.inputChangedHandler} /><br /><br />
              <label className="left">Fest Symbol</label>
              <input id="symbol" className="validate" placeholder="Fest Symbol" type="text" name="symbol" onChange={this.inputChangedHandler} /><br /><br />
              <label className="left">Ticket Price</label>
              <input id="price" placeholder="Ticket Price" type="text" name="price" onChange={this.inputChangedHandler} /><br /><br />
              <label className="left">Total Supply</label>
              <input id="supply" placeholder="Total Supply" type="text" name="supply" onChange={this.inputChangedHandler} /><br /><br />
              <button type="submit" className="custom-btn login-btn">Create Festival</button>
            </form>
          </div>
        </div>
      </div>
    );
  }
}

export default Festival;
