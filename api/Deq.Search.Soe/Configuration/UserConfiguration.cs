﻿using Deq.Search.Soe.Extensions;
using Deq.Search.Soe.Infastructure;
using Deq.Search.Soe.Models.Configuration;
using ESRI.ArcGIS.esriSystem;

namespace Deq.Search.Soe.Configuration {

    #region License
    // 
    // Copyright (C) 2012 AGRC
    // Permission is hereby granted, free of charge, to any person obtaining a copy of this software 
    // and associated documentation files (the "Software"), to deal in the Software without restriction, 
    // including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, 
    // and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, 
    // subject to the following conditions:
    // 
    // The above copyright notice and this permission notice shall be included in all copies or substantial 
    // portions of the Software.
    // 
    // THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT
    // NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
    // IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
    // WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
    // SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
    // 
    #endregion

    /// <summary>
    ///     Debug configration. Preconfigured for debug environment
    /// </summary>
    public class UserConfiguration : IConfigurable {
        public ApplicationFieldSettings GetFields(IPropertySet props) {
            var settings = new ApplicationFieldSettings {
                ReturnFields = props.GetValueAsString("returnfields", true).Split(','),
                ProgramId = props.GetValueAsString("programid", true),
                SiteName = props.GetValueAsString("sitename", true)
            };

            return settings;
        }
    }
}
