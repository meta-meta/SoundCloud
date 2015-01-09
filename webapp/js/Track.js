/** @jsx React.DOM */
define([
    'underscore', 'react', 'react-cursor', 'wingspan-forms', './Common', 'jsx!./TagView', 'jsx!./TagEdit'
], function (_, React, Cursor, Forms, Common, TagView, TagEdit) {
    'use strict';

    var KendoText = Forms.KendoText;
    var MultilineText = Forms.MultilineText;

    var Track = React.createClass({
        mixins:[Cursor.ImmutableOptimizations(['cursor', 'tagsCursor'])],

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
                <div className="description clearfix bordered">description: {t.description}</div>
            );

            //sharing: {t.sharing}

            var stateClassname = {
                finished: 'fa fa-cloud fa-3x',
                processing: 'fa fa-gears fa-3x',
                failed: 'fa fa-warning fa-3x'
            }[t.state];

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
                    <MultilineText
                        className="description"
                        value={t.description}
                        placeholder="Description"
                        onChange={this.onDescriptionChange}
                    />
                    <div>
                        <i className={stateClassname}>:</i>
                        <i className="fa fa-play fa-2x">{t.playback_count}</i>
                        <i className="fa fa-heart fa-2x">{t.favoritings_count}</i>
                        <i className="fa fa-comments fa-2x">{t.comment_count}</i>
                        <i className="fa fa-cloud-download fa-2x">{t.download_count}</i>
                    </div>
                    <div className="waveform clearfix bordered" style={waveformStyle} >
                        <div className="duration">{timestring(t.duration)}</div>
                    </div>
                </div>
            )

        },

        onDescriptionChange: function (val) {
            //console.log(val);
            this.props.cursor.refine('description').onChange(val);
        },

        editTags: function () {
            this.props.tagsCursor.refine('trackIdBeingEdited').onChange(this.props.cursor.value.id);
        }
    });

    return Track;
});