using CosmosScheduler.Helpers;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace CosmosScheduler.Domain
{

    public class Schedule
    {
        public string AccountName { get; set; }
        public string AccountKey { get; set; }
        public IEnumerable<ScheduleDatabase> Databases { get; set; }


        /// <summary>
        /// Validates a schedule
        /// </summary>
        /// <param name="s"></param>
        /// <returns>List of errors or empty list if valid</returns>
        public List<string> Validate()
        {
            var res = new List<string>();
            if (string.IsNullOrEmpty(AccountName)) res.Add("Must provide Account Name");
            if (string.IsNullOrEmpty(AccountKey)) res.Add("Must provide Account Key");
            if (Databases == null || !Databases.Any()) res.Add("Must define at least one database");
            foreach (var database in Databases)
            {
                if (string.IsNullOrEmpty(database.Name)) res.Add("Must provide database name");
                if (database.Collections == null || !database.Collections.Any()) res.Add("Must define at least one collection");
                foreach (var collection in database.Collections)
                {
                    if (string.IsNullOrEmpty(collection.Name)) res.Add("Must provide collection name");
                    if (string.IsNullOrEmpty(collection.Timezone)) res.Add("Must provide timezone for collection");
                    try
                    {
                        var tz = TimeZoneInfo.FindSystemTimeZoneById(collection.Timezone);
                    }
                    catch
                    {
                        res.Add($"Timezone '{collection.Timezone}' is not a valid timezone (collection: {collection})");
                    }
                    if (collection.Schedules== null || !collection.Schedules.Any()) res.Add("Must define at least one schedule for collection");
                    foreach (var timeSched in collection.Schedules)
                    {
                        if (timeSched.RequestUnits < 400 || timeSched.RequestUnits % 100 != 0) res.Add("Request Units must be greater than 400 and multiple of 100");
                    }
                }
            }
            return res;
        }
    }

    public class ScheduleDatabase
    {
        public string Name { get; set; }
        public IEnumerable<ScheduleCollection> Collections { get; set; }
    }

    public class ScheduleCollection
    {
        public bool IsActive { get; set; }
        public int CurrentRUs { get; set; }
        public string Name { get; set; }
        public string Timezone { get; set; }
        public IEnumerable<ScheduleConfiguration> Schedules { get; set; }
    }

    public class ScheduleConfiguration
    {
        public int StartHour { get; set; }
        public int RequestUnits { get; set; }
    }
}
