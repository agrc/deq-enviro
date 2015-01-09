namespace Deq.Search.Soe.Models.Configuration {
    /// <summary>
    ///     The class representing Application settings related to fields
    ///     This can be modified to suite the application needs or removed.
    /// </summary>
    public class ApplicationSettings {
        /// <summary>
        ///     Gets or sets the return fields.
        /// </summary>
        /// <value>
        ///     The fields to get the values from and return from the service.
        /// </value>
        public string[] ReturnFields { get; set; }

        /// <summary>
        ///     Gets or sets the program identifier.
        /// </summary>
        /// <value>
        ///     The program identifier field name to use for programid queries.
        /// </value>
        public string ProgramId { get; set; }

        /// <summary>
        ///     Gets or sets the name of the site.
        /// </summary>
        /// <value>
        ///     The name of the sitename field to use for sitename queries.
        /// </value>
        public string SiteName { get; set; }

        /// <summary>
        /// Gets or sets the facility ust layer name in the mxd.
        /// </summary>
        /// <value>
        /// The facility ust layer name in the mxd.
        /// </value>
        public string FacilityUst { get; set; }

        /// <summary>
        /// Gets or sets the maximum records that will be returned without error.
        /// </summary>
        /// <value>
        /// The maximum number of records.
        /// </value>
        public int MaxRecords { get; set; }
    }
}
