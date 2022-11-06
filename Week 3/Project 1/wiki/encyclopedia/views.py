from django.shortcuts import render
from random import randint

import markdown2

from . import util

def index(request):

    # initializing list of markdown documents and a variable storing a random one for the random search on the home page
    entries = util.list_entries()
    random_entry = entries[randint(0, len(entries)-1)]

    return render(request, "encyclopedia/index.html", {
        "entries": entries,
        "random_entry": random_entry
    })

def page(request, page):

    # reformatting the user's input in the url
    if page.lower() == "css" or page.lower() == "html":
            page = page.upper()
    else:
        page = page.capitalize()

    # getting the file name of the entry the user input into the url
    file_name = util.get_entry(page)

    # initializing list of markdown documents and a variable storing a random one for the random search on the home page
    entries = util.list_entries()
    random_entry = entries[randint(0, len(entries)-1)]

    # if the file name returned None, meaning the user input a markdown file that doesn't exist, then return the error page
    if file_name == None:
        return render(request, "encyclopedia/error.html")
    
    # otherwise, return the markdown file as html into the html page
    else:
        return render(request, "encyclopedia/page.html", {
            "page": page,
            "content": markdown2.markdown(file_name),
            "random_entry": random_entry
        })
    
# def search(request, page):
   
#     entries = util.list_entries()

#      # if page legit, redirect to path url with page as page
#     if page in entries:
#         return HttpResponseRedirect(reverse("wiki/page"))
    
#     #if not legit, send to search.html
#     else:
#          return render(request, "encyclopedia/error.html")
