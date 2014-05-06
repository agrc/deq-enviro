using System;
using System.Diagnostics;
using Deq.Search.Soe.Extensions;
using ESRI.ArcGIS.Geodatabase;

namespace Deq.Search.Soe.Infastructure.Commands {
    /// <summary>
    ///     A command with no return value
    /// </summary>
    public abstract class Command {
        /// <summary>
        ///     The message code to be used for all failed commands
        /// </summary>
        internal const int MessageCode = 2472;

#if !DEBUG
        internal ServerLogger Logger = new ServerLogger();
#endif

        public void Run() {
            var commandName = ToString();

            try {
                Debug.Print("Executing\r\n{0}".With(commandName));
#if !DEBUG

                Logger.LogMessage(ServerLogger.msgType.debug, "{0}.{1}".With(commandName, "execute"), MessageCode,
                                  "Executing\r\n{0}".With(commandName));
#endif

                Execute();
                Debug.Print("Done Executing\r\n{0}".With(commandName));
#if !DEBUG

                Logger.LogMessage(ServerLogger.msgType.debug, "{0}.{1}".With(commandName, "execute"), MessageCode,
                                  "Done Executing");
#endif
            } catch (Exception ex) {
                Debug.Print("Error processing task: {0}".With(commandName), ex);
#if !DEBUG
Logger.LogMessage(ServerLogger.msgType.error, "{0}.{1}".With(commandName, "execute"), MessageCode,
                                  "Error running command");
#endif
            } finally {
#if !DEBUG
                Logger = null;
#endif
            }
        }

        public abstract override string ToString();

        /// <summary>
        ///     code to execute when command is run.
        /// </summary>
        protected abstract void Execute();
    }

    /// <summary>
    ///     A command with a return value
    /// </summary>
    /// <typeparam name="T"> </typeparam>
    public abstract class Command<T> : Command {
        public T Result { get; protected set; }

        public IObject Row { get; set; }

        public T GetResult() {
            Run();

#if !DEBUG
            Logger = new ServerLogger();

            Logger.LogMessage(ServerLogger.msgType.debug, ToString(), MessageCode,
                              "Done Executing\r\n{0}\r\nResult: {1}".With(ToString(), Result));
            Logger = null;
#endif
            return Result;
        }
    }
}
