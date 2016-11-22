# These are the controllers for your ajax api.


def get_user_name_from_email(email):
    """Returns a string corresponding to the user first and last names,
    given the user email."""
    u = db(db.auth_user.email == email).select().first()
    if u is None:
        return 'None'
    else:
        return ' '.join([u.first_name, u.last_name])

@auth.requires_login()
def get_posts():
    start_idx = int(request.vars.start_idx) if request.vars.start_idx is not None else 0
    end_idx = int(request.vars.end_idx) if request.vars.end_idx is not None else 0
    selected_course_id = int(request.vars.course_id) if request.vars.course_id is not None else 0
    # We just generate a lot of of data.
    posts = []
    has_more = False
    # TODO: change query once courses data entered into db
    # post_db_rows = db((db.post.user_email == auth.user.email) & (db.courses.id == selected_course_id))\
    #    .select(db.post.ALL, db.courses.course_name, limitby=(start_idx, end_idx + 1), orderby=~db.post.created_on)
    post_db_rows = db((db.post.user_email == auth.user.email)).select(db.post.ALL, limitby=(start_idx, end_idx + 1), orderby=~db.post.updated_on)

    for i, r in enumerate(post_db_rows):
        if i < end_idx - start_idx:
            p = dict(
                id=r.id,
                post_content=r.post_content,
                created_on=r.created_on,
                updated_on=r.updated_on,
                #TODO: include course_name once courses data entered into db
                # course_name=r.course_name,
                topic=r.topic,
                tags=r.tags,
                course_id=r.course_id,
            )
            posts.append(p)
        else:
            has_more = True

    logged_in = auth.user_id is not None
    user_email = auth.user.email if logged_in else None
    return response.json(dict(
        posts=posts,
        logged_in=logged_in,
        has_more=has_more,
        user_email=user_email,
    ))

def search_posts():
    posts = []
    print "search posts"
    print request.vars.query
    search = request.vars.query.strip() if request.vars.query is not None else 0
    print "search is: "+search

    q = ((db.post.post_content.contains(search))
         | (db.post.topic.contains(search))
         | (db.post.tags.contains(search))
         )
    print "done with search"
    # print "q is: "+q
    rows = db(q)((db.post.user_email == auth.user.email)).select(db.post.ALL,orderby=~db.post.updated_on)
    print rows

    for i, r in enumerate(rows):
            p = dict(
                id = r.id,
                post_content = r.post_content,
                author_email = r.user_email,
                author_name = get_user_name_from_email(r.user_email),
                created_on =r.created_on,
                updated_on=r.updated_on,
                class_content=r.course_id,
                topic_content=r.topic,
                tags_content=r.tags,
            )
            print "post p is: "
            print (p) #debug
            posts.append(p)
    logged_in = auth.user_id is not None
    user_email = auth.user.email if logged_in else None
    print p
    return response.json(dict(
        posts=posts,
        logged_in=logged_in,
        user_email=user_email,
    ))


# Note that we need the URL to be signed, as this changes the db.
@auth.requires_signature()
def add_post():
    post_id = db.post.insert(
        post_content=request.vars.post_content,
        topic=request.vars.topic,
        tags=request.vars.tags,
        course_id=request.vars.course_id
    )
    p_raw = db.post(post_id)
    p = dict(
        id=p_raw.id,
        post_content=p_raw.post_content,
        author_email=p_raw.user_email,
        author_name=get_user_name_from_email(p_raw.user_email),
        created_on=p_raw.created_on,
        updated_on=p_raw.updated_on,
        course_id=p_raw.course_id,
        topic=p_raw.topic,
        tags=p_raw.tags,
    )
    return response.json(dict(post=p))


@auth.requires_signature()
def del_post():
    db(db.post.id == request.vars.post_id).delete()
    return "ok"


@auth.requires_signature()
def edit_post():

    post = db.post(db.post.id == request.vars.post_id).select().first()
    post.update_record(post_content=request.vars.post_content)

    p_raw = db.post(request.vars.post_id)
    p = dict(
        id=p_raw.id,
        post_content=p_raw.post_content,
        author_email=p_raw.user_email,
        author_name=get_user_name_from_email(p_raw.user_email),
        created_on=p_raw.created_on,
        updated_on=p_raw.updated_on,
    )
    return response.json(dict(post=p))


