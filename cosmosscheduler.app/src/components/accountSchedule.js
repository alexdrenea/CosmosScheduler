import React from "react";
import "../styles/accountSchedule.css";
import SweetAlert from 'react-bootstrap-sweetalert';

import { Formik, Form, Field, FieldArray, ErrorMessage } from "formik";

class AccountSchedule extends React.Component {
  constructor(props, context) {
    super(props, context);

    this.state = {
      isEditing: this.props.isEditing,
      isNewAccount: this.props.isNewAccount,
      account: this.props.account,
      alert: null
    };
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
      scheduleItems: []
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

  submitForm(values) {
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
          render={formProps => {
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
                                      <FieldArray //Schedules
                                        name={`data.databases.${dbIndex}.collections.${colIndex}.scheduleItems`}
                                        render={arrayHelpers => (
                                          <div>
                                            {formProps.values.data.databases[dbIndex].collections[colIndex].scheduleItems.map(
                                              (schedule, schedIndex) => (
                                                <div key={`sched.${schedIndex}`}>
                                                  Start hour:{" "}
                                                  <Field name={`data.databases.${dbIndex}.collections.${colIndex}.scheduleItems.${schedIndex}.startHourUTC`}/>
                                                  Request Units:{" "}
                                                  <Field name={`data.databases.${dbIndex}.collections.${colIndex}.scheduleItems.${schedIndex}.requestUnits`} validate={this.validateRequestUnit}/>
                                                  <ErrorMessage component="div" className="error" name={`data.databases.${dbIndex}.collections.${colIndex}.scheduleItems.${schedIndex}.requestUnits`}/>

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
                    Collection: {collection.name}
                    {collection.scheduleItems.map(schedule => {
                      return (
                        <div key={schedule.startHourUTC}>
                          {schedule.startHourUTC}: {schedule.requestUnits} RUs
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

export default AccountSchedule;
