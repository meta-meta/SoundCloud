/** @jsx React.DOM */
define([
    'underscore', 'react', 'react-cursor', './Common', 'jsx!./Track'
], function (_, React, Cursor, Common, Track) {
    'use strict';

    var TrackList = React.createClass({
        mixins:[Cursor.ImmutableOptimizations(['cursor'])],

        render: function () {
            var cursor = this.props.cursor.refine('tracks');
            var tagsCursor = this.props.cursor.refine('tags');
            var selectedTags = this.props.cursor.refine('tags', 'selected').value;

            var longestTrack = Math.max.apply(null, _.pluck(cursor.value, 'duration'));

            var trackList = _.chain(cursor.value)
                .map(function (track, index) {
                    var tagCond = selectedTags.length == 0 || !_.isEmpty(_.intersection(Common.parseTags(track), _.pluck(selectedTags, 'id')));
                    var publishedCond = _.isEqual(track.sharing, 'public') || !this.props.cursor.refine('showPublishedOnly').value;
                    var visible = tagCond && publishedCond;
                    return (
                        <Track
                            visible={visible}
                            cursor={cursor.refine(index)}
                            tagsCursor={tagsCursor}
                            selectedTrackCursor={this.props.cursor.refine('selectedTrackUrl')}
                            longestDuration={longestTrack}
                            key={'track' + track.id}
                        />
                    );
                }.bind(this))
                .value();

            var loading = this.props.cursor.refine('loggedIn').value && trackList.length == 0 ? (<span className="fa-5x"><i className="fa fa-refresh fa-spin" />Loading Tracks</span>) : '';
            return (
                <div className="clearfix trackList">
                    {loading}
                    {trackList}
                    <div className="clearfix" />
                </div>
            );
        }
    });

    return TrackList;
});
