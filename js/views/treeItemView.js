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
        className: "tree_row item no_tree_children",
        tagName: "li",
        template: _.template("<div>" +
            "<% if( selectable ) { %><input type='checkbox' <% if( selected ) { %>checked<% } %> /> <% } %>" +
            "<em <% if( typeof click != 'undefined' ) { %>class='clickable'<% } %>><%= title %></em></div>"),

        initialize: function() {
            $(this.el).attr("id", "mi_" + this.model.cid);
            $(this.el).data("model", this.model);

            this.model.bind("change:selectable", this.render, this);
            this.model.bind("change:selected", this.render, this);
            this.model.bind("change:title", this.render, this);
            this.render();
        },
        events: {
            "click em": "click",
            "click input[type=checkbox]": "toggle_select"
        },
        toggle_select: function(e) {
            var is_selected = $(e.currentTarget).is(":checked");
            this.model.set({"selected": is_selected});
        },
        click: function() {
            this.model.trigger("click");
        },
        render: function() {
            var html = this.template( this.model.toJSON() );
            $(this.el).html(html);
            this.delegateEvents();
        }
    });
});
