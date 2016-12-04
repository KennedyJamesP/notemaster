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

    function get_assignments_function(start_idx, end_idx) {
        var pp = {
            start_idx: start_idx,
            end_idx: end_idx
        };

        return get_assignments_url + "?" + $.param(pp);
    }

    self.get_assignments = function () {
        $.getJSON(get_assignments_function(0, 20), function (data) {
            self.vue.assignments = data.assignments;
            self.vue.has_more = data.has_more;
            self.vue.logged_in = data.logged_in;
            sort_by_date(self.vue.assignments);
            enumerate(self.vue.assignments);
            self.vue.assignments.reverse();
        })
    };

    self.get_more = function () {
        var num_tracks = self.vue.assignments.length;
        $.getJSON(get_assignments_url(num_tracks, num_tracks + 50), function (data) {
            self.vue.has_more = data.has_more;
            self.extend(self.vue.assignments, data.assignments);
            enumerate(self.vue.assignments);
        });
    };

    var sort_by_date = function (v) {
        console.log("sort_by_date")
        v.sort(function (a, b) {
            if (a.due > b.due)
                return -1;
            else if (a.due < b.due)
                return 1;
            else
                return 0;
        });
    }


    self.add_assignment_button = function () {
        // The button to add a track has been pressed.
        self.vue.is_adding_assignment = !self.vue.is_adding_assignment;
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
                self.vue.assignments.unshift(data.track);
                enumerate(self.vue.assignments);
            });
        //following lines need work
            sort_by_date(self.vue.assignments);
            enumerate(self.vue.assignments);
            self.vue.assignments.reverse();

    };


    self.delete_assignment = function(track_idx) {
        $.post(del_assignment_url,
            { track_id: self.vue.assignments[track_idx].id },
            function () {
                self.vue.assignments.splice(track_idx, 1);
                enumerate(self.vue.assignments);
            }
        )
    };



    self.vue = new Vue({
        el: "#vue-div",
        delimiters: ['${', '}'],
        unsafeDelimiters: ['!{', '}'],
        data: {
            assignment_name: null,
            assignment_description: null,
            due: null,
            is_adding_assignment: false,
            assignments: [],
            logged_in: false,
            has_more: false,
            selected_idx: null,
            selected_url: null,
        },
        methods: {
            get_more: self.get_more,
            add_assignment_button: self.add_assignment_button,
            add_assignment: self.add_assignment,
            delete_assignment: self.delete_assignment,
        }

    });

    self.get_assignments();
    $("#vue-div").show();


    return self;
};

var APP = null;

// This will make everything accessible from the js console;
// for instance, self.x above would be accessible as APP.x
jQuery(function(){APP = app();});