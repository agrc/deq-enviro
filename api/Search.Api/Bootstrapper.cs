﻿#region license
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

using Nancy;
using Nancy.Bootstrapper;
using Nancy.TinyIoc;
using Newtonsoft.Json;
using Search.Api.Config;
using Search.Api.Serializers;

namespace Search.Api {
  public class Bootstrapper : DefaultNancyBootstrapper {
    // The bootstrapper enables you to reconfigure the composition of the framework,
    // by overriding the various methods and properties.
    // For more information https://github.com/NancyFx/Nancy/wiki/Bootstrapper

    protected override void ApplicationStartup(TinyIoCContainer container, IPipelines pipelines)
    {
      base.ApplicationStartup(container, pipelines);

      AutoMapperConfig.RegisterMaps();
    }


    protected override void ConfigureApplicationContainer(TinyIoCContainer container)
    {
      base.ConfigureApplicationContainer(container);

      container.Register(typeof(JsonSerializer), typeof(JsonSerializerOptions));
    }
  }
}
