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
            <img src={t.waveform_url} height={50} width={(100 * Math.pow(t.duration / this.props.longestDuration, .5)) + '%'} />
          </div>
        </div>
        )
    }
  });

  var Tags = React.createClass({
    render: function () {
      var allTags = _.map(this.props.cursor.refine('all').value, function(tag) {
        return {
          id: tag,
          label: tag
        }
      });

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
            console.log('tracks fetched: ' + tracks.length);

            var tags = _.chain(tracks)
              .map(parseTags)
              .flatten()
              .unique()
              .value();

            this.setState({tracks: tracks, tags: {all: tags, selected: []}});
          }
        }.bind(this));
      }.bind(this);

      getTracks(0);
    },

    render: function () {
      var cursor = Cursor.build(this);

      var selectedTags = this.state.tags.selected;

      var longestTrack = Math.max.apply(null, _.pluck(this.state.tracks, 'duration'));

      var tracks = _.chain(this.state.tracks)
        .filter(function (track) {
          return selectedTags.length == 0 || !_.isEmpty(_.intersection(parseTags(track), _.pluck(selectedTags, 'id')));
        })
        .map(function (record) {
        return (<Track record={record} longestDuration={longestTrack}/>);
      });

      return (
        <div className="App">
          <Tags cursor={cursor.refine('tags')} />
          <div className="clearfix">{tracks}</div>
        </div>
        );
    }
  });

  // ripped from SoundCloud minified javascript
  function parseTags(track) {
    var i, r = /(\w+)\:(\w+)=(.+)/;

    function t(e) {
      return !r.test(e)
    }

    function parse(e, i) {
      var r, s, o, a = [],
        l = [],
        u = !1,
        c = !0;
      for (i || (i = {}), r = 0, s = e.length; s > r; ++r) o = e.charAt(r), '"' === o ? u = !u : " " === o || "," === o ? u ? l.push(o) : c || (c = !0, a.push(l.join("")), l.length = 0) : (c = !1, l.push(o));
      return c || a.push(l.join("")), a.filter(i.includeMachineTags ? n : t).map(function(e) {
        return e.replace(/"/g, "").replace(/\s\s+/, " ").trim()
      }).filter(Boolean)
    }

    return parse(track.tag_list);
  }

  function entrypoint(rootEl) {
    React.renderComponent(<App />, rootEl);
    Forms.ControlCommon.attachFormTooltips($('body'));
  }

  return {
    entrypoint: entrypoint
  };
});
