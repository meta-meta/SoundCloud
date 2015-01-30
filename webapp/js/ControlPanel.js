/** @jsx React.DOM */
define([
    'underscore', 'react', 'react-cursor', 'wingspan-forms', 'jsx!./TagSelect', 'jsx!./SoundCloudWidget'
], function (_, React, Cursor, Forms, TagSelect, SoundCloudWidget) {
    'use strict';

    var CheckBox = Forms.CheckBox;

    var ControlPanel = React.createClass({
        mixins:[Cursor.ImmutableOptimizations(['cursor'])],

        render: function () {
            return (
                <div className="controlPanel" >
                    <SoundCloudWidget cursor={this.props.cursor.refine('selectedTrackUrl')} />
                    <TagSelect cursor={this.props.cursor.refine('tags')} />
                    <CheckBox
                        value={this.props.cursor.refine('showPublishedOnly').value}
                        onChange={this.props.cursor.refine('showPublishedOnly').onChange}
                        label="Published"
                        id="showPublished"
                    />
                </div>
            )
        }
    });

    return ControlPanel;
});