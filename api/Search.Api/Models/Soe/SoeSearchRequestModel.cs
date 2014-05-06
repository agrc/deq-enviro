namespace Search.Api.Models.Soe {
    public class SoeSearchRequestModel {
        public int[] LayerIds { get; set; }

        public string[] DefinitionQueries { get; set; }

        public string SearchMethod { get; set; }

        public string GeometryJson { get; set; }

        public string SiteName { get; set; }

        public string ProgramId { get; set; }

        public bool IncludeAll { get; set; }

        public string F {
            get { return "json"; }
        }
    }
}
