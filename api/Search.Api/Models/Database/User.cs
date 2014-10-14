using System;

namespace Search.Api.Models.Database {
    public class User {
        public Guid UserId { get; set; }
        public UserAccessRules AccessRules { get; set; }
        public class UserAccessRules {
            public string OptionsSerialized { get; set; }
        }
    }

    public class AccessRules {
        public string[] Counties { get; set; }
    }
}