using System.IO;
using System.Reflection;
using Nancy;

namespace Search.Api.Tests {
    /// <summary>
    /// Unit tests don't look for views in the right folder so make them!
    /// </summary>
    public class UnitTestRootPathProvider : IRootPathProvider {
        public string GetRootPath() {
            var directoryName = Path.GetDirectoryName(Assembly.GetExecutingAssembly().GetName().CodeBase);

            var debugPath = directoryName.Replace("file:\\", "");

            var debugDirectory = new DirectoryInfo(debugPath);

            var testProjectDirectory = debugDirectory.Parent.Parent;
            var path = testProjectDirectory.FullName.Replace(".Tests", "");

            return path;
        }
    }
}
