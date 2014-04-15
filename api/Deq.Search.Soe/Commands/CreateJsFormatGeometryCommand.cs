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

using System.Collections.Generic;
using Deq.Search.Soe.Infastructure.Commands;
using ESRI.ArcGIS.Geometry;
using EsriJson.Net;
using EsriJson.Net.CoordinateReferenceSystem;
using EsriJson.Net.Geometry;
using IGeometry = ESRI.ArcGIS.Geometry.IGeometry;
using Point = EsriJson.Net.Geometry.Point;
using Polygon = EsriJson.Net.Geometry.Polygon;
using Polyline = EsriJson.Net.Geometry.Polyline;

namespace Deq.Search.Soe.Commands {
  /// <summary>
  ///   Creates esri geometry from arcobject geometry that turns into an esri/graphic nicely
  /// </summary>
  public class CreateJsFormatGeometryCommand : Command<EsriJsonObject> {
    public CreateJsFormatGeometryCommand(IGeometry geometry, ISpatialReference spatialReference) {
      Geometry = geometry;
      SpatialReference = spatialReference;
    }

    public IGeometry Geometry { get; set; }

    public ISpatialReference SpatialReference { get; set; }

    public override string ToString() {
      return "CreateGraphicFromGeometryCommand";
    }

    protected override void Execute() {
      if (Geometry is IPoint) {
        var esriPoint = Geometry as IPoint;

        if (SpatialReference != null) {
          esriPoint.Project(SpatialReference);
        }

        var point = new Point(esriPoint.X, esriPoint.Y);

        Result = point;
        return;
      }

      if (Geometry is IPolyline) {
        var line = new Polyline();

        var simpleGeom = Geometry as IPolyline5;
        simpleGeom.Generalize(10);

        if (SpatialReference != null) {
          simpleGeom.Project(SpatialReference);
        }

        var geometryCollection = simpleGeom as IGeometryCollection;
        var count = geometryCollection.GeometryCount;

        for (var i = 0; i < count; i++) {
          var points = geometryCollection.Geometry[i] as IPointCollection4;

          var pointCount = points.PointCount;
          var ringPoints = new List<RingPoint>(pointCount);

          for (var j = 0; j < pointCount; j++) {
            var point = points.Point[j];
            ringPoints.Add(new RingPoint(point.X, point.Y));
          }

          line.AddPath(new List<RingPoint[]> {
            ringPoints.ToArray()
          });
        }

        Result = line;
        return;
      }

      if (Geometry is IPolygon) {
        var polygon = new Polygon();

        var simpleGeom = Geometry as IPolygon4;
        simpleGeom.Generalize(250);

        if (SpatialReference != null) {
          polygon.CRS = new CRS
          {
            WellKnownId = SpatialReference.FactoryCode
          };
 
          if (simpleGeom.SpatialReference.FactoryCode != SpatialReference.FactoryCode) {
            simpleGeom.Project(SpatialReference);
          }
        }

        

        var geometryCollection = simpleGeom as IGeometryCollection;
        var count = geometryCollection.GeometryCount;

        for (var i = 0; i < count; i++) {
          var points = geometryCollection.Geometry[i] as IPointCollection4;

          var pointCount = points.PointCount;
          var ringPoints = new List<RingPoint>(pointCount);

          for (var j = 0; j < pointCount; j++) {
            var point = points.Point[j];
            ringPoints.Add(new RingPoint(point.X, point.Y));
          }

          polygon.AddRing(new List<RingPoint[]> {
            ringPoints.ToArray()
          });
        }

        Result = polygon;
      }
    }
  }
}
