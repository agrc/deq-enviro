using System.Linq;
using Raven.Client.Indexes;
using Search.Api.Models.Database;

namespace Search.Api.Index {
    public class UserByIdIndex : AbstractIndexCreationTask<User>
    {
        public UserByIdIndex()
        {
            Map = users => from user in users
                           select new
                               {
                                   user.UserId
                               };
        }
    }
}