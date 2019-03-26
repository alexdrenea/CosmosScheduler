import React from 'react';
import AccountSchedule from './accountSchedule'
import axios from 'axios';
import Popup from 'reactjs-popup'
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
  
  componentWillReceiveProps(nextProps){
    this.setState({
      accounts: nextProps.data,
      loading: nextProps.loading
    });
  }


  _addAccount = payload => {
    return axios.post(API_URL,  payload, API_HEADERS).then(
      (result) => { 
        let newData = this.state.accounts;
        newData.push(payload);
        this.setState({
          accounts: newData
        });
        return true;
      },
      (err) => { 
        console.log(err);
        return false;
      }
    );
  }

  _updateAccount = payload => {
    return axios.put(API_URL,  payload, API_HEADERS).then(
      (result) => { 
        return true;
      },
      (err) => { 
        console.log(err);
        return false;
      }
    );
  }

  _removeAccount = accountName => {
    return axios.delete(`${API_URL}/${accountName}`).then(
      (result) => { 
        let newData = this.state.accounts;
        const removedAccount = newData.find((acc)=> { return acc.accountName.toLowerCase() === accountName.toLowerCase() });
        if (removedAccount) {
          const index = newData.indexOf(removedAccount);
          newData.splice(index,1);
          this.setState({
            accounts: newData
          });
        }
        return true;
      },
      (err) => { 
        console.log(err);
        return false;
      }
    );
  }
  
  render() {
    const accounts = this.state.accounts;
    if (this.state.loading) return "";
    return (
        <ul className="schedule-items--container">
            {accounts.map(account=>{
              return <AccountSchedule key={account.accountName} account={account} saveCallback={this._updateAccount.bind(this)} deleteCallback={this._removeAccount.bind(this)}/>
            })}
           
           <Popup closeOnDocumentClick={false} trigger={<button className="button"> Add new account </button>} modal>
              {close => (
                <div className="modal">
                  <div className="header"> Add new Account </div>
                  <div className="content">
                    <AccountSchedule key="new_account" account={ {databases:[]}} isNewAccount={true} isEditing={true} saveCallback={this._addAccount.bind(this)} closeCallback={close}/>
                  </div>
                  <div className="actions"></div>
                </div>
              )}
            </Popup>
        </ul>
    );
  }
    
}

export default AccountSchedules