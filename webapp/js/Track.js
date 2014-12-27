/** @jsx React.DOM */
define([
    'underscore', 'react', 'wingspan-forms', './Common', 'jsx!./TagView', 'jsx!./TagEdit'
], function (_, React, Forms, Common, TagView, TagEdit) {
    'use strict';

    var KendoText = Forms.KendoText;

    var Track = React.createClass({
        render: function () {
            var t = this.props.cursor.value;

            var tagWidget = _.isEqual(t.id, this.props.tagsCursor.refine('trackIdBeingEdited').value) ? (
                <TagEdit
                    className="tagEdit"
                    selectedTags={Common.parseTags(t)}
                    trackCursor={this.props.cursor}
                    tagsCursor={this.props.tagsCursor}
                    key={JSON.stringify(this.props.tagsCursor.refine('all').value) + t.id + 'trax'}
                />
            ) : (
                <TagView
                    className="tagView"
                    selectedTags={Common.parseTags(t)}
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

            function timestring(millis) {
                var s = Math.trunc(millis / 1000);
                var h = Math.trunc(s / 3600);
                var m = Math.trunc((s % 3600) / 60);
                s %= 60;
                return _.str.lpad(h, 2, '0') + ':' + _.str.lpad(m, 2, '0') +':' + _.str.lpad(s, 2, '0');
            }

            return (
                <div className="track" style={trackStyle}>
                    <KendoText value={t.title} />
                    {tagWidget}
                    {description}
                    <div className="waveform clearfix bordered" style={waveformStyle} >
                        <div className="duration">{timestring(t.duration)}</div>
                    </div>
                </div>
            )
        },

        editTags: function () {
            this.props.tagsCursor.refine('trackIdBeingEdited').onChange(this.props.cursor.value.id);
        }
    });

    return Track;
});