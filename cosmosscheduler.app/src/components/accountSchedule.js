import React from "react";
import "../styles/accountSchedule.css";

class AccountSchedule extends React.Component {
  render() {
    const account = this.props.account;
    return (
      <ul className="schedule-item">
        <div>Account Name: {account.accountName}</div>
        <div>Account Key: ******</div>
        {account.databases.map(database => {
          return (
            <div key={database.name}>
              Database: {database.name}
              {database.collections.map(collection => {
                return (
                  <div key={collection.name}>
                    Collection: {collection.name}<br/>
                    Timezone: {collection.timezone}
                    {collection.schedules.map(schedule => {
                      return (
                        <div key={schedule.startHour}>
                          {schedule.startHour}: {schedule.requestUnits} RUs
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          );
        })}

        <div>
          <button onClick={this.props.onEdit}>Edit</button>
          <button onClick={this.props.onRemove}>Remove</button>
        </div>
      </ul>
    );
  }
}

export default AccountSchedule;
