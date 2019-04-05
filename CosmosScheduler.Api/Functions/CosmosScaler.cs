using System;
using System.IO;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Azure.WebJobs;
using Microsoft.Azure.WebJobs.Extensions.Http;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using Newtonsoft.Json;
using CosmosScheduler.Core;
using System.Linq;
using CosmosScheduler.Domain;
using Microsoft.WindowsAzure.Storage.Table;
using System.Collections.Generic;
using System.Collections;
using CosmosScheduler.Helpers;
using Microsoft.WindowsAzure.Storage.Queue;

namespace CosmosScheduler
{
    public static class CosmosScaler
    {
        [FunctionName("CosmosManualScale")]
        public static async Task<IActionResult> RunManualScale(
            [HttpTrigger(AuthorizationLevel.Function, "get", "post", Route = null)] HttpRequest req,
            ILogger log)
        {
            var endpoint = "https://accountname.documents.azure.com:443/";
            var key = "";
            var db = "dev";
            var col = "core2";

            var res = await CosmosUtils.UpdateCollectionSize(endpoint, key, db, col, 400);

            return (ActionResult)new OkObjectResult($"Hello");
        }


        /// <summary>
        /// Function runs every hour 2 minutes before the exact time.
        /// It will analyze if there's any RU to be adjusted at this hour and if so, 
        /// it will determine if it's an increase of a decrease of RUs and schedule the operation right before the exact hour or right after the exact hour (+/- 1m)
        /// </summary>
        /// <param name="myTimer"></param>
        /// <param name="inTable"></param>
        /// <param name="log"></param>
        /// <returns></returns>
        [FunctionName("ScaleTime")]
        public static async Task RunScale(
           [TimerTrigger("%ScheduleCron%")]TimerInfo myTimer,
           [Table("%ScheduleTableName%")] CloudTable inTable,
           [Queue("%ScaleUpQueueName%")]CloudQueue scaleUpQueue,
           [Queue("%ScaleDownQueueName%")]CloudQueue scaleDownQueue,
           ILogger log)
        {
            var scaleDownDelayBeforeExactHourInSeconds = int.Parse(Environment.GetEnvironmentVariable("ScaleDownDelayBeforeExactHourInSeconds", EnvironmentVariableTarget.Process));
            var scaleUpDelayAfterExactHourInSeconds = int.Parse(Environment.GetEnvironmentVariable("ScaleUpDelayAfterExactHourInSeconds", EnvironmentVariableTarget.Process));

            log.LogInformation($"ScaleTime function executed at: {DateTime.UtcNow.ToString("HH:mm:ss - dd/MM/yyyy")} UTC");

            //Get all entities from table
            var tableEntities = await inTable.ExecuteQuerySegmentedAsync(new TableQuery<ScheduleTableEntity>(), null);
            log.LogInformation($" - found {tableEntities.Count()} table entities");
            //Convert them to the schedule model
            var schedules = tableEntities.Select(Util.GetScheduleFromTableEntity).Where(r => r != null).ToArray();
            log.LogInformation($" - found {schedules.Count()} schedules");

            //Get a list of resize requests that are due this hour
            var resizesThisHour = schedules.SelectMany(r =>
                                        r.Databases.SelectMany(d =>
                                            d.Collections.Where(c => c.IsActive && c.Schedules.Any(s=> s.IsScheduleDueNextHour(c.Timezone)))
                                                         .Select(c => new ScaleRequest
                                                         {
                                                             AccountKey = r.AccountKey,
                                                             AccountName = r.AccountName,
                                                             Database = d.Name,
                                                             Collection = c.Name,
                                                             RequestedRUs = c.Schedules.FirstOrDefault(s => s.IsScheduleDueNextHour(c.Timezone)).RequestUnits
                                                         }))).ToArray();
            log.LogInformation($" - found {resizesThisHour.Count()} collections to resize next hour");

            //Populate resize items with current RUs
            foreach (var r in resizesThisHour)
            {
                r.CurrentRUs = await CosmosUtils.GetCollectionSize(r.Endpoint, r.AccountKey, r.Database, r.Collection);
            }


            var secondsToExactHour = (60 - DateTime.Now.Minute) * 60 + (60 - DateTime.Now.Second);

            //put requests in appropriate queues
            foreach (var r in resizesThisHour)
            {
                if (r.CurrentRUs == -1) //todo: log invalid
                {
                    log.LogInformation($" - invalid configuration for {r.AccountName}-{r.Database}-{r.Collection}.");
                    continue;
                }
                if (r.CurrentRUs > r.RequestedRUs) //scaledown request
                {
                    await scaleDownQueue.AddMessageAsync(message: new CloudQueueMessage(JsonConvert.SerializeObject(r)),
                                                        timeToLive: TimeSpan.FromMinutes(30),
                                                        initialVisibilityDelay: TimeSpan.FromSeconds(Math.Max(0, secondsToExactHour - scaleDownDelayBeforeExactHourInSeconds)),
                                                        options: null,
                                                        operationContext: null);
                    log.LogInformation($" - scale down {r.AccountName}-{r.Database}-{r.Collection} from {r.CurrentRUs} RUs to {r.RequestedRUs} RUs");
                }

                if (r.CurrentRUs < r.RequestedRUs) //scaleup request
                {
                    await scaleUpQueue.AddMessageAsync(message: new CloudQueueMessage(JsonConvert.SerializeObject(r)),
                                                        timeToLive: TimeSpan.FromMinutes(30),
                                                        initialVisibilityDelay: TimeSpan.FromSeconds(secondsToExactHour + scaleUpDelayAfterExactHourInSeconds),
                                                        options: null,
                                                        operationContext: null);

                    log.LogInformation($" - scale up {r.AccountName}-{r.Database}-{r.Collection} from {r.CurrentRUs} RUs to {r.RequestedRUs} RUs");
                }
            }

            log.LogInformation($"ScaleTime function execution finished.");
        }



        [FunctionName("ScaleUp")]
        public static async Task ScaleUp(
           [QueueTrigger("%ScaleUpQueueName%")]ScaleRequest request,
           ILogger log)
        {
            await CosmosUtils.UpdateCollectionSize(
                                request.Endpoint,
                                request.AccountKey,
                                request.Database,
                                request.Collection,
                                request.RequestedRUs);
        }


        [FunctionName("ScaleDown")]
        public static async Task ScaleDown(
          [QueueTrigger("%ScaleDownQueueName%")]ScaleRequest request,
          ILogger log)
        {
            await CosmosUtils.UpdateCollectionSize(
                                request.Endpoint,
                                request.AccountKey,
                                request.Database,
                                request.Collection,
                                request.RequestedRUs);
        }
    }
}
