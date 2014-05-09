using System;
using System.Collections.Generic;
using System.Diagnostics;
using EsriJson.Net.Geometry;
using NUnit.Framework;
using Newtonsoft.Json;

namespace EsriJson.Net.Tests
{
    [TestFixture]
    public class PolygonTests
    {
        [Test]
        [ExpectedException(typeof (ArgumentException))]
        public void ThrowsErrorIfRingIsNotClosed()
        {
            var polygon = new Polygon(new List<RingPoint[]>
                {
                    new[]
                        {
                            new RingPoint(0, 0),
                            new RingPoint(1, 0),
                            new RingPoint(2, 0)
                        }
                });
        }

        [Test]
        [ExpectedException(typeof (ArgumentException))]
        public void ThrowsErrorOnLessThanThreePointsInRing()
        {
            var polygon = new Polygon(new List<RingPoint[]>
                {
                    new[]
                        {
                            new RingPoint(0, 0),
                            new RingPoint(1, 0)
                        }
                });
        }

        [Test]
        [ExpectedException(typeof(ArgumentException))]
        public void ThrowsErrorOnLessThanThreePointsInRingOnAdd()
        {
            var rings = new List<RingPoint[]>
                {
                    new[]
                        {
                            new RingPoint(0, 0), new RingPoint(1, 0)
                        }
                };

            var polygon = new Polygon();
            polygon.AddRing(rings);
        }

        [Test]
        [ExpectedException(typeof (ArgumentException))]
        public void ThrowsErrorOnLessThanThreePointsInRingWithMultipleRings()
        {
            var rings = new List<RingPoint[]>
                {
                    new[]
                        {
                            new RingPoint(0, 0),
                            new RingPoint(0, 1),
                            new RingPoint(0, 0)
                        },
                    new[]
                        {
                            new RingPoint(1, 1),
                            new RingPoint(1, 2),
                        }
                };

            var p = new Polygon(rings);
        }

        [Test]
        public void PolygonSerializesNicely()
        {
            var polygon = new Polygon(new List<RingPoint[]>
                {
                    new[]
                        {
                            new RingPoint(0, 0),
                            new RingPoint(1, 0),
                            new RingPoint(2, 0),
                            new RingPoint(0, 0)
                        }
                });

            var json = JsonConvert.SerializeObject(polygon, Formatting.None, new JsonSerializerSettings
                {
                    NullValueHandling = NullValueHandling.Ignore
                });

            Debug.Print(json);

            Assert.That(json, Is.StringStarting("{\"rings\":[[["));
        }

        [Test]
        public void CanAddRing()
        {
            var polygon = new Polygon();

            var rings = new List<RingPoint[]>
                {
                    new[]
                        {
                            new RingPoint(0, 0), new RingPoint(1, 0), new RingPoint(2, 0), new RingPoint(0, 0)
                        }
                };

            polygon.AddRing(rings);

            Assert.That(polygon.Rings, Is.EquivalentTo(rings));
        }

        [Test]
        public void CanAddRings()
        {
            var polygon = new Polygon();

            var rings = new List<RingPoint[]>
                {
                    new[]
                        {
                            new RingPoint(0, 0), new RingPoint(1, 0), new RingPoint(2, 0), new RingPoint(0, 0)
                        },
                         new[]
                        {
                            new RingPoint(1, 0), new RingPoint(2, 0), new RingPoint(3, 0), new RingPoint(1, 0)
                        }
                };

            polygon.AddRing(rings);

            Assert.That(polygon.Rings, Is.EquivalentTo(rings));
        }
    }
}