// This is the js for the default/index.html view.

var app = function() {

    var self = {};

    Vue.config.silent = false; // show all warnings

    // Extends an array
    self.extend = function(a, b) {
        for (var i = 0; i < b.length; i++) {
            a.push(b[i]);
        }
    };

    // Enumerates an array.
    var enumerate = function(v) {
        var k=0;
        return v.map(function(e) {e._idx = k++;});
    };

        // Sortable fields in table.
    var sortable = ['artist', 'track'];

    function get_tracks_url(start_idx, end_idx) {
        var pp = {
            start_idx: start_idx,
            end_idx: end_idx
        };
        for (var i = 0; i < sortable.length; i++) {
            var k = sortable[i];
            if (self.vue.is_sort_up[k]) {
                pp['sort_' + k] = 'up';
            } else if (self.vue.is_sort_down[k]) {
                pp['sort_' + k] = 'down';
            }
        }
        return tracks_url + "?" + $.param(pp);
    }

    self.get_tracks = function () {
        $.getJSON(get_tracks_url(0, 20), function (data) {
            self.vue.tracks = data.tracks;
            self.vue.has_more = data.has_more;
            self.vue.logged_in = data.logged_in;
            enumerate(self.vue.tracks);
        })
    };

    self.get_more = function () {
        var num_tracks = self.vue.tracks.length;
        $.getJSON(get_tracks_url(num_tracks, num_tracks + 50), function (data) {
            self.vue.has_more = data.has_more;
            self.extend(self.vue.tracks, data.tracks);
            enumerate(self.vue.tracks);
        });
    };

    self.add_track_button = function () {
        // The button to add a track has been pressed.
        self.vue.is_adding_track = !self.vue.is_adding_track;
    };

    self.add_assignment = function () {
        // The submit button to add a track has been added.
        $.post(add_assignment_url,
            {
                assignment_name: self.vue.assignment_name,
                assignment_definition: self.vue.assignment_description,
                due: self.vue.due,
            },
            function (data) {
                $.web2py.enableElement($("#add_assignment"));
                self.vue.tracks.unshift(data.track);
                enumerate(self.vue.tracks);
            });
    };


    self.delete_track = function(track_idx) {
        $.post(del_track_url,
            { track_id: self.vue.tracks[track_idx].id },
            function () {
                self.vue.tracks.splice(track_idx, 1);
                enumerate(self.vue.tracks);
            }
        )
    };

    self.select_track = function(track_idx) {
        var track = self.vue.tracks[track_idx];
        self.vue.selected_idx = track_idx;
        self.vue.selected_id = track.id;
        if (track.has_track) {
            self.vue.selected_url = play_url + '?' + $.param({track_id: track.id});
        } else {
            self.vue.selected_url = null;
        }
        // Shows the uploader if we don't have a track url.
        if (self.vue.selected_url) {
            $("#uploader_div").hide();
        } else {
            // Also sets properly the attribute of the upload form.
            self.upload_url = upload_url + "?" + $.param({track_id: track.id});
            self.delete_file_url = delete_file_url + "?" + $.param({track_id: track.id});
            $("#uploader_div").show();
        }
    };


    function reset_sort() {
        for (var i = 0; i < sortable.length; i++) {
            self.vue.is_sort_up[sortable[i]] = false;
            self.vue.is_sort_down[sortable[i]] = false;
        }
    }

    self.toggle_sort = function (col) {
        // Toggle the sort for a given column.
        // The default is to sort down (from largest to smallest).
        var is_down = self.vue.is_sort_down[col];
        reset_sort();
        if (is_down) {
            self.vue.is_sort_up[col] = true;
        } else {
            self.vue.is_sort_down[col] = true;
        }
        self.get_tracks();
    };


    self.vue = new Vue({
        el: "#vue-div",
        delimiters: ['${', '}'],
        unsafeDelimiters: ['!{', '}'],
        data: {
            assignment_name: null,
            assignment_description: null,
            due: null,
            is_adding_track: false,
            tracks: [],
            logged_in: false,
            has_more: false,
            form_artist: null,
            form_track: null,
            form_album: null,
            form_duration: null,
            selected_id: -1,  // Track selected to play.
            selected_idx: null,
            selected_url: null,
            is_sort_up: {'artist': false, 'track': false},
            is_sort_down: {'artist': false, 'track': false}
        },
        methods: {
            get_more: self.get_more,
            add_track_button: self.add_track_button,
            add_assignment: self.add_assignment,
            delete_track: self.delete_track,
            select_track: self.select_track,
            toggle_sort: self.toggle_sort
        }

    });

    self.get_tracks();
    $("#vue-div").show();


    return self;
};

var APP = null;

// This will make everything accessible from the js console;
// for instance, self.x above would be accessible as APP.x
jQuery(function(){APP = app();});