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

    // Enumerates an array.
    var enumerate_and_sort = function (v) {
        v.sort(function (a, b) {
            if (a.created_on > b.created_on)
                return -1;
            else if (a.created_on < b.created_on)
                return 1;
            else
                return 0;
        });


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

                enumerate_and_sort(self.vue.posts);
            }
        );
    };

    self.load_more = function () {
        var num_posts = self.vue.posts.length;
        $.getJSON(get_posts_url(num_posts, num_posts + DEFAULT_POST_LIST_LENGTH), function (data) {
            self.vue.has_more = data.has_more;
            self.extend(self.vue.posts, data.posts);
            enumerate_and_sort(self.vue.posts);
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

                self.vue.posts.unshift(data.post);
                enumerate_and_sort(self.vue.posts);
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
                enumerate_and_sort(self.vue.posts);
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
                    enumerate_and_sort(self.vue.posts);
                }
            );
        }
    };

         self.do_search= function () {
        // Perform search on database
        $.getJSON(search_post_url, $.param({q: self.vue.search}), function(data) {
            self.vue.posts = data.posts;
            enumerate(self.vue.posts);
        });
    };

    self.vue = new Vue({
        el: "#vue-div",
        delimiters: ['${', '}'],
        unsafeDelimiters: ['!{', '}'],
        data: {
            is_adding_post: false,
            is_editing_post: false,
            idx_to_edit: null,
            posts: [],
            logged_in: false,
            has_more: false,
            current_course_id: null,
            current_course_name: null,
            form_post_content: null,
            form_edit_content: null,
            form_topic_content: null,
            form_tags_content: null,
            user_email: null,
            search: '',
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
            do_search: self.do_search,
            delete_post: self.delete_post
        }

    });



    self.do_search();
    self.get_posts();
    $("#vue-div").show();


    return self;
};

var APP = null;

// This will make everything accessible from the js console;
// for instance, self.x above would be accessible as APP.x
jQuery(function () {
    APP = app();
});
