using CosmosScheduler.Helpers;

namespace CosmosScheduler.Domain
{
    public class ScaleRequest
    {
        public string AccountName { get; set; }
        public string Endpoint => Util.GetEndpointFromAccountName(AccountName);
        public string AccountKey { get; set; }
        public string Database { get; set; }
        public string Collection { get; set; }
        public int CurrentRUs { get; set; }
        public int RequestedRUs { get; set; }
    }
}
