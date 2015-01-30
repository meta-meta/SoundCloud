/** @jsx React.DOM */
define([
    'underscore', 'react', 'wingspan-forms', 'react-cursor',
    './Common', 'jsx!./TrackList', 'jsx!./ControlPanel'
], function (_, React, Forms, Cursor,
             Common, TrackList, ControlPanel) {
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
                selectedTrackUrl: '',
                loggedIn: false
            };
        },

        componentDidMount: function () {
            SC.initialize({
                client_id: '816559a8805e07de7b585e3e588d5e7e',
                redirect_uri: 'http://meta-meta.github.io/SoundCloud/webapp/callback.html'
                //redirect_uri: 'http://localhost:8000/callback.html'
            });

            this.logIn();
        },

        logIn: function () {
            var self = this;
            SC.connect(function () {
                self.cursor.refine('loggedIn').onChange(true);
                SC.get('/me', function (me) {
                    self.updateTracks(me);
                });
            });
        },

        updateTracks: function (me) {
            var tracks = [];

            var attempts = 0;

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

                        if(attempts < 3) {
                            console.log('trying again: attempt ' + ++attempts);
                            getTracks(0);
                        }

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
            this.cursor = Cursor.build(this);

            var logInButton = this.cursor.refine('loggedIn').value ? '' :
                (<button id="notLoggedIn" className="k-button" onClick={this.logIn} >Log in to SoundCloud</button>);

            return (
                <div className="app">
                    <ControlPanel cursor={this.cursor} />
                    <TrackList cursor={this.cursor} />
                    {logInButton}
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
