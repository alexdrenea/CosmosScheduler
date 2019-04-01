import React from "react";
import "../styles/accountSchedule.css";

class AccountSchedule extends React.Component {
  render() {
    const account = this.props.account;
    return (
      <div className="mui-panel">
        <div className="mui--text-headline">
          <span className="schedule-field-property">Account Name:</span>
          <span>{account.accountName}</span>
        </div>
        {/* <div>Account Key: ******</div> */}
        {account.databases.map(database => {
          return (
            <div key={database.name} className="schedule-database schedule-box">
              <div>
                <span className="schedule-field-property">Database:</span>
                <span>{database.name}</span>
              </div>
              {database.collections.map(collection => {
                return (
                  <div key={collection.name} className="schedule-collection schedule-box">
                    <div>
                      <span className="schedule-field-property">Collection:</span>
                      <span>{collection.name}</span>
                    </div>
                    <div>
                      <span className="schedule-field-property">Timezone:</span>
                      <span>{collection.timezone}</span>
                    </div>
                    <span className="schedule-field-property"> Schedules:</span>
                    <div className="schedule-schedule">
                      {collection.schedules.map(schedule => {
                        return (
                          <div key={schedule.startHour}>
                            {schedule.startHour}:00  -> {schedule.requestUnits} RUs
                          </div>
                        );
                      })}
                      </div>
                  </div>
                );
              })}
            </div>
          );
        })}

        <div>
          <button className="mui-btn mui-btn--primary" onClick={this.props.onEdit}>Edit</button>
          <button className="mui-btn mui-btn--danger" color="danger" onClick={this.props.onRemove}>Remove</button>
        </div>
      </div>
    );
  }
}

export default AccountSchedule;
