import React from "react";
import Select from 'react-select'
import TimePicker from 'react-bootstrap-time-picker'
import { Formik, Form, Field, FieldArray, ErrorMessage} from "formik";
import * as Yup from 'yup';

import {getEmptyDatabase, getEmptyCollection, getEmptySchedule} from '../actions/accountSchedule'
import timezonesjson from '../timezones.json';
import "../styles/accountSchedule.css";


const timeZones = timezonesjson.map((value)=>{return {label: value.text, value: value.value}});

class AccountScheduleEdit extends React.Component {

  submitForm(values, {setSubmitting}) {
    console.log(values);
    this.props.saveCallback(values.data).then(
      (result) =>{
        setSubmitting(false);
        if (result.success) {
            this.props.closeCallback();
          }
      });
  }

  render() {
    return (
        <Formik
          initialValues={this.props.data}
          validationSchema = {YupValidationSchema}
          onSubmit= {(values, { setSubmitting }) => {
            console.log(values);
            this.props.saveCallback(values).then(
              (result) =>{
                setSubmitting(false);
                if (result.success) {
                    this.props.closeCallback();
                  }
              });
          }}
          validateOnChange= {true}
          validateOnBlur = {true}
          render = { formProps => {
            console.log(formProps);
            return (
              <Form className="mui-form mui-container-fluid">
                <div className="mui-row">
                  <div className="mui-textfield mui-textfield--float-label mui-col-md-4">
                    <Field name="accountName" disabled={!this.props.isNewAccount}/>
                    <label>Account name</label>
                    {/* <ErrorMessage component="div" className="error" name="accountName"/> */}
                  </div>
                  <div className="mui-textfield mui-textfield--float-label mui-col-md-8">
                    <Field name="accountKey" disabled={!this.props.isNewAccount}/>
                    <label>Account key</label>
                    {/* <ErrorMessage component="div" className="error" name="accountKey"/> */}
                  </div>
                </div>
                <FieldArray //Databases
                  name="databases"
                  render={arrayHelpers => (
                    <div>
                      <ul className="mui-tabs__bar mui-tabs__bar">
                        {formProps.values.databases.map(
                          (database, dbIndex) => 
                            <li className={dbIndex === 0 ? 'mui--is-active' : ''} key={`db.header-${dbIndex}`}>
                              <a data-mui-toggle="tab" data-mui-controls={`db-${dbIndex}`}>
                                 {database.name || "[empty name]"}
                                 <button className="mui-col-md-1 mui-btn mui-btn--flat mui-btn--danger fas fa-trash" type="button" onClick={() => arrayHelpers.remove(dbIndex)}/>
                              </a>
                            </li>
                        )}
                        <button className="mui-btn mui-btn--flat mui-btn--primary fas fa-plus" type="button" onClick={() => arrayHelpers.push(getEmptyDatabase())}> New Database</button>
                      </ul>
                      {formProps.values.databases.map(
                        (database, dbIndex) => (
                          <div key={`db-${dbIndex}`} id={`db-${dbIndex}`} className={dbIndex === 0 ? 'mui--is-active mui-tabs__pane schedule-database schedule-box' : 'mui-tabs__pane schedule-database schedule-box'}>
                            <div className="mui-textfield mui-textfield--float-label">
                              <Field name={`databases.${dbIndex}.name`}/>
                              <label>Database name</label>
                              {/* <ErrorMessage component="div" className="error" name={`databases.${dbIndex}.name`} /> */}
                            </div>
                            <FieldArray //Collections
                              name={`databases.${dbIndex}.collections`}
                              render={arrayHelpers => (
                                <div>
                                  {formProps.values.databases[dbIndex].collections.map((collection, colIndex) => (
                                    <div key={`col.${colIndex}`} className="mui-panel schedule-collection schedule-box ">
                                      <div className="mui-row">
                                        <div className="mui-col-md-11">
                                          <div className="mui-textfield mui-textfield--float-label mui-col-md-4">
                                            <Field name={`databases.${dbIndex}.collections.${colIndex}.name`}/>
                                            <label>Collection name</label>
                                            {/* <ErrorMessage component="div" className="error" name={`databases.${dbIndex}.collections.${colIndex}.name`}/> */}
                                          </div>
                                          <div className="mui-col-md-8">
                                            <TimezoneSelect
                                              propName={`databases.${dbIndex}.collections.${colIndex}.timezone`}
                                              value={formProps.values.databases[dbIndex].collections[colIndex].timezone}
                                              onChange={formProps.setFieldValue}
                                              onBlur={formProps.setFieldTouched}
                                              required
                                            />
                                            {/* <ErrorMessage component="div" className="error" name={`databases.${dbIndex}.collections.${colIndex}.timezone`}/> */}
                                          </div>
                                          <FieldArray //Schedules
                                            name={`databases.${dbIndex}.collections.${colIndex}.schedules`}
                                            render={arrayHelpers => (
                                              <div>
                                                {collection.schedules.map(
                                                  (schedule, schedIndex) => (
                                                    <div key={`sched.${schedIndex}`} className="schedule-schedule schedule-box mui-row">
                                                      <div className="mui-select mui-col-md-4">
                                                        <TimePicker 
                                                          onChange={(value)=>formProps.setFieldValue(`databases.${dbIndex}.collections.${colIndex}.schedules.${schedIndex}.startHour`, value / 3600) } 
                                                          start="00:00" 
                                                          end="23:00" 
                                                          step={60}
                                                          value={formProps.values.databases[dbIndex].collections[colIndex].schedules[schedIndex].startHour * 3600} 
                                                          required
                                                        />
                                                        <label>Time</label>
                                                      </div>
                                                      <div className="mui-textfield mui-textfield--float-label mui-col-md-4">
                                                        <Field name={`databases.${dbIndex}.collections.${colIndex}.schedules.${schedIndex}.requestUnits`}/>
                                                        <label>Request Units</label>
                                                        {/* <ErrorMessage component="div" className="error" name={`databases.${dbIndex}.collections.${colIndex}.schedules.${schedIndex}.requestUnits`}/> */}
                                                      </div>
                                                    
                                                      <button type="button" className="mui-btn mui-btn--flat mui-btn--danger fas fa-trash" onClick={() =>arrayHelpers.remove(schedIndex)}/>
                                                    </div>
                                                  )
                                                )}
                                                <div className="mui-row">
                                                  <button className="mui-btn mui-btn--flat mui-btn--primary fas fa-plus mui-col-md-offset-1 mui-col-md-10 mui--text-center" type="button" onClick={() => arrayHelpers.push(getEmptySchedule())}> New Schedule</button>
                                                </div>
                                              </div>
                                            )}
                                          />
                                        </div>
                                        <button className="mui-col-md-1 mui-btn mui-btn--flat mui-btn--danger fas fa-trash" type="button" onClick={() => arrayHelpers.remove(colIndex)}/>
                                      </div>
                                    </div>
                                  ))}
                                  <button className="mui-btn mui-btn--flat mui-btn--primary fas fa-plus" type="button" onClick={() => arrayHelpers.push(getEmptyCollection())}> New Collection</button>
                                </div>
                              )}
                            />
                          </div>
                        )
                      )}
  
                      {/* <button type="button" onClick={() => arrayHelpers.push(getEmptyDatabase())}>Add Database</button> */}
                    </div>
                   )}
                />
                <button className="mui-btn mui-btn--primary" type="submit" disabled={formProps.isSubmitting}>Save</button>
                <button className="mui-btn"  disabled={formProps.isSubmitting} onClick={() => this.props.closeCallback()}>Cancel</button>
              </Form>
            );
          }} 
        />
    );
  }


}


