﻿using CosmosScheduler.Domain;
using Microsoft.Azure.Cosmos;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace CosmosScheduler.Helpers
{
    public static class Util
    {
        public static string GetEndpointFromAccountName(string accountName)
        {
            return $"https://{accountName}.documents.azure.com:443";
        }

        /// <summary>
        /// Given a connection string, extract Cosmos Account Details (account name, key, etc)
        /// </summary>
        public static CosmosConnectionDetails ToConnectionDetails(this string connectionString)
        {
            //AccountEndpoint=https://accountname.documents.azure.com:443/;AccountKey=somekey==;ApiKind=Gremlin;
            var parts = connectionString.Split(';').ToDictionary(k => k.Split('=').First(), v => { return v.Substring(v.IndexOf("=") + 1); });
            var endpoint = parts.GetValueOrDefault("AccountEndpoint") ?? string.Empty;

            var key = parts.GetValueOrDefault("AccountKey") ?? string.Empty;
            var name = string.Empty;
            if (endpoint.Length > 8)
                name = endpoint.Substring(8, Math.Max(8, endpoint.IndexOf('.')) - 8);
            return new CosmosConnectionDetails { AccountKey = key, AccountName = name, ConnectionString = connectionString, Endpoint = endpoint };
        }

        /// <summary>
        /// Parse a scheduleEntity into a schedule
        /// </summary>
        public static Schedule GetScheduleFromTableEntity(this ScheduleTableEntity entity)
        {
            try
            {
                return JsonConvert.DeserializeObject<Schedule>(entity.Schedule);
            }
            catch
            {
                //invalid schedule table item
                return null;
            }
        }

        /// <summary>
        /// Given a schedule and the timezone, return a value indicating if the schedule is due this hour considering the timezone it's provided in
        /// </summary>
        /// <param name="sc"></param>
        /// <param name="timezone"></param>
        /// <returns>If an invalid timezone is provided, returns false.</returns>
        public static bool IsScheduleDueNextHour(this ScheduleConfiguration sc, string timezone)
        {
            try
            {
                //scheduler runs a few minutes before the exact hour. Check if next hour is part of the schedule
                var hour = TimeZoneInfo.ConvertTimeBySystemTimeZoneId(DateTime.UtcNow, timezone).Hour + 1;
                return hour == sc.StartHour;
            }
            catch (Exception)
            {
                //TODO: log
                return false;
            }
        }

        public static bool IsHttpSuccessCode(this int statusCode)
        {
            return statusCode >= 200 && statusCode <= 299;
        }

    }
}
