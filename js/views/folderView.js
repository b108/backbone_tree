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

define(['Backbone'], function(Backbone) {
    return Backbone.View.extend({
        tagName: "li",
        className: "tree_row folder",
        template: _.template("<div class='folder_details'></div><ol class='folder_items'></ol>"),

        initialize: function() {
            this.model.bind("change:title", this.render_details, this);
            this.model.bind("change:selected", this.render_details, this);

            //when folder hidden or shown, update both the items below, as well as the hide/show button in the details pane
            this.model.bind("change:hidden", this.render_items, this);
            this.model.bind("change:hidden", this.render_details, this);

            //create and remove item views when items are added to the folder; see commentary under `initialize_children_views` for details
            this.model.get("children").bind("add", function(item) { this.children_views[item.cid] = this.initialize_item_view(item); }, this);
            this.model.get("children").bind("remove", function(item) { delete this.children_views[item.cid]; }, this);
            this.model.get("children").bind("reset", this.initialize_children_views, this);
            this.initialize_children_views();
          
            this.model.get("children").bind("add", this.render_items, this);
            this.model.get("children").bind("remove", this.render_items, this);
            this.model.get("children").bind("reset", this.render_items, this);
            this.bind("move", this.render_items, this);

            $(this.el).attr("id", "folder_" + this.model.cid);
            $(this.el).data("model", this.model);
            this.render();
        },

        //we initialize children views when they are added to the collection, and reference those views on redraw
        //this is more efficient than creating new views each time we re-render the folder, and it allows us to remove
        //views if the child model is ever removed from the folder
        children_views: {},

        //sets up views for all children
        initialize_children_views: function() {
            this.children_views = {}; 
            this.model.get("children").each(function(item) {
                this.children_views[item.cid] = this.initialize_item_view(item); 
            }, this);
        },

        //our tree is responsible for initializing new views for the items in the tree; each item should have a default class,
        //stored as the view_class property
        initialize_item_view: function(item) {
            var view_class = window.tree_constructors.views[ item.get("constructor") ];
            return new view_class({"model": item});
        },

        toggle_hide: function(e) {
            e.preventDefault();
            var is_hidden = this.model.get("hidden");
            this.model.save_hidden(!is_hidden);
        },
        render: function() {
            $(this.el).html( this.template( this.model.toJSON() ) );

            this.render_details();
            this.render_items();
        },
        render_details: function() {
            var html = _.template(
                    "<a href='#' class='toggle_hide'>Toggle Hide</a>" +
                    "<% if( selectable ) { %><input type='checkbox' <% if( selected == true ) { %>checked<% } %> /> <% } %>" +
                    "<em><span>Folder:</span><%= title %></em>", 
                    {
                        "cid": this.model.cid,
                        "selectable": this.model.get("selectable"),
                        "selected": this.model.get("selected"),
                        "hidden": this.model.get("hidden"),
                        "title": this.model.get("title")
                    });
            $(this.el).children(".folder_details").html(html);

            //add or remove a 'hidden' class to the folder based on it's state
            if( this.model.get("hidden") ) {
                $(this.el).addClass("hidden");
            } else {
                $(this.el).removeClass("hidden");
            }


            //set the 'indeterminate' property for the selected checkbox if it is mixed
            //this can only be done in JS
            if( this.model.get("selected") == "mixed" ) {
                $(this.el).children(".folder_details").find("input[type=checkbox]").prop("indeterminate", true);
            }

            //bind hide event
            $(this.el).children(".folder_details").find("a.toggle_hide").click($.proxy(function(e) { this.toggle_hide(e); }, this));
            $(this.el).children(".folder_details").find("input[type=checkbox]").click($.proxy(function(e) { 
                var is_selected = $(e.currentTarget).is(":checked");
                this.model.set({"selected": is_selected});
            }, this));
        },
        render_items: function() {
            //get the list that we will be putting our children into
            var ol_el = $(this.el).children("ol.folder_items");

            //hide the list if the folder is hidden, then do nothing else
            if( this.model.get("hidden") ) {
                $(ol_el).addClass("hidden");
                return true;
            }

            //show otherwise
            $(ol_el).removeClass("hidden");

            //if there are any child elements in the folder, do a jQuery detach on them first before wiping the html
            //of the list; this will preserve any events that were bound on the child views els
            $(ol_el).children("li").detach();
            $(ol_el).html("");

            //re-insert each children's view
            this.model.get("children").each(function(child) {
                var view = this.children_views[child.cid];
                ol_el.append( view.el );
            }, this);
        }
    });
});