const YupValidationSchema = () => {
  return Yup.object().shape({
    accountName: Yup.string().required("Account Name is required"),
    accountKey: Yup.string().required("Account Key is required"),
    databases: Yup.array()
        .min(1, "At least one database is required")
        .of(
          Yup.object().shape({
            name: Yup.string().required("Database name is requried"),
            collections: Yup.array()
              .min(1, "At least one collection is required")
              .of( 
                Yup.object().shape({
                  name: Yup.string().required("Collection name is required"),
                  timezone: Yup.string().required("Collection timezone is required"),
                  schedules: Yup.array()
                    .min(1, "At least one scheduled time is required")
                    .of(
                      Yup.object().shape({
                        startHour: Yup.number()
                          .min(0, "Start hour must be a valid hour").max(24*3600, "Start hour must be a valid hour"),
                        requestUnits: Yup.number("Request Units must be a valid number")
                          .typeError("Request Units must be a valid number")
                          .min(400, "Request Units must be at least 400")
                      })
                    )
                  })
              )
            })
        )
  });
}

class TimezoneSelect extends React.Component {
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
      <div>
        <Select
          id={this.props.propName}
          options={timeZones}
          multi={false}
          onChange={this.handleChange.bind(this)}
          onBlur={this.handleBlur.bind(this)}
          value={currentValue}
          className="mui-textfield"
          placeholder="Timezone"
        />
      </div>
    );
  }
}


export default AccountScheduleEdit;
