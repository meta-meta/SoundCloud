/** @jsx React.DOM */
define([
    'underscore', 'react', 'react-cursor', 'wingspan-forms'
], function (_, React, Cursor, Forms) {
    'use strict';

    var KendoMultiSelect = Forms.KendoMultiSelect;

    var TagEdit = React.createClass({
        mixins:[Cursor.ImmutableOptimizations(['trackCursor', 'tagsCursor'])],

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
                    template='#= label#'
                    dataSource={dataSource}
                    value={{id: this.props.selectedTags}}
                    placeholder="Tags"
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
        },

        componentDidUpdate: function () {
            this.setValue();
        },

        setValue: function () {
            var tags = this.props.selectedTags;
            $(this.getDOMNode()).find('select').first().data('kendoMultiSelect').value(tags);
        },

        setNewTagList: function (newTagList) {
            var t = this.props.trackCursor.value;

            SC.put('/tracks/' + t.id , {track: {tag_list: newTagList}}, function(track, err){
                if(err) {
                    console.log('error updating track');
                } else {
                    this.props.trackCursor.onChange(_.extend(t, {tag_list: track.tag_list}));
                }
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