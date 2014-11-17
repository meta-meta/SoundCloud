/** @jsx React.DOM */
define([
  'underscore', 'react', 'wingspan-forms', 'react-cursor'
], function (_, React, Forms, Cursor) {
  'use strict';

  var KendoMultiSelect = Forms.KendoMultiSelect;

  var Track = React.createClass({
    render: function () {
      var t = this.props.record;
      return (
        <div className="Track">
          <div>
            <h3>{t.title}</h3>
          </div>
          <div>
            id: {t.id}<br />
            uri: {t.uri}<br />
            duration(ms): {t.duration}<br />
            tags: {t.tag_list}<br />
            description: {t.description}<br />
            sharing: {t.sharing}<br />
            favoritings_count: {t.favoritings_count}<br />
            comment_count: {t.comment_count}<br />
            plays: {t.playback_count}<br />
            downloads: {t.download_count}<br />
            state(finished or processing or failed): {t.state}<br />
            <img src={t.artwork_url} /><br />
            <img src={t.waveform_url} height={50} width={Math.pow(t.duration, .5)} />
          </div>
        </div>
        )
    }
  });

  var Tags = React.createClass({
    render: function () {
      var allTags = this.props.cursor.refine('all').value;

      return (
        <KendoMultiSelect
          displayField='label'
          valueField='id'
          dataSource={allTags}
          key={JSON.stringify(allTags)}
          value={this.props.cursor.refine('selected').value}
          onChange={this.onChange}
        />
      )
    },

    onChange: function (selection) {
      this.props.cursor.refine('selected').onChange(selection);
    }
  });

  var App = React.createClass({
    getInitialState: function () {
      return {
        tracks: [],
        tags: {
          all: [],
          selected: []
        },
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
//          alert('Hello, ' + me.username);
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
          .map(function(tag) {
            return {
              id: tag,
              label: tag
            }
          })
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
            this.setState({tracks: tracks, tags: {all: parseTags(tracks), selected: []}});
          }
        }.bind(this));
      }.bind(this);

      getTracks(0);
    },

    render: function () {
      var cursor = Cursor.build(this);

      var selectedTags = this.state.tags.selected;

      var tracks = _.chain(this.state.tracks)
        .filter(function (track) {
          return selectedTags.length == 0 || !_.isEmpty(_.intersection(_.str.words(track.tag_list, '" "'), _.pluck(selectedTags, 'id')));
        })
        .map(function (record) {
        return (<Track record={record}/>);
      });

      return (
        <div className="App">
          <Tags cursor={cursor.refine('tags')} />
          <div className="clearfix">{tracks}</div>
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
