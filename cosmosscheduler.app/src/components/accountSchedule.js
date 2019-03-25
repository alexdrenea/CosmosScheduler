import React from 'react';
import '../styles/accountSchedule.css'

class AccountSchedule extends React.Component {
    constructor(props, context) {
        super(props, context);

        this.state = {
            isEditing: false,
        };
    }

    _renderDatabase (database) {
        if (this.state.isEditing)
        {
            return ( 
                <div key={database.name}>
                    database: 
                    <input vlalue={database.name}/>
                    {database.collections.map(collection=>{ return this._renderCollection(collection); })}
                </div>
            );
        } else {
            return ( 
                <div key={database.name}>
                    database: {database.name}
                    {database.collections.map(collection=>{ return this._renderCollection(collection); })}
                </div>
            );
        }
    }

    _renderCollection (collection) {
        return(
            <div key={collection.name}>
                collection: {collection.name}
                {collection.scheduleItems.map( (schedule) => { return this._renderScheduleItem(schedule); })}
            </div>   
        );
    }

    _renderScheduleItem (schedule) {
        return(
            <div key={schedule.startHourUTC}>
                {schedule.startHourUTC}: {schedule.requestUnits} RUs
            </div>
        );
    }

    render() {
        const data = this.props.accountSchedule;
        return (
            <ul className="schedule-item">
                <li>Account Name: {data.accountName}</li>
                <li> Account Key: ******</li>
                {data.databases.map(database => { 
                    return this._renderDatabase(database); 
                })}

                {this.state.isEditing ? 
                    (<div><button onClick={()=> this.setState({isEditing: false})}>Cancel</button>
                     <button>Save</button></div>) : 
                    (<button onClick={()=> this.setState({isEditing: true})}>Edit</button>) 
                }
                
                
            </ul>
        );
    }

}

export default AccountSchedule;
