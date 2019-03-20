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
        public IEnumerable<ScheduleConfiguration> ScheduleItems { get; set; }
    }

    public class ScheduleConfiguration
    {
        public int StartHourUTC { get; set; }
        public int RequestUnits { get; set; }
    }
}
