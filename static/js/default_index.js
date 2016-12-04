// This is the js for the default/index.html view.

var app = function () {

    //this controls the number of posts displayed at first and the number of posts received from the server
    const DEFAULT_POST_LIST_LENGTH = 10;

    var self = {};

    Vue.config.silent = false; // show all warnings

    // Extends an array
    self.extend = function (a, b) {
        for (var i = 0; i < b.length; i++) {
            a.push(b[i]);
        }
    };

    var sort_by_created_on = function (v) {
        v.sort(function (a, b) {
            if (a.created_on > b.created_on)
                return -1;
            else if (a.created_on < b.created_on)
                return 1;
            else
                return 0;
        });
    }
    var sort_by_last_used = function (v) {
        v.sort(function (a, b) {
            if (a.last_used > b.last_used)
                return -1;
            else if (a.last_used < b.last_used)
                return 1;
            else
                return 0;
        });
    }



    // Enumerates an array.
    var enumerate = function (v) {

        var k = 0;
        return v.map(function (e) {
            e._idx = k++;
        });
    };

    function get_posts_url(start_idx, end_idx) {
        var pp = {
            start_idx: start_idx,
            end_idx: end_idx
        };
        return posts_url + "?" + $.param(pp);
    };

    self.get_posts = function () {
        $.getJSON(get_posts_url(0, DEFAULT_POST_LIST_LENGTH), function (data) {
                self.vue.posts = data.posts;
                self.vue.has_more = data.has_more;
                self.vue.logged_in = data.logged_in;
                self.vue.user_email = data.user_email;
                self.vue.current_course_id = data.course_id; //not sure if working

                sort_by_created_on(self.vue.posts)
                enumerate(self.vue.posts);
            }
        );
    };

        function SearchPostUrl() {
        var ppx = {
            query: self.vue.post_search,
        };
        return search_post_url + "?" + $.param(ppx);
    };


        self.do_search = function () {
        $.getJSON(SearchPostUrl(), function (data) {
                self.vue.posts = data.posts;
                self.vue.has_more = data.has_more;
                self.vue.logged_in = data.logged_in;
                self.vue.user_email = data.user_email;
                sort_by_created_on(self.vue.posts);
                enumerate(self.vue.posts);
            }
        );
    };

    self.load_more = function () {
        var num_posts = self.vue.posts.length;
        $.getJSON(get_posts_url(num_posts, num_posts + DEFAULT_POST_LIST_LENGTH), function (data) {
            self.vue.has_more = data.has_more;
            self.extend(self.vue.posts, data.posts);
            sort_by_created_on(self.vue.posts);
            enumerate(self.vue.posts);
        });
    };

    self.add_post_button = function () {
        // The button to add a post has been pressed.
        if (self.vue.logged_in)
            self.vue.is_adding_post = true;
    };

    self.cancel_post_button = function () {
        // The button to add a post has been pressed.
        self.vue.form_post_content = "";
        self.vue.form_edit_content = "";
        self.vue.form_course_content = "";
        self.form_topic_content = "";
        self.form_tags_content = "";
        self.vue.is_adding_post = false;
        self.vue.is_editing_post = false;
    };


    //TODO: only pop if the list is over 4 els long
    self.add_post = function () {
        // The submit button to add a post has been added.
        $.post(add_post_url,
            {
                //TODO: get current course from vue instead of user inputting the course
                course_id: self.vue.current_course_id,
                post_content: self.vue.form_post_content,
                topic: self.vue.form_topic_content,
                tags: self.vue.form_tags_content,
            },
            function (data) {
                // $.web2py.enableElement($("#add_post_btn"));


                //TODO: remove post from end of list if necessary to ensure num posts displayed doesnt change once posts
                // // reaches its default limit
                // if ((self.vue.posts.length > 0) &&
                //     (self.vue.posts % DEFAULT_POST_LIST_LENGTH == 0)) {
                //     self.vue.posts.pop();
                //     self.vue.has_more = true;
                // }

                //no sorting needed since new item is inserted at front of posts list
                self.vue.posts.unshift(data.post);
                enumerate(self.vue.posts);
            });
        //clear out all input fields (except course) so they don't have leftover data in them
        self.vue.form_post_content = "";
        self.form_topic_content = "";
        self.form_tags_content = "";
        //self.form_course_content = "";
        self.vue.is_adding_post = false;
    };

    self.edit_post_button = function (post_idx) {
        if (self.vue.logged_in) {
            self.vue.form_edit_content = self.vue.posts[post_idx].post_content;
            self.vue.idx_to_edit = post_idx;
            self.vue.is_editing_post = true;
        }
    };


    self.is_adding_or_editing = function () {
        if (self.vue)
            return self.vue.is_adding_post || self.vue.is_editing_post;
        else
            return false;
    };

    self.is_idx_being_edited = function (idx) {
        if (self.vue.is_editing_post)
            return idx == self.vue.idx_to_edit;
        else
            return false;
    }

    self.edit_post = function () {
        // The edit button to commit changes to a post has been pressed.
        $.post(edit_post_url,
            {
                post_id: self.vue.posts[self.vue.idx_to_edit].id,
                post_content: self.vue.form_edit_content,
            },
            function (data) {
                self.vue.posts.splice(self.vue.idx_to_edit, 1);
                self.vue.posts.unshift(data.post);
                sort_by_created_on(self.vue.posts);
                enumerate(self.vue.posts);
            }
        )
        self.vue.is_editing_post = false;
    };


    self.delete_post = function (post_idx) {

        if (post_idx < self.vue.posts.length) {
            $.post(del_post_url,
                {
                    post_id: self.vue.posts[post_idx].id
                },
                function () {
                    self.vue.posts.splice(post_idx, 1);
                    //no sorting necessary since list was already sorted no items changed position relative to another
                    enumerate(self.vue.posts);
                }
            );
        }
    };

    //toggles the expanded/collapsed view of the sidebar
    self.sidebar_collapse_btn = function () {
        self.vue.is_sidebar_open = !self.vue.is_sidebar_open;
    }


    self.goto = function (page_name) {
        //changes the current page to the one specified
        self.vue.page = page_name;
    }

    self.get_courses = function () {
        $.getJSON(get_courses_url, function (data) {
                self.vue.courses = data.courses;
                self.vue.current_course_id = data.current_course_id;
                sort_by_last_used(self.vue.courses);
                enumerate(self.vue.courses);
            }
        );
    };


    self.add_course = function () {
        // The submit button to add a post has been added.
        $.post(add_course_url,
            {
                course_name: self.vue.new_course_name,
            },
            function (data) {
                self.vue.current_course_id = data.course.id;

                //no sorting needed since new item is inserted at front of courses list
                self.vue.courses.unshift(data.course);
                enumerate(self.vue.courses);
            });
        //clear out all input fields (except course) so they don't have leftover data in them
        self.vue.new_course_name = "";
        self.form_topic_content = "";
        self.form_tags_content = "";
        self.form_course_content = "";
        self.vue.is_adding_post = false;
    };

    function get_assignments_function(start_idx, end_idx) {
        var pp = {
            start_idx: start_idx,
            end_idx: end_idx
        };

        return get_assignments_url + "?" + $.param(pp);
    }


    function get_past_assignments_function(start_idx, end_idx) {
        var pp = {
            start_idx: start_idx,
            end_idx: end_idx
        };

        return get_past_assignments_url + "?" + $.param(pp);
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

      self.get_past_assignments = function () {
        $.getJSON(get_past_assignments_function(0, 20), function (data) {
            self.vue.past_assignments = data.past_assignments;
            sort_by_date(self.vue.past_assignments);
            enumerate(self.vue.past_assignments);
            self.vue.past_assignments.reverse();
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
                console.log(data);
                console.log(data.assignment.diff)
                if(data.assignment.diff <0){
                    self.vue.past_assignments.unshift(data.assignment);
                    sort_by_date(self.vue.past_assignments);
                    enumerate(self.vue.past_assignments);
                    self.vue.past_assignments.reverse();

                }else {
                    self.vue.assignments.unshift(data.assignment);
                    sort_by_date(self.vue.assignments);
                    enumerate(self.vue.assignments);
                    self.vue.assignments.reverse();
                }
            });

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
            is_adding_post: true,
            is_editing_post: false,
            is_sidebar_open: false,
            idx_to_edit: null,
            posts: [],
            courses: [],
            logged_in: false,
            has_more: false,
            current_course_id: null,
            current_course_name: null,
            form_post_content: null,
            form_edit_content: null,
            form_topic_content: null,
            form_tags_content: null,
            user_email: null,
            post_search: "",
            page:"splash",
            new_course_name: "",
            assignment_name: null,
            assignment_description: null,
            due: null,
            is_adding_assignment: false,
            assignments: [],
            past_assignments: [],
            selected_idx: null,
            selected_url: null,
        },
        methods: {
            load_more: self.load_more,
            add_post_button: self.add_post_button,
            cancel_post_button: self.cancel_post_button,
            edit_post_button: self.edit_post_button,
            is_adding_or_editing: self.is_adding_or_editing,
            is_idx_being_edited: self.is_idx_being_edited,
            add_post: self.add_post,
            edit_post: self.edit_post,
            delete_post: self.delete_post,
            do_search:self.do_search,
            sidebar_collapse_btn:self.sidebar_collapse_btn,
            goto:self.goto,
            get_courses:self.get_courses,
            add_course:self.add_course,
            get_more: self.get_more,
            add_assignment_button: self.add_assignment_button,
            add_assignment: self.add_assignment,
            delete_assignment: self.delete_assignment,

        }
    })

//these functions automatically get called when the page loads
    self.get_posts();
    self.get_courses();
    self.get_assignments();
    self.get_past_assignments();

    $("#vue-div").show();


    return self;
};

var APP = null;

// This will make everything accessible from the js console;
// for instance, self.x above would be accessible as APP.x
jQuery(function () {
    APP = app();
});
