using System;
using System.Collections.Generic;

namespace Deq.Search.Soe.Infastructure.IOC {
    /// <summary>
    ///     Ayende's 15 lines of code IOC container minified
    /// </summary>
    public class Container {
        #region Delegates
        public delegate object Creator(Container container);
        #endregion

        private readonly Dictionary<Type, Creator> _typeToCreator = new Dictionary<Type, Creator>();

        public void Register<T>(Creator creator) {
            _typeToCreator.Add(typeof (T), creator);
        }

        public T Create<T>() {
            return (T)_typeToCreator[typeof (T)](this);
        }
    }
}
