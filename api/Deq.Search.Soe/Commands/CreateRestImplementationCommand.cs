﻿using System;
using System.Reflection;
using Deq.Search.Soe.Endpoints;
using Deq.Search.Soe.Infastructure.Commands;
using Deq.Search.Soe.Infastructure.Endpoints;
using ESRI.ArcGIS.SOESupport;

namespace Deq.Search.Soe.Commands {
    /// <summary>
    ///     Creates the SOE rest implementation. Searches the assembly and adds all endpoints denoted
    ///     with the Endpoint attribute.
    /// </summary>
    public class CreateRestImplementationCommand : Command<SoeRestImpl> {
        private const string Restoperation = "RestOperation";

        private readonly Assembly _assemblyToScan;

        /// <summary>
        ///     Initializes a new instance of the <see cref="CreateRestImplementationCommand" /> class.
        /// </summary>
        /// <param name="assembly"> The assembly. </param>
        public CreateRestImplementationCommand(Assembly assembly) {
            _assemblyToScan = assembly;
        }

        /// <summary>
        ///     code to execute when command is run. adds a default ResourceHandler and scans assembly
        ///     for all OperationHandlers marked with the EndpointAttribute
        /// </summary>
        protected override void Execute() {
            var resource = new RestResource(typeof (VersionEndpoint).Assembly.FullName, false, VersionEndpoint.Handler);

            foreach (var type in CommandExecutor.ExecuteCommand(
                new FindAllEndpointsCommand(_assemblyToScan))) {
                if (!typeof (IRestEndpoint).IsAssignableFrom(type)) {
                    continue;
                }

                var methodInfo = type.GetMethod(Restoperation);
                var instance = Activator.CreateInstance(type);

                var restOperation = methodInfo.Invoke(instance, null) as RestOperation;

                if (restOperation == null) {
                    continue;
                }

                resource.operations.Add(restOperation);
            }

            Result = new SoeRestImpl(Assembly.GetExecutingAssembly().FullName, resource);
        }

        public override string ToString() {
            return string.Format("{0}", "CreateRestImplementationCommand");
        }
    }
}
