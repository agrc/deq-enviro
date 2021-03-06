﻿using System.Linq;
using AutoMapper;
using Newtonsoft.Json;
using Search.Api.Models.Request;
using Search.Api.Models.Soe;

namespace Search.Api.Config {
    /// <summary>
    ///     Contains the automapper maps.
    /// </summary>
    public static class AutoMapperConfig {
        /// <summary>
        /// Registers the maps.
        /// </summary>
        public static void RegisterMaps() {
            Mapper.CreateMap<SearchRequest, SoeSearchRequest>()
                  .ForMember(dest => dest.DefinitionQueries,
                             option => option.MapFrom(src => src.QueryLayers.Select(x => x.DefQuery).ToArray()))
                  .ForMember(dest => dest.F, option => option.Ignore())
                  .ForMember(dest => dest.Geometry, o => o.Ignore())
                  .ForMember(dest => dest.IncludeAll, option => option.Ignore())
                  .ForMember(dest => dest.LayerIds,
                             option => option.MapFrom(src => src.QueryLayers.Select(x => x.Id).ToArray()))
                  .ForMember(dest => dest.ProgramId, option => option.Ignore())
                  .ForMember(dest => dest.SearchMethod, option => option.Ignore())
                  .ForMember(dest => dest.SiteName, option => option.Ignore())
                  .ForMember(dest => dest.DefQuery, option => option.Ignore())
                  .ForMember(dest => dest.Token, options => options.Ignore())
                  .ForMember(dest => dest.AccessRules, options => options.Ignore())
                  .AfterMap((src, dest) => {
                      dest.SearchMethod = "";
                      if (src.SiteName != null) {
                          dest.SiteName = string.Join(",", src.SiteName.Terms);
                          dest.IncludeAll = src.SiteName.IncludeAll;
                          dest.SearchMethod = "site";
                      } else if (src.Geometry != null) {
                          dest.Geometry = JsonConvert.SerializeObject(src.Geometry);
                          dest.SearchMethod = "geometry";
                      } else if (!string.IsNullOrEmpty(src.ProgramId)) {
                          dest.ProgramId = src.ProgramId;
                          dest.SearchMethod = "program";
                      }
                      else if (!string.IsNullOrEmpty(src.DefQuery))
                      {
                          dest.DefQuery = src.DefQuery;
                          dest.SearchMethod = "defQuery";
                      }
                  });
#if DEBUG
            Mapper.AssertConfigurationIsValid();
#endif
        }
    }
}
