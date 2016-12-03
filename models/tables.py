# Define your tables below (or better in another model file) for example
#
# >>> db.define_table('mytable', Field('myfield', 'string'))
#
# Fields can be 'string','text','password','integer','double','boolean'
#       'date','time','datetime','blob','upload', 'reference TABLENAME'
# There is an implicit 'id integer autoincrement' field
# Consult manual for more options, validators, etc.

import datetime

db.define_table('courses',
                Field('user_email', default=auth.user.email if auth.user_id else None),
                Field('course_name', 'text', unique=True),
                Field('created_on', 'datetime', default=datetime.datetime.utcnow()),
                Field('last_used', 'datetime', update=datetime.datetime.utcnow()),
                )

db.define_table('post',
                Field('user_email', default=auth.user.email if auth.user_id else None),
                Field('post_content', 'text'),
                Field('created_on', 'datetime', default=datetime.datetime.utcnow()),
                Field('updated_on', 'datetime', update=datetime.datetime.utcnow()),
                Field('course_id', 'integer'),
                Field('topic', 'text'),
                Field('tags', 'text'),
                )

db.define_table('topics',
                Field('user_email', default=auth.user.email if auth.user_id else None),
                Field('post_id', 'integer'),  # where the post is
                Field('topic_name','text'),
                )

db.define_table('definitions',
                Field('user_email', default=auth.user.email if auth.user_id else None),
                Field('post_id', 'integer'),  # where the topic is defined
                Field('subject_name', 'text'),
                Field('subject_definition', 'text'),
                )

# I don't want to display the user email by default in all forms.
db.courses.user_email.readable = db.courses.user_email.writable = False
db.courses.created_on.readable = db.courses.created_on.writable = False
db.courses.last_used.readable = db.courses.last_used.writable = False
db.courses.course_name.requires = IS_NOT_EMPTY()
db.courses.course_name.requires = IS_NOT_IN_DB(db, db.courses)

db.post.user_email.readable = db.post.user_email.writable = False
db.post.created_on.readable = db.post.created_on.writable = False
db.post.updated_on.readable = db.post.updated_on.writable = False
db.post.post_content.requires = IS_NOT_EMPTY()
db.post.course_id.requires = IS_NOT_EMPTY()
db.post.topic.requires = IS_NOT_EMPTY()

db.topics.user_email.readable = db.topics.user_email.writable = False
db.topics.post_id.requires = IS_NOT_EMPTY()
db.topics.topic_name.requires = IS_NOT_EMPTY()

db.definitions.user_email.readable = db.definitions.user_email.writable = False
db.definitions.post_id.requires = IS_NOT_EMPTY()
db.definitions.subject_name.requires = IS_NOT_EMPTY()
db.definitions.subject_definition.requires = IS_NOT_EMPTY()

# after defining tables, uncomment below to enable auditing
# auth.enable_record_versioning(db)
