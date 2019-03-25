import React from 'react';
import AccountSchedule from './accountSchedule'
import axios from 'axios';
import '../styles/accountSchedule.css';

import {API_URL, API_HEADERS} from '../api/const';

class AccountSchedules extends React.Component {
  constructor(props, context) {
    super(props, context);

    this.state = {
        accounts: this.props.data,
        loading: true,
    };
  }


  _saveNewAccount(payload) {
    return axios.post(API_URL,  payload, API_HEADERS).then(
      (result) => { 
        console.log(result.data);
        //this.setState( { data: result.data, loading: false } );
        return true;
      },
      (err) => { 
        //this.setState( { data: accounts, loading: false } );
        console.log(err);
        return false;
      }
    );
  }

  _updateAccount(payload) {
    return axios.put(API_URL,  payload, API_HEADERS).then(
      (result) => { 
        //this.setState( { data: result.data, loading: false } );
        return true;
      },
      (err) => { 
        console.log(err);
        return false;
      }
    );
  }


  _addNewAccount() {
    const newItem = {
      accountName: 'test',
      accountKey: '',
      databases: []
    };

    let newData = this.state.data;
    newData.push(newItem);
    this.setState({
      accounts: newData
    });
  }

  componentWillReceiveProps(nextProps){
    this.setState({
      accounts: nextProps.data,
      loading: nextProps.loading
    });
  }

  render() {
    const accounts = this.state.accounts;
    if (this.state.loading) return "";
    return (
        <ul className="schedule-items--container">
            {accounts.map(account=>{
              return <AccountSchedule key={account.accountName} account={account} saveCallback={this._updateAccount}/>
            })}
           
            <li><button onClick={()=> this._addNewAccount()}>Add new</button></li>
        </ul>
    );
  }
    
}

export default AccountSchedules