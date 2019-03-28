import React from "react";
import SweetAlert from 'react-bootstrap-sweetalert';
import Select from 'react-select'
import TimePicker from 'react-bootstrap-time-picker'
import { Formik, Form, Field, FieldArray, ErrorMessage } from "formik";

import timezonesjson from '../timezones.json';
import "../styles/accountSchedule.css";


const timeZones = timezonesjson.map((value)=>{return {label: value.text, value: value.value}});

class AccountSchedule extends React.Component {
  constructor(props, context) {
    super(props, context);

    this.state = {
      isEditing: this.props.isEditing,
      isNewAccount: this.props.isNewAccount,
      account: this.props.account,
      alert: null
    };

    //this.timeZones = timezonesjson.map((value)=>{return {label: value.text, value: value.value}});
  }

  _removeAccount(){
    if (this.props.deleteCallback){
      this.props.deleteCallback(this.state.account.accountName);
    }
  }


  _getEmptyDatabase() {
    return {
      name: "",
      collections: [this._getEmptyCollection()]
    };
  }

  _getEmptyCollection() {
    return {
      name: "",
      schedules: []
    };
  }

  validateRequired(value) {
    let error;
    if (!value) {
      error = "Please enter a value";
    }
    return error;
  }

  validateRequestUnit(value) {
    let error ='';
    if (!value) {
      error = `${error}Please enter a value. `;
    }
    if (isNaN(value)) {
      error = `${error}Please enter a numeric value. `;
    }
    if (value % 100 !== 0){
      error = `${error}\nRUs must be set in 100 increments. `;
    }
    if (value < 400){
      error = `${error}\nRUs must greater than 400. `;
    }
    return error;
  }


  showAlert(title, message, callBack, style) {
    this.setState({
        alert: (
            <SweetAlert 
                warning
                showCancel
                confirmBtnText = "Yes"
                cancelBtnText = "No"
                confirmBtnBsStyle= {style ? style : "warning"}
                cancelBtnBsStyle = "default"
                customIcon = "thumbs-up.jpg"
                title = {title}
                onConfirm = {callBack()}
                onCancel = {this.hideAlert}
            >
            {message}
            </SweetAlert>
        )            
    });
  }

  hideAlert = () => {
      this.setState({
          alert: null
      });
  }


  submitForm(values) {
    console.log(values);
    this.props.saveCallback(values.data).then(
      (result) =>{
        if (result) {
          if (this.props.closeCallback){
            this.props.closeCallback();
          } else {
          this.setState({
            account: values.data,
            isEditing: false 
          });
          }
        } else {
          alert("failed to save");
        }
      }
    )
  }



