/** @jsx React.DOM */
define([
    'underscore', 'react', 'react-cursor', 'wingspan-forms'
], function (_, React, Cursor, Forms) {
    'use strict';

    var KendoText = Forms.KendoText;

    var TitleEdit = React.createClass({
        mixins:[Cursor.ImmutableOptimizations(['cursor'])],

        render: function () {
            return (
                <KendoText
                    value={this.props.cursor.value}
                    onChange={this.props.cursor.onChange}
                />
            )
        },

        componentDidMount: function () {
            var $input = $(this.getDOMNode());

            var self = this;

            $input.on( 'keyup', function (e){
                if (e.keyCode == 13) {
                    // Enter pressed
                    $(this).blur();
                }
            });

            $input.focusout(this.saveTitle);

            $input.keyup();
        },

        saveTitle: function () {
            console.log('saving title');
            SC.put('/tracks/' + this.props.trackId,
                {track: {title: this.props.cursor.value}},
                function (track, err) {
                    if (err) {
                        console.log('error updating track');
                    } else {
                        this.props.cursor.onChange(track.title);
                    }
                }.bind(this));
        }
    });

    return TitleEdit;
});