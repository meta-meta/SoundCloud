/** @jsx React.DOM */
define([
  'underscore', 'react', 'wingspan-forms', 'react-cursor'
], function (_, React, Forms, Cursor) {
  'use strict';

  var Track = React.createClass({
    render: function () {
      return (<div>{this.props.record.title}</div>)
    }
  });

  var App = React.createClass({
    getInitialState: function () {
      return {
        tracks: [],
        tags: [],
        loggedIn: false
      };
    },

    componentDidMount: function () {
      SC.initialize({
        client_id: '816559a8805e07de7b585e3e588d5e7e',
        redirect_uri: 'http://localhost:8000/callback.html'
      });

      SC.connect(function() {
        SC.get('/me', function(me) {
          alert('Hello, ' + me.username);
          this.updateTracks(me);
        }.bind(this));
      }.bind(this));
    },

    updateTracks: function (me) {
      var tracks = [];

      var parseTags = function(tracks) {
        return _.chain(tracks)
          .map(function(track) {
            return _.str.words(track.tag_list, '" "'); // {tag_list: "\"tag one\" \"tag two\"}
          })
          .flatten()
          .unique()
          .value();
      };

      var getTracks = function(page) {
        var pageSize = 200;
        var params = {
          'user_id': me.id,
          'limit': pageSize,
          'offset': pageSize * page
        };

        SC.get('/tracks', params, function(res, err) {
          if(err) {
            console.log(err);
            return;
          }

          tracks = tracks.concat(res);

          if(res.length == pageSize) {
            getTracks(page + 1);
          } else {
            console.log('got tracks:' + tracks);
            this.setState({tracks: tracks, tags: parseTags(tracks)});
          }
        }.bind(this));
      }.bind(this);

      getTracks(0);
    },

    render: function () {
      var cursor = Cursor.build(this);

      var tracks = _.map(this.state.tracks, function (record) {
        return (<Track record={record}/>);
      });

      var tags = _.map(this.state.tags, function (tag) {
        return (<li>{tag}</li>)
      })

      return (
        <div className="App">
          <ol>{tags}</ol>
          <div>{tracks}</div>
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
