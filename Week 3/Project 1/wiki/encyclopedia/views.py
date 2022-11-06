from django.shortcuts import redirect, render
from random import randint
from django import forms

import markdown2

from . import util

# Creating Django Form object for Create New Page - has a title entry input and markdown textarea. Still have to wrap it in html form tag and add submit button in html
class NewEntryForm(forms.Form):
    title = forms.CharField(label="New Entry Title")
    markdown = forms.CharField(widget=forms.Textarea())

# Creating Django Form object for Edit Existing Page - has a markdown textarea. Still have to wrap it in html form tag and add submit button in html
class EditEntryForm(forms.Form):
    markdown = forms.CharField(widget=forms.Textarea())

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
        return render(request, "encyclopedia/error.html", {
            "random_entry": random_entry
        })
    
    # otherwise, return the markdown file as html into the html page
    else:
        return render(request, "encyclopedia/page.html", {
            "page": page,
            "content": markdown2.markdown(file_name),
            "random_entry": random_entry
        })

def edit(request, page):

    # initializing list of markdown documents and a variable storing a random one for the random search on the home page
    entries = util.list_entries()
    random_entry = entries[randint(0, len(entries)-1)]

    # if accessing the view via the form post (meaning the the user has clicked the save button on the edit page), retrieve the form info and then proceed accordingly
    if request.method == "POST":
        form = EditEntryForm(request.POST)

        if form.is_valid():

            # Isolate the task from the 'cleaned' version of form data, save updated content as a new entry, and redirect to the newly edited page
            markdown = form.cleaned_data["markdown"]
            util.save_entry(page, markdown)
            return redirect(f'/wiki/{page}')
        
        else:
            return render(request, "encyclopedia/error.html", {
                    "random_entry": random_entry
            })
    
    #otherwise, the user is accessing the edit page for the first time. Render initial page with form content
    else:
        markdown = util.get_entry(page)
        form = EditEntryForm(initial={'markdown': markdown})

        return render(request, "encyclopedia/edit.html", {
            "random_entry": random_entry,
            "form": form,
            "page": page
        })

def create(request):

    # initializing list of markdown documents and a variable storing a random one for the random search on the home page
    entries = util.list_entries()
    random_entry = entries[randint(0, len(entries)-1)]


    # if accessing the view via the form post, retrieve the form info and then proceed accordingly
    if request.method == "POST":
        form = NewEntryForm(request.POST)

        if form.is_valid():
            
            # Isolate the task from the 'cleaned' version of form data, save it as a new entry, and redirect to the new page
            title = form.cleaned_data["title"]
            markdown = form.cleaned_data["markdown"]
            
            # if an entry with the same title already exists, return the error page
            if util.get_entry(title) != None:
                return render(request, "encyclopedia/error.html", {
                      "random_entry": random_entry
                })

            # if the entry does not already exist, add it and redirect to the new page
            else:
                util.save_entry(title, markdown)
                return redirect(f'/wiki/{title}')

        #if the form isn't valid, then revisit form page with error alert
        else:
            return render(request, "encyclopedia/create.html", {
                "form": form,
                "random_entry": random_entry
            })
    
    # otherwise, upon original access, show empty form
    else:
        return render(request, "encyclopedia/create.html", {
            "form": NewEntryForm(),
            "random_entry": random_entry
        })