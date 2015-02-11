/** @jsx React.DOM */
define([
    'underscore', 'react', 'react-cursor'
], function (_, React, Cursor) {
    'use strict';

    var SoundCloudWidget = React.createClass({
        shouldComponentUpdate: function () {
            return false;
        },

        componentWillReceiveProps: function (nextProps) {
            if(!_.isEqual(this.props.cursor, nextProps.cursor)) {
                this.widget.load(nextProps.cursor.value + '&color=23C5CC');
            }
        },

        render: function () {
            return (
                <iframe
                    id="scWidget"
                    width="100%"
                    height="166"
                    scrolling="no"
                    frameBorder="no"
                    // this widget will not load subsequent urls if we don't give it the secret key sauce from the start
                    src="https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/tracks/190676187%3Fsecret_token%3Ds-JgIwM&amp;color=23C5CC&amp;auto_play=false&amp;hide_related=true&amp;show_comments=true&amp;show_user=true&amp;show_reposts=false"
                />
            )
        },

        componentDidMount: function () {
            this.widget = SC.Widget('scWidget');
        }
    });

    return SoundCloudWidget;
});