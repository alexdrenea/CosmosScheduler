using System;
using System.IO;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Azure.WebJobs;
using Microsoft.Azure.WebJobs.Extensions.Http;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using Newtonsoft.Json;
using Microsoft.WindowsAzure.Storage.Table;
using CosmosScheduler.Domain;
using System.Linq;
using CosmosScheduler.Helpers;

namespace CosmosScheduler.Functions.API
{
    public static class ScheduleManagerAPI
    {
        private const string TABLE_PARTITIONKEY = "schedule";
        private const string CLIENT_ACCOUNTKEY_MASK = "********";
        private const string ROUTE_NAME = "schedules";

        [FunctionName("Api_GetSchedules")]
        public static async Task<IActionResult> GetSchedules(
            [HttpTrigger(AuthorizationLevel.Function, "get", Route = ROUTE_NAME)] HttpRequest req,
            [Table("%ScheduleTableName%")] CloudTable inTable,
            ILogger log)
        {
            //Get all entities from table
            var tableEntities = await inTable.ExecuteQuerySegmentedAsync(new TableQuery<ScheduleTableEntity>(), null);
            //Convert them to the schedule model
            var schedules = tableEntities.Select(Util.GetScheduleFromTableEntity).Where(r => r != null).ToArray();

            //Mask all the account keys - don't want to send them back to the caller.
            foreach (var s in schedules) s.AccountKey = CLIENT_ACCOUNTKEY_MASK;

            return new OkObjectResult(schedules);
        }

        [FunctionName("Api_GetSchedule")]
        public static async Task<IActionResult> GetSchedule(
          [HttpTrigger(AuthorizationLevel.Function, "get", Route = ROUTE_NAME + "/{accountName}")] HttpRequest req,
          string accountName,
          [Table("%ScheduleTableName%")] CloudTable table,
          ILogger log)
        {
            var tableEntity = await GetScheduleEntityFromTable(table, accountName);
            if (tableEntity == null)
                return new NotFoundObjectResult($"Account with name '{accountName.ToLower()}' not found");

            var schedule = Util.GetScheduleFromTableEntity(tableEntity);
            schedule.AccountKey = CLIENT_ACCOUNTKEY_MASK;

            return new OkObjectResult(schedule);
        }

        [FunctionName("Api_AddSchedule")]
        public static async Task<IActionResult> AddSchedule(
            [HttpTrigger(AuthorizationLevel.Function, "post", Route = ROUTE_NAME)] HttpRequest req,
            [Table("%ScheduleTableName%")] CloudTable table,
            ILogger log)
        {
            var scheduleRequest = await GetScheduleFromRequest(req);
            if (scheduleRequest == null)
                return new BadRequestObjectResult("Can't parse request into a Schedule object");

            var tableEntity = await GetScheduleEntityFromTable(table, scheduleRequest.AccountName);
            if (tableEntity != null)
                return new ConflictObjectResult($"Account with name '{scheduleRequest.AccountName.ToLower()}' already configured");

            var errors = scheduleRequest.Validate();
            if (errors.Any())
                return new BadRequestObjectResult($"Invalid Schedule object provided{Environment.NewLine}{string.Join(Environment.NewLine, errors)}");

            var success = await AddOrUpdateTableEntity(table, scheduleRequest);

            scheduleRequest.AccountKey = CLIENT_ACCOUNTKEY_MASK;
            return success ? (ActionResult)new CreatedResult(scheduleRequest.AccountName.ToLower(), "") : (ActionResult)new StatusCodeResult(500);
        }

        [FunctionName("Api_UpdateSchedule")]
        public static async Task<IActionResult> UpdateSchedule(
            [HttpTrigger(AuthorizationLevel.Function, "put", Route = ROUTE_NAME)] HttpRequest req,
            [Table("%ScheduleTableName%")] CloudTable table,
            ILogger log)
        {
            var scheduleRequest = await GetScheduleFromRequest(req);
            if (scheduleRequest == null)
                //invalid request
                return new BadRequestObjectResult("Can't parse request into a Schedule object");

            var tableEntity = await GetScheduleEntityFromTable(table, scheduleRequest.AccountName);
            if (tableEntity == null)
                return new NotFoundObjectResult($"Account with name '{scheduleRequest.AccountName.ToLower()}' not found");

            //we'll be replacing the whole table entry, make sure we update the key since the client sends the masked value with the request.
            var tableSchedule = JsonConvert.DeserializeObject<Schedule>(tableEntity.Schedule);
            scheduleRequest.AccountKey = tableSchedule.AccountKey;

            var errors = scheduleRequest.Validate();
            if (errors.Any())
            {
                return new BadRequestObjectResult($"Invalid Schedule object provided {Environment.NewLine}{string.Join(Environment.NewLine, errors)}");
            }

            var success = await AddOrUpdateTableEntity(table, scheduleRequest);

            return success ? (ActionResult)new AcceptedResult(scheduleRequest.AccountName.ToLower(), "") : (ActionResult)new StatusCodeResult(500);
        }


        [FunctionName("Api_DeleteSchedule")]
        public static async Task<IActionResult> DeleteSchedule(
          [HttpTrigger(AuthorizationLevel.Function, "delete", Route = ROUTE_NAME + "/{accountName}" )] HttpRequest req,
          string accountName,
          [Table("%ScheduleTableName%")] CloudTable table,
          ILogger log)
        {
            var tableEntity = await GetScheduleEntityFromTable(table, accountName);
            if (tableEntity == null)
                return new NotFoundObjectResult($"Account with name '{accountName.ToLower()}' not found");

            var result = await table.ExecuteAsync(TableOperation.Delete(new ScheduleTableEntity
            {
                PartitionKey = TABLE_PARTITIONKEY,
                RowKey = accountName.ToLower(),
                ETag = "*"
            }));

            return result.HttpStatusCode.IsHttpSuccessCode() ? (ActionResult)new OkResult() : (ActionResult)new StatusCodeResult(500);
        }

        private static async Task<ScheduleTableEntity> GetScheduleEntityFromTable(CloudTable table, string accountName)
        {
            var tableOperation = TableOperation.Retrieve<ScheduleTableEntity>(TABLE_PARTITIONKEY, accountName.ToLower());
            var entity = await table.ExecuteAsync(tableOperation);

            return entity?.Result as ScheduleTableEntity;
        }

        private static async Task<Schedule> GetScheduleFromRequest(HttpRequest req)
        {
            try
            {
                string requestBody = await new StreamReader(req.Body).ReadToEndAsync();
                return JsonConvert.DeserializeObject<Schedule>(requestBody);
            }
            catch
            {
                return null;
            }
        }

        private static async Task<bool> AddOrUpdateTableEntity(CloudTable table, Schedule s)
        {
            var entity = new ScheduleTableEntity
            {
                PartitionKey = TABLE_PARTITIONKEY,
                RowKey = s.AccountName.ToLower(),
                Schedule = JsonConvert.SerializeObject(s)
            };

            var result = await table.ExecuteAsync(TableOperation.InsertOrReplace(entity));
            return result.HttpStatusCode.IsHttpSuccessCode();
        }

    }
}
