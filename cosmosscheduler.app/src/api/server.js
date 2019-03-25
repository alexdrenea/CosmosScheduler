import axios from 'axios';
import {API_URL, API_HEADERS} from './const';

module.exports = {
    getSchedules: function () {
      return axios.get(API_URL, API_HEADERS);
    },
    getSchedule: function (accountName) {
        return axios.get(`${API_URL}/${accountName}`, API_HEADERS);
    },
    addSchedule: function (payload) {
        return axios.post(API_URL, payload, API_HEADERS);
    },
    updateSchedule: function (payload) {
        return axios.put(API_URL, payload, API_HEADERS);
    },
    deleteSchedule: function (accountName) {
        return axios.delete(`${API_URL}/${accountName}`,  API_HEADERS);
    }
};