namespace CosmosScheduler.Domain
{
    public class CosmosConnectionDetails
    {
        public string ConnectionString { get; set; }

        public string AccountName { get; set; }
        public string Endpoint { get; set; }
        public string AccountKey { get; set; }
    }
}
