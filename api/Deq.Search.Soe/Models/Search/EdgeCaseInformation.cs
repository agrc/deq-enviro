namespace Deq.Search.Soe.Models.Search {
    /// <summary>
    ///     Edge case information for last minute changes for queries
    /// </summary>
    public class EdgeCaseInformation {
        /// <summary>
        ///     Gets or sets the type of the search.
        /// </summary>
        /// <value>
        ///     The type of the search.
        /// </value>
        public SearchType SearchType { get; set; }

        /// <summary>
        ///     Gets or sets the program identifier.
        /// </summary>
        /// <value>
        ///     The program identifier.
        /// </value>
        public string ProgramId { get; set; }

        public bool IsProgramSearch
        {
            get { return SearchType == SearchType.Program; }
        }
    }
}