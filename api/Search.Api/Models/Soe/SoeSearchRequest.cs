namespace Search.Api.Models.Soe {
    public class SoeSearchRequest {
        public int[] LayerIds { get; set; }

        public string[] DefinitionQueries { get; set; }

        public string SearchMethod { get; set; }

        public string Geometry { get; set; }

        public string SiteName { get; set; }

        public string ProgramId { get; set; }

        public bool IncludeAll { get; set; }

        public string F {
            get { return "json"; }
        }
    }
}
