/** @jsx React.DOM */
define([
    'underscore', 'react', 'wingspan-forms'
], function (_, React, Forms) {
    'use strict';

    var KendoMultiSelect = Forms.KendoMultiSelect;

    var TagEdit = React.createClass({
        render: function () {
            var dataSource = _.map(this.props.tagsCursor.refine('all').value, function (tag) {
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
                    value={{id: this.props.selectedTags}}
                    onChange={this.onChange}
                />
            );
            //  value={{id: this.state.tags}} TODO: HACK  update wingspanforms
        },

        componentDidMount: function () {
            $(this.getDOMNode()).find('input').first().keyup(this.onKeyUp);

            // just mounted because we clicked on the TagView component. focus on this component like nothing ever happened
            $(this.getDOMNode()).find('input').first().focus();

            this.setValue();
            console.log('mount');
        },

        componentDidUpdate: function () {
            console.log('update');
            this.setValue();
        },

        setValue: function () {
            var tags = this.props.selectedTags;
            console.log('setVal: ' + tags);
            $(this.getDOMNode()).find('select').first().data('kendoMultiSelect').value(tags);
        },

        setNewTagList: function (newTagList) {
            var t = this.props.trackCursor.value;

            SC.put(t.permalink_url, {track: {tag_list: newTagList}}, function(res){
                console.log(res);
                this.props.trackCursor.onChange(_.extend(t, {tag_list: newTagList}));
            }.bind(this));
        },

        onKeyUp: function (e) {
            var allTags = this.props.tagsCursor.refine('all').value;

            if (kendo.keys.ENTER == e.keyCode && !_.str.isBlank(e.target.value) && !_.contains(allTags, e.target.value)) {
                var newTag = e.target.value;

                // update master list of tags
                this.props.tagsCursor.refine('all').onChange(_.union(allTags, newTag));

                // wrap tag in quotes if needed
                if (_.str.contains(_.str.trim(newTag), ' ')) {
                    newTag = _.str.quote(newTag);
                }
                this.setNewTagList(this.props.trackCursor.value.tag_list + ' ' + newTag);
            }
        },

        onChange: function (selection) {
            var tags = _.chain(selection)
                .pluck('id')
                .map(function (tag) {
                    return _.str.contains(_.str.trim(tag), ' ') ?
                        _.str.quote(tag) : tag;
                })
                .value();

            this.setNewTagList(_.str.join.apply(null, [' '].concat(tags)));
        }
    });

    return TagEdit;
});