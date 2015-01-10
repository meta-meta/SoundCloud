/** @jsx React.DOM */
define([
    'underscore', 'react', 'react-cursor', 'wingspan-forms'
], function (_, React, Cursor, Forms) {
    'use strict';

    var MultilineText = Forms.MultilineText;

    var DescriptionEdit = React.createClass({
        mixins:[Cursor.ImmutableOptimizations(['cursor'])],

        render: function () {
            return (
                <MultilineText
                    className="description"
                    value={this.props.cursor.value}
                    placeholder="Description"
                    onChange={this.props.cursor.onChange}
                />
            )
        },

        componentDidMount: function () {
            var $textarea = $(this.getDOMNode());

            var self = this;

            $textarea.on( 'keyup', function (e){
                $(this).height( 0 );
                $(this).height( this.scrollHeight );

                if (e.ctrlKey && e.keyCode == 13) {
                    // Ctrl-Enter pressed
                    $(this).blur();
                }
            });

            $textarea.focusout(this.saveDescription);

            $textarea.keyup();
        },

        saveDescription: function () {
            console.log('saving description');
            SC.put('/tracks/' + this.props.trackId,
                {track: {description: this.props.cursor.value}},
                function (track, err) {
                    if (err) {
                        console.log('error updating track');
                    } else {
                        this.props.cursor.onChange(track.description);
                    }
                }.bind(this));
        }
    });

    return DescriptionEdit;
});