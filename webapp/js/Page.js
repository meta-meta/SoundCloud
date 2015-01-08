/** @jsx React.DOM */
define([
    'underscore', 'react', 'wingspan-forms', 'react-cursor',
    './Common', 'jsx!./TrackList', 'jsx!./TagSelect'
], function (_, React, Forms, Cursor,
             Common, TrackList, TagSelect) {
    'use strict';

    var App = React.createClass({
        getInitialState: function () {
            return {
                tracks: [],
                tags: {
                    all: [],
                    selected: [],
                    trackIdBeingEdited: ''
                },
                loggedIn: false
            };
        },

        componentDidMount: function () {
            SC.initialize({
                client_id: '816559a8805e07de7b585e3e588d5e7e',
                redirect_uri: 'http://meta-meta.github.io/SoundCloud/webapp/callback.html'
                //redirect_uri: 'http://localhost:8000/callback.html'
            });

            SC.connect(function () {
                SC.get('/me', function (me) {
//          alert('Hello, ' + me.username);
                    this.updateTracks(me);
                }.bind(this));
            }.bind(this));
        },

        updateTracks: function (me) {
            var tracks = [];

            var getTracks = function (page) {
                var pageSize = 200;
                var params = {
                    'user_id': me.id,
                    'limit': pageSize,
                    'offset': pageSize * page
                };

                SC.get('/tracks', params, function (res, err) {
                    if (err) {
                        console.log(err);
                        return;
                    }

                    tracks = tracks.concat(res);

                    if (res.length == pageSize) {
                        getTracks(page + 1);
                    } else {
                        console.log('tracks fetched: ' + tracks.length);
                        this.loadTracks(tracks);
                    }
                }.bind(this));
            }.bind(this);

            getTracks(0);
        },

        loadTracks: function (tracks) {
            var tags = _.chain(tracks)
                .map(Common.parseTags)
                .flatten()
                .unique()
                .value();

            this.setState({tracks: tracks, tags: {all: tags, selected: []}});
        },

        render: function () {
            var cursor = Cursor.build(this);

            return (
                <div className="App">
                    <TagSelect cursor={cursor.refine('tags')} />
                    <TrackList cursor={cursor} />
                </div>
            );
        }
    });

    function entrypoint(rootEl) {
        React.renderComponent(<App />, rootEl);
        Forms.ControlCommon.attachFormTooltips($('body'));
    }

    return {
        entrypoint: entrypoint
    };
});
