import React from 'react';
import AccountSchedule from './accountSchedule'
import AccountScheduleEdit from './accountScheduleEdit';
import SweetAlert from 'react-bootstrap-sweetalert'
import axios from 'axios';
import Popup from 'reactjs-popup'
import '../styles/accountSchedule.css';

import {getNewAccount} from '../actions/accountSchedule'
import {API_URL, API_HEADERS} from '../const';


class AccountSchedules extends React.Component {
  constructor(props, context) {
    super(props, context);

    this.state = {
        accounts: this.props.data,
        loading: true,
        alert: null,
        editingAccount: null
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
        return {success: true, data: result};
      },
      (err) => { 
        console.log(err);
        this.showSweetAlert("Failed to add account", `Error: ${err.message}`, "fail", null, "default", "Ok", false, "default", "");
        return {success: false, data: err.message};
      }
    );
  }

  _updateAccount = payload => {
    return axios.put(API_URL,  payload, API_HEADERS).then(
      (result) => { 
        let newData = this.state.accounts;
        const updatedAccount = newData.find((acc)=> { return acc.accountName.toLowerCase() === payload.accountName.toLowerCase() });
        newData[newData.indexOf(updatedAccount)] = payload;
        return {success: true, data: result};
      },
      (err) => { 
        console.log(err);
        this.showSweetAlert("Failed to update account", `Error: ${err.message}`, "fail", null, "default", "Ok", false, "default", "");
        return {success: false, data: err.message};
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
        return {success: true, data: result};
      },
      (err) => { 
        console.log(err);
        this.showSweetAlert("Failed to remove account", `Error: ${err.message}`, "fail", null, "default", "Ok", false, "default", "");
        return {success: false, data: err.message};
      }
    );
  }
  

  showSweetAlert(title, message, style, confirmCallBack, confirmButtonStyle, confirmButtonText, showCancel, cancelButtonStyle, cancelButtonText) {
    this.setState({
        alert: (
            <SweetAlert 
                success = {style === "success"}
                danger = {style === "fail"}
                info = {style === "confirm"}
                showCancel = {showCancel}
                confirmBtnText = {confirmButtonText}
                cancelBtnText = {cancelButtonText}
                confirmBtnBsStyle= {confirmButtonStyle}
                cancelBtnBsStyle = {cancelButtonStyle}
                title = {title}
                onConfirm = { ()=> {
                  if (confirmCallBack) confirmCallBack();                 
                  this.setState({alert: null});
                }}
                onCancel = {()=> this.setState({alert: null})}
            >
            {message}
            </SweetAlert>
        )            
    });
  }

  renderEditPopup(){
    if (this.state.editingAccount)
    {  
      const isNewAccount = !this.state.accounts.find((acc)=> acc.accountName === this.state.editingAccount.accountName);
      return(
        <Popup closeOnDocumentClick={false} open={true} onClose={()=>this.setState({editingAccount: null})} modal>
        {close => (
          <div className="modal add-schedule-popup">
            <div className="mui--text-headline mui--text-center"> {isNewAccount ? "Add new Account" : "Edit account"} </div>
            <div className="content">
              <AccountScheduleEdit 
                    key="account_edit" 
                    data={this.state.editingAccount} 
                    isNewAccount={isNewAccount}
                    saveCallback={isNewAccount ? this._addAccount.bind(this) : this._updateAccount.bind(this)} 
                    closeCallback={close}/>
            </div>
            <div className="actions"></div>
          </div>
        )}
      </Popup>
      );
    }
  }

  render() {
    const accounts = this.state.accounts;
    if (this.state.loading) return "";
    return (
      <div>
        <ul className="schedule-items--container">
            {accounts.map(account=>{
              return <AccountSchedule 
                        key={account.accountName} 
                        account={account} 
                        onEdit={()=>this.setState({editingAccount: account})} 
                        onRemove={()=> this.showSweetAlert("Remove account", "Are you sure you want to remove this account", "confirm",  () => {this._removeAccount(account.accountName)}, "danger","Yes",true,"default","No")}/>
            })}
            
            <button className="mui-btn mui-btn--flat mui-btn--primary fas fa-plus" onClick={()=>this.setState({editingAccount: getNewAccount()})}>New Account</button>

            {this.renderEditPopup()}

        </ul>
        {this.state.alert}
      </div>
    );
  }
    
}


export default AccountSchedules