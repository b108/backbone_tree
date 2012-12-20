define(['Backbone'], function(Backbone) {
    return Backbone.Model.extend({
        defaults: {
            click: false, //optional function that is called when item clicked
            selectable: false,
            selected: false,
            constructor: "item",
            title: '-'
        },
        serialize: function () {
            var data = this.toJSON(); 
            delete data["click"];
            return data;
        },
        deserialize: function(data) { 
            this.set(data); 
        },
        initialize: function() {
            this.bind("click", function() { 
                if( this.get("click") ) {
                    this.get("click").call(this);
                }
            });
        },
        is_selected: function() {
            return ( this.get("selectable") && ( this.get("selected") === true ) ) ? true : false;
        }
    });
});
