/** @jsx React.DOM */
define([
    'underscore', 'react', './Common', 'jsx!./Track'
], function (_, React, Common, Track) {
    'use strict';

    var TrackList = React.createClass({
        render: function () {
            var cursor = this.props.cursor.refine('tracks');
            var tagsCursor = this.props.cursor.refine('tags');
            var selectedTags = this.props.cursor.refine('tags', 'selected').value;

            var longestTrack = Math.max.apply(null, _.pluck(cursor.value, 'duration'));

            var trackList = _.chain(cursor.value)
                .map(function (track, index) {
                    var visible = selectedTags.length == 0 || !_.isEmpty(_.intersection(Common.parseTags(track), _.pluck(selectedTags, 'id')));
                    return (<Track visible={visible} cursor={cursor.refine(index)} tagsCursor={tagsCursor} longestDuration={longestTrack} key={'track' + track.id} />);
                })
                .value();

            return (<div className="clearfix trackList">{trackList}<div className="clearfix" /></div>);
        }
    });

    return TrackList;
});