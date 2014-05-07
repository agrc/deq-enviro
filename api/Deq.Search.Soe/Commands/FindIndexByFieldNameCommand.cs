using System.Collections.Generic;
using Deq.Search.Soe.Infastructure.Commands;
using Deq.Search.Soe.Models;
using ESRI.ArcGIS.Geodatabase;

namespace Deq.Search.Soe.Commands {
    /// <summary>
    ///     Command to find the index for each attribute name for all month/types
    /// </summary>
    public class FindIndexByFieldNameCommand : Command<Dictionary<string, IndexFieldMap>> {
        private readonly IFields _fields;

        private readonly string[] _fieldsToMap;

        private readonly Dictionary<string, IndexFieldMap> _propertyValueIndexMap;

        /// <summary>
        ///     Initializes a new instance of the <see cref="FindIndexByFieldNameCommand" /> class.
        /// </summary>
        /// <param name="layer"> The layer. </param>
        /// <param name="fieldsToMap">The fields to map to an index number</param>
        public FindIndexByFieldNameCommand(IFeatureClass layer, string[] fieldsToMap) {
            _fieldsToMap = fieldsToMap;
            _fields = layer.Fields;
            _propertyValueIndexMap = new Dictionary<string, IndexFieldMap>();
        }

        public override string ToString() {
            return string.Format("{0}", "FindIndexByFieldNameCommand");
        }

        /// <summary>
        ///     code to execute when command is run. Iterates over every month and finds the index for the field in teh feature
        ///     class
        /// </summary>
        protected override void Execute() {
            foreach (var field in _fieldsToMap) {
                _propertyValueIndexMap.Add(field,
                                           new IndexFieldMap(GetIndexForField(field, _fields), field));
            }

            Result = _propertyValueIndexMap;
        }

        /// <summary>
        ///     Gets the index for field.
        /// </summary>
        /// <param name="attributeName"> The attribute name. </param>
        /// <param name="fields"> The fields. </param>
        /// <returns> </returns>
        private static int GetIndexForField(string attributeName, IFields fields) {
            var findField = fields.FindField(attributeName.Trim());

            return findField < 0 ? fields.FindFieldByAliasName(attributeName.Trim()) : findField;
        }
    }
}
