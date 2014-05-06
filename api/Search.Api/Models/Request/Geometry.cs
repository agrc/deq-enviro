using System.Collections.Generic;

namespace Search.Api.Models.Request {
    public class Geometry {
        public List<List<List<double>>> Rings { get; set; }

        public SpatialReference SpatialReference { get; set; }
    }
}
