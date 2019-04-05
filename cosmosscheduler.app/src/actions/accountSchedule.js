export const getNewAccount = () => {
  return {
    accountName: "",
    accountKey: "",
    databases: [getEmptyDatabase()]
  }
}

export const getEmptyDatabase = () => {
  return {
    name: "",
    collections: [getEmptyCollection()]
  };
}

export const getEmptyCollection = () => {
  return {
    name: "",
    timezone: "",
    isActive: true,
    schedules: [getEmptySchedule()]
  };
}

export const getEmptySchedule = () => {
  return {
    startHour: 0,
    requestUnits: ""
  };
}