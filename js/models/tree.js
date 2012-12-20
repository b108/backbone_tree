define(['models/folder'], function(Folder) {
    return Folder.extend({
        defaults: {
            "sortable": false,
            "show_select_all": false
        }
    });
});
