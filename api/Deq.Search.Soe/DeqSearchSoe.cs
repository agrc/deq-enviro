#region license
// The MIT License
// 
// Copyright (c) 2014 AGRC
// 
// Permission is hereby granted, free of charge, to any person obtaining a copy of this
// software and associated documentation files (the "Software"), to deal in the Software
// without restriction, including without limitation the rights to use, copy, modify, merge,
// publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons 
// to whom the Software is furnished to do so, subject to the following conditions:
// 
// The above copyright notice and this permission notice shall be included in all copies or 
// substantial portions of the Software.
// 
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF 
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. 
// IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY 
// CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, 
// TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE 
// SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
#endregion

using System.Runtime.InteropServices;
using Deq.Search.Soe.Cache;
using Deq.Search.Soe.Commands;
using Deq.Search.Soe.Configuration;
using Deq.Search.Soe.Infastructure;
using Deq.Search.Soe.Infastructure.Commands;
using Deq.Search.Soe.Infastructure.IOC;
using ESRI.ArcGIS.SOESupport;
using ESRI.ArcGIS.Server;
using ESRI.ArcGIS.esriSystem;

namespace Deq.Search.Soe {
  /// <summary>
  ///   The main server object extension
  /// </summary>
  [ComVisible(true), Guid("a48951e3-a7a8-4d30-8331-a43ad0122a3c"), ClassInterface(ClassInterfaceType.None),
   ServerObjectExtension("MapServer",
     AllCapabilities = "",
     //These create checkboxes to determine allowed functionality
     DefaultCapabilities = "",
     Description = "Batch query for deq enviro app.",
     //shows up in manager under capabilities
     DisplayName = "DEQ Search API",
     //Properties that can be set on the capabilities tab in manager.
     Properties = "returnFields=comma,separated,list;sitename=SN;programid=PID;",
     SupportsREST = true,
     SupportsSOAP = false)]
  public class DeqSearchSoe : SoeBase, IServerObjectExtension, IObjectConstruct, IRESTRequestHandler {
    /// <summary>
    ///   Initializes a new instance of the <see cref="DeqSearchSoe" /> class. If you have business logic
    ///   that you want to run when the SOE first becomes enabled, don’t here; instead, use the following
    ///   IObjectConstruct.Construct() method found in SoeBase.cs
    /// </summary>
    public DeqSearchSoe() {
      ReqHandler = CommandExecutor.ExecuteCommand(
        new CreateRestImplementationCommand(typeof (FindAllEndpointsCommand).Assembly));
      Kernel = new Container();
#if DEBUG
      Kernel.Register<IConfigurable>(x => new DebugConfiguration());
#else
            Kernel.Register<IConfigurable>(x => new UserConfiguration());
#endif
    }

    private Container Kernel { get; set; }

    #region IObjectConstruct Members
    /// <summary>
    ///   This is where you put any expensive business logic that you don’t need to run on each request. For example, if you
    ///   know you’re always working with the same layer in the map, you can put the code to get the layer here.
    /// </summary>
    /// <param name="props"> The props. </param>
    public override void Construct(IPropertySet props) {
      base.Construct(props);

      var config = Kernel.Create<IConfigurable>();

      ApplicationCache.Fields = config.GetFields(props);
      ApplicationCache.FeatureClassIndexMap =
        CommandExecutor.ExecuteCommand(new CreateLayerMapCommand(ServerObjectHelper));
    }
    #endregion
  }
}
