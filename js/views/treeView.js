/* Copyright (c) 2012 Top Hat Monocle, http://tophatmonocle.com/
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy 
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies
 * of the Software, and to permit persons to whom the Software is furnished to do so,
 * subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED,
 * INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A
 * PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
 * COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN
 * AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
 * WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.*/

define(['Backbone', 'views/folderView'], function(Backbone, FolderView) {
    return FolderView.extend({
        tagName: "div",
        className: "tree",
        template: _.template("<% if( show_select_all ) { %><a href='#' class='select_all'>Select All/None</a><% } %>" +
            "<ol class='folder_items'></ol>"),
        events: {
            "click a.select_all": "toggle_select_all",
        },
        toggle_select_all: function(e) {
            e.preventDefault();

            var new_selected = (this.model.get("selected") == true) ? false : true;
            this.model.set({"selected": new_selected});
        },
        initialize: function() {
            FolderView.prototype.initialize.call(this);

            //set sorting and bind for property updates
            this.model.bind("change:sortable", this.set_sorting, this);
        },
        render: function() {
            FolderView.prototype.render.call(this);
            this.set_sorting();
            
            if( this.options.max_height ) {
                $(this.el).css("max-height", this.options.max_height + "px");
            }
        },
        render_items: function() {
            //do not re-render the tree while it is being dragged
            if( this.options.tree_dragging ) { return false; }

            FolderView.prototype.render_items.call(this);

            //if an empty message has been provided, add it
            if( !this.model.get("children").length && this.options.empty_message ) {
                $(this.el).children("ol.folder_items").html("<div class='empty'>" + this.options.empty_message + "</div>");
            } 
        },
        set_sorting: function() {
            if( !this.model.get("sortable") ) {
                $(this.el).children("ol").nestedSortable("destroy");
                return true;
            }

            var tree_view = this;
            $(this.el).children("ol").nestedSortable({
                disableNesting: 'no_tree_children',
                forcePlaceholderSize: true,
                handle: 'div > em',
                helper:	'clone',
                items: 'li',
                maxLevels: 5,
                opacity: .6,
                placeholder: 'placeholder',
                revert: 250,
                tabSize: 20,
                tolerance: 'pointer',
                toleranceElement: '> div',
                revertOnError: 0,

                scroll: true,
                scrollY: true,
                scrollX: false,

                start: function(event, ui) {
                    //keep track of the fact that the tree is being dragged, as this may affect rendering of the tree
                    //re-rendering the tree while dragging is occuring will cause the browser to hang, for example
                    tree_view.options.tree_dragging = true;

                    var start_pos = ui.item.index();
                    ui.item.data('start_pos', start_pos);

                    var start_parent = ui.item.parent("ol").parent("li").data("model");
                    if( !start_parent ) { start_parent = tree_view.model; }
                    ui.item.data('start_parent', start_parent);
                },
                update: function(event, ui) {
                    tree_view.options.tree_dragging = false;

                    var item = ui.item.data("model");

                    var end_parent = ui.item.parent("ol").parent("li").data("model");
                    if( !end_parent ) { end_parent = tree_view.model; }
                    var start_parent = ui.item.data('start_parent');

                    var start_pos = ui.item.data('start_pos');
                    var end_pos = $(ui.item).index();

                    if( start_parent != end_parent ) {
                        start_parent.remove(item);
                        end_parent.add(item, end_pos );

                        //if we are moving a child into a hidden folder, mark the folder as opened on drop
                        if( end_parent.get("hidden") ) {
                            end_parent.save_hidden(false);
                        }
                    } else if( start_pos != end_pos ) {
                        start_parent.move(item, end_pos);
                    }

                    tree_view.model.trigger("sorted", item, start_parent, end_parent, end_pos);
                }
            }).addClass("sortable");
        }

    });
});
