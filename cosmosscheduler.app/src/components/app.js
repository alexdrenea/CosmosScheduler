import axios from 'axios'
import React from 'react';
import AccountSchedules from './accountSchedules'
import LoadingSpinner from './loadingSpinner'
import Header from './header'

import {API_URL, API_HEADERS} from '../const';
import '../styles/app.css';
import accounts from '../mockdata/accounts.json';

class App extends React.Component {

  constructor(props, context) {
    super(props, context);

    this.state = {
      data: [],
      loading: true,
    }
  
  }
  componentDidMount() {
    this._fetchSchedules();
    console.log(API_URL)
  }

  _fetchSchedules() {
    return axios.get(API_URL, API_HEADERS).then(
      (result) => { 
        console.log(result.data);
        this.setState( { data: result.data, loading: false } );
      },
      (err) => { 
        this.setState( { data: accounts, loading: false } );
        console.log(err);
      }
    );
  }

  render() {
    return (
      <div>
        <Header/>
        <div className="app">
          
          <AccountSchedules data={this.state.data} loading={this.state.loading}/>

          <LoadingSpinner loading={this.state.loading}/>
        </div>
      </div>
    );
  }
}

export default App;
