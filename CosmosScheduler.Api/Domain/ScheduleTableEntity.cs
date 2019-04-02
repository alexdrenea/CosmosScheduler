using Microsoft.WindowsAzure.Storage.Table;

namespace CosmosScheduler.Domain
{
    public class ScheduleTableEntity : TableEntity
    {
        public string Schedule { get; set; }
    }
}
