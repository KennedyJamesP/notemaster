# These are the controllers for your ajax api.


def get_user_name_from_email(email):
    """Returns a string corresponding to the user first and last names,
    given the user email."""
    u = db(db.auth_user.email == email).select().first()
    if u is None:
        return 'None'
    else:
        return ' '.join([u.first_name, u.last_name])

def get_posts():
    start_idx = int(request.vars.start_idx) if request.vars.start_idx is not None else 0
    end_idx = int(request.vars.end_idx) if request.vars.end_idx is not None else 0
    # We just generate a lot of of data.
    posts = []
    has_more = False
    rows = db().select(db.post.ALL, limitby=(start_idx, end_idx + 1), orderby=~db.post.updated_on)
    for i, r in enumerate(rows):
        if i < end_idx - start_idx:

            p = dict(
                id = r.id,
                post_content = r.post_content,
                author_email = r.user_email,
                author_name = get_user_name_from_email(r.user_email),
                created_on =r.created_on,
                updated_on=r.updated_on,
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


# Note that we need the URL to be signed, as this changes the db.
@auth.requires_signature()
def add_post():
    post_id = db.post.insert(
        post_content = request.vars.post_content)
    p_raw = db.post(post_id)
    p = dict(
        id=p_raw.id,
        post_content=p_raw.post_content,
        author_email=p_raw.user_email,
        author_name=get_user_name_from_email(p_raw.user_email),
        created_on=p_raw.created_on,
        updated_on=p_raw.updated_on,
    )
    return response.json(dict(post=p))


@auth.requires_signature()
def del_post():
    db(db.post.id == request.vars.post_id).delete()
    return "ok"


@auth.requires_signature()
def edit_post():

    post = db(db.post.id == request.vars.post_id).select().first()
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