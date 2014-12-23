/** @jsx React.DOM */
define([
    'underscore', 'react', 'wingspan-forms', 'react-cursor'
], function (_, React, Forms, Cursor) {
    'use strict';

    var KendoMultiSelect = Forms.KendoMultiSelect;

    var Tags = React.createClass({
        render: function () {
            var allTags = _.map(this.props.cursor.refine('all').value, function (tag) {
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
                    key={JSON.stringify(this.props.cursor.refine('all').value)}
                    value={this.props.cursor.refine('selected').value}
                    onChange={this.onChange}
                />
            )
        },

        onChange: function (selection) {
            this.props.cursor.refine('selected').onChange(selection);
        }
    });

    var TrackList = React.createClass({
        render: function () {
            var cursor = this.props.cursor.refine('tracks');
            var tagsCursor = this.props.cursor.refine('tags');
            var selectedTags = this.props.cursor.refine('tags', 'selected').value;

            var longestTrack = Math.max.apply(null, _.pluck(cursor.value, 'duration'));

            var trackList = _.chain(cursor.value)
                .map(function (track, index) {
                    var visible = selectedTags.length == 0 || !_.isEmpty(_.intersection(parseTags(track), _.pluck(selectedTags, 'id')));
                    return (<Track visible={visible} cursor={cursor.refine(index)} tagsCursor={tagsCursor} longestDuration={longestTrack} key={'track' + track.id} />);
                })
                .value();

            return (<div className="clearfix trackList">{trackList}<div className="clearfix" /></div>);
        }
    });

    var Track = React.createClass({
        render: function () {
            var t = this.props.cursor.value;

            var tagWidget = _.isEqual(t.id, this.props.tagsCursor.refine('trackIdBeingEdited').value) ? (
                <TagEdit
                    className="tagEdit"
                    selectedTags={parseTags(t)}
                    trackCursor={this.props.cursor}
                    tagsCursor={this.props.tagsCursor}
                    key={JSON.stringify(this.props.tagsCursor.refine('all').value) + t.id + 'trax'}
                />
            ) : (
                <TagView
                    className="tagView"
                    selectedTags={parseTags(t)}
                    editTags={this.editTags}
                />
            );

            var trackStyle = {
                backgroundImage: t.artwork_url && 'url(' + t.artwork_url + ')',
                display: this.props.visible ? 'initial' : 'none'
            };

            var waveformStyle = {
                backgroundImage: 'url(' + t.waveform_url + ')',
                height: 50,
                width: (100 * Math.pow(t.duration / this.props.longestDuration, .25)) + '%'
            };

            var description = t.description && (
                <div className="description clearfix bordered">
                    id: {t.id}
                    <br />
                    uri: {t.uri}
                    <br />
                    duration(ms): {t.duration}
                    <br />
                    tags: {t.tag_list}
                    <br />

                    description: {t.description}
                    <br />
                    sharing: {t.sharing}
                    <br />
                    favoritings_count: {t.favoritings_count}
                    <br />
                    comment_count: {t.comment_count}
                    <br />
                    plays: {t.playback_count}
                    <br />
                    downloads: {t.download_count}
                    <br />
                    state(finished or processing or failed): {t.state}
                </div>
            );

            return (
                <div className="track" style={trackStyle}>
                    <h2>{t.title}</h2>
                    {tagWidget}
                    {description}
                    <div className="waveform clearfix bordered" style={waveformStyle} />
                </div>
            )
        },

        editTags: function () {
            this.props.tagsCursor.refine('trackIdBeingEdited').onChange(this.props.cursor.value.id);
        }
    });

    var TagView = React.createClass({
        render: function () {
            var tags = this.props.selectedTags;

            var dataSource = _.map(tags, function (tag) {
                return {
                    id: tag,
                    label: tag
                }
            });

            return (
                <KendoMultiSelect
                    displayField='label'
                    valueField='id'
                    dataSource={dataSource}
                    value={{id: tags}}
                    disabled={true}
                />
            );
            //  value={{id: this.state.tags}} TODO: HACK  update wingspanforms
        },

        componentDidMount: function () {
            $(this.getDOMNode()).click(this.props.editTags);
        }
    });

    var TagEdit = React.createClass({
        render: function () {
            var dataSource = _.map(this.props.tagsCursor.refine('all').value, function (tag) {
                return {
                    id: tag,
                    label: tag
                }
            });

            return (
                <KendoMultiSelect
                    displayField='label'
                    valueField='id'
                    dataSource={dataSource}
                    value={{id: this.props.selectedTags}}
                    onChange={this.onChange}
                />
            );
            //  value={{id: this.state.tags}} TODO: HACK  update wingspanforms
        },

        componentDidMount: function () {
            $(this.getDOMNode()).find('input').first().keyup(this.onKeyUp);

            // just mounted because we clicked on the TagView component. focus on this component like nothing ever happened
            $(this.getDOMNode()).find('input').first().focus();

            this.setValue();
            console.log('mount');
        },

        componentDidUpdate: function () {
            console.log('update');
            this.setValue();
        },

        setValue: function () {
            var tags = this.props.selectedTags;
            console.log('setVal: ' + tags);
            $(this.getDOMNode()).find('select').first().data('kendoMultiSelect').value(tags);
        },

        setNewTagList: function (newTagList) {
            var t = this.props.trackCursor.value;

            SC.put(t.permalink_url, {track: {tag_list: newTagList}}, function(res){
                console.log(res);
                this.props.trackCursor.onChange(_.extend(t, {tag_list: newTagList}));
            }.bind(this));
        },

        onKeyUp: function (e) {
            var allTags = this.props.tagsCursor.refine('all').value;

            if (kendo.keys.ENTER == e.keyCode && !_.str.isBlank(e.target.value) && !_.contains(allTags, e.target.value)) {
                var newTag = e.target.value;

                // update master list of tags
                this.props.tagsCursor.refine('all').onChange(_.union(allTags, newTag));

                // wrap tag in quotes if needed
                if (_.str.contains(_.str.trim(newTag), ' ')) {
                    newTag = _.str.quote(newTag);
                }
                this.setNewTagList(this.props.trackCursor.value.tag_list + ' ' + newTag);
            }
        },

        onChange: function (selection) {
            var tags = _.chain(selection)
                .pluck('id')
                .map(function (tag) {
                    return _.str.contains(_.str.trim(tag), ' ') ?
                        _.str.quote(tag) : tag;
                })
                .value();

            this.setNewTagList(_.str.join.apply(null, [' '].concat(tags)));
        }
    });

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
                redirect_uri: 'http://localhost:8000/callback.html'
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

            return (
                <div className="App">
                    <Tags cursor={cursor.refine('tags')} />
                    <TrackList cursor={cursor} />
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
