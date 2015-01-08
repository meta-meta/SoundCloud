/** @jsx React.DOM */
define([
    'underscore', 'react', 'react-cursor', 'wingspan-forms'
], function (_, React, Cursor, Forms) {
    'use strict';

    var KendoMultiSelect = Forms.KendoMultiSelect;

    var TagSelect = React.createClass({
        mixins:[Cursor.ImmutableOptimizations(['cursor'])],

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

    return TagSelect;
});