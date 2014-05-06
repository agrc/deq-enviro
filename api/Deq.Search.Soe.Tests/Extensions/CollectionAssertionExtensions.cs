using System.Collections.Generic;
using NUnit.Framework;
using Newtonsoft.Json;

namespace Deq.Search.Soe.Tests.Extensions {
    public static class CollectionAssertExtensions {
        public static void CollectionAsJsonAreEqual<T>(this IEnumerable<T> actual, IEnumerable<T> expected) {
            Assert.That(JsonConvert.SerializeObject(expected), Is.EqualTo(JsonConvert.SerializeObject(actual)));
        }
    }
}
