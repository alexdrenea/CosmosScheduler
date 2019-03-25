import React from 'react';
import AccountSchedule from './accountSchedule'
import '../styles/accountSchedule.css';

class AccountSchedules extends React.Component {
  constructor(props, context) {
    super(props, context);

    this.state = {
        data: this.props.data,
        loading: true,
    };
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
      data: newData
    });
  }

  componentWillReceiveProps(nextProps){
    this.setState({
      data: nextProps.data,
      loading: nextProps.loading
    });
  }

  render() {
    const schedules = this.state.data;
    if (this.state.loading) return "";
    return (
        <ul className="schedule-items--container">
            {schedules.map(account=>{
              return <AccountSchedule key={account.accountName} accountSchedule={account}/>
            })}
           
            <li><button onClick={()=> this._addNewAccount()}>Add new</button></li>
        </ul>
    );
  }
    
}

export default AccountSchedules