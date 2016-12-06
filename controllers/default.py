# -*- coding: utf-8 -*-
# this file is released under public domain and you can use without limitations

# -------------------------------------------------------------------------
# This is a sample controller
# - index is the default action of any application
# - user is required for authentication and authorization
# - download is for downloading files uploaded in the db (does streaming)
# -------------------------------------------------------------------------

def get_user_name_from_email(email):
    """Returns a string corresponding to the user first and last names,
    given the user email."""
    u = db(db.auth_user.email == email).select().first()
    if u is None:
        return 'None'
    else:
        return ' '.join([u.first_name, u.last_name])


@auth.requires_login()
def index():
    """
    This is your main controller.  Here you do almost nothing; you just cause index.html to be served.
    """

    #search_posts("John")
    #getDaysApart(2016,12,25)
    #redirect(URL('default', 'appointment_create'))
    return dict()

@auth.requires_login()
def mycal():
    rows=db(db.t_appointment.created_by==auth.user.id).select()
    assignments=get_assignments()
    return dict(rows=rows,assignments=assignments)


@auth.requires_login()
def appointment_create():
    form=crud.create(db.t_appointment,
                     next='mycal')
    return dict(form=form)

@auth.requires_login()
def assignments():
    print "called assignments"
    return dict()




def get_assignments():
    print "called get_assignments"
    assignments = []
    has_more = False
    print "starting rows"
    rows = db((db.t_appointment.created_by == auth.user_id)).select(db.t_appointment.ALL,orderby=db.t_appointment.f_start_time)
    print rows
    print "finished rows"
    # need to calculate how many days until the assignment is due here
    for i, r in enumerate(rows):
            # Check if I have a track or not.
            print "due on: "
            print r.f_start_time
            slash=str(r.f_start_time).split('-') #item 0 is year, item 1 is month, item 2 is day
            print slash

            print slash[0]
            print slash[1]
            print slash[2]

            day=slash[2].split(" ")
            print day[0]
            diff=getDaysApart(slash[0],slash[1],day[0])
            print diff.days
            if(int(diff.days) >=0):
                t = dict(
                due = r.f_start_time,
                assignment_name = r.f_title,
                assignment_definition = r.description,
                id=r.id,
                diff=int(diff.days)
            )
                print t
                assignments.append(t)
    logged_in = auth.user_id is not None
    print "printing assignments"
    print assignments
    return assignments

    # gets the days between the inputted date and today
    # year, month, and day need to be ints
def getDaysApart(year, month, day):
        import datetime
        today = datetime.date.today()
        someday = datetime.date(int(year), int(month), int(day))
        diff = someday - today
        # print diff.days
        return diff

@auth.requires_login()
def main():
    return dict()


@auth.requires_login()
def edit():
    """
    This is the page to create / edit / delete a post.
    """
    return dict()


def user():
    """
    exposes:
    http://..../[app]/default/user/login
    http://..../[app]/default/user/logout
    http://..../[app]/default/user/register
    http://..../[app]/default/user/profile
    http://..../[app]/default/user/retrieve_password
    http://..../[app]/default/user/change_password
    http://..../[app]/default/user/bulk_register
    use @auth.requires_login()
        @auth.requires_membership('group name')
        @auth.requires_permission('read','table name',record_id)
    to decorate functions that need access control
    also notice there is http://..../[app]/appadmin/manage/auth to allow administrator to manage users
    """
    return dict(form=auth())


@cache.action()
def download():
    """
    allows downloading of uploaded files
    http://..../[app]/default/download/[filename]
    """
    return response.download(request, db)


def call():
    """
    exposes services. for example:
    http://..../[app]/default/call/jsonrpc
    decorate with @services.jsonrpc the functions to expose
    supports xml, json, xmlrpc, jsonrpc, amfrpc, rss, csv
    """
    return service()


