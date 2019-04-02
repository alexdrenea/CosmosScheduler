using Microsoft.Azure.Cosmos;
using System.Threading.Tasks;

namespace CosmosScheduler.Core
{
    public static class CosmosUtils
    {

        public static async Task<bool> UpdateCollectionSize(string endpoint, string key, string db, string collection, int requestedRU)
        {
            try
            {
                using (CosmosClient client = new CosmosClient(endpoint, key))
                {
                    var res = await client.Databases[db].Containers[collection].ReadProvisionedThroughputAsync();
                    if (res.HasValue)
                        await client.Databases[db].Containers[collection].ReplaceProvisionedThroughputAsync(requestedRU);
                }
                return true;
            }
            catch
            {
                return false;
            }
        }

        public static async Task<int> GetCollectionSize(string endpoint, string key, string db, string collection)
        {
            try
            {
                using (CosmosClient client = new CosmosClient(endpoint, key))
                {
                    var res = await client.Databases[db].Containers[collection].ReadProvisionedThroughputAsync();
                    return res ?? -1;
                }
            }
            catch
            {
                return -1;
            }
        }
    }
}