  _renderAccountEdit(account, isNewAccount) {
    
    return (
      <ul className="schedule-item">
        <Formik
          initialValues={{
            data: account,
            isNewAccount: isNewAccount
          }}
          onSubmit={values => this.submitForm(values)}
          //validateOnChange= {false}
          //validateOnBlur = {false}
          render = { formProps => {
            console.log(formProps);
            console.log(formProps.values);
            //console.log(formProps.values.data.databases[0].collections[0])
            //console.log(formProps.values.data.databases[0].collections[0].schedules)
            return (
              <Form>
                Account Name: 
                <Field name="data.accountName" placeholder="Account Name" validate={this.validateRequired}/>
                <ErrorMessage component="div" className="error" name="data.accountName"/>
                {isNewAccount ? 
                  <div>
                    Account Key:
                    <Field name="data.accountKey" placeholder="Account Key" validate={this.validateRequired}/>
                    <ErrorMessage component="div" className="error" name="data.accountKey"/>
                  </div>
                  : 
                  <div>Account Key: ******</div>
                }               
                <FieldArray //Databases
                  name="data.databases"
                  render={arrayHelpers => (
                    <div>
                      {formProps.values.data.databases.map(
                        (database, dbIndex) => (
                          <div key={`db.${dbIndex}`}>
                            Database: 
                            <Field name={`data.databases.${dbIndex}.name`} validate={this.validateRequired}/>
                            <ErrorMessage component="div" className="error" name={`data.databases.${dbIndex}.name`} />
                           
                            <FieldArray //Collections
                              name={`data.databases.${dbIndex}.collections`}
                              render={arrayHelpers => (
                                <div>
                                  {formProps.values.data.databases[dbIndex].collections.map((collection, colIndex) => (
                                    <div key={`col.${colIndex}`}>
                                      Collection:
                                      <Field name={`data.databases.${dbIndex}.collections.${colIndex}.name`} validate={this.validateRequired}/>
                                      <ErrorMessage component="div" className="error" name={`data.databases.${dbIndex}.collections.${colIndex}.name`}/>
                                      <MySelect
                                        propName={`data.databases.${dbIndex}.collections.${colIndex}.timezone`}
                                        value={formProps.values.data.databases[dbIndex].collections[colIndex].timezone}
                                        onChange={formProps.setFieldValue}
                                        onBlur={formProps.setFieldTouched}
                                      />

                                      <FieldArray //Schedules
                                        name={`data.databases.${dbIndex}.collections.${colIndex}.schedules`}
                                        render={arrayHelpers => (
                                          <div>
                                            {formProps.values.data.databases[dbIndex].collections[colIndex].schedules.map(
                                              (schedule, schedIndex) => (
                                                <div key={`sched.${schedIndex}`}>
                                                  Start hour:{" "}
                                                  {/* <Field name={`data.databases.${dbIndex}.collections.${colIndex}.schedules.${schedIndex}.startHour`}/> */}
                                                  <TimePicker 
                                                    onChange={(value)=>formProps.setFieldValue(`data.databases.${dbIndex}.collections.${colIndex}.schedules.${schedIndex}.startHour`, value/3600) } 
                                                    //onBlur={formProps.setFieldTouched(`data.databases.${dbIndex}.collections.${colIndex}.schedules.${schedIndex}.startHour`)}
                                                    start="00:00" 
                                                    end="23:00" 
                                                    step={60}
                                                    value={formProps.values.data.databases[dbIndex].collections[colIndex].schedules[schedIndex].startHour * 3600} 
                                                  />
                                                  Request Units:{" "}
                                                  <Field name={`data.databases.${dbIndex}.collections.${colIndex}.schedules.${schedIndex}.requestUnits`} validate={this.validateRequestUnit}/>
                                                  <ErrorMessage component="div" className="error" name={`data.databases.${dbIndex}.collections.${colIndex}.schedules.${schedIndex}.requestUnits`}/>

                                                  <button type="button" onClick={() =>arrayHelpers.remove(schedIndex)}>Remove Schedule</button>
                                                </div>
                                              )
                                            )}
                                            <button type="button" onClick={() => arrayHelpers.push("")}>Add Schedule</button>
                                          </div>
                                        )}
                                      />
                                      <button type="button" onClick={() => arrayHelpers.remove(colIndex)}>Remove Collection</button>
                                    </div>
                                  ))}
                                  <button type="button" onClick={() => arrayHelpers.push(this._getEmptyCollection())}>Add Collection</button>
                                </div>
                              )}
                            />
                            <button type="button" onClick={() => arrayHelpers.remove(dbIndex)}>Remove Database</button>
                          </div>
                        )
                      )}
                      <button type="button" onClick={() => arrayHelpers.push(this._getEmptyDatabase())}>Add Database</button>
                    </div>
                  )}
                />
                <button type="submit" /*disabled={formProps.isSubmitting}*/>Save</button>
                <button onClick={() =>{
                  if (this.props.closeCallback){
                    this.props.closeCallback();
                  } else {
                    this.setState({ isEditing: false })         
                  }
                }}>Cancel</button>
              </Form>
            );
          }}
        />
      </ul>
    );
  }

  _renderAccount(account) {
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
          <button onClick={() => this.setState({ isEditing: true })}>Edit</button>
          {/* <button onClick={() =>  this.props.deleteCallback(account.accountName)}>Remove</button> */}
          <button onClick={() => this.showAlert('Remove account', 'Are you sure you want to remove the account?', () => this._removeAccount.bind(this), null) }>Remove</button>

          {this.state.alert}
        </div>
      </ul>
    );
  }


  render() {
    return this.state.isEditing
      ? this._renderAccountEdit(this.state.account, this.state.isNewAccount)
      : this._renderAccount(this.state.account);
  }
}

class MySelect extends React.Component {
  handleChange = value => {
    // this is going to call setFieldValue and manually update values.topcis
    this.props.onChange(this.props.propName, value.value);
  };

  handleBlur = () => {
    // this is going to call setFieldTouched and manually update touched.topcis
    this.props.onBlur(this.props.propName, true);
  };

  render() {
    let currentValue = timeZones.find((tz)=> tz.value === this.props.value);
    return (
      <div style={{ margin: '1rem 0' }}>
        <Select
          id={this.props.propName}
          options={timeZones}
          multi={false}
          onChange={this.handleChange.bind(this)}
          onBlur={this.handleBlur.bind(this)}
          value={currentValue}
        />
      </div>
    );
  }
}


export default AccountSchedule;
