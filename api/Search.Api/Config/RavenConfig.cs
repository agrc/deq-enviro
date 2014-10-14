using System;
using System.Threading.Tasks;
using Raven.Client;
using Raven.Client.Indexes;

namespace Search.Api.Config {
    public class RavenConfig
    {
        public static void Register(Type type, IDocumentStore documentStore)
        {
            RegisterIndexes(type, documentStore);
        }

        public static async Task RegisterAsync(Type type, IDocumentStore documentStore)
        {
            await IndexCreation.CreateIndexesAsync(type.Assembly, documentStore);
        }

        private static void RegisterIndexes(Type type, IDocumentStore documentStore)
        {
            IndexCreation.CreateIndexes(type.Assembly, documentStore);
        }
    }
}