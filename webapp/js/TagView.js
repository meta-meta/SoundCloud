/** @jsx React.DOM */
define([
    'underscore', 'react', 'wingspan-forms'
], function (_, React, Forms) {
    'use strict';

    var KendoMultiSelect = Forms.KendoMultiSelect;

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
                    placeholder="Tags"
                    disabled={true}
                />
            );
            //  value={{id: this.state.tags}} TODO: HACK  update wingspanforms
        },

        componentDidMount: function () {
            $(this.getDOMNode()).click(this.props.editTags);
        }
    });
    return TagView;
});