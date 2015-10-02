// TODO: finish porting the rest of the matchers from https://github.com/agrc/agrc-jasmine-matchers and put in a new repo
define([
    'dojo/topic'
], function (
    topic
) {
    var publishes;
    var handles;

    return {
        beforeEach: function () {
            publishes = {};
            handles = [];
        },
        afterEach: function () {
            handles.forEach(function (hand) {
                hand.remove();
            });
        },
        listen: function (topicName) {
            // summary
            //      Adds subscribes for the topic(s) so that this module
            //      can track them.
            // topicName: String | Object
            //      Can either be a single string topic name or an object with
            //      topic names as properties (e.g. {topic1: 'topic1', t2: 'topic2'})
            var topics = [];

            if (typeof topicName === 'string') {
                topics.push(topicName);
            } else {
                for (var prop in topicName) {
                    if (topicName.hasOwnProperty(prop)) {
                        topics.push(topicName[prop]);
                    }
                }
            }
            topics.forEach(function (t) {
                handles.push(topic.subscribe(t, function () {
                    if (!publishes[t]) {
                        publishes[t] = [arguments];
                    } else {
                        publishes[t].push(arguments);
                    }
                }));
            });
        },
        plugin: function (chai, utils) {
            var Assertion = chai.Assertion;

            Assertion.addMethod('publishedWith', function () {
                var topicName = this._obj;

                // need to get from arguments keyword because we don't know
                // how many arguments will be passed
                // this means that I'm a grown up JS dev :)

                // convert to true array
                var expectedArgs = [].slice.call(arguments);

                if (publishes[topicName] === undefined) {
                    this.assert(false, 'topic: "' + topicName + '" was never called!');
                }

                var actualArgsLU = publishes[topicName][publishes[topicName].length - 1];

                var pass = expectedArgs.every(function checkArg(a, i) {
                    return utils.eql(a, actualArgsLU[i]);
                });

                var getMsg = function (negate) {
                    var stringify = function (args) {
                        try {
                            return JSON.stringify(args);
                        } catch (e) {
                            return '[could not stringify]';
                        }
                    };
                    var msg = 'expected topic: "' + topicName + '"\n';
                    if (negate) {
                        msg += ' not';
                    }
                    var actualArgs = [];
                    Object.keys(actualArgsLU).forEach(function addValue(k) {
                        actualArgs.push(actualArgsLU[k]);
                    });
                    msg += ' to have been called with ' + stringify(expectedArgs) +
                    '\n but it was actually called with ' + stringify(actualArgs);

                    return msg;
                };

                this.assert(pass, getMsg(), getMsg(true));
            });

            Assertion.addMethod('published', function () {
                var topicName = this._obj;

                var pass = publishes[topicName] !== undefined;

                var getMsg = function (negate) {
                    var msg = 'Expected topic: "' + topicName + '"';
                    if (negate) {
                        msg += ' not';
                    }
                    msg += ' to have been published';
                    return msg;
                }
                this.assert(pass, getMsg(), getMsg(true));
            });
        }
    };
});
